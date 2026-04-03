const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'tourandtravel_db',
  port: 3306
});

connection.connect((err) => {
  if (err) throw err;
  console.log('DB connected');
});

module.exports = connection;