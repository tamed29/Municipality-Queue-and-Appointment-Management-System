import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function inspect() {
  const db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  const schemas = await db.all("SELECT tbl_name, sql FROM sqlite_master WHERE type='table'");
  console.log(schemas);
  await db.close();
}

inspect();
