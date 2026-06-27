import express from "express";
import { pool } from "../config/db.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const ALLOWED_STATUSES = [
  "pending","confirmed","preparing","ready","on_the_way","delivered","cancelled"
];

// GET /api/admin/orders — all orders with customer info + item count
router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id, o.status, o.total_price,
         o.customer_name, o.customer_phone, o.customer_address,
         o.created_at, o.user_id,
         u.email AS user_email,
         COUNT(oi.id)::int AS item_count
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id, u.email
       ORDER BY o.created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Admin list orders error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/admin/orders/:id — single order with items
router.get("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const order = await pool.query(
      `SELECT o.*, u.email AS user_email, u.name AS user_name
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       WHERE o.id = $1 LIMIT 1`, [id]
    );
    if (order.rows.length === 0) return res.status(404).json({ message: "Not found" });

    const items = await pool.query(
      `SELECT * FROM order_items WHERE order_id = $1`, [id]
    );
    return res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    console.error("Admin get order error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch("/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update status error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;