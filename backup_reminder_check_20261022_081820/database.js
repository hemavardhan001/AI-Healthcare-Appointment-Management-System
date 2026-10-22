const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

const initDB = async () => {
  db = await open({
    filename: path.join(__dirname, '../database/appointment.db'),
    driver: sqlite3.Database,
  });

  await db.run('PRAGMA foreign_keys = ON');

  console.log('✅ Connected to SQLite database');
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