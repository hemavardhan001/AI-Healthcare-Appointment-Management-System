const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

const initDB = async () => {
  const dbPath = process.env.DB_PATH ||
    path.join(__dirname, '../database/appointment.db');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.run('PRAGMA foreign_keys = ON');

  console.log('Connected to SQLite database:', dbPath);
  return db;
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
};

module.exports = {
  initDB,
  getDB,
};
