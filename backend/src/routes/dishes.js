import express from "express";
import { dishesSeed } from "../seed/dishesSeed.js";

const router = express.Router();

/**
 * GET /api/dishes
 * Public: list all dishes
 */
router.get("/", (req, res) => {
  res.json(dishesSeed);
});

/**
 * GET /api/dishes/:id
 * Single dish
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const dish = dishesSeed.find((d) => d.id === id);

  if (!dish) {
    return res.status(404).json({ message: "Dish not found" });
  }

  res.json(dish);
});

/**
 * POST /api/dishes
 * Admin-only later
 */
router.post("/", (req, res) => {
  const { name, category, price } = req.body;

  if (!name || !category || price == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newDish = {
    id: dishesSeed.length + 1,
    name,
    category,
    price,
    tags: [],
    spicyLevel: 0,
    isFeatured: false,
  };

  dishesSeed.push(newDish);
  res.status(201).json(newDish);
});

/**
 * PUT /api/dishes/:id
 */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const dish = dishesSeed.find((d) => d.id === id);

  if (!dish) {
    return res.status(404).json({ message: "Dish not found" });
  }

  Object.assign(dish, req.body);
  res.json(dish);
});

/**
 * DELETE /api/dishes/:id
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = dishesSeed.findIndex((d) => d.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Dish not found" });
  }

  dishesSeed.splice(index, 1);
  res.json({ message: `Dish ${id} deleted` });
});

export default router;

