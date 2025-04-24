document.addEventListener('DOMContentLoaded', () => {
  const avatarOptions = document.querySelectorAll('.avatar-option');
  const selectedAvatarInput = document.getElementById('selectedAvatar');
  const profileForm = document.getElementById('profileForm');
  const messageElement = document.getElementById('message');
  
  // Set the first avatar as selected by default
  avatarOptions[0].classList.add('selected');
  
  // Add click event listeners to all avatar options
  avatarOptions.forEach(avatar => {
    avatar.addEventListener('click', () => {
      // Remove 'selected' class from all avatars
      avatarOptions.forEach(av => av.classList.remove('selected'));
      
      // Add 'selected' class to clicked avatar
      avatar.classList.add('selected');
      
      // Update the hidden input value
      selectedAvatarInput.value = avatar.getAttribute('data-avatar');
    });
  });
  
  // Handle form submission
  profileForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const avatarPath = selectedAvatarInput.value;
    
    try {
      // Send data to server - use your server port (5000)
      const response = await fetch("http://localhost:5000/editProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          avatarPath
        })
      });
      
      if (!response.ok) {
        throw new Error("Server error: " + response.status);
      }
      
      const result = await response.json();
      messageElement.textContent = result.message;
      messageElement.style.color = 'green';
      
    } catch (error) {
      console.error("Error:", error);
      messageElement.textContent = "Update failed. Please try again.";
      messageElement.style.color = 'red';
    }
  });
});

  