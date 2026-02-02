const db = require("../db");

/* =========================
   ADD TOUR PACKAGE (ADMIN)
========================= */
exports.addPackage = (req, res) => {
  const {
    title,
    destination,
    price,
    duration,
    category,
    description,
    image,
    created_by
  } = req.body;

  const sql = `
    INSERT INTO packages
    (title, destination, price, duration, category, description, image, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, destination, price, duration, category, description, image, created_by],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Package added successfully", id: result.insertId });
    }
  );
};

/* =========================
   GET ALL PACKAGES
========================= */
exports.getPackages = (req, res) => {
  const sql = `
    SELECT id, title, destination, price, duration, category, description, image, created_by
    FROM packages
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

/* =========================
   UPDATE PACKAGE (ADMIN)
========================= */
exports.updatePackage = (req, res) => {
  const { id } = req.params;
  const {
    title,
    destination,
    price,
    duration,
    category,
    description,
    image
  } = req.body;

  const sql = `
    UPDATE packages
    SET title=?, destination=?, price=?, duration=?, category=?, description=?, image=?
    WHERE id=?
  `;

  db.query(
    sql,
    [title, destination, price, duration, category, description, image, id],
    err => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Package updated successfully" });
    }
  );
};

/* =========================
   DELETE PACKAGE (ADMIN)
========================= */
exports.deletePackage = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM packages WHERE id=?", [id], err => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Package deleted successfully" });
  });
};
