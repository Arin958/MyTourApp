// controllers/notificationController.js
const Notification = require("../models/Notification");

// Get notifications (admin only)
exports.getAdminNotifications = async (req, res) => {
  try {
    // Verify admin role
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Debug: Log the query parameters

    const notifications = await Notification.findAll({
      where: { userId: req.user.id, forAdmin: true }, // ✅ Filter only this admin's
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    // Debug: Log raw SQL query

    // Debug: Log the results

    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Optional: Only allow the owner (or admin) to mark it
    if (req.user.id !== notification.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, forAdmin: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    res.status(200).json({ count });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      order: [["createdAt", "DESC"]],
      // Optional: limit the number of notifications
    });

    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching unread notifications:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
// Get user notifications (updated version)
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await Notification.findAll({
      where: {
        userId: req.user.id,
        forAdmin: false,
      },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await Notification.count({
      where: {
        userId: req.user.id,
        forAdmin: false,
      },
    });

    res.json({
      notifications,
      total,
      hasMore: parseInt(offset) + parseInt(limit) < total,
    });
  } catch (err) {
    console.error("Error fetching user notifications:", err);
    res.status(500).json({ message: "Error fetching user notifications" });
  }
};

// Mark all user notifications as read
exports.markAllUserAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId: req.user.id,
          forAdmin: false,
          isRead: false,
        },
      }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
