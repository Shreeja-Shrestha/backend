const eventModel = require("../models/eventModel");

const getTourEvents = async (req, res) => {
  try {
    const { tourId } = req.params;

    const events = await eventModel.getEventsByTourId(tourId);

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTourEvents,
};
