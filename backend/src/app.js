import express from "express";
import cors from "cors";
import session from "express-session";

import authRoutes from "./routes/auth.js";
import dishesRoutes from "./routes/dishes.js";
import ordersRoutes from "./routes/orders.js";
import contactRoutes from "./routes/contact.js";



const app = express();

// CORS (cookies)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Sessions (no JWT)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/contact", contactRoutes);

export default app;
