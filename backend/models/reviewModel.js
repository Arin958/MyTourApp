const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Tour = require("./tourModel");
const Review = sequelize.define(
  "Review",
  {
    review: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

Review.calcAverageRatings = async function (tourId) {
  const result = await this.findAll({
    where: { tourId: tourId },
    attributes: ["rating"],
  });

  const ratingsQuantity = result.length;
  const ratingsAverage =
    ratingsQuantity > 0
      ? result.reduce((acc, r) => acc + r.rating, 0) / ratingsQuantity
      : 4.5;

  await Tour.update(
    { ratingsQuantity, ratingsAverage },
    { where: { id: tourId } }
  );
};

Review.afterCreate(async (review, options) => {
  await Review.calcAverageRatings(review.tourId);
});

Review.afterDestroy(async (review, options) => {
  await Review.calcAverageRatings(review.tourId);
});

Review.afterUpdate(async (review, options) => {
  await Review.calcAverageRatings(review.tourId);
});
module.exports = Review;