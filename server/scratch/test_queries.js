import { query } from '../config/db.js';

(async () => {
  try {
    console.log("Testing SELECT user by national_id or email...");
    const userExists = await query('SELECT * FROM users WHERE national_id = $1 OR email = $2', ['ADMIN001', 'admin@gmail.com']);
    console.log("Result:", userExists.rows);

    console.log("\nTesting SELECT user by email or phone...");
    const userResult = await query('SELECT * FROM users WHERE email = $1 OR phone = $1', ['admin@gmail.com']);
    console.log("Result:", userResult.rows);

    console.log("\nTesting INSERT with RETURNING...");
    // Let's use a unique email and national_id
    const randomSuffix = Math.floor(Math.random() * 10000);
    const email = `testuser_${randomSuffix}@gmail.com`;
    const nationalId = `NAT_${randomSuffix}`;
    const newUser = await query(
      'INSERT INTO users (full_name, national_id, phone, email, age, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, role',
      ['Test User', nationalId, '0912345678', email, 25, 'dummy_hash']
    );
    console.log("Inserted user:", newUser.rows[0]);
  } catch (error) {
    console.error("Test failed with error:", error);
  }
})();
