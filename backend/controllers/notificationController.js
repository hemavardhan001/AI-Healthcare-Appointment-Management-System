
const {
  getUserNotifications,
  getUnreadCount,
  markNotificationRead
} = require("../models/notificationModel");

const getNotifications = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);

    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};

const getNotificationsUnreadCount = async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Unread count error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count"
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);

    if (!Number.isInteger(notificationId) || notificationId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID"
      });
    }

    const result = await markNotificationRead(
      notificationId,
      req.user.id
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Mark notification read error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update notification"
    });
  }
};

module.exports = {
  getNotifications,
  getNotificationsUnreadCount,
  markAsRead
};
