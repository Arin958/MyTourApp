const User = require("../models/userModel");
const Tour = require("../models/tourModel");
const appError = require("../utils/appError");
const { Review } = require("../models");

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


exports.getAllToursAdmin = async (req, res, next) => {
  try {
    const tours = await Tour.findAll();

    res.status(200).json({
      status: "success",
      results: tours.length,
      tours,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all tours
exports.getAllTours = async (req, res, next) => {
  try {
    const tours = await Tour.findAll({
      where: {
        isActive: true,
      },
    });

    res.status(200).json({
      status: "success",
      results: tours.length,
      tours,
    });
  } catch (err) {
    next(err);
  }
};


// Get tour by ID
exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id);

    res.status(200).json({
      status: "success",
      tour,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTourBySlug = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({ where: { slug: req.params.slug } });

    if (!tour) {
      return next(appError('Tour not found', 404));
    }

    const reviews = await Review.findAll({
      where: { tourId: tour.id },
      include: {
        model: User,
        attributes: ['name'], // only include the user's name
      },
    });
  
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      tourId: review.tourId,
      userId: review.userId,
      userName: review.User?.name,
      review: review.review,
      rating: review.rating,
      createdAt: review.createdAt,
    }));

    res.status(200).json({
      status: 'success',
      tour,
      reviews: formattedReviews,
    });
  } catch (err) {
    next(err);
  }
};


// create a Tour
exports.saveTour = async (req, res, next) => {
  if (!req.file) return next(appError("No file uploaded", 400));
  console.log("req.body:", req.body);
  const {
    title,
    slug,
    description,
    summary,
    duration,
    maxGroupSize,
    difficulty,
    price,
    priceDiscount,
    startDates,
    startLocation,
    locations,
    images,
    isActive,
  } = req.body;
  console.log(locations);
  try {
    const existing = await Tour.findOne({ where: { slug } });
    if (existing) return next(appError("Slug already exists", 400));
    console.log("req.file", req.file);
    const coverImage = req.file.filename;
    const newTour = await Tour.create({
      title,
      slug,
      description,
      summary,
      duration,
      maxGroupSize,
      difficulty,
      price,
      priceDiscount,
      startDates,
      startLocation,
      locations,
      coverImage,
      images,
      isActive,
    });

    res.status(201).json({
      status: "success",
      message: "Tour created",
      tour: {
        id: newTour.id,
        title: newTour.title,
        slug: newTour.slug,
        description: newTour.description,
        summary: newTour.summary,
        duration: newTour.duration,
        maxGroupSize: newTour.maxGroupSize,
        difficulty: newTour.difficulty,
        price: newTour.price,
        priceDiscount: newTour.priceDiscount,
        startDates: newTour.startDates,
        startLocation: newTour.startLocation,
        locations: newTour.locations,
        coverImage: newTour.coverImage,
        images: newTour,
        isActive: newTour.isActive,
      },
    });
  } catch (err) {
    console.log(err);

    next(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.editTour = async (req, res, next) => {
  const { id } = req.params; // Assuming you're sending the tour ID in URL like /api/tours/:id

  try {
    const tour = await Tour.findByPk(id);
    if (!tour) return next(appError("Tour not found", 404));

    // Destructure fields from body
    const {
      title,
      slug,
      description,
      summary,
      duration,
      maxGroupSize,
      difficulty,
      price,
      priceDiscount,
      startDates,
      startLocation,
      locations,
      images,
      isActive,
    } = req.body;

    // Check for duplicate slug (if it's changed)
    if (slug && slug !== tour.slug) {
      const existing = await Tour.findOne({ where: { slug } });
      if (existing) return next(appError("Slug already exists", 400));
    }

    // Update coverImage if a new file is uploaded
    const coverImage = req.file ? req.file.filename : tour.coverImage;

    // Update the tour
    await tour.update({
      title,
      slug,
      description,
      summary,
      duration,
      maxGroupSize,
      difficulty,
      price,
      priceDiscount,
      startDates,
      startLocation,
      locations,
      images,
      isActive,
      coverImage,
    });

    res.status(200).json({
      status: "success",
      message: "Tour updated",
      tour,
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({ message: err.message });
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

// Delete a tour (deactivate or delete)
exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) return next(appError("Tour not found", 404));

    await tour.destroy(); // or set active = false if using soft delete

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

// exports.getTourReview = async (req, res, next) => {
//   try {
//     const tour = await Tour.findByPk(req.tour.id, {
//       attributes: ["id", "title"],
//       include: {
//         model: Review,
//         attributes: ["id", "rating", "review"],
//       },
//     });
    
//     if (!tour) return next(appError("User not found", 404));

//     // const reviews = user.getReviews({
//     //   attributes: ["id", "rating", "review"],
//     // })

//     res.status(200).json({
//       status: "success",
//       tour
    
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getTourReview = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id, {
      attributes: ["id", "title"],
      include: {
        model: Review,
        attributes: ["id", "rating", "review", "userId"],
      },
    });

    if (!tour) return next(appError("Tour not found", 404));

    res.status(200).json({
      status: "success",
      tour,
    });
  } catch (err) {
    next(err);
  }
};
