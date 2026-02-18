const axios = require("axios");
const db = require("../config/db");

// Distance calculator
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
        return res.status(400).json({ message: "Latitude & Longitude required" });
    }

    try {
        const query = `
            [out:json];
            node["tourism"="hotel"](around:5000,${lat},${lng});
            out;
        `;

        const response = await axios.post(
            "https://overpass-api.de/api/interpreter",
            query,
            { headers: { "Content-Type": "text/plain" } }
        );

        const hotels = response.data.elements;

        if (!hotels.length) {
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

        // Save to database
        db.query(
            `INSERT INTO nearest_hotels 
            (search_lat, search_lng, hotel_name, hotel_lat, hotel_lng, distance_km)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [lat, lng, hotelName, nearest.lat, nearest.lon, minDistance],
        );

        res.json({
            name: hotelName,
            latitude: nearest.lat,
            longitude: nearest.lon,
            distance_km: minDistance.toFixed(2)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
