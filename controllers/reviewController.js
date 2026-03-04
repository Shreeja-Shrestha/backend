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