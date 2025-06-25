const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  uploadAvatar,
  getAllUsers,
  destroy,
  updateMe,
  getMe,
  getReviews,
  getAllUsersWithReviews,
} = require("../controllers/userController");

/* admin routes */
router.get("/", protect, restrictTo("admin"), getAllUsers);
router.delete("/:id", protect, restrictTo("admin"), destroy);

/* protected routes */
router.get("/profile", protect, getMe);
router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);
router.put("/:id", protect, updateMe);
router.get("/reviews", protect, getReviews);
router.get(
  "/getAllUsers",
  protect,
  restrictTo("admin"),
  getAllUsersWithReviews
);

module.exports = router;
