const sqlite3 = require("./backend/node_modules/sqlite3");
const db = new sqlite3.Database("./backend/database/appointment.db");

db.all(
  "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
  (err, tables) => {
    if (err) {
      console.error(err.message);
      db.close();
      return;
    }

    if (!tables.length) {
      console.log("No tables found.");
      db.close();
      return;
    }

    let remaining = tables.length;

    for (const table of tables) {
      db.all(`PRAGMA table_info("${table.name}")`, (columnErr, columns) => {
        if (columnErr) console.error(columnErr.message);

        db.get(`SELECT COUNT(*) AS count FROM "${table.name}"`, (countErr, result) => {
          console.log("\nTable:", table.name);
          console.log("Columns:", columnErr ? "Error" : columns.map(c => c.name).join(", "));
          console.log("Rows:", countErr ? countErr.message : result.count);

          remaining--;
          if (remaining === 0) {
            console.log("\nInspection complete.");
            db.close();
          }
        });
      });
    }
  }
);
