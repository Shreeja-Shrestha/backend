const tourModel = require("../models/tourModel");

const db = require("../config/db");
/* GET ALL TOURS */
exports.getTours = function (req, res) {

  tourModel.getAllTours(function (err, result) {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

};


/* GET TOUR BY ID */
exports.getTourById = function (req, res) {

  const id = req.params.id;

  tourModel.getTourById(id, function (err, result) {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result[0]);

  });

};


/* CREATE TOUR */
exports.createTour = function (req, res) {

  const tour = req.body;

  tourModel.createTour(tour, function (err, result) {

    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Tour created successfully",
      tourId: result.insertId
    });

  });

};


/* UPDATE TOUR */
exports.updateTour = function (req, res) {

  const id = req.params.id;
  const tour = req.body;

  tourModel.updateTour(id, tour, function (err, result) {

    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Tour updated successfully"
    });

  });

};


/* DELETE TOUR */
exports.deleteTour = function (req, res) {
  const id = req.params.id;

  tourModel.deleteTour(id, function (err, result) {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    // This checks if a row was actually deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tour not found" });
    }

    res.status(200).json({
      message: "Tour deleted successfully"
    });

  });
};
/* GET TOURS BY CATEGORY */
exports.getToursByCategory = function (req, res) {

  const category = req.params.category;

  tourModel.getToursByCategory(category, function (err, result) {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

};
exports.getHomeTours = function (req, res) {
  const sql = `
    SELECT * FROM tours
    WHERE category IS NOT NULL
    AND TRIM(LOWER(category)) NOT IN ('food', 'outdoor', 'water')
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json(err);
    }

    res.json(results);
  });
};
exports.getToursByCategoryAndSubcategory = function (req, res) {
  const { category, subcategory } = req.params;

  tourModel.getToursByCategoryAndSubcategory(
    category,
    subcategory,
    function (err, result) {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
};