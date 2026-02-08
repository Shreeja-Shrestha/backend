const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'tourandtravel_db' 
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to db:', err.message);
      setTimeout(handleDisconnect, 2000); // Try again in 2 seconds
    } else {
      console.log('Database connected (Single Connection Mode).');
    }
  });

  connection.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Re-establish connection
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = connection;