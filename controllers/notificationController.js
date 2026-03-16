const db = require('../config/db');

// Get notifications for a user
exports.getNotifications = (req, res) => {

    const userId = req.params.userId;

    const query = `
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(query, [userId], (err, results) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
};


// Create notification
// Create notification
exports.createNotification = (req, res) => {

    if (!req.body) {
        return res.status(400).json({ error: "Request body missing" });
    }

    const { user_id, title, message, type, reference_id } = req.body;

    if (!user_id || !title || !message) {
        return res.status(400).json({
            error: "user_id, title and message are required"
        });
    }

    const query = `
        INSERT INTO notifications
        (user_id, title, message, type, reference_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [user_id, title, message, type || null, reference_id || null],
        (err, result) => {

            if (err) {
                console.log("Notification insert error:", err);
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                message: "Notification created successfully",
                notification_id: result.insertId
            });
        }
    );
};
// Mark notification as read
exports.markAsRead = (req, res) => {

    const notificationId = req.params.id;

    const query = `
        UPDATE notifications
        SET is_read = 1
        WHERE id = ?
    `;

    db.query(query, [notificationId], (err, result) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Notification marked as read" });
    });
};