require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "travel_tour_dev",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql", // Explicitly specify the dialect
    dialectModule: require("mysql2"), // Explicitly specify the dialect module
    migrationStorageTableName: "sequelize_meta",
  },
  test: {
    username: process.env.TEST_DB_USER || "root",
    password: process.env.TEST_DB_PASSWORD || "password",
    database: process.env.TEST_DB_NAME || "travel_tour_test",
    host: process.env.TEST_DB_HOST || "127.0.0.1",
    port: process.env.TEST_DB_PORT || 3306,
    dialect: "mysql", // Explicitly specify the dialect
    dialectModule: require("mysql2"), // Explicitly specify the dialect module
    logging: false,
  },
  production: {
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT || 3306,
    dialect: "mysql", // Explicitly specify the dialect
    dialectModule: require("mysql2"), // Explicitly specify the dialect module
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  },
};