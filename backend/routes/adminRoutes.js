const express = require("express");
const { getDashboardStats } = require("../controllers/adminDashboard");
const { protect, restrictTo } = require("../middlewares/auth");
const adminRouter = express.Router();

adminRouter.get("/", protect, restrictTo("admin"), getDashboardStats);

module.exports = adminRouter;