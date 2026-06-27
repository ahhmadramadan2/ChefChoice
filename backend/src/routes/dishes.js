import express from "express";
import { pool } from "../config/db.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { seedDishesToDb } from "../seed/seedDishesToDb.js";

const router = express.Router();

// POST /api/dishes/seed  (dev only)
router.post("/seed", async (req, res) => {
  try {
    const result = await seedDishesToDb();
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("Seed error:", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// GET /api/dishes
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, category, price, calories,
              spice_level, is_vegan, is_vegetarian, is_gluten_free, is_active
       FROM dishes
       WHERE is_active = TRUE
       ORDER BY category, name`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Get dishes error:", err);
    return res.status(500).json({ message: "Server error while fetching dishes." });
  }
});

// GET /api/dishes/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid dish id" });

    const result = await pool.query(
      `SELECT id, name, description, category, price, calories,
              spice_level, is_vegan, is_vegetarian, is_gluten_free, is_active
       FROM dishes WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Dish not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Get dish error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/dishes (admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      name, description = null, category, price,
      calories = 0, spice_level = 0,
      is_vegan = false, is_vegetarian = false, is_gluten_free = false, is_active = true,
    } = req.body;

    if (!name || !category || price == null) return res.status(400).json({ message: "Missing required fields" });

    const result = await pool.query(
      `INSERT INTO dishes
       (name, description, category, price, calories, spice_level,
        is_vegan, is_vegetarian, is_gluten_free, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [name, description, category, Number(price), Number(calories), Number(spice_level),
       Boolean(is_vegan), Boolean(is_vegetarian), Boolean(is_gluten_free), Boolean(is_active)]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create dish error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// PUT /api/dishes/:id (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid dish id" });

    const allowed = ["name","description","category","price","calories","spice_level",
                     "is_vegan","is_vegetarian","is_gluten_free","is_active"];
    const boolFields = ["is_vegan","is_vegetarian","is_gluten_free","is_active"];

    const updates = [];
    const values = [];
    let i = 1;
    for (const key of allowed) {
      if (key in req.body) {
        updates.push(`${key} = $${i++}`);
        values.push(boolFields.includes(key) ? Boolean(req.body[key]) : req.body[key]);
      }
    }
    if (!updates.length) return res.status(400).json({ message: "No fields to update" });

    values.push(id);
    await pool.query(`UPDATE dishes SET ${updates.join(", ")} WHERE id = $${i}`, values);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Update dish error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// DELETE /api/dishes/:id (admin) — soft delete
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid dish id" });
    await pool.query(`UPDATE dishes SET is_active = FALSE WHERE id = $1`, [id]);
    return res.json({ ok: true, message: `Dish ${id} deactivated` });
  } catch (err) {
    console.error("Delete dish error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;