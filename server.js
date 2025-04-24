const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const multer = require('multer'); 
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp for uniqueness
  },
});
const upload = multer({ storage: storage });
// Add this to your existing server.js file
app.post('/editProfile', upload.single('avatar'), async (req, res) => {
    const { username, password, avatarPath } = req.body;
    
    try {
      // Update the user in your database
      // This syntax might need adjustment based on your database setup
      const result = await db.query(
        'UPDATE players SET avatarPath = ?, password_hash = ? WHERE username = ?',
        [avatarPath, password, username]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });


app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  const { username, email, region, password } = req.body;

  console.log("Register request received:", { username, email, region, password });

  const sql = "INSERT INTO players (username, email, region, password_hash) VALUES (?, ?, ?, ?)";
  try {
      console.log("Executing SQL:", sql);
      console.log("With parameters:", [username, email, region, password]);
      
      const [result] = await db.query(sql, [username, email, region, password]);
      console.log("SQL result:", result);

      res.json({ message: "User registered successfully!" });
  } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).json({ error: err.message });
  }
});


app.listen(5000, () => {
    console.log("Server running on port 5000");
});

// const bcrypt=require("bcryptjs");
app.post("/file", async (req, res) => {
    const { username, password } = req.body;

    console.log("Login request received:", { username, password });

    try {
        const [rows] = await db.query("SELECT * FROM players WHERE username = ?", [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = rows[0];

        // Compare plain-text password
        if (password === user.password_hash) {
            res.json({ message: "Login successful!",  player_id: user.player_id});
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

// Add this to your server.js
app.get("/profile", async (req, res) => {

  const username = req.query.username;
  
  try {
      const [rows] = await db.query(
          "SELECT username, email, avatarPath, region, player_id, skill_level, wins, losses FROM players WHERE username = ?", 
          [username]
      );
      
      if (rows.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }
      
      res.json(rows[0]);
  } catch (err) {
      console.error("Error fetching profile:", err);
      res.status(500).json({ error: "Server error" });
  }
});


app.post("/fixed-create-lobby", async (req, res) => {
    const { playerName, player_id } = req.body;
    
    if (!playerName) {
        return res.status(400).json({ error: "Player name is required" });
    }
    
    // Generate a 6-character lobby code
    const lobbyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const lobbyId = uuidv4();
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL datetime format
    
    try {
        // First, create the lobby record
        const [lobbyResult] = await db.query(
            "INSERT INTO lobbies (lobby_id, lobby_code, created_at, host_name, status) VALUES (?, ?, ?, ?, ?)",
            [lobbyId, lobbyCode, createdAt, playerName, 'waiting']
        );
        
        // Then add the host as the first member
        const memberId = uuidv4();
        await db.query(
            "INSERT INTO lobby_members (member_id, lobby_id, player_name, is_host, player_id) VALUES (?, ?, ?, ?, ?)",
            [memberId, lobbyId, playerName, true, player_id || NULL]
        );
        
        // Get all members to return in response
        const [members] = await db.query(
            "SELECT member_id as id, player_name as name, is_host as isHost FROM lobby_members WHERE lobby_id = ?",
            [lobbyId]
        );
        
        console.log(`Lobby created: ${lobbyCode} by ${playerName}`);
        
        res.json({ 
            success: true, 
            lobby: {
                id: lobbyId,
                code: lobbyCode,
                host: playerName,
                members: members
            }
        });
    } catch (err) {
        console.error("Error creating lobby:", err);
        res.status(500).json({ error: "Failed to create lobby" });
    }
});

// Join an existing lobby
app.post("/fixed-join-lobby", async (req, res) => {
    const { playerName, lobbyCode, player_id} = req.body;
    
    if (!playerName || !lobbyCode) {
        return res.status(400).json({ error: "Player name and lobby code are required" });
    }
    
    try {
        // Check if the lobby exists
        const [lobbies] = await db.query(
            "SELECT lobby_id, host_name, status FROM lobby WHERE lobby_code = ?",
            [lobbyCode]
        );
        
        if (lobbies.length === 0) {
            return res.status(404).json({ error: "Lobby not found" });
        }
        
        const lobby = lobbies[0];
        
        // Check if game is already in progress
        if (lobby.status !== 'waiting') {
            return res.status(400).json({ error: "This game is already in progress" });
        }
        
        // Add player to the lobby
        const memberId = uuidv4();
        await db.query(
            "INSERT INTO lobby_members (member_id, lobby_id, player_name, is_host, player_id) VALUES (?, ?, ?, ?, ?)",
            [memberId, lobby.lobby_id, playerName, false, player_id]
        );
        
        // Get all members to return in response
        const [members] = await db.query(
            "SELECT member_id as id, player_name as name, is_host as isHost FROM lobby_members WHERE lobby_id = ?",
            [lobby.lobby_id]
        );
        

        console.log(`Player ${playerName} joined lobby: ${lobbyCode}`);
        
        res.json({ 
            success: true, 
            lobby: {
                id: lobby.lobby_id,
                code: lobbyCode,
                host: lobby.host_name,
                members: members
            }
        });
    } catch (err) {
        console.error("Error joining lobby:", err);
        res.status(500).json({ error: "Failed to join lobby" });
    }
});

// Get lobby information
app.get("/lobby/:code", async (req, res) => {
    const lobbyCode = req.params.code;
    
    try {
        // Get lobby information
        const [lobbies] = await db.query(
            "SELECT lobby_id, lobby_code, host_name, status FROM lobbies WHERE lobby_code = ?",
            [lobbyCode]
        );
        
        if (lobbies.length === 0) {
            return res.status(404).json({ error: "Lobby not found" });
        }
        
        const lobby = lobbies[0];
        
        // Get all members
        const [members] = await db.query(
            "SELECT member_id as id, player_name as name, is_host as isHost FROM lobby_members WHERE lobby_id = ?",
            [lobby.lobby_id]
        );
        
        res.json({
            success: true,
            lobby: {
                id: lobby.lobby_id,
                code: lobbyCode,
                host: lobby.host_name,
                members: members,
                status: lobby.status
            }
        });
    } catch (err) {
        console.error("Error getting lobby:", err);
        res.status(500).json({ error: "Failed to get lobby information" });
    }
});
    

