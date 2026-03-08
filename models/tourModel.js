const db = require("../config/db");

exports.getAllTours = (callback) => {
  db.query("SELECT * FROM tours", callback);
};

exports.getTourById = (id, callback) => {
  db.query("SELECT * FROM tours WHERE id = ?", [id], callback);
};