import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

async function seed() {
    const db = await open({
        filename: path.join(process.cwd(), 'database.sqlite'),
        driver: sqlite3.Database
    });

    console.log("Reading schema.sql...");
    const schema = fs.readFileSync(path.join(process.cwd(), '../schema.sql'), 'utf8');
    
    console.log("Executing schema and seeds...");
    // Split schema by semicolon to handle multiple statements if needed, 
    // but db.exec should handle it.
    await db.exec(schema);
    
    console.log("Database seeded successfully!");
    await db.close();
}

seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
