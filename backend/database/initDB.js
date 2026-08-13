const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

const setupDatabase = async () => {
  const db = await open({
    filename: path.join(__dirname, 'appointment.db'),
    driver: sqlite3.Database,
  });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  await db.exec(schema);

  console.log('✅ Database initialized successfully with all tables!');

  await db.close();
};

setupDatabase().catch((err) => {
  console.error('❌ Error initializing database:', err);
});