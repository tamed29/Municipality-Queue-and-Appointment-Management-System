import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let db;

// Initialize connection and schema
const initDb = async () => {
  if (db) return;
  db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Check if users table exists, if not run schema
  const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
  if (!tableCheck) {
    console.log("Initializing SQLite database schema...");
    const schemaPath = path.join(process.cwd(), '../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await db.exec(schema);
      console.log("Schema initialized successfully.");
    } else {
      console.error("schema.sql not found at", schemaPath);
    }
  }
};

initDb();

export const query = async (text, params = []) => {
  if (!db) await initDb();
  
  // Convert Postgres $1, $2 to SQLite ?
  const sqliteText = text.replace(/\$\d+/g, '?');
  
  const textUpper = sqliteText.trim().toUpperCase();
  const isSelect = textUpper.startsWith('SELECT');
  const isReturning = textUpper.includes('RETURNING');
  
  try {
    if (isSelect || isReturning) {
      // db.all handles SELECT and modern SQLite supports INSERT/UPDATE ... RETURNING
      const rows = await db.all(sqliteText, params);
      return { rows };
    } else {
      // Standard INSERT/UPDATE/DELETE without RETURNING
      const result = await db.run(sqliteText, params);
      return { rows: [], rowCount: result.changes };
    }
  } catch (err) {
    console.error("Database Error on Query:", sqliteText);
    console.error("Params:", params);
    throw err;
  }
};

export default { query };
