import express from "express";
import crypto from "crypto";
import { pool } from "../config/db.js";


const router = express.Router();

// ---------- PASSWORD HELPERS ----------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(password, salt, 64).toString("hex");
  return test === hash;
}

// ========== POST /api/auth/signup ==========
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({ message: "Name too short" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password min 6 chars" });
    }

    // 1) check if email already exists
    const [existingRows] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({ message: "Email already used" });
    }

    // 2) hash password
    const passwordHash = hashPassword(password);

    // 3) insert user
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    const newUserId = result.insertId;

    // 4) create session
    req.session.userId = newUserId;

    return res.status(201).json({
      id: newUserId,
      name,
      email,
      role: "user", // DB default
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error during signup." });
  }
});

// ========== POST /api/auth/login ==========
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // find user in DB
    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // verify password
    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // set session
    req.session.userId = user.id;

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
});

// ========== GET /api/auth/me ==========
router.get("/me", async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const userId = req.session.userId;

    const [rows] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      // user not found in DB (maybe deleted)
      return res.status(401).json({ message: "Not logged in" });
    }

    const user = rows[0];

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Auth me error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ========== POST /api/auth/logout ==========
router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.json({ ok: true });
  }
  req.session.destroy(() => res.json({ ok: true }));
});

export default router;
