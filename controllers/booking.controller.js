const db = require('../config/db');

exports.createBooking = (req, res) => {
    const { user_id, package_id, travel_date, persons, transport_type } = req.body;

    const sql = `INSERT INTO tour_bookings 
        (user_id, tour_id, travel_date, number_of_people, transport_mode, booking_status) 
        VALUES (?, ?, ?, ?, ?, 'pending')`;

    db.query(sql, [user_id, package_id, travel_date, persons, transport_type], (err, result) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).json({ success: false, message: err.message });
        }

        res.status(201).json({ 
            success: true, 
            message: "Booking confirmed!", 
            bookingId: result.insertId 
        });
    });
};

exports.getUserBookings = (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM tour_bookings WHERE user_id = ?";

    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true, bookings: rows });
    });
};

exports.deleteBooking = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM tour_bookings WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        });
    });
};
