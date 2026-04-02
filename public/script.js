// script.js - client side
const apiBase = "";

function toggleTheme() {
  document.body.classList.toggle("dark");
  const btn = document.querySelector(".theme-toggle");
  if (btn) btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Chat widget logic
function toggleChat() {
  const box = document.querySelector(".chatbot-container");
  box.style.display = box.style.display === "flex" ? "none" : "flex";
}

// append message to chat
function addMessage(text, who="bot") {
  const body = document.getElementById("chat-body");
  const el = document.createElement("div");
  el.className = "chat-message " + (who === "user" ? "user-msg" : "bot-msg");
  el.innerText = text;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}

// send message to server
async function sendMessage() {
  const input = document.getElementById("chat-input");
  const txt = input.value.trim();
  if (!txt) return;
  addMessage(txt, "user");
  input.value = "";

  // optional: include conversation history for context
  const history = []; // you may collect previous messages if you want
  try {
    addMessage("…thinking", "bot"); // temporary placeholder
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: txt, history })
    });
    const data = await res.json();
    // remove the temporary 'thinking' message
    const body = document.getElementById("chat-body");
    const last = body.lastChild;
    if (last && last.innerText === "…thinking") body.removeChild(last);

    if (data.reply) addMessage(data.reply, "bot");
    else addMessage("Sorry, no reply.", "bot");
  } catch (err) {
    console.error(err);
    addMessage("Network error.", "bot");
  }
}

// Auth helpers (signup/signin)
async function signup(e) {
  e.preventDefault();
  const username = document.getElementById("su-username").value;
  const email = document.getElementById("su-email").value;
  const password = document.getElementById("su-password").value;
  const res = await fetch("/api/signup", { method: "POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ username, email, password })});
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Signed up!");
    window.location = "/index.html";
  } else alert(data.error || "Signup failed");
}

async function signin(e) {
  e.preventDefault();
  const email = document.getElementById("si-email").value;
  const password = document.getElementById("si-password").value;
  const res = await fetch("/api/signin", { method: "POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ email, password })});
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Signed in!");
    window.location = "/index.html";
  } else alert(data.error || "Signin failed");
}

// Attach event listeners when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const chatToggle = document.getElementById("chat-toggle");
  if (chatToggle) chatToggle.addEventListener("click", toggleChat);
  const sendBtn = document.querySelector(".chat-footer button");
  if (sendBtn) sendBtn.addEventListener("click", sendMessage);
  const chatInput = document.getElementById("chat-input");
  if (chatInput) chatInput.addEventListener("keypress", (ev)=>{ if(ev.key==='Enter') sendMessage(); });

  const suForm = document.getElementById("signup-form");
  if (suForm) suForm.addEventListener("submit", signup);
  const siForm = document.getElementById("signin-form");
  if (siForm) siForm.addEventListener("submit", signin);
});
