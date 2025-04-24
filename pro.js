document.addEventListener('DOMContentLoaded', async () => {
    // Get username from URL parameter or localStorage
    // For this example, we'll use localStorage from the login
    const username = localStorage.getItem('username');
    
    if (!username) {
        alert("Please login first");
        window.location.href = "file.html"; // Redirect to login
        return;
    }
    
    try {
        // Fetch user data from server
        const response = await fetch(`http://localhost:5000/profile?username=${username}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch profile data");
        }
        
        const userData = await response.json();
        
        // Update the profile page with user data
        document.querySelector('.content__title h1').textContent = `Username: ${userData.username}`;
        document.querySelector('.content__title span').textContent = `Player ID: ${userData.player_id || "N/A"}`;
        
        // Update email and region if available
        const descriptionParagraphs = document.querySelectorAll('.content__description p');
        descriptionParagraphs[0].textContent = `Region: ${userData.region || "Not specified"}`;
        descriptionParagraphs[1].textContent = `E-Mail: ${userData.email || "Not specified"}`;
        
        // Update stats if available
        const statElements = document.querySelectorAll('.content__list li span');
        statElements[0].textContent = userData.skill_level || '0';
        statElements[1].textContent = userData.wins || '0';
        statElements[2].textContent = userData.losses || '0';
        
        // Update avatar
        if (userData.avatarPath) {
            document.getElementById('current-avatar').src = userData.avatarPath;
        }
        
    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Could not load profile data. Please try again later.");
    }
});