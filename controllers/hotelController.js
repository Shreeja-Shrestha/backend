const axios = require("axios");
const db = require("../config/db");

// Distance formula (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
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

    if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and Longitude required" });
    }

    try {

        console.log("Searching hotels near:", lat, lng);

        // 🔥 Improved Overpass Query
        const overpassQuery = `
            [out:json][timeout:25];
            (
              node["tourism"~"hotel|guest_house|motel|hostel"](around:5000,${lat},${lng});
            );
            out body;
        `;

        const response = await axios.post(
            "https://overpass-api.de/api/interpreter",
            overpassQuery,
            {
                headers: { "Content-Type": "text/plain" },
                timeout: 15000
            }
        );

        const hotels = response.data.elements;

        console.log("Hotels found:", hotels.length);

        if (!hotels || hotels.length === 0) {
            return res.json([]);
        }

        const results = hotels.map(hotel => {
            const distance = calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
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

        // ✅ Sort by nearest
        results.sort((a, b) => a.distance_km - b.distance_km);

        // ✅ Save nearest hotel in DB
        const nearest = results[0];

// 🔥 STEP 1: Check if hotel already exists
const checkSql = `
  SELECT id FROM hotels
  WHERE name = ? AND latitude = ? AND longitude = ?
`;

db.query(
  checkSql,
  [nearest.name, nearest.latitude, nearest.longitude],
  (err, existing) => {
    if (err) {
      console.error("Select Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (existing.length === 0) {
      // 🔥 STEP 2: Insert if not exists
      const insertSql = `
        INSERT INTO hotels (name, latitude, longitude, source)
        VALUES (?, ?, ?, 'OpenStreetMap')
      `;

      db.query(
        insertSql,
        [nearest.name, nearest.latitude, nearest.longitude],
        (err, result) => {
          if (err) {
            console.error("Insert Error:", err);
            return res.status(500).json({ message: "Insert failed" });
          }

          const hotelId = result.insertId;

          return res.json({
            hotels: results,
            nearest_hotel_id: hotelId
          });
        }
      );

    } else {
      const hotelId = existing[0].id;

      return res.json({
        hotels: results,
        nearest_hotel_id: hotelId
      });
    }
  }
);


        return res.json(results);

    } catch (error) {
        console.error("Overpass Error:", error.message);
        return res.status(500).json({ message: "Error fetching hotels" });
    }
};