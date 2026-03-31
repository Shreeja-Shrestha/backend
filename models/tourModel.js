const db = require("../config/db");

/* GET ALL TOURS */
exports.getAllTours = function (callback) {

  const sql = "SELECT * FROM tours ORDER BY created_at DESC";

  db.query(sql, callback);

};


/* GET TOUR BY ID */
exports.getTourById = function (id, callback) {

  const sql = "SELECT * FROM tours WHERE id = ?";

  db.query(sql, [id], callback);

};


/* CREATE TOUR */
exports.createTour = function (tour, callback) {

  const sql = `
    INSERT INTO tours
    (title, destination, price, duration, category, description, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      tour.title,
      tour.destination,
      tour.price,
      tour.duration,
      tour.category,
      tour.description,
      tour.image
    ],
    callback
  );

};


/* UPDATE TOUR */
exports.updateTour = function (id, tour, callback) {

  const sql = `
    UPDATE tours
    SET title=?, destination=?, price=?, duration=?, category=?, description=?, image=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      tour.title,
      tour.destination,
      tour.price,
      tour.duration,
      tour.category,
      tour.description,
      tour.image,
      id
    ],
    callback
  );

};


/* DELETE TOUR */
exports.deleteTour = function (id, callback) {

  const deleteFavorites = "DELETE FROM favorites WHERE tour_id = ?";
  const deleteRatings = "DELETE FROM ratings WHERE tour_id = ?";
  const deleteBookings = "DELETE FROM tour_bookings WHERE tour_id = ?";
  const deleteTour = "DELETE FROM tours WHERE id = ?";

  db.query(deleteFavorites, [id], function(err) {
    if (err) return callback(err);

    db.query(deleteRatings, [id], function(err) {
      if (err) return callback(err);

      db.query(deleteBookings, [id], function(err) {
        if (err) return callback(err);

        db.query(deleteTour, [id], callback);
      });

    });

  });

};
exports.getToursByCategory = function (category, callback) {

  const sql = "SELECT * FROM tours WHERE category = ? ORDER BY created_at DESC";

  db.query(sql, [category], callback);

};