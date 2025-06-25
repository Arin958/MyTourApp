const Booking = require("../models/BookingModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const appError = require("../utils/appError");
const Notification = require("../models/Notification");

// Create a booking
exports.saveBooking = async (req, res, next) => {
  try {
    const { tourId, userId, price, date, participants } = req.body;

    if (!tourId || !userId || !price || !date || !participants) {
      return next(appError("All booking fields are required", 400));
    }

    // Fetch user and tour info
    const [existingTour, bookingUser] = await Promise.all([
      Tour.findByPk(tourId),
      User.findByPk(userId),
    ]);

    if (!existingTour) return next(appError("Tour not found", 404));
    if (!bookingUser) return next(appError("User not found", 404));

    const newBooking = await Booking.create({
      tourId,
      userId,
      price,
      date,
      participants,
    });

    const admins = await User.findAll({ where: { role: "admin" } });

    const notificationMessage = `🧳 ${bookingUser.name} booked the tour "${existingTour.title}"`;

    // Create notification in DB
    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          userId: admin.id,
          message: notificationMessage,
          type: "booking",
          forAdmin: true,
          isRead: false,
        })
      )
    );

    // Emit via socket
    const userSocketMap = req.app.locals.userSocketMap;
    const io = req.io;

    admins.forEach((admin) => {
      const adminSocketId = userSocketMap[admin.id];
      if (adminSocketId) {
        io.to(adminSocketId).emit("newNotification", {
          message: notificationMessage,
          type: "booking",
          bookingId: newBooking.id,
          createdAt: new Date(),
          isRead: false,
        });
      }
    });

    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (err) {
    console.error("Booking Error:", err);
    next(err);
  }
};

// Get all bookings (optionally include Tour info)
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: Tour, attributes: ["title"] }],
    });

    res.status(200).json({
      status: "success",
      results: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// Get single booking by ID
exports.getUserBookings = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId: loggedInUserId },
      include: [
        {
          model: Tour,
          attributes: [
            "id",
            "title",
            "slug",
            "description",
            "summary",
            "duration",
            "maxGroupSize",
            "difficulty",
            "price",
            "coverImage",
          ], // choose what fields you want
        },
      ],
      order: [["date", "DESC"]],
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) return next(appError("Booking not found", 404));

    await booking.destroy();

    res.status(200).json({
      status: "success",
      message: "Booking deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Admin can update any booking (including status)
exports.adminUpdateBooking = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update bookings",
      });
    }

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Tour }, { model: User }],
    });

    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "No booking found with that ID",
      });
    }

    const { participants, date, status, price } = req.body;

    if (participants !== undefined) {
      if (participants < 1 || participants > booking.Tour.maxGroupSize) {
        return res.status(400).json({
          status: "fail",
          message: `Participants must be between 1 and ${booking.Tour.maxGroupSize}`,
        });
      }
      booking.participants = participants;
    }

    if (date !== undefined) {
      const newDate = new Date(date);
      if (newDate < Date.now()) {
        return res.status(400).json({
          status: "fail",
          message: "Booking date must be in the future",
        });
      }
      booking.date = date;
    }

    if (status !== undefined) {
      booking.status = status;
    }

    if (price !== undefined) {
      booking.price = price;
    }

    await booking.save();

     const updatedBooking = await Booking.findByPk(req.params.id, {
      include: [{ model: Tour }, { model: User }],
    });

    
    const message = `Your booking for ${updatedBooking.Tour.title} was updated.`;
    console.log(message);

    // ✅ Save notification in DB
    await Notification.create({
      userId: booking.userId,
      message,
      type: "booking",
      forAdmin: false, // this is a user notification
    });

    // ✅ EMIT SOCKET EVENT AFTER SAVING
    const userSocketMap = req.app.locals.userSocketMap;
    const socketId = userSocketMap[booking.userId]; // use id not _id
    if (socketId) {
      req.io.to(socketId).emit("bookingStatusChanged", {
        bookingId: booking.id,
        status: booking.status,
        message: `Your booking #${booking.id} status changed to ${booking.status}`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Booking updated successfully by admin",
      booking,
    });
  } catch (err) {
    console.error("Admin update booking error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong during admin booking update",
    });
  }
};

exports.getBookingsBasedOnRole = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const loggedInUserRole = req.user.role; // assuming you set this in your auth middleware

    let bookings;

    if (loggedInUserRole === "admin") {
      // Admin gets all bookings
      bookings = await Booking.findAll({
        include: [
          {
            model: Tour,
            attributes: ["id", "title", "description", "price", "coverImage"],
          },
          {
            model: User,
            attributes: ["id", "name", "email", "role"],
          },
        ],
        order: [["date", "DESC"]],
      });
    } else {
      // Regular user gets only their bookings
      bookings = await Booking.findAll({
        where: { userId: loggedInUserId },
        include: [
          {
            model: Tour,
            attributes: ["id", "title", "description", "price", "coverImage"],
          },
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["date", "DESC"]],
      });
    }

    res.status(200).json({
      status: "success",
      results: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// exports.getBookingsByUserId = async (req, res, next) => {
//   try {
//     const userId = req.params.userId;
//     const bookings = await Booking.findAll({
//       where: {
//         userId: userId,
//       },
//     });
//     res.status(200).json({
//       status: "success",
//       results: bookings.length,
//       bookings,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// Update a booking

exports.updateUserBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Tour }, { model: User }],
    });

    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "No booking found with that ID",
      });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: "You can only update pending bookings",
      });
    }

    const { participants, date } = req.body;

    if (participants) {
      if (participants > booking.Tour.maxGroupSize) {
        return res.status(400).json({
          status: "fail",
          message: `Maximum group size is ${booking.Tour.maxGroupSize}`,
        });
      }
      if (participants < 1) {
        return res.status(400).json({
          status: "fail",
          message: "At least 1 participant is required",
        });
      }
    }

    if (date) {
      const newDate = new Date(date);
      if (newDate < Date.now()) {
        return res.status(400).json({
          status: "fail",
          message: "Booking date must be in the future",
        });
      }
    }

    // ✅ Update fields
    booking.participants = participants || booking.participants;
    booking.date = date || booking.date;

    await booking.save();

    // ✅ Refetch with associations
    const updatedBooking = await Booking.findByPk(req.params.id, {
      include: [{ model: Tour }, { model: User }],
    });

    const message = `Your booking for ${updatedBooking.Tour.name} was updated.`;

    // ✅ Save notification in DB
    await Notification.create({
      userId: booking.userId,
      message,
      type: "booking",
      forAdmin: false, // this is a user notification
    });

    // ✅ Emit socket notification
    const userSocketMap = req.app.locals.userSocketMap;
    const socketId = userSocketMap[booking.userId];

    if (socketId) {
      req.io.to(socketId).emit("bookingStatusChanged", {
        bookingId: booking.id,
        status: booking.status,
        message,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        booking: updatedBooking,
      },
    });
  } catch (err) {
    console.error("User booking update error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while updating the booking.",
    });
  }
};

// Request cancellation (user-initiated)
exports.requestBookingCancellation = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Tour }],
    });

    if (!booking) {
      return res
        .status(404)
        .json({ status: "fail", message: "Booking not found" });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.status !== "paid") {
      return res
        .status(400)
        .json({ message: "Only paid bookings can request cancellation." });
    }

    if (booking.cancellationRequested) {
      return res
        .status(400)
        .json({ status: "fail", message: "Cancellation already requested" });
    }

    booking.cancellationRequested = true;
    await booking.save();

    res.status(200).json({
      status: "success",
      message: "Cancellation request sent to admin",
      booking,
    });
  } catch (err) {
    console.error("Cancellation request error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while requesting cancellation",
    });
  }
};

exports.handleCancellationRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Only admins can perform this action",
      });
    }

    const booking = await Booking.findByPk(req.params.id);

    if (!booking || !booking.cancellationRequested) {
      return res.status(400).json({
        status: "fail",
        message: "No pending cancellation request for this booking",
      });
    }

    const { action } = req.body; // 'approve' or 'reject'

    if (action === "approve") {
      booking.status = "cancelled";
    }

    booking.cancellationRequested = false;
    await booking.save();

    res.status(200).json({
      status: "success",
      message: `Cancellation request ${
        action === "approve" ? "approved" : "rejected"
      }`,
      booking,
    });
  } catch (err) {
    console.error("Admin cancellation handler error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while handling the cancellation",
    });
  }
};
