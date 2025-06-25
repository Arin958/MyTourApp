const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/auth");
const upload = require("../middlewares/uploadMedia");
const {
  saveTour,
  getAllTours,
  getTour,
  deleteTour,
  getTourReview,
  getTourBySlug,
  getAllToursAdmin,
  editTour,
} = require("../controllers/tourController");

/* public routes */
router.get("/tour-reviews", protect, getTourReview);
router.get("/allAdminTours", protect, restrictTo("admin"), getAllToursAdmin);
router.get("/", getAllTours);
router.get("/:slug", getTourBySlug)
router.get("/:id", getTour);

/* admin routes */
router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.single("coverImage"),
  saveTour
);
router.put("/:id", protect, restrictTo("admin"), upload.single("coverImage"), editTour);
router.delete("/:id", protect, restrictTo("admin"), deleteTour);

router.get("/tour-reviews/:id", protect, getTourReview);

module.exports = router;