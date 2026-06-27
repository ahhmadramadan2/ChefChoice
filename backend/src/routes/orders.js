import express from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const ALLOWED_STATUSES = [
  "pending","confirmed","preparing","ready","on_the_way","delivered","cancelled"
];

// POST /api/orders — must be logged in
router.post("/", requireAuth, async (req, res) => {
  const { items, total, customerName, customerPhone, customerAddress, saveAddress, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items in order." });
  }
  const cleanTotal = Number(total) || 0;
  if (cleanTotal <= 0) return res.status(400).json({ message: "Invalid order total." });

  if (!customerName?.trim() || !customerPhone?.trim() || !customerAddress?.trim()) {
    return res.status(400).json({ message: "Name, phone, and address are required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

   const orderResult = await client.query(
  `INSERT INTO orders (user_id, status, total_price, customer_name, customer_phone, customer_address, notes)
   VALUES ($1, 'pending', $2, $3, $4, $5, $6) RETURNING id`,
  [req.user.id, cleanTotal, customerName.trim(), customerPhone.trim(), customerAddress.trim(), notes?.trim() || null]
);
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.price) || 0;
      await client.query(
        `INSERT INTO order_items (order_id, dish_id, quantity, unit_price, line_total, dish_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.id == null ? null : Number(item.id), qty, unitPrice, qty * unitPrice, item.name || "Dish"]
      );
    }

    // Save address to user profile if requested
    if (saveAddress) {
      await client.query(
        `UPDATE users SET phone = $1, address = $2 WHERE id = $3`,
        [customerPhone.trim(), customerAddress.trim(), req.user.id]
      );
    }

    await client.query("COMMIT");
    return res.status(201).json({ message: "Order received.", orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order create error:", err);
    return res.status(500).json({ message: "Server error while creating order." });
  } finally {
    client.release();
  }
});

// GET /api/orders — current user's orders
router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, status, total_price, customer_name, customer_phone, customer_address, created_at
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/orders/:id — single order (owner OR admin)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const result = await pool.query(
     `SELECT id, user_id, status, total_price, customer_name, customer_phone, customer_address, notes, created_at
 FROM orders WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Not found" });

    const order = result.rows[0];
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const items = await pool.query(
      `SELECT id, dish_id, quantity, unit_price, line_total, dish_name
       FROM order_items WHERE order_id = $1`, [id]
    );

    return res.json({ ...order, items: items.rows });
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;