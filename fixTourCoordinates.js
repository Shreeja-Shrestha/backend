require("dotenv").config();
const axios = require("axios");
const db = require("./config/db");

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

async function getCoordinates(destination) {
  try {
    if (!destination || !GEOAPIFY_API_KEY) {
      return { latitude: null, longitude: null };
    }

    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/search",
      {
        params: {
          text: `${destination}, Nepal`,
          limit: 1,
          apiKey: GEOAPIFY_API_KEY,
        },
      }
    );

    const place = response.data.features?.[0];

    if (!place) {
      return { latitude: null, longitude: null };
    }

    return {
      latitude: place.properties.lat,
      longitude: place.properties.lon,
    };
  } catch (error) {
    console.error("Geocoding failed for:", destination, error.message);
    return { latitude: null, longitude: null };
  }
}

function query(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function fixCoordinates() {
  try {
    if (!GEOAPIFY_API_KEY) {
      console.log("GEOAPIFY_API_KEY is missing in .env");
      process.exit(1);
    }

    const tours = await query(`
      SELECT id, title, destination
      FROM tours
      WHERE latitude IS NULL OR longitude IS NULL
    `);

    console.log(`Found ${tours.length} tours without coordinates`);

    for (const tour of tours) {
      const coords = await getCoordinates(tour.destination);

      if (coords.latitude && coords.longitude) {
        await query(
          `
          UPDATE tours
          SET latitude = ?, longitude = ?
          WHERE id = ?
          `,
          [coords.latitude, coords.longitude, tour.id]
        );

        console.log(
          `Updated: ${tour.title} → ${coords.latitude}, ${coords.longitude}`
        );
      } else {
        console.log(`Could not find coordinates for: ${tour.title}`);
      }
    }

    console.log("Coordinate fixing completed");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing coordinates:", error);
    process.exit(1);
  }
}

fixCoordinates();