// backend/controllers/booking.controller.js

exports.createBooking = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { packageId, travelDate, persons, transportType } = req.body;

    if (!packageId || !travelDate || !persons || !transportType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // TEMP: no DB yet, just test API
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        packageId,
        travelDate,
        persons,
        transportType
      }
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
