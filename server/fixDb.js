import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function fix() {
    const db = await open({
        filename: path.join(process.cwd(), 'database.sqlite'),
        driver: sqlite3.Database
    });

    try {
        await db.exec("ALTER TABLE services ADD COLUMN department VARCHAR(100) DEFAULT 'General'");
        console.log("Column 'department' added.");
    } catch (e) {
        console.log("Column 'department' might already exist.");
    }

    await db.close();
}

fix();
