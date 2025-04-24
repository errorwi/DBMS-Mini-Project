document.getElementById("registerForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const password = document.getElementById("pwd").value;
    const confirmPassword = document.getElementById("repwd").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match! Please try again.");
        return;
    }

    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        region: document.getElementById("region").value,
        password: password
    };

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Error:", error);
        alert("Registration failed. Please try again.");
    }
});

// Login User
document.getElementById("loginForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("pwd").value
    };

    try {
        const response = await fetch("http://localhost:5000/file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Store the username and player_id in localStorage
            localStorage.setItem('username', document.getElementById("username").value);
            localStorage.setItem('player_id', result.player_id); // Store the player_id from the response
            alert("Login successful!");
            window.location.href = "home.html"; // Redirect to game lobby
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
    }
});

// Create Lobby Function
async function createLobby(playerName) {
    try {
        const player_id = localStorage.getItem('player_id');
        
        const response = await fetch("http://localhost:5000/create-lobby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName, player_id })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || "Server error: " + response.status);
        }
        
        if (result.success) {
            // Store lobby information in localStorage
            localStorage.setItem('lobbyCode', result.lobby.code);
            localStorage.setItem('playerName', playerName);
            localStorage.setItem('isHost', 'true');
            
            // Return the lobby data
            return result.lobby;
        } else {
            alert("Failed to create lobby");
            return null;
        }
    } catch (error) {
        console.error("Error creating lobby:", error);
        alert("Failed to create lobby: " + error.message);
        return null;
    }
}

// Join Lobby Function
async function joinLobby(playerName, lobbyCode) {
    try {
        const player_id = localStorage.getItem('player_id');
        
        const response = await fetch("http://localhost:5000/join-lobby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName, lobbyCode, player_id })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || "Server error: " + response.status);
        }
        
        if (result.success) {
            // Store lobby information in localStorage
            localStorage.setItem('lobbyCode', result.lobby.code);
            localStorage.setItem('playerName', playerName);
            localStorage.setItem('isHost', 'false');
            
            // Return the lobby data
            return result.lobby;
        } else {
            alert("Failed to join lobby");
            return null;
        }
    } catch (error) {
        console.error("Error joining lobby:", error);
        alert("Failed to join lobby: " + error.message);
        return null;
    }
}

// Function to update member list in the UI
function updateMemberList(members) {
    const list = document.getElementById('membersList');
    if (!list) return;
    
    list.innerHTML = '';
    members.forEach((member, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${member.name}${member.isHost ? ' (Host)' : ''}`;
        list.appendChild(li);
    });
}

// Add event listeners for the create and join lobby forms
document.addEventListener('DOMContentLoaded', () => {
    // For create-lobby.html
    const createLobbyBtn = document.querySelector('button[onclick="createLobby()"]');
    if (createLobbyBtn) {
        // Replace the onclick attribute with an event listener
        createLobbyBtn.removeAttribute('onclick');
        createLobbyBtn.addEventListener('click', async () => {
            const playerName = document.getElementById('playerName').value.trim();
            if (!playerName) {
                alert("Please enter your name.");
                return;
            }
            
            const lobby = await createLobby(playerName);
            if (lobby) {
                document.getElementById('lobbyResult').innerText = `Lobby Created!\nCode: ${lobby.code}`;
                updateMemberList(lobby.members);
                document.getElementById('membersSection').style.display = 'block';
            }
        });
    }
    
    // For join-lobby.html
    const joinLobbyBtn = document.querySelector('button[onclick="joinLobby()"]');
    if (joinLobbyBtn) {
        // Replace the onclick attribute with an event listener
        joinLobbyBtn.removeAttribute('onclick');
        joinLobbyBtn.addEventListener('click', async () => {
            const playerName = document.getElementById('playerName').value.trim();
            const lobbyCode = document.getElementById('lobbyCode').value.trim().toUpperCase();
            
            if (!playerName || !lobbyCode) {
                alert("Please enter your name and the lobby code.");
                return;
            }
            
            const lobby = await joinLobby(playerName, lobbyCode);
            if (lobby) {
                document.getElementById('result').innerText = `Joined Lobby: ${lobby.code}\nWelcome, ${playerName}!`;
                // Alternative: redirect to a lobby page
                // window.location.href = `lobby.html?code=${lobby.code}`;
            }
        });
    }
});
