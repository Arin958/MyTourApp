const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Sequelize instance
const Tour = sequelize.define(
  "Tour",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          msg: "Slug must be lowercase alphanumeric with hyphens",
        },
        len: {
          args: [3, 50],
          msg: "Slug must be between 3 and 50 characters",
        },
      },
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    summary: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxGroupSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "difficult"),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    priceDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    ratingsAverage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ratingsQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    startDates: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    startLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locations: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = Tour;