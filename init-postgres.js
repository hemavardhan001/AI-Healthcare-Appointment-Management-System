require("./backend/node_modules/dotenv").config({
  path: "./backend/.env",
  quiet: true
});

const fs = require("fs");
const path = require("path");
const { Client } = require("./backend/node_modules/pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  try {
    const schemaPath = path.join(
      __dirname,
      "backend",
      "database",
      "schema.sql"
    );

    const schema = fs.readFileSync(schemaPath, "utf8");

    await client.connect();
    await client.query("BEGIN");
    await client.query(schema);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query("COMMIT");
    console.log("PostgreSQL schema initialized successfully.");
    console.log("Core tables and notifications are ready.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Initialization failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
