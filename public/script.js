//a script.js - client side
(function () {
  if (!document.getElementById('sweetalert-script')) {
    const swalScript = document.createElement('script');
    swalScript.id = 'sweetalert-script';
    swalScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    document.head.appendChild(swalScript);
  }
})();

window.showToast = function(message, icon = "success") {
  if (window.Swal) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: icon,
      title: message
    });
  } else {
    alert(message);
  }
};

(function () {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
  }
})();

const apiBase = "";

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  const btn = document.querySelector(".theme-toggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
  
  const dropdownThemeBtn = document.getElementById("dropdown-theme-toggle");
  if (dropdownThemeBtn) dropdownThemeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// ✅ Set button icon after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme");
  const btn = document.querySelector(".theme-toggle");
  if (btn) btn.textContent = saved === "dark" ? "☀️" : "🌙";
});
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
    window.showToast("Signed up!", "success");
    setTimeout(() => { window.location = "/index.html"; }, 1500);
  } else {
    window.showToast(data.error || "Signup failed", "error");
  }
}

async function signin(e) {
  e.preventDefault();
  const email = document.getElementById("si-email").value;
  const password = document.getElementById("si-password").value;
  const res = await fetch("/api/signin", { method: "POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ email, password })});
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    window.showToast("Signed in!", "success");
    setTimeout(() => { window.location = "/index.html"; }, 1500);
  } else {
    window.showToast(data.error || "Signin failed", "error");
  }
}

// Attach event listeners when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const signinLink = document.querySelector('a[href="signin.html"]');
  const signupLink = document.querySelector('a[href="signup.html"]');
  const navUl = document.querySelector('nav ul');

  if (token) {
    if (signinLink) signinLink.parentElement.style.display = "none";
    if (signupLink) signupLink.parentElement.style.display = "none";

    // Hide the original theme-toggle button
    const mainThemeToggle = document.querySelector(".theme-toggle");
    if (mainThemeToggle) mainThemeToggle.style.display = "none";

    const isDark = document.body.classList.contains("dark");
    const themeText = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

    const profileDropdown = document.createElement("div");
    profileDropdown.classList.add("profile-dropdown-container");
    profileDropdown.innerHTML = `
      <div class="profile-icon-btn" id="profile-dropdown-btn">
        <img src="https://ui-avatars.com/api/?name=User&background=b6f542&color=0d0d0d&rounded=true&bold=true" alt="Profile" class="profile-img">
      </div>
      <div class="profile-dropdown" id="profile-dropdown-menu">
        <a href="profile.html">Profile</a>
        <a href="#" id="dropdown-theme-toggle">${themeText}</a>
        <a href="#" id="logout-btn">Logout</a>
      </div>
    `;
    
    // Append to <nav> directly so it appears at the far right end
    const navNode = document.querySelector("nav");
    if (navNode) navNode.appendChild(profileDropdown);

    document.addEventListener("click", (e) => {
      const btn = document.getElementById("profile-dropdown-btn");
      const menu = document.getElementById("profile-dropdown-menu");
      
      if (btn && btn.contains(e.target)) {
        menu.classList.toggle("show");
      } else if (menu && !menu.contains(e.target)) {
        menu.classList.remove("show");
      }

      if (e.target.id === "dropdown-theme-toggle") {
        e.preventDefault();
        toggleTheme();
      }

      if (e.target.id === "logout-btn") {
        e.preventDefault();
        if (window.Swal) {
          Swal.fire({
            title: "Are you sure?",
            text: "Are you sure you want to logout?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#b6f542",
            cancelButtonColor: "#ff6b6b",
            confirmButtonText: "Yes, logout!"
          }).then((result) => {
            if (result.isConfirmed) {
              localStorage.removeItem("token");
              window.location = "/index.html";
            }
          });
        } else {
          const confirmed = confirm("Are you sure you want to logout ?");
          if(confirmed){
            localStorage.removeItem("token");
            window.location = "/index.html";
          }
        }
      }
    });
  } else {
    if (signinLink) signinLink.parentElement.style.display = "";
    if (signupLink) signupLink.parentElement.style.display = "";
  }

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


// ── CONTACT FORM ── ← paste here at the very bottom
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('c-username').value.trim();
    const email    = document.getElementById('c-email').value.trim();
    const message  = document.getElementById('c-message').value.trim();
    const status   = document.getElementById('form-status');
    const btn      = document.querySelector('.send-btn');

    btn.classList.add('loading');
    btn.querySelector('#btn-text').textContent = 'Sending...';
    status.textContent = '';
    status.className = 'form-status';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, message })
      });
      const data = await res.json();
      if (data.success) {
        status.textContent = '✅ Message sent successfully!';
        status.className = 'form-status success';
        form.reset();
      } else {
        status.textContent = '❌ ' + (data.error || 'Something went wrong.');
        status.className = 'form-status error';
      }
    } catch (err) {
      status.textContent = '❌ Network error. Please try again.';
      status.className = 'form-status error';
    } finally {
      btn.classList.remove('loading');
      btn.querySelector('#btn-text').textContent = 'Send Message';
    }
  });
});