import { pool } from "../config/db.js";
import { dishesSeed } from "./dishesSeed.js";

// Map your seed file's shape -> dishes table columns
function mapSeedRow(d) {
  const tags = d.tags || [];
  const isVegan = tags.includes("Vegan");
  const isVegetarian = isVegan || tags.includes("Vegetarian");
  const isGlutenFree = tags.includes("Gluten-free");

  return {
    name: d.name,
    description: d.description || null,
    category: d.category,
    price: Number(d.price),
    calories: Number(d.calories) || 0,
    spice_level: Number(d.spicyLevel) || 0,
    is_vegan: isVegan,
    is_vegetarian: isVegetarian,
    is_gluten_free: isGlutenFree,
    is_active: true,
  };
}

export async function seedDishesToDb() {
  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE order_items, orders, dishes RESTART IDENTITY CASCADE");

    for (const d of dishesSeed) {
      const r = mapSeedRow(d);
      await client.query(
        `INSERT INTO dishes
         (name, description, category, price, calories, spice_level,
          is_vegan, is_vegetarian, is_gluten_free, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [r.name, r.description, r.category, r.price, r.calories, r.spice_level,
         r.is_vegan, r.is_vegetarian, r.is_gluten_free, r.is_active]
      );
      inserted++;
    }

    await client.query("COMMIT");
    return { inserted };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}