const db = require("../config/db");

// create notification
exports.createNotification = (userId, title, message, type, referenceId = null) => {

    const sql = `
        INSERT INTO notifications (user_id, title, message, type, reference_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [userId, title, message, type, referenceId], (err) => {
        if (err) {
            console.error("Notification error:", err);
        }
    });
};

// get notifications for a user
exports.getUserNotifications = (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(results);
    });
};

// mark notification as read
exports.markAsRead = (req, res) => {

    const id = req.params.id;

    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ?
    `;

    db.query(sql, [id], (err) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({ message: "Notification marked as read" });
    });
};