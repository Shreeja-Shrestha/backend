const axios = require("axios");
const db = require("../config/db");

// Haversine Distance Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = val => val * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

exports.getNearestHotel = async (req, res) => {
  const { lat, lng } = req.query;

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return res.status(400).json({ message: "Invalid latitude or longitude" });
  }

  try {

    console.log("Searching hotels near:", latNum, lngNum);

    // =========================
    // CHECK CACHE IN DATABASE
    // =========================
    const cachedHotels = await new Promise((resolve) => {
      db.query(
        `SELECT hotel_name AS name,
                hotel_lat AS latitude,
                hotel_lng AS longitude,
                distance_km
         FROM nearest_hotels
         WHERE ABS(search_lat - ?) < 0.01
         AND ABS(search_lng - ?) < 0.01
         ORDER BY created_at DESC
         LIMIT 10`,
        [latNum, lngNum],
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
    // OVERPASS QUERY
    // =========================
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"~"hotel|guest_house|motel|lodge"](around:20000,${latNum},${lngNum});
      );
      out body;
    `;

    const response = await axios.get(
      "https://overpass-api.de/api/interpreter",
      {
        params: { data: overpassQuery },
        timeout: 20000
      }
    );

    const hotels = response.data.elements;

    console.log("Hotels found:", hotels.length);

    if (!hotels || hotels.length === 0) {
      return res.json([]);
    }

    // =========================
    // CALCULATE DISTANCE
    // =========================
    const results = hotels.map(hotel => {

      const distance = calculateDistance(
        latNum,
        lngNum,
        hotel.lat,
        hotel.lon
      );

      return {
        name: hotel.tags?.name || "Unnamed Hotel",
        latitude: hotel.lat,
        longitude: hotel.lon,
        distance_km: parseFloat(distance.toFixed(2))
      };
    });

    // =========================
    // SORT BY NEAREST
    // =========================
    results.sort((a, b) => a.distance_km - b.distance_km);

    const topHotels = results.slice(0, 10);

    // =========================
    // SAVE NEAREST HOTEL
    // =========================
    const nearest = topHotels[0];

    db.query(
      `INSERT INTO nearest_hotels
       (search_lat, search_lng, hotel_name, hotel_lat, hotel_lng, distance_km)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        latNum,
        lngNum,
        nearest.name,
        nearest.latitude,
        nearest.longitude,
        nearest.distance_km
      ],
      (err) => {
        if (err) {
          console.error("Database Insert Error:", err);
        } else {
          console.log("Nearest hotel saved successfully");
        }
      }
    );

    return res.json(topHotels);

  } catch (error) {

    console.error("Overpass Error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Error fetching hotels"
    });
  }
};