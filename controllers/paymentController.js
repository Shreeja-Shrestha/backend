const axios = require("axios");
const db = require("../config/db");

// 1. INITIATE PAYMENT
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
            return_url:
              "https://backend-production-551c.up.railway.app/api/payment/payment-success",
            website_url: "https://backend-production-551c.up.railway.app",
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

        db.query(
          "UPDATE tour_bookings SET pidx=? WHERE id=?",
          [pidx, booking_id],
          (err) => {
            if (err) {
              console.log("DB Error saving pidx:", err);
              return res.status(500).json({ error: "Failed to save pidx" });
            }

            console.log("pidx saved:", pidx);

            return res.json({
              success: true,
              payment_url,
              pidx,
            });
          }
        );
      }
    );
  } catch (error) {
    console.log("Payment initiation error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// 2. PAYMENT SUCCESS
exports.paymentSuccess = async (req, res) => {
  try {
    const { pidx } = req.query;

    if (!pidx) return res.send("pidx missing");

    console.log("PAYMENT SUCCESS HIT:", pidx);

    // FIRST: check if booking already paid
    db.query(
      "SELECT id, user_id, travel_date, payment_status FROM tour_bookings WHERE pidx=?",
      [pidx],
      async (err, rows) => {
        if (err) {
          console.log("DB error checking booking:", err);
          return res.send("DB error");
        }

        if (!rows || rows.length === 0) {
          console.log("Booking not found for pidx:", pidx);
          return res.send("Booking not found");
        }

        const booking = rows[0];
        const bookingId = booking.id;

        // IMPORTANT: prevent repeated processing
        if (booking.payment_status === "Paid") {
          console.log("Booking already paid. Redirecting once:", bookingId);
          return res.redirect(
            `fypapp://booking-success?booking_id=${bookingId}`
          );
        }

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

        if (paymentData.status !== "Completed") {
          console.log("Payment not completed:", paymentData.status);
          return res.send("Payment not completed");
        }

        db.query(
          `
          UPDATE tour_bookings
          SET payment_status='Paid',
              booking_status='Confirmed',
              amount_paid=?,
              transaction_id=?,
              payment_date=NOW()
          WHERE pidx=? AND payment_status!='Paid'
          `,
          [paymentData.total_amount / 100, paymentData.transaction_id, pidx],
          (err, updateResult) => {
            if (err) {
              console.log("Update error:", err);
              return res.send("DB error");
            }

            if (updateResult.affectedRows === 0) {
              console.log("Booking already updated:", pidx);
              return res.redirect(
                `fypapp://booking-success?booking_id=${bookingId}`
              );
            }

            console.log("Booking updated for pidx:", pidx);

            const userId = booking.user_id;
            const travelDate = booking.travel_date;

            db.query(
              `
              INSERT INTO notifications 
              (user_id, title, message, type, reference_id)
              VALUES (?, ?, ?, ?, ?)
              `,
              [
                userId,
                "Booking Confirmed",
                `Your booking for ${travelDate} has been confirmed.`,
                "booking",
                bookingId,
              ],
              (err) => {
                if (err) console.log("User notification error:", err);
                else console.log("User notification inserted");
              }
            );

            db.query(
              `
              INSERT INTO notifications 
              (user_id, title, message, type, reference_id)
              VALUES (?, ?, ?, ?, ?)
              `,
              [
                10,
                "New Confirmed Booking",
                `Booking ${bookingId} confirmed.`,
                "booking",
                bookingId,
              ],
              (err) => {
                if (err) console.log("Admin notification error:", err);
                else console.log("Admin notification inserted");
              }
            );

            return res.redirect(
              `fypapp://booking-success?booking_id=${bookingId}`
            );
          }
        );
      }
    );
  } catch (error) {
    console.log("Payment verification error:", error.message);
    return res.status(500).send("Error verifying payment");
  }
};

// 3. VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ error: "pidx is required" });
    }

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
      return res.json({ success: false, data });
    }
  } catch (err) {
    console.log("Verify error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};