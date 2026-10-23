
const { Pool } = require("pg");

let pool;

function convertPlaceholders(sql) {
  let index = 0;
  let result = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (char === "'" && !inDoubleQuote) {
      if (inSingleQuote && sql[i + 1] === "'") {
        result += "''";
        i++;
        continue;
      }

      inSingleQuote = !inSingleQuote;
      result += char;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      result += char;
      continue;
    }

    if (char === "?" && !inSingleQuote && !inDoubleQuote) {
      index++;
      result += "$" + index;
    } else {
      result += char;
    }
  }

  return result;
}

const db = {
  async get(sql, params = []) {
    const result = await pool.query(
      convertPlaceholders(sql),
      params
    );

    return result.rows[0];
  },

  async all(sql, params = []) {
    const result = await pool.query(
      convertPlaceholders(sql),
      params
    );

    return result.rows;
  },

  async run(sql, params = []) {
    const result = await pool.query(
      convertPlaceholders(sql),
      params
    );

    return {
      lastID: result.rows[0]?.id ?? null,
      changes: result.rowCount ?? 0,
      rowCount: result.rowCount ?? 0,
    };
  },

  async exec(sql) {
    return pool.query(sql);
  },
};

const initDB = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is missing. Configure it in the backend environment."
    );
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  });

  pool.on("error", (error) => {
    console.error(
      "Unexpected PostgreSQL pool error:",
      error.message
    );
  });

  try {
    await pool.query("SELECT 1");
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    await pool.end().catch(() => {});
    pool = undefined;
    throw error;
  }

  return db;
};

const getDB = () => {
  if (!pool) {
    throw new Error(
      "Database not initialized. Call initDB() first."
    );
  }

  return db;
};

module.exports = { initDB, getDB };
