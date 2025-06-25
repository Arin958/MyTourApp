require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const globalErrorHandler = require("./middlewares/error");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tourRoutes = require("./routes/tourRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const adminRouter = require("./routes/adminRoutes");
const { sequelize } = require("./models");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // Set to your React URL in production
    methods: ["GET", "POST", "PUT"],
  },
});

// ✅ Make io available in all routes/controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sync DB
sequelize.sync({ alter: true })
  .then(() => console.log("Database schema updated"))
  .catch((err) => console.error("Sync error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/booking", bookingRouter);
app.use("/api/adminDashboard", adminRouter);
app.use("/api/notifications", notificationRoutes)
// Global error handler
app.use(globalErrorHandler);

// Socket.IO events
const userSocketMap = {}; // userId => socket.id
app.locals.userSocketMap = userSocketMap; // 

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When user identifies themself
  socket.on("registerUser", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // On disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Clean up from userSocketMap
    for (const [userId, sId] of Object.entries(userSocketMap)) {
      if (sId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

// Start server
server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
