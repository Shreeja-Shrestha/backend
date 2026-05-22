const db = require('../config/db');


// =========================
// 1. GET USER NOTIFICATIONS
// =========================
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


// =========================
// 2. CREATE NOTIFICATION
// =========================
exports.createNotification = (req, res) => {

    const { user_id, title, message, type, reference_id } = req.body;

    if (!user_id || !title || !message) {
        return res.status(400).json({
            error: "user_id, title and message are required"
        });
    }

    const query = `
        INSERT INTO notifications
        (user_id, title, message, type, reference_id, is_read)
        VALUES (?, ?, ?, ?, ?, 0)
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


// =========================
// 3. MARK AS READ
// =========================
exports.markAsRead = (req, res) => {

    const notificationId = req.params.id;

    const query = `
        UPDATE notifications
        SET is_read = 1
        WHERE id = ?
    `;

    db.query(query, [notificationId], (err) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Notification marked as read" });
    });
};


// =========================
// 4. GET ADMIN NOTIFICATIONS
// =========================
exports.getAdminNotifications = (req, res) => {

    // 🔴 FIX: Use correct admin id
    const ADMIN_ID = 10; // change if needed

    const query = `
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(query, [ADMIN_ID], (err, results) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
};


// =========================
// 5. GET UNREAD COUNT (NEW)
// =========================
exports.getUnreadCount = (req, res) => {

    const userId = req.params.userId;

    const query = `
        SELECT COUNT(*) AS unread
        FROM notifications
        WHERE user_id = ? AND is_read = 0
    `;

    db.query(query, [userId], (err, result) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ unread: result[0].unread });
    });
};
