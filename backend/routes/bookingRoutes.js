const express = require("express");

const bookingRouter = express.Router();

const { protect, restrictTo } = require("../middlewares/auth");

const {
  saveBooking,
  getBookings,
  getBookingById,
  deleteBooking,
  updateBooking,
  getUserBookings,
  getBookingsBasedOnRole,
  updateUserBooking,
  adminUpdateBooking,
  requestBookingCancellation,
  handleCancellationRequest,
} = require("../controllers/bookings");

bookingRouter.get(
  "/",
  protect,

  getBookings
);

bookingRouter.get(
  "/userBooking",
  protect,

  getUserBookings
);

bookingRouter.post(
  "/",
  protect,

  saveBooking
);
bookingRouter.patch(
  "/admin/:id",
  protect,
  restrictTo("admin"),
  adminUpdateBooking
);
bookingRouter.delete(
  "/:id",
  protect,

  deleteBooking
);

bookingRouter.get(
  "/allBookings",
  protect,
  restrictTo("admin"),
  getBookingsBasedOnRole
);

bookingRouter.patch("/updateUserBooking/:id", protect, updateUserBooking);

// routes/bookingRoutes.js
bookingRouter.patch(
  "/cancellation-request/:id",
  protect,
  requestBookingCancellation
); // for users
bookingRouter.patch(
  "/handle-cancel/:id",
  protect,
  restrictTo("admin"),
  handleCancellationRequest
); // for admin

// Authenticated user routes

module.exports = bookingRouter;
