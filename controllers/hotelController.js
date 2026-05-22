const axios = require("axios");
const db = require("../config/db");

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

// =========================
// Haversine Formula
// =========================
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (val) => (val * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// =========================
// MAIN CONTROLLER
// =========================
exports.getNearestHotel = async (req, res) => {
  const { tour_id } = req.query;

  if (!tour_id) {
    return res.status(400).json({ message: "tour_id is required" });
  }

  try {
    // =========================
    // GET TOUR LOCATION
    // =========================
    const tour = await new Promise((resolve, reject) => {
      db.query(
        "SELECT latitude, longitude FROM tours WHERE id = ?",
        [tour_id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    if (!tour || tour.length === 0) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const latNum = Number(tour[0].latitude);
    const lngNum = Number(tour[0].longitude);

    console.log("Tour location:", latNum, lngNum);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({
        message: "Invalid coordinates",
      });
    }

    // =========================
    // CHECK CACHE FIRST
    // =========================
    const cachedHotels = await new Promise((resolve) => {
      db.query(
        `SELECT hotel_name AS name,
                hotel_lat AS latitude,
                hotel_lng AS longitude,
                distance_km
         FROM nearest_hotels
         WHERE tour_id = ?
         ORDER BY distance_km ASC`,
        [tour_id],
        (err, rows) => {
          if (err) {
            console.error("DB Error:", err);
            resolve(null);
          } else {
            resolve(rows);
          }
        }
      );
    });

    if (cachedHotels && cachedHotels.length > 0) {
      console.log("Using cached hotels");
      return res.json(cachedHotels);
    }

    // =========================
    // GEOAPIFY API CALL
    // =========================
    let hotels = [];

    try {
      const response = await axios.get(
        "https://api.geoapify.com/v2/places",
        {
          params: {
            categories: "accommodation", // broader results
            filter: `circle:${lngNum},${latNum},20000`,
            limit: 20,
            apiKey: GEOAPIFY_API_KEY,
          },
        }
      );

      hotels = response.data.features;

      console.log("Hotels fetched:", hotels.length);

    } catch (err) {
      console.error("Geoapify failed:", err.message);

      return res.json([
        {
          name: "Hotel data unavailable",
          latitude: latNum,
          longitude: lngNum,
          distance_km: 0,
        },
      ]);
    }

    // =========================
    // NO DATA CASE
    // =========================
    if (!hotels || hotels.length === 0) {
      return res.json([
        {
          name: "No hotels found nearby",
          latitude: latNum,
          longitude: lngNum,
          distance_km: 0,
        },
      ]);
    }

    // =========================
    // PROCESS DATA
    // =========================
    const results = hotels
      .map((h) => {
        const hotelLat = h.properties.lat;
        const hotelLng = h.properties.lon;

        if (!hotelLat || !hotelLng) return null;

        const distance = calculateDistance(
          latNum,
          lngNum,
          hotelLat,
          hotelLng
        );

        return {
          name: h.properties.name || "Unnamed Hotel",
          latitude: hotelLat,
          longitude: hotelLng,
          distance_km: Number(distance.toFixed(2)),
        };
      })
      .filter(Boolean);

    results.sort((a, b) => a.distance_km - b.distance_km);

    // =========================
    // SAVE CACHE (ONLY IF DATA EXISTS)
    // =========================
    if (results.length > 0) {
      await new Promise((resolve) => {
        db.query(
          "DELETE FROM nearest_hotels WHERE tour_id = ?",
          [tour_id],
          () => resolve()
        );
      });

      results.forEach((hotel) => {
        db.query(
          `INSERT INTO nearest_hotels
           (tour_id, search_lat, search_lng, hotel_name, hotel_lat, hotel_lng, distance_km)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            tour_id,
            latNum,
            lngNum,
            hotel.name,
            hotel.latitude,
            hotel.longitude,
            hotel.distance_km,
          ]
        );
      });
    }

    return res.json(results);

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};