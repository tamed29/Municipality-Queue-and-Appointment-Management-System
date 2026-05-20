import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

let db;

// Initialize connection and schema
const initDb = async () => {
  if (db) return;
  
  if (!process.env.DATABASE_URL) {
    console.error("=========================================================");
    console.error("ERROR: DATABASE_URL environment variable is not defined!");
    console.error("Please configure the DATABASE_URL environment variable in your");
    console.error("Render Environment settings.");
    console.error("=========================================================");
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Test connection
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL database");
    client.release();
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    throw error;
  }

  // Check if users table exists, if not run schema
  try {
    const result = await pool.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');`
    );
    
    if (!result.rows[0].exists) {
      console.log("Initializing PostgreSQL database schema...");
      const schemaPath = path.join(process.cwd(), '../schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log("Schema initialized successfully.");
      } else {
        console.error("schema.sql not found at", schemaPath);
      }
    } else {
      console.log("Database tables already exist.");
    }
  } catch (error) {
    console.error("Error checking/initializing schema:", error);
    throw error;
  }

  db = pool;
  return db;
};

initDb();

export const query = async (text, params = []) => {
  if (!db) await initDb();
  
  try {
    const result = await db.query(text, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } catch (err) {
    console.error("Database Error on Query:", text);
    console.error("Params:", params);
    throw err;
  }
};

export const getDb = async () => {
  if (!db) await initDb();
  return db;
};

export default { query, getDb };
