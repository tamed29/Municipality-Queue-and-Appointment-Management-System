import { query } from './config/db.js';

async function resetDb() {
  try {
    console.log("Truncating all tables...");
    await query('TRUNCATE TABLE feedback, queue, appointments, users, services RESTART IDENTITY CASCADE');
    console.log("All tables truncated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to reset DB:", error);
    process.exit(1);
  }
}

resetDb();
