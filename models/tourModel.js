const db = require("../config/db");
const axios = require("axios");

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

// =========================
// GET LAT/LNG FROM DESTINATION
// =========================
async function getCoordinatesFromDestination(destination) {
  try {
    if (!destination || !GEOAPIFY_API_KEY) {
      return {
        latitude: null,
        longitude: null,
      };
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
      return {
        latitude: null,
        longitude: null,
      };
    }

    return {
      latitude: place.properties.lat,
      longitude: place.properties.lon,
    };
  } catch (error) {
    console.error("Geocoding failed:", error.message);

    return {
      latitude: null,
      longitude: null,
    };
  }
}

/* GET ALL TOURS */
exports.getAllTours = function (callback) {
  const sql = `
    SELECT 
      t.*,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
      COUNT(r.id) AS review_count
    FROM tours t
    LEFT JOIN ratings r ON t.id = r.tour_id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;

  db.query(sql, callback);
};

/* GET TOUR BY ID */
exports.getTourById = function (id, callback) {
  const sql = `
    SELECT 
      t.*,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
      COUNT(r.id) AS review_count
    FROM tours t
    LEFT JOIN ratings r ON t.id = r.tour_id
    WHERE t.id = ?
    GROUP BY t.id
  `;

  db.query(sql, [id], callback);
};

/* CREATE TOUR */
exports.createTour = async function (tour, callback) {
  const coordinates = await getCoordinatesFromDestination(tour.destination);

  const sql = `
    INSERT INTO tours
    (
      title, 
      destination, 
      price, 
      duration, 
      category, 
      subcategory, 
      latitude, 
      longitude, 
      description, 
      image
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      tour.title,
      tour.destination,
      tour.price,
      tour.duration,
      tour.category,
      tour.subcategory,
      coordinates.latitude,
      coordinates.longitude,
      tour.description,
      tour.image,
    ],
    callback
  );
};

/* UPDATE TOUR */
exports.updateTour = async function (id, tour, callback) {
  const coordinates = await getCoordinatesFromDestination(tour.destination);

  const sql = `
    UPDATE tours
    SET 
      title = ?, 
      destination = ?, 
      price = ?, 
      duration = ?, 
      category = ?, 
      subcategory = ?, 
      latitude = COALESCE(?, latitude), 
      longitude = COALESCE(?, longitude), 
      description = ?, 
      image = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      tour.title,
      tour.destination,
      tour.price,
      tour.duration,
      tour.category,
      tour.subcategory,
      coordinates.latitude,
      coordinates.longitude,
      tour.description,
      tour.image,
      id,
    ],
    callback
  );
};

/* DELETE TOUR */
exports.deleteTour = function (id, callback) {
  const deleteFavorites = "DELETE FROM favorites WHERE tour_id = ?";
  const deleteRatings = "DELETE FROM ratings WHERE tour_id = ?";
  const deleteBookings = "DELETE FROM tour_bookings WHERE tour_id = ?";
  const deleteHotels = "DELETE FROM nearest_hotels WHERE tour_id = ?";
  const deleteTour = "DELETE FROM tours WHERE id = ?";

  db.query(deleteFavorites, [id], function (err) {
    if (err) return callback(err);

    db.query(deleteRatings, [id], function (err) {
      if (err) return callback(err);

      db.query(deleteBookings, [id], function (err) {
        if (err) return callback(err);

        db.query(deleteHotels, [id], function (err) {
          if (err) return callback(err);

          db.query(deleteTour, [id], callback);
        });
      });
    });
  });
};

/* GET TOURS BY CATEGORY */
exports.getToursByCategory = function (category, callback) {
  const sql = `
    SELECT 
      t.*,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
      COUNT(r.id) AS review_count
    FROM tours t
    LEFT JOIN ratings r ON t.id = r.tour_id
    WHERE t.category = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;

  db.query(sql, [category], callback);
};

/* GET TOURS BY CATEGORY AND SUBCATEGORY */
exports.getToursByCategoryAndSubcategory = function (
  category,
  subcategory,
  callback
) {
  const sql = `
    SELECT 
      t.*,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
      COUNT(r.id) AS review_count
    FROM tours t
    LEFT JOIN ratings r ON t.id = r.tour_id
    WHERE LOWER(TRIM(t.category)) = LOWER(TRIM(?))
    AND LOWER(TRIM(t.subcategory)) = LOWER(TRIM(?))
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;

  db.query(sql, [category, subcategory], callback);
};