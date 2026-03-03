const axios = require("axios");
const db = require("../config/db");


// 1️⃣ INITIATE PAYMENT
exports.initiatePayment = async (req, res) => {
  const { amount, booking_id } = req.body;

  if (!amount || !booking_id) {
    return res.status(400).json({ error: "Amount and booking_id are required" });
  }

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: "http://localhost:3000/api/payment/payment-success",
        website_url: "http://localhost:3000",
        amount: amount,
        purchase_order_id: `booking_${booking_id}`,
        purchase_order_name: "Tour Booking Payment"
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("Khalti Initiate Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
};



// 2️⃣ PAYMENT SUCCESS (Khalti Redirect Here)
exports.paymentSuccess = async (req, res) => {
  try {
    const { purchase_order_id } = req.query;

    if (!purchase_order_id) {
      return res.status(400).send("Invalid payment response");
    }

    // Extract booking id from "booking_5"
    const bookingId = purchase_order_id.replace("booking_", "");

    await db.query(
      "UPDATE bookings SET payment_status = 'Paid' WHERE id = ?",
      [bookingId]
    );

    res.send("Payment Successful. Waiting for Admin Approval.");

  } catch (error) {
    console.error("Payment Success Error:", error);
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

    res.json(response.data);

  } catch (error) {
    console.error("Verification Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
};