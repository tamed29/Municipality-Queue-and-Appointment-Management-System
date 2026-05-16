import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function check() {
  const db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
  const services = await db.all("SELECT department, count(*) as count FROM services GROUP BY department");
  console.log('Services by department:', services);
  const queues = await db.all("SELECT * FROM queue");
  console.log('Total queue items:', queues.length);
}
check();
