const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// MySQL connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // your MySQL password if any
  database: 'your_database_name'
});

connection.connect(error => {
  if (error) {
    console.error('MySQL connection error:', error);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Simple route
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// Example route to fetch data from MySQL
app.get('/users', (req, res) => {
  connection.query('SELECT * FROM users', (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
