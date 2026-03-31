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
        return_url: `http://172.20.10.2:3000/api/payment/payment-success?booking_id=${booking_id}`,
        website_url: "http://172.20.10.2:3000",
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


exports.paymentSuccess = async (req, res) => {

  try {

    const { pidx, booking_id } = req.query;

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

      const updateSql = `
        UPDATE tour_bookings
        SET payment_status='Paid',
            booking_status='Pending',
            amount_paid=?,
            transaction_id=?
        WHERE pidx=?
      `;

      db.query(
        updateSql,
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

        const bookingQuery = `
SELECT id, user_id, tour_id, travel_date
FROM tour_bookings
WHERE pidx = ?
LIMIT 1
`;

db.query(bookingQuery, [pidx], (err, result) => {

  if (err) {
    console.log("Booking fetch error:", err);
    return res.redirect("fypapp://booking-success");
  }

  if (result.length === 0) {
    console.log("No booking found for pidx:", pidx);
    return res.redirect("fypapp://booking-success");
  }

  const bookingId = result[0].id;
  const userId = result[0].user_id;
  const tourId = result[0].tour_id;
  const travelDate = result[0].travel_date;
// 🔥 CHECK IF RECEIPT ALREADY EXISTS
const checkReceiptQuery = `
SELECT * FROM receipts WHERE booking_id = ?
`;

db.query(checkReceiptQuery, [bookingId], (err, existing) => {
  if (err) {
    console.log("Check receipt error:", err);
  }

  if (existing.length === 0) {
    // INSERT ONLY IF NOT EXISTS
    const receiptQuery = `
    INSERT INTO receipts
    (booking_id, user_id, tour_id, amount, transaction_id, payment_status)
    VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      receiptQuery,
      [
        bookingId,
        userId,
        tourId,
        paymentData.total_amount / 100,
        paymentData.transaction_id,
        "Paid"
      ],
      (err) => {
        if (err) {
          console.log("Receipt insert error:", err);
        } else {
          console.log("Receipt created successfully");
        }
      }
    );
  } else {
    console.log("Receipt already exists, skipping insert");
  }
});

  const notificationQuery = `
  INSERT INTO notifications
  (user_id, title, message, type, reference_id)
  VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    notificationQuery,
    [
      userId,
      "Booking Placed",
      `Your tour booking for ${travelDate} has been placed.`,
      "booking",
      bookingId
    ],
    (err) => {
      if (err) {
        console.log("Notification insert error:", err);
      } else {
        console.log("Notification inserted successfully");
      }
    }
  );

  return res.redirect(`fypapp://booking-success?booking_id=${bookingId}`);

});

        }
      );

    } else {
      res.send("Payment not completed");
    }

  } catch (error) {
    console.log(
      "Payment verification error:",
      error.response?.data || error.message
    );
    res.status(500).send("Verification failed");
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body missing" });
    }

    const { pidx} = req.body;
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