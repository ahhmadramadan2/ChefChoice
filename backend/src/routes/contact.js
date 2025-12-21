import express from "express";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { pool } from "../config/db.js";





const router = express.Router();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 10, // 10 requests / 10 min per IP
  standardHeaders: true,
  legacyHeaders: false,
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/", limiter, async (req, res, next) => {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || !email || !topic || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    if (message.length > 3000) {
      return res.status(400).json({ message: "Message is too long." });
    }

    // 1) Store in MySQL
    const [result] = await pool.query(
      "INSERT INTO contact_messages (name, email, topic, message) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim(), topic.trim(), message.trim()]
    );

    // 2) Send email notification
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
        `Message ID: ${result.insertId}`,
    });

    return res.status(201).json({ message: "Message sent successfully." });
  } catch (err) {
    next(err);
  }
});

export default router;

