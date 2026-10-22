
const { getDB } = require("../config/database");

const createNotification = async ({
  user_id,
  appointment_id = null,
  title,
  message,
  type = "general"
}) => {
  const db = getDB();

  return db.run(
    `INSERT INTO notifications
      (user_id, appointment_id, title, message, type)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, appointment_id, title, message, type]
  );
};

const getUserNotifications = async (userId) => {
  const db = getDB();

  return db.all(
    `SELECT id, appointment_id, title, message, type, is_read, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT 50`,
    [userId]
  );
};

const getUnreadCount = async (userId) => {
  const db = getDB();

  const result = await db.get(
    `SELECT COUNT(*) AS count
     FROM notifications
     WHERE user_id = ? AND is_read = 0`,
    [userId]
  );

  return result.count;
};

const markNotificationRead = async (notificationId, userId) => {
  const db = getDB();

  return db.run(
    `UPDATE notifications
     SET is_read = 1
     WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markNotificationRead
};
