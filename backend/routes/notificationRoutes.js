
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  getNotificationsUnreadCount,
  markAsRead
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getNotificationsUnreadCount);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
