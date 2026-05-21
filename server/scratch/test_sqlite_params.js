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
      role TEXT,
      phone TEXT
    );
  `);

  await db.run(
    'INSERT INTO users (name, role, phone) VALUES (?, ?, ?)',
    ['Alice', 'admin', '123456']
  );

  // Test 1: $1, $2 with array
  try {
    const result = await db.all(
      'SELECT * FROM users WHERE name = $1 AND role = $2',
      ['Alice', 'admin']
    );
    console.log('Test 1 ($1, $2):', result);
  } catch (err) {
    console.error('Test 1 Error:', err);
  }

  // Test 2: Repeat $1 with array of 1 element
  try {
    const result = await db.all(
      'SELECT * FROM users WHERE name = $1 OR phone = $1',
      ['Alice']
    );
    console.log('Test 2 (repeat $1):', result);
  } catch (err) {
    console.error('Test 2 Error:', err);
  }

  // Test 3: Repeat $1 with array of 1 element, converting to named params?
  // Let's see what happens if we pass an array vs object.
  
  await db.close();
}

test();
