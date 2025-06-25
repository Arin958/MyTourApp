const sequelize = require("../config/db");
const User = require("./userModel");
const Tour = require("./tourModel");
const Review = require("./reviewModel");
const Booking = require("./BookingModel");
const Notification = require("./Notification");

// Define associations
User.hasMany(Review, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
});
Review.belongsTo(User, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
});

Tour.hasMany(Review, {
  foreignKey: { name: "tourId", allowNull: false },
  onDelete: "CASCADE",
});

Review.belongsTo(Tour, {
  foreignKey: { name: "tourId", allowNull: false },
  onDelete: "CASCADE",
});

// Associations
User.hasMany(Booking, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
});
Booking.belongsTo(User, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
});

Tour.hasMany(Booking, {
  foreignKey: { name: "tourId", allowNull: false },
  onDelete: "CASCADE",
});
Booking.belongsTo(Tour, {
  foreignKey: { name: "tourId", allowNull: false },
  onDelete: "CASCADE",
});
User.hasMany(Notification, {
  foreignKey: "userId",
  onDelete: "CASCADE"
});
Notification.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE"
});

// Export all models
module.exports = {
  sequelize,
  User,
  Tour,
  Review,
  Booking,
  Notification
};