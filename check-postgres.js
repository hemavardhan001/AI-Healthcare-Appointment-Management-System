require("./backend/node_modules/dotenv").config({
  path: "./backend/.env",
  quiet: true
});

const { Client } = require("./backend/node_modules/pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  const tables = [
    "users",
    "doctors",
    "appointments",
    "availability",
    "reminders",
    "notifications"
  ];

  try {
    await client.connect();
    console.log("PostgreSQL connection: SUCCESS");

    for (const table of tables) {
      const exists = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2",
        ["public", table]
      );

      if (exists.rows.length === 0) {
        console.log(`${table}: table missing`);
        continue;
      }

      const result = await client.query(
        `SELECT COUNT(*)::int AS count FROM public."${table}"`
      );

      console.log(`${table}: ${result.rows[0].count}`);
    }
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
