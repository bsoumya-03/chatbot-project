async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const message = input.value.trim();

  if (message === "") return;

  // Show user message
  const userMsg = document.createElement("p");
  userMsg.classList.add("user-msg");
  userMsg.innerText = message;
  chatBox.appendChild(userMsg);

  // Clear input
  input.value = "";

  // Call backend
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    // Show bot reply
    const botMsg = document.createElement("p");
    botMsg.classList.add("bot-msg");
    botMsg.innerText = data.reply || "⚠️ Sorry, no reply.";
    chatBox.appendChild(botMsg);

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error(err);
  }
}
