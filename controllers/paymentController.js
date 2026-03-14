const axios = require("axios");
const db = require("../config/db");

exports.initiatePayment = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body missing" });
    }

    const { amount, booking_id } = req.body;

    console.log("Payment Request Body:", req.body);

    if (!amount || !booking_id) {
      return res.status(400).json({
        error: "Amount and booking_id are required",
      });
    }

    // Khalti sandbox limit
    if (amount < 10 || amount > 1000) {
      return res.status(400).json({
        error: "Amount must be between Rs 10 and Rs 1000 for testing",
      });
    }

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: "http://192.168.18.11:3000/api/payment/payment-success",
        website_url: "http://192.168.18.11:3000",
        amount: amount * 100,
        purchase_order_id: booking_id.toString(),
        purchase_order_name: "Tour Booking Payment",
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { pidx, payment_url } = response.data;

    const sql = "UPDATE tour_bookings SET pidx=? WHERE id=?";
    db.query(sql, [pidx, booking_id], (err) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).json({ error: "Database update failed" });
      }

      return res.json({
        success: true,
        payment_url: payment_url,
        pidx: pidx,
      });
    });
  } catch (error) {
    console.log("Payment initiation error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

/* =========================
   2) PAYMENT SUCCESS
========================= */
exports.paymentSuccess = async (req, res) => {
  try {
    const { pidx } = req.query;

    if (!pidx) {
      return res.status(400).send("pidx missing");
    }

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data;

    console.log("Khalti Lookup:", paymentData);

    if (paymentData.status === "Completed") {
      const sql = `
        UPDATE tour_bookings
        SET payment_status='Paid',
            booking_status='Confirmed',
            amount_paid=?,
            transaction_id=?
        WHERE pidx=?
      `;

      db.query(
        sql,
        [
          paymentData.total_amount / 100,
          paymentData.transaction_id,
          pidx,
        ],
     (err) => {
  if (err) {
    console.log("DB Error:", err);
    return res.status(500).send("Database error");
  }

  // redirect user after successful payment
  return res.redirect("http://192.168.18.11:3000/booking-success");
}
      );
    } else {
      res.send("Payment not completed");
    }
  } catch (error) {
    console.log("Payment verification error:", error.response?.data || error.message);
    res.status(500).send("Verification failed");
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body missing" });
    }

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
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data;

    console.log("Verify Payment:", paymentData);

    if (paymentData.status === "Completed") {
      const sql = `
        UPDATE tour_bookings
        SET payment_status='Paid',
            amount_paid=?,
            transaction_id=?
        WHERE pidx=?
      `;

      db.query(
        sql,
        [
          paymentData.total_amount / 100,
          paymentData.transaction_id,
          pidx,
        ],
        (err) => {
          if (err) {
            console.log("DB Error:", err);
            return res.status(500).json({ error: "Database update failed" });
          }

          res.json({
            success: true,
            message: "Payment verified and updated",
          });
        }
      );
    } else {
      res.status(400).json({
        error: "Payment not completed",
        status: paymentData.status,
      });
    }
  } catch (error) {
    console.log("Verify error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};