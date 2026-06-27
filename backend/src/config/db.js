import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
  max: 10,
});

// Connection test
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Postgres connected");
    client.release();
  } catch (err) {
    console.error("❌ Postgres connection failed:", err.message);
  }
})();