require("./backend/node_modules/dotenv").config({
  path: "./backend/.env",
  quiet: true
});

const sqlite3 = require("./backend/node_modules/sqlite3");
const { Client } = require("./backend/node_modules/pg");
const path = require("path");
const fs = require("fs");

const sqlitePath = path.join(
  __dirname, "backend", "database", "appointment.db"
);

const tables = [
  "users",
  "doctors",
  "availability",
  "appointments",
  "reminders",
  "notifications"
];

function openSqlite() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqlitePath, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function sqliteAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function closeSqlite(db) {
  return new Promise((resolve) => db.close(() => resolve()));
}

async function main() {
  if (!fs.existsSync(sqlitePath)) {
    throw new Error("SQLite database file was not found.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from backend/.env");
  }

  const source = await openSqlite();
  const target = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  let transactionStarted = false;

  try {
    await target.connect();

    console.log("Reading SQLite source data...");
    const sourceData = {};

    for (const table of tables) {
      const rows = await sqliteAll(
        source,
        `SELECT * FROM "${table}"`
      );
      sourceData[table] = rows;
      console.log(`SQLite ${table}: ${rows.length}`);
    }

    console.log("\nChecking PostgreSQL destination...");
    for (const table of tables) {
      const check = await target.query(
        "SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema=$1 AND table_name=$2",
        ["public", table]
      );

      if (!check.rows[0].count) {
        throw new Error(
          `PostgreSQL table "${table}" is missing. Stop and check the schema.`
        );
      }

      const count = await target.query(
        `SELECT COUNT(*)::int AS count FROM public."${table}"`
      );

      if (count.rows[0].count !== 0) {
        throw new Error(
          `PostgreSQL table "${table}" is not empty. No data was migrated.`
        );
      }
    }

    await target.query("BEGIN");
    transactionStarted = true;

    for (const table of tables) {
      const rows = sourceData[table];

      if (rows.length === 0) {
        console.log(`\n${table}: no records to copy`);
        continue;
      }

      const targetColumns = await target.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position",
        ["public", table]
      );

      const allowed = new Set(
        targetColumns.rows.map((column) => column.column_name)
      );

      for (const row of rows) {
        const columns = Object.keys(row).filter(
          (column) => allowed.has(column)
        );

        if (!columns.length) {
          throw new Error(`No matching columns found for ${table}.`);
        }

        const values = columns.map((column) => row[column]);
        const placeholders = columns.map(
          (_, index) => `$${index + 1}`
        );

        const sql =
          `INSERT INTO public."${table}" (` +
          columns.map((column) => `"${column}"`).join(", ") +
          `) VALUES (${placeholders.join(", ")})`;

        await target.query(sql, values);
      }

      console.log(`${table}: copied ${rows.length} records`);
    }

    console.log("\nUpdating generated ID sequences...");

    for (const table of tables) {
      const hasId = await target.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND column_name='id'",
        ["public", table]
      );

      if (!hasId.rows.length) continue;

      await target.query(
        `SELECT setval(pg_get_serial_sequence($1, 'id'), GREATEST(COALESCE(MAX(id), 1), 1), COUNT(*) > 0) FROM public."${table}"`,
        [`public.${table}`]
      );
    }

    await target.query("COMMIT");
    transactionStarted = false;

    console.log("\nMigration committed successfully.");

    for (const table of tables) {
      const result = await target.query(
        `SELECT COUNT(*)::int AS count FROM public."${table}"`
      );
      console.log(`PostgreSQL ${table}: ${result.rows[0].count}`);
    }
  } catch (error) {
    if (transactionStarted) {
      await target.query("ROLLBACK").catch(() => {});
    }
    throw error;
  } finally {
    await target.end().catch(() => {});
    await closeSqlite(source);
  }
}

main().catch((error) => {
  console.error("\nMigration stopped:", error.message);
  process.exitCode = 1;
});
