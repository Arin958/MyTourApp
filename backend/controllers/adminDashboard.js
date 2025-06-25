const { Op, fn, col, literal } = require("sequelize");
const appError = require("../utils/appError");
const Booking = require("../models/BookingModel");
const { User, Tour, Review } = require("../models");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalTours = await Tour.count();
    const totalBookings = await Booking.count();
    const totalReviews = await Review.count();

    const currentDate = new Date();

    // Monthly revenue grouped by month for current year
    const monthlyRevenueRaw = await Booking.findAll({
      attributes: [
        [fn("MONTH", col("createdAt")), "month"],
        [fn("SUM", col("price")), "total"],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(currentDate.getFullYear(), 0, 1),
        },
      },
      group: [fn("MONTH", col("createdAt"))],
      order: [[literal("month"), "ASC"]],
    });

    // Create array of revenue for 12 months (index 0 = Jan, 11 = Dec)
    const monthlyRevenueData = Array(12).fill(0);
    monthlyRevenueRaw.forEach((entry) => {
      const monthIndex = parseInt(entry.dataValues.month) - 1;
      monthlyRevenueData[monthIndex] = parseFloat(entry.dataValues.total);
    });

    // Current month revenue
    const currentMonthIndex = currentDate.getMonth();
    const thisMonthRevenue = monthlyRevenueData[currentMonthIndex];

    // Last month revenue (handle January case)
    const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
    const lastMonthRevenue = monthlyRevenueData[lastMonthIndex] || 0;

    // Calculate revenue growth safely
    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    }
    revenueGrowth = +revenueGrowth.toFixed(1);

    // Define date ranges for user, booking, and tour growth calculations
    const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // User counts
    const thisMonthUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thisMonthStart,
        },
      },
    });
    const lastMonthUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonthStart,
          [Op.lte]: lastMonthEnd,
        },
      },
    });
    let userGrowth = 0;
    if (lastMonthUsers > 0) {
      userGrowth = ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;
    }
    userGrowth = +userGrowth.toFixed(1);

    // Booking counts
    const thisMonthBookings = await Booking.count({
      where: {
        createdAt: {
          [Op.gte]: thisMonthStart,
        },
      },
    });
    const lastMonthBookings = await Booking.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonthStart,
          [Op.lte]: lastMonthEnd,
        },
      },
    });
    let bookingGrowth = 0;
    if (lastMonthBookings > 0) {
      bookingGrowth = ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100;
    }
    bookingGrowth = +bookingGrowth.toFixed(1);

    // Tour counts
    const thisMonthTours = await Tour.count({
      where: {
        createdAt: {
          [Op.gte]: thisMonthStart,
        },
      },
    });
    const lastMonthTours = await Tour.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonthStart,
          [Op.lte]: lastMonthEnd,
        },
      },
    });
    let tourGrowth = 0;
    if (lastMonthTours > 0) {
      tourGrowth = ((thisMonthTours - lastMonthTours) / lastMonthTours) * 100;
    }
    tourGrowth = +tourGrowth.toFixed(1);

    // Recent bookings with User and Tour info
    const recentBookings = await Booking.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
        {
          model: Tour,
          attributes: ["id", "title"],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        totalTours,
        totalBookings,
        totalReviews,
        monthlyRevenue: thisMonthRevenue,
        monthlyRevenueData,
        revenueGrowth,
        userGrowth,
        bookingGrowth,
        tourGrowth,
        recentBookings,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
