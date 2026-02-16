const db = require("../db");

const getEventsByTourId = async (tourId) => {
  const [rows] = await db.query(
    `SELECT 
        event_name AS title, 
        event_date AS date, 
        description 
     FROM tour_events 
     WHERE tour_id = ?`,
    [tourId]
  );

  return rows;
};

module.exports = {
  getEventsByTourId,
};
