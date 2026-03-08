const tourModel = require("../models/tourModel");

exports.getTours = (req, res) => {

  tourModel.getAllTours((err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

};

exports.getTourById = (req, res) => {

  const id = req.params.id;

  tourModel.getTourById(id, (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result[0]);

  });

};