import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

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

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || name.length < 2) return res.status(400).json({ message: "Name too short" });
    if (!email) return res.status(400).json({ message: "Email required" });
    if (!password || password.length < 6) return res.status(400).json({ message: "Password min 6 chars" });

    const existing = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (existing.rows.length > 0) return res.status(409).json({ message: "Email already used" });

    const passwordHash = hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error during signup." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const result = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const row = result.rows[0];
    if (!verifyPassword(password, row.password_hash)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = signToken(user);
    return res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1 LIMIT 1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(401).json({ message: "Not logged in" });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Auth me error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/auth/logout — JWT is stateless, so just acknowledge
router.post("/logout", (req, res) => res.json({ ok: true }));

// GET /api/auth/profile — full profile including saved address
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, phone, address FROM users WHERE id = $1 LIMIT 1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(401).json({ message: "Not logged in" });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;