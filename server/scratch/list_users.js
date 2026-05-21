import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function listUsers() {
  const db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  const users = await db.all("SELECT id, full_name, email, role, is_active FROM users");
  console.log('Users in DB:', users);
  await db.close();
}

listUsers();
