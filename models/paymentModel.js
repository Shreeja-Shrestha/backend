const db = require("../config/db");

exports.savePayment = (data, callback) => {
  const sql = `
    INSERT INTO payments 
    (order_id, pidx, amount, transaction_id, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.order_id,
      data.pidx,
      data.amount,
      data.transaction_id,
      data.status
    ],
    callback
  );
};