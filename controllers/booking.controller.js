const db = require('../config/db');
const axios = require('axios');


// =========================
// 1. INITIATE PAYMENT
// =========================
exports.initiatePayment = (req, res) => {

    const { amount, purchase_order_id, purchase_order_name } = req.body;

    if (!amount || !purchase_order_id) {
        return res.status(400).json({
            error: "Amount and booking id are required"
        });
    }

    //  Check booking exists + not already paid
    const checkSql = `SELECT payment_status FROM tour_bookings WHERE id = ?`;

    db.query(checkSql, [purchase_order_id], (err, result) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (result[0].payment_status === "Paid") {
            return res.status(400).json({
                error: "Payment already completed for this booking"
            });
        }

        //  Call Khalti
        axios.post('https://a.khalti.com/api/v2/epayment/initiate/', {
            return_url: `http://192.168.18.11:3000/api/payment/payment-success`,
            website_url: "https://yourwebsite.com",
            amount: amount * 100,
            purchase_order_id: purchase_order_id,
            purchase_order_name: purchase_order_name,
        }, {
            headers: { 'Authorization': 'Key 9e601b866fff445197196b3e7407c2ac' }
        })
        .then(response => {

            const { pidx, payment_url } = response.data;

            // Save pidx
            const updateSql = `UPDATE tour_bookings SET pidx = ? WHERE id = ?`;

            db.query(updateSql, [pidx, purchase_order_id], (err) => {

                if (err) {
                    console.log("DB Error:", err);
                    return res.status(500).json({ error: "Failed to save payment id" });
                }

                res.json({
                    success: true,
                    payment_url: payment_url,
                    pidx: pidx
                });

            });

        })
        .catch(err => {
            console.error("Khalti Error:", err.response?.data || err.message);
            res.status(500).json({ error: "Failed to initiate payment" });
        });

    });

};


// =========================
// 2. CREATE BOOKING
// =========================
// =========================
// 2. CREATE BOOKING
// =========================
exports.createBooking = (req, res) => {
  const {
    user_id,
    tour_id,
    travel_date,
    number_of_people,
    transport_mode
  } = req.body;

  if (!user_id || !tour_id || !travel_date || !number_of_people || !transport_mode) {
    return res.status(400).json({
      error: "All required fields must be provided"
    });
  }

  const bookingSql = `
    INSERT INTO tour_bookings
    (
      user_id,
      tour_id,
      travel_date,
      number_of_people,
      transport_mode,
      booking_status,
      payment_status,
      amount_paid,
      payment_method
    )
    VALUES (?, ?, ?, ?, ?, 'Pending', 'Unpaid', 0, 'Khalti')
  `;

  db.query(
    bookingSql,
    [user_id, tour_id, travel_date, number_of_people, transport_mode],
    (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({
          error: "Booking creation failed",
          details: err.message
        });
      }

      const bookingId = result.insertId;

      // Get tour/package details for notification message
      const tourSql = `
        SELECT title, category, subcategory
        FROM tours
        WHERE id = ?
      `;

      db.query(tourSql, [tour_id], (tourErr, tourRows) => {
        if (tourErr) {
          console.log("TOUR FETCH ERROR:", tourErr);

          return res.json({
            message: "Booking created successfully",
            booking_id: bookingId,
            notification: "Booking saved, but notification failed"
          });
        }

        const tour = tourRows[0] || {};
        const tourTitle = tour.title || "Tour Package";
        const category = tour.category || "";
        const subcategory = tour.subcategory || "";

        const adminId = 10; // change this if your admin user id is different

        const notificationTitle =
          category === "food"
            ? "New Food Experience Booking"
            : "New Tour Booking";

        const notificationMessage =
          category === "food"
            ? `${tourTitle} (${subcategory}) has been booked by user ${user_id} for ${travel_date}.`
            : `${tourTitle} has been booked by user ${user_id} for ${travel_date}.`;

        const notificationSql = `
          INSERT INTO notifications
          (user_id, title, message, type, reference_id, is_read)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          notificationSql,
          [
            adminId,
            notificationTitle,
            notificationMessage,
            "booking",
            bookingId,
            0
          ],
          (notificationErr) => {
            if (notificationErr) {
              console.log("NOTIFICATION ERROR:", notificationErr);

              return res.json({
                message: "Booking created successfully",
                booking_id: bookingId,
                notification: "Booking saved, but notification failed"
              });
            }

            return res.json({
              message: "Booking created successfully",
              booking_id: bookingId,
              notification: "Admin notification created"
            });
          }
        );
      });
    }
  );
};

// =========================
// 3. GET USER BOOKINGS
// =========================
exports.getUserBookings = (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT b.*, t.title
        FROM tour_bookings b
        JOIN tours t ON b.tour_id = t.id
        WHERE b.user_id = ?
        ORDER BY b.travel_date DESC
    `;

    db.query(sql, [userId], (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json(rows);
    });
};


// =========================
// 4. CANCEL BOOKING (ADMIN)
// =========================
exports.deleteBooking = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE tour_bookings
        SET booking_status = 'Cancelled'
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Send notification to user
        db.query(`
            INSERT INTO notifications (user_id, title, message, type, reference_id)
            SELECT user_id, ?, ?, 'booking', ?
            FROM tour_bookings WHERE id = ?
        `, [
            "Booking Cancelled",
            "Your booking has been cancelled by admin.",
            id,
            id
        ]);

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        });

    });
};