const axios = require("axios");
const db = require("../config/db");

// Distance formula
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

    if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and Longitude required" });
    }

    try {

        // 🔥 THIS IS THE HOTEL API CALL
        const overpassQuery = `
            [out:json];
            node["tourism"="hotel"](around:5000,${lat},${lng});
            out;
        `;

        const response = await axios.post(
            "https://overpass-api.de/api/interpreter",
            overpassQuery,
            { headers: { "Content-Type": "text/plain" } }
        );

        const hotels = response.data.elements;

        if (!hotels || hotels.length === 0) {
            return res.json({ message: "No hotels found nearby" });
        }

        let nearest = null;
        let minDistance = Infinity;

        hotels.forEach(hotel => {
            const distance = calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
                hotel.lat,
                hotel.lon
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = hotel;
            }
        });

        const hotelName = nearest.tags?.name || "Unnamed Hotel";

        // Optional: Save in database
        db.query(
            `INSERT INTO nearest_hotels 
            (search_lat, search_lng, hotel_name, hotel_lat, hotel_lng, distance_km)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [lat, lng, hotelName, nearest.lat, nearest.lon, minDistance]
        );

        return res.json({
            name: hotelName,
            latitude: nearest.lat,
            longitude: nearest.lon,
            distance_km: minDistance.toFixed(2)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching hotels" });
    }
};