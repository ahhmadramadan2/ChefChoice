import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import dishesRoutes from "./routes/dishes.js";
import ordersRoutes from "./routes/orders.js";
import contactRoutes from "./routes/contact.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: false, // JWT in Authorization header, no cookies
}));

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error("API ERROR:", err);
  res.status(500).json({ message: err.message || "Server error" });
});

export default app;