
module.exports = (err, req, res, next) => {
  // Default values
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  res.status(statusCode).json({
    status,
    message: err.message || "Something went wrong",
  });
};
