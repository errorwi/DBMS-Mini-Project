const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",  // Change if needed
    password: "0range69",  // Use the password you set
    database: "game_lobby_db"
});

db.connect(err => {
    if (err) {
        console.error("MySQL connection failed:", err);
    } else {
        console.log("Connected to MySQL!");
    }
});

module.exports = db;
