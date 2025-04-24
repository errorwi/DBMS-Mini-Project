document.addEventListener("DOMContentLoaded", () => {
  const messageBtn = document.querySelector(".btn:nth-child(1)");
  const inviteBtn = document.querySelector(".btn:nth-child(2)");
  const giftBtn = document.querySelector(".btn:nth-child(3)");
  const chatBox = document.getElementById("chat-box");
  const closeChatBtn = document.getElementById("close-chat");
  const sendBtn = document.getElementById("send-btn");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  messageBtn.addEventListener("click", () => {
    chatBox.classList.remove("hidden");
  });

  closeChatBtn.addEventListener("click", () => {
    chatBox.classList.add("hidden");
  });

  sendBtn.addEventListener("click", () => {
    const message = chatInput.value.trim();
    if (message) {
      const msgDiv = document.createElement("div");
      msgDiv.textContent = `You: ${message}`;
      msgDiv.style.marginBottom = "8px";
      chatMessages.appendChild(msgDiv);
      chatInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  inviteBtn.addEventListener("click", () => {
    const id = prompt("Enter the Friendship ID to invite:");
    if (id) {
      alert(`Invite sent to Friendship ID: ${id}`);
    } else {
      alert("Invite cancelled.");
    }
  });

  giftBtn.addEventListener("click", () => {
    alert("Gift sent!");
  });
});
