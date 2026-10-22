const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./backend/database/appointment.db");

db.exec(`
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  appointment_id INTEGER,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
ON notifications(user_id, is_read);
`, (err) => {
  console.log(err ? err.message : "Notifications table ready");
  db.close();
});
