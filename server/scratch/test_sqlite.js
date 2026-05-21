import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function test() {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT
    );
  `);

  // Test insert with array of parameters
  try {
    const result = await db.all(
      'INSERT INTO users (name, role) VALUES ($1, $2) RETURNING id, name, role',
      ['Alice', 'admin']
    );
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
  }

  await db.close();
}

test();
