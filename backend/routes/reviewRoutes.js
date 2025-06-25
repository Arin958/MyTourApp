const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const { saveReview, updateReview, deleteOwnReview } = require("../controllers/reviewController");

/* protected routes */
router.post("/", protect, saveReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteOwnReview)

module.exports = router;