const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    console.log("Register request received:", { username, email, password });

    const sql = "INSERT INTO players (username, email, password_hash) VALUES (?, ?, ?)";
    db.query(sql, [username, email, password], (err, result) => {  // Use password instead of password
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "User registered successfully!" });
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});

app.post("/file", (req, res) => {
    const { username, password } = req.body;

    console.log("Login request received:", { username, password });

    const sql = "SELECT * FROM players WHERE username = ? AND password_hash = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length > 0) {
            res.json({ message: "Login successful!" });
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }
    });
});

