const db = require('../config/db');

exports.submitReview = (req, res) => {
    const { user_id, tour_id, rating, comment } = req.body;

    // Validation
    if (!user_id || !tour_id || !rating) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Missing required fields: user_id, tour_id, or rating' 
        });
    }

    const sql = "INSERT INTO ratings (user_id, tour_id, rating, comment) VALUES (?, ?, ?, ?)";
    
    // Using standard callback logic
    db.query(sql, [user_id, tour_id, rating, comment], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Failed to insert review into database' 
            });
        }

        res.status(200).json({ 
            status: 'success', 
            message: 'Review submitted successfully',
            data: result 
        });
    });
};
exports.getReviewsByTour = (req, res) => {
    const tour_id = req.params.tour_id;

    const sql = `
        SELECT r.id, r.rating, r.comment, r.created_at,
               u.name AS user_name,
               r.user_id
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.tour_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(sql, [tour_id], (err, result) => {
        if (err) {
            console.error("Error fetching reviews:", err);
            return res.status(500).json({ status: "error" });
        }

        res.json(result);
    });
};
exports.deleteReview = (req, res) => {
    const { id, user_id } = req.body;

    if (!id || !user_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing id or user_id"
        });
    }

    const sql = `
        DELETE FROM ratings
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [id, user_id], (err, result) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({ status: "error" });
        }

        if (result.affectedRows === 0) {
            return res.json({
                status: "error",
                message: "Not allowed or review not found"
            });
        }

        res.json({
            status: "success",
            message: "Review deleted"
        });
    });
};