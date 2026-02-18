const eventModel = require('../models/eventModel');

const getEvents = (req, res) => {
  const tourId = req.params.id;

  eventModel.getEventsByTourId(tourId, (err, events) => {
    if (err) {
      console.error("Controller Error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(events);
  });
};

module.exports = { getEvents };
