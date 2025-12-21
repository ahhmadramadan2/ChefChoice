import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

/**
 * POST /api/orders
 * Body:
 * {
 *   items: [
 *     {
 *       id,          // dish id
 *       name,        // dish name
 *       quantity,
 *       price,
 *       isCombo,
 *       comboItems: [ { id, name }, ... ] // optional
 *     },
 *     ...
 *   ],
 *   total: 45.80
 * }
 */
router.post("/", async (req, res) => {
  const { items, total } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items in order." });
  }

  // user id from session (can be null if you allow guest orders)
  const userId = req.session?.userId || null;

  // basic validation
  const cleanTotal = Number(total) || 0;
  if (cleanTotal <= 0) {
    return res.status(400).json({ message: "Invalid order total." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Insert into orders
    const [orderResult] = await conn.execute(
      `INSERT INTO orders (user_id, status, total_price, notes)
       VALUES (?, 'pending', ?, NULL)`,
      [userId, cleanTotal]
    );

    const orderId = orderResult.insertId;

    // 2) Insert order_items rows
    const orderItemValues = [];
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = qty * unitPrice;

      orderItemValues.push([
        orderId,
        Number(item.id),   // dish_id
        qty,
        unitPrice,
        lineTotal,
        item.name || "Dish",
      ]);
    }

    await conn.query(
      `INSERT INTO order_items
       (order_id, dish_id, quantity, unit_price, line_total, dish_name)
       VALUES ?`,
      [orderItemValues]
    );

    await conn.commit();

    return res.status(201).json({
      message: "Order received and is now being prepared.",
      orderId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Order create error:", err);
    return res.status(500).json({ message: "Server error while creating order." });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/orders
 * Optional: list orders for logged in user
 */
router.get("/", async (req, res) => {
  const userId = req.session?.userId || null;

  if (!userId) {
    return res.status(401).json({ message: "Not logged in." });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, status, total_price, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ message: "Server error while fetching orders." });
  }
});

export default router;
