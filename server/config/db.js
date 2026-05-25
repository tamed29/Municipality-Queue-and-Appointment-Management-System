import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

const { Pool } = pkg;
dotenv.config();

let db;
let isSqlite = false;

// Initialize connection and schema
const initDb = async () => {
  if (db) return;
  
  console.log("DEBUG: DATABASE_URL value type is:", typeof process.env.DATABASE_URL);
  console.log("DEBUG: DATABASE_URL value is:", process.env.DATABASE_URL ? `[length: ${process.env.DATABASE_URL.length}]` : "falsy");
  
  let pgConnected = false;

  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "undefined" && process.env.DATABASE_URL !== "null") {
    try {
      console.log("Attempting to connect to PostgreSQL...");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test connection
      const client = await pool.connect();
      console.log("Connected to PostgreSQL database");
      client.release();
      
      db = pool;
      isSqlite = false;
      pgConnected = true;
    } catch (error) {
      console.error("Failed to connect to PostgreSQL:", error.message);
      console.log("Will attempt falling back to SQLite...");
    }
  } else {
    console.log("No DATABASE_URL configured. Falling back to SQLite...");
  }

  if (!pgConnected) {
    console.log("Initializing SQLite database...");
    try {
      const dbPath = path.join(process.cwd(), 'database.sqlite');
      const sqliteDb = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      console.log(`Connected to SQLite database at: ${dbPath}`);
      
      // Check if users table exists
      const tableCheck = await sqliteDb.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users';"
      );

      if (tableCheck.length === 0) {
        console.log("Initializing SQLite database schema...");
        const schemaPath = path.join(process.cwd(), '../schema.sql');
        if (fs.existsSync(schemaPath)) {
          let schema = fs.readFileSync(schemaPath, 'utf8');
          // Simple translation of PG schema to SQLite schema
          schema = schema.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
          // Execute schema queries
          await sqliteDb.exec(schema);
          console.log("SQLite Schema initialized successfully.");
        } else {
          console.error("schema.sql not found at", schemaPath);
        }
      } else {
        console.log("SQLite Database tables already exist.");
      }

      // Check if default admin exists in SQLite
      const adminCheck = await sqliteDb.get("SELECT id FROM users WHERE role = 'admin';");
      if (!adminCheck) {
        console.log("Seeding default admin user into SQLite...");
        const salt = await bcrypt.genSalt(4);
        const passwordHash = await bcrypt.hash('admin', salt);
        await sqliteDb.run(
          `INSERT INTO users (full_name, national_id, phone, email, age, password_hash, role, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          ['System Administrator', 'ADMIN001', '0900000000', 'admin@gmail.com', 30, passwordHash, 'admin', 1]
        );
        console.log("Default admin user seeded successfully into SQLite.");
      }

      db = sqliteDb;
      isSqlite = true;
    } catch (sqliteError) {
      console.error("Failed to initialize SQLite database:", sqliteError);
      throw sqliteError;
    }
  } else {
    // Check PostgreSQL schema if using pg
    try {
      const result = await db.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');`
      );
      
      if (!result.rows[0].exists) {
        console.log("Initializing PostgreSQL database schema...");
        const schemaPath = path.join(process.cwd(), '../schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schema = fs.readFileSync(schemaPath, 'utf8');
          await db.query(schema);
          console.log("Schema initialized successfully.");
        } else {
          console.error("schema.sql not found at", schemaPath);
        }
      } else {
        console.log("Database tables already exist.");
      }

      // Check if default admin exists in PostgreSQL
      const adminCheck = await db.query("SELECT id FROM users WHERE role = 'admin';");
      if (adminCheck.rowCount === 0) {
        console.log("Seeding default admin user into PostgreSQL...");
        const salt = await bcrypt.genSalt(4);
        const passwordHash = await bcrypt.hash('admin', salt);
        await db.query(
          `INSERT INTO users (full_name, national_id, phone, email, age, password_hash, role, is_active) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          ['System Administrator', 'ADMIN001', '0900000000', 'admin@gmail.com', 30, passwordHash, 'admin', true]
        );
        console.log("Default admin user seeded successfully into PostgreSQL.");
      }
    } catch (error) {
      console.error("Error checking/initializing schema on PostgreSQL:", error);
      throw error;
    }
  }

  return db;
};

initDb();

export const query = async (text, params = []) => {
  if (!db) await initDb();
  
  try {
    if (isSqlite) {
      let sql = text.replace(/\$(\d+)/g, '?$1');
      
      // Handle PostgreSQL-specific TRUNCATE command
      if (sql.toUpperCase().includes('TRUNCATE TABLE')) {
        const match = sql.match(/TRUNCATE TABLE\s+([a-zA-Z0-9_,\s]+)(?:RESTART|$)/i);
        if (match) {
          const tables = match[1].split(',').map(t => t.trim());
          await db.exec('BEGIN TRANSACTION;');
          for (const table of tables) {
            await db.exec(`DELETE FROM ${table};`);
            await db.exec(`DELETE FROM sqlite_sequence WHERE name = '${table}';`);
          }
          await db.exec('COMMIT;');
          return { rows: [], rowCount: 0 };
        }
      }
      
      const rows = await db.all(sql, params);
      if (rows && rows.length > 0) {
        rows.forEach(row => {
          for (const key of Object.keys(row)) {
            if (key.toLowerCase().startsWith('count(')) {
              row.count = row[key];
            }
          }
        });
      }
      return { rows: rows || [], rowCount: rows ? rows.length : 0 };
    } else {
      const result = await db.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount };
    }
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

