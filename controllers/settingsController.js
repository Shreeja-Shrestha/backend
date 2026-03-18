const db = require("../config/db");

/// GET SETTINGS
exports.getSettings = (req, res) => {
  const { user_id } = req.params;

  db.query(
    "SELECT * FROM user_settings WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.length === 0) {
        return res.json({ message: "No settings found" });
      }

      res.json(result[0]);
    }
  );
};

/// UPDATE SETTINGS
exports.updateSettings = (req, res) => {
  const { user_id, notifications, offers, privacy_public, interests } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  const query = `
    INSERT INTO user_settings (user_id, notifications, offers, privacy_public, interests)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      notifications = VALUES(notifications),
      offers = VALUES(offers),
      privacy_public = VALUES(privacy_public),
      interests = VALUES(interests)
  `;

  db.query(
    query,
    [user_id, notifications, offers, privacy_public, JSON.stringify(interests)],
    (err) => {
      if (err) return res.status(500).json({ error: err });

      res.json({ success: true, message: "Settings updated" });
    }
  );
};