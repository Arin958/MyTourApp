// routes/notificationRoutes.js
const express = require("express");
const notificationRoutes = express.Router();
const { protect, restrictTo } = require('../middlewares/auth');
const {
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  getUnreadCount,
  markAllUserAsRead,
  getUnreadNotifications,

} = require("../controllers/notificationController");

// Admin routes
notificationRoutes.get("/admin", protect, restrictTo("admin"), getAdminNotifications);
notificationRoutes.patch("/admin/seen/:id", protect, restrictTo("admin"), markAsRead);
notificationRoutes.patch("/admin/seen", protect, restrictTo("admin"), markAllAsRead);

// User routes
notificationRoutes.get("/user", protect, getUserNotifications);
notificationRoutes.get("/user/unread", protect, getUnreadCount);
notificationRoutes.patch("/user/seen/:id", protect, markAsRead);
notificationRoutes.get("/unread", protect, getUnreadNotifications);
notificationRoutes.patch("/user/seen-all", protect, markAllUserAsRead);

module.exports = notificationRoutes;