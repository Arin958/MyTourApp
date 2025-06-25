const { Review } = require("../models");
const User = require("../models/userModel");
const appError = require("../utils/appError");

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  if (!req.file) return next(appError("No file uploaded", 400));

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(appError("User not found", 404));

    user.avatar = req.file.filename;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });
  } catch (err) {
    next(err);
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "avatar", "createdAt"],
    });

    res.status(200).json({
      status: "success",
      results: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// Get current logged-in user's profile
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "avatar"],
    });

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// Update current user's name or email
exports.updateMe = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(appError("User not found", 404));

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete current user (deactivate or delete)
exports.deleteMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(appError("User not found", 404));

    await user.destroy(); // or set active = false if using soft delete

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const id = req.params.id; // Assuming you're passing the user ID in the URL
    const user = await User.findByPk(id);
    if (!user) return next(appError("User not found", 404));

    await user.destroy(); // or set active = false if using soft delete

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};


exports.getReviews = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "avatar"],
        include: {
          model: Review,
          attributes: ["id", "rating", "review"],
        },
      });
    if (!user) return next(appError("User not found", 404));


    // const reviews = user.getReviews({
    //   attributes: ["id", "rating", "review"],
    // })

    res.status(200).json({
      status: "success",
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsersWithReviews = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "avatar", "createdAt"],
      include: {
        model: Review,
        attributes: ["id", "rating", "review", "tourId", "createdAt"]
      }
    });

    res.status(200).json({
      status: "success",
      results: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// exports.getReviews = async (req, res, next) => {
//   try {
//     const user = await User.findByPk(req.user.id);
//     if (!user) return next(appError("User not found", 404));

//     const reviews = await user.getReviews({
//       attributes: ["id", "rating", "review", "tourId", "createdAt"],
//     });

//     res.status(200).json({
//       status: "success",
//       reviews,
//     });
//   } catch (err) {
//     next(err);
//   }
// };