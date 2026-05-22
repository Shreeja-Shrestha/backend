const axios = require("axios");
const db = require("../config/db");


// =========================
// 1. INITIATE PAYMENT
// =========================
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, booking_id } = req.body;

    if (!amount || !booking_id) {
      return res.status(400).json({
        error: "Amount and booking_id are required",
      });
    }

    db.query(
      "SELECT payment_status FROM tour_bookings WHERE id = ?",
      [booking_id],
      async (err, result) => {
        if (err) return res.status(500).json({ error: "DB error" });

        if (!result || result.length === 0) {
          return res.status(404).json({ error: "Booking not found" });
        }

        if (result[0].payment_status === "Paid") {
          return res.status(400).json({
            error: "Already paid",
          });
        }

        const response = await axios.post(
          "https://a.khalti.com/api/v2/epayment/initiate/",
          {
            return_url: "http://172.20.10.2:3000/api/payment/payment-success",
            website_url: "http://172.20.10.2:3000",
            amount: amount * 100,
            purchase_order_id: booking_id.toString(),
            purchase_order_name: "Tour Booking",
          },
          {
            headers: {
              Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { pidx, payment_url } = response.data;

        // Save pidx
        db.query(
          "UPDATE tour_bookings SET pidx=? WHERE id=?",
          [pidx, booking_id],
          (err) => {
            if (err) {
              console.log("❌ DB Error saving pidx:", err);
              return res.status(500).json({ error: "Failed to save pidx" });
            }

            console.log("✅ pidx saved:", pidx);

            res.json({
              success: true,
              payment_url,
              pidx,
            });
          }
        );
      }
    );
  } catch (error) {
    console.log("❌ Payment initiation error:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// =========================
// 2. PAYMENT SUCCESS
// =========================
exports.paymentSuccess = async (req, res) => {
  try {
    const { pidx } = req.query;

    if (!pidx) return res.send("pidx missing");

    console.log("🔵 PAYMENT SUCCESS HIT:", pidx);

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data;

    if (paymentData.status === "Completed") {

      // UPDATE BOOKING
      db.query(
        `
        UPDATE tour_bookings
        SET payment_status='Paid',
            booking_status='Confirmed',
            amount_paid=?,
            transaction_id=?,
            payment_date=NOW()
        WHERE pidx=?
        `,
        [paymentData.total_amount / 100, paymentData.transaction_id, pidx],
        (err, updateResult) => {

          if (err) {
            console.log("❌ Update error:", err);
            return res.send("DB error");
          }

          if (updateResult.affectedRows === 0) {
            console.log("❌ No booking updated for pidx:", pidx);
            return res.send("Booking not updated");
          }

          console.log("✅ Booking updated for pidx:", pidx);

          // FETCH BOOKING
          db.query(
            "SELECT id, user_id, travel_date FROM tour_bookings WHERE pidx=?",
            [pidx],
            (err, result) => {

              if (err || !result || result.length === 0) {
                console.log("❌ Booking not found after update:", pidx);
                return res.send("Booking not found");
              }

              const bookingId = result[0].id;
              const userId = result[0].user_id;
              const travelDate = result[0].travel_date;

              console.log("✅ Booking found:", bookingId);

              // USER NOTIFICATION
              db.query(
                `INSERT INTO notifications (user_id,title,message,type,reference_id)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                  userId,
                  "Booking Confirmed",
                  `Your booking for ${travelDate} has been confirmed.`,
                  "booking",
                  bookingId
                ],
                (err) => {
                  if (err) console.log("❌ User notification error:", err);
                  else console.log("✅ User notification inserted");
                }
              );

              // ADMIN NOTIFICATION
              db.query(
                `INSERT INTO notifications (user_id,title,message,type,reference_id)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                  10,
                  "New Confirmed Booking",
                  `Booking ${bookingId} confirmed.`,
                  "booking",
                  bookingId
                ],
                (err) => {
                  if (err) console.log("❌ Admin notification error:", err);
                  else console.log("✅ Admin notification inserted");
                }
              );

              return res.redirect(`fypapp://booking-success?booking_id=${bookingId}`);
            }
          );
        }
      );

    } else {
      console.log("⚠️ Payment not completed:", paymentData.status);
      res.send("Payment not completed");
    }

  } catch (error) {
    console.log("❌ Payment verification error:", error.message);
    res.status(500).send("Error verifying payment");
  }
};


// =========================
// 3. VERIFY PAYMENT
// =========================
exports.verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    const data = response.data;

    if (data.status === "Completed") {
      return res.json({ success: true, data });
    } else {
      return res.json({ success: false });
    }

  } catch (err) {
    console.log("❌ Verify error:", err.message);
    res.status(500).json({ error: err.message });
  }
};