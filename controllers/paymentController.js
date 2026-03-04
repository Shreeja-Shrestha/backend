const axios = require("axios");
const db = require("../config/db");

exports.initiatePayment = async (req, res) => {
  const { amount, booking_id } = req.body;

  if (!amount || !booking_id) {
    return res.status(400).json({
      error: "Amount and booking_id are required"
    });
  }

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: "http://localhost:3000/api/payment/payment-success",
        website_url: "http://localhost:3000",
        amount: amount * 100, // Khalti requires paisa
        purchase_order_id: booking_id.toString(),
        purchase_order_name: "Booking Payment"
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      payment_url: response.data.payment_url
    });

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
};



// 2️⃣ PAYMENT SUCCESS (Khalti Redirect Here)
exports.paymentSuccess = async (req, res) => {
  try {
    const { pidx, transaction_id } = req.query;

    console.log("Payment Success Params:", req.query);

    if (!pidx) {
      return res.status(400).send("No pidx received");
    }

    // Update booking using pidx
    const sql = `
      UPDATE tour_bookings 
      SET payment_status = 'Paid',
          booking_status = 'Pending',
          transaction_id = ?
      WHERE pidx = ?
    `;

    db.query(sql, [transaction_id || null, pidx], (err, result) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).send("Database update failed");
      }

      res.send("Payment Successful. Waiting for Admin Approval.");
    });

  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).send("Error updating payment.");
  }
};

// 3️⃣ VERIFY PAYMENT (Optional but Good Practice)
exports.verifyPayment = async (req, res) => {
  const { pidx } = req.body;

  if (!pidx) {
    return res.status(400).json({ error: "pidx is required" });
  }

  try {
    // Call Khalti lookup API
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const paymentData = response.data;

    console.log("Khalti Verify Response:", paymentData);

    if (paymentData.status === "Completed") {

      // Update booking in DB
      const sql = `
        UPDATE tour_bookings
        SET payment_status = 'Paid',
            amount_paid = ?,
            transaction_id = ?
        WHERE pidx = ?
      `;

      db.query(
        sql,
        [
          paymentData.total_amount / 100, // convert paisa to rupees
          paymentData.transaction_id,
          pidx
        ],
        (err) => {
          if (err) {
            console.log("DB Error:", err);
            return res.status(500).json({ error: "Database update failed" });
          }

          return res.json({
            success: true,
            message: "Payment verified and updated"
          });
        }
      );

    } else {
      return res.status(400).json({
        error: "Payment not completed",
        status: paymentData.status
      });
    }

  } catch (error) {
    console.log("Verify Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
};