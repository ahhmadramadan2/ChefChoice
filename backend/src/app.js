const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const dishesRoutes = require("./routes/dishes.routes");
const ordersRoutes = require("./routes/orders.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishesRoutes);
app.use("/api/orders", ordersRoutes);

app.use(errorHandler);

module.exports = app;
