const db = require('../config/db');

const getEventsByTourId = (tourId, callback) => {
  const sql = `
    SELECT 
      id,
      tour_id,
      event_name AS title,
      event_date AS date,
      description,
      is_major
    FROM tour_events
    WHERE tour_id = ?
  `;

  db.query(sql, [tourId], (err, results) => {
    if (err) {
      console.error("SQL Error:", err);
      return callback(err, null);
    }

    callback(null, results);
  });
};

module.exports = { getEventsByTourId };
