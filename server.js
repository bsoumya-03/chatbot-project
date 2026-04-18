import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

// Load .env
dotenv.config();

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Database setup
let db;
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
  
  await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
})();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ====================== AUTH ROUTES ======================

// ✅ FIXED: /signup → /api/signup + returns token
app.post("/api/signup", async (req, res) => {
  try {
    const { username,email, password } = req.body;

    if (!username ||!email|| !password) {
      return res.status(400).json({ error: "Username,email and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.run(
      "INSERT INTO users (username,email, password) VALUES (?,?,?)",
      [username,email, hashed]
    );

    const user = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "User already exists" });
  }
});

// ✅ FIXED: /login → /api/signin
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if ( !email || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // email field is used as username from script.js
    const user = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware to check JWT
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// ====================== CHAT ROUTE ======================

// ✅ FIXED: /chat → /api/chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        }),
      }
    );
if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      return res.json({ reply: "⚠️ API error" });
    }
    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "⚠️ Sorry, I didn't get a reply.";

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.json({ reply: "⚠️ Error processing your request." });
  }
});
// ── your existing routes above (/api/signup, /api/signin, /api/chat) ──


// ── CONTACT ROUTE ── ← paste here
app.post("/api/contact", async (req, res) => {
  try {
    const { username, email, message } = req.body;

    if (!username || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    await db.run(
      "INSERT INTO contacts (username, email, message) VALUES (?, ?, ?)",
      [username, email, message]
    );

    res.json({ success: true, message: "Message received!" });

  } catch (err) {
    console.error("Contact route error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});
// ── GET PROFILE ──
app.get("/api/profile", authenticate, async (req, res) => {
  const user = await db.get("SELECT username, email FROM users WHERE id = ?", [req.user.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// ── CHANGE PASSWORD ──
app.post("/api/change-password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await db.get("SELECT * FROM users WHERE id = ?", [req.user.id]);
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(400).json({ error: "Current password is wrong." });
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);
  res.json({ success: true });
});



// ====================== START SERVER ======================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
