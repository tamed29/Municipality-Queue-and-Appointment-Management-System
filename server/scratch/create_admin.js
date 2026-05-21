import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcrypt';

async function createAdmin() {
  const db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  try {
    // Check if admin already exists
    const adminUser = await db.get("SELECT * FROM users WHERE role = 'admin' OR email = 'admin@gmail.com'");
    if (adminUser) {
      console.log('Admin user already exists in DB:', adminUser);
    } else {
      console.log('Admin user not found. Creating default admin...');
      
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin', salt);
      
      const result = await db.run(
        `INSERT INTO users (full_name, national_id, phone, email, age, password_hash, role, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['System Administrator', 'ADMIN001', '0900000000', 'admin@gmail.com', 30, passwordHash, 'admin', 1]
      );
      
      console.log('Admin user created successfully! ID:', result.lastID);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await db.close();
  }
}

createAdmin();
