import express from "express";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { pool } from "../config/db.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/", limiter, async (req, res) => {
  const { name, email, topic, message } = req.body || {};

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }
  if (String(message).length > 3000) {
    return res.status(400).json({ message: "Message is too long." });
  }

  // 1) Store in MySQL
  let insertId = null;
  try {
    const [result] = await pool.query(
      "INSERT INTO contact_messages (name, email, topic, message) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim(), topic.trim(), String(message).trim()]
    );
    insertId = result.insertId;
  } catch (dbErr) {
    console.error("DB insert failed:", dbErr);
    return res.status(500).json({ message: "Database error saving message." });
  }

  // 2) Email notification (optional)
  try {
    const hasSMTP =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.CONTACT_FROM_EMAIL &&
      process.env.CONTACT_TO_EMAIL;

    if (hasSMTP) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE) === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.CONTACT_FROM_EMAIL,
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: email.trim(),
        subject: `[ChefChoice] New Contact: ${topic}`,
        text:
          `New contact message\n\n` +
          `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n` +
          `Message:\n${message}\n\n` +
          `Message ID: ${insertId}`,
      });
    } else {
      console.warn("SMTP not configured → skipping email notification");
    }
  } catch (mailErr) {
    console.error("Email send failed (message still saved):", mailErr.message);
  }

  return res.status(201).json({
    message: "Message sent successfully.",
    id: insertId,
  });
});

export default router;
