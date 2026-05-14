const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Log = require("../logging_middleware/logger");
const notificationRoutes = require("./routes/notificationRoutes");
const { errorHandler, requestLogger } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply request logger middleware
app.use(requestLogger);

// Health check endpoint
app.get("/", async (req, res) => {
  await Log(
    "backend",
    "info",
    "route",
    "Health check endpoint accessed"
  );

  res.json({
    success: true,
    message: "Notification System API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      notifications: "/api/notifications",
      health: "/"
    }
  });
});

// API Routes
app.use("/api/notifications", notificationRoutes);

// 404 handler
app.use((req, res) => {
  Log(
    "backend",
    "warn",
    "route",
    `Route not found: ${req.method} ${req.path}`
  ).catch(console.error);

  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/affordmed_notifications";
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Log(
      "backend",
      "info",
      "db",
      `MongoDB connected successfully: ${mongoUri}`
    );

    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    await Log(
      "backend",
      "fatal",
      "db",
      `MongoDB connection failed: ${error.message}`
    );

    console.error("✗ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Start Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✓ Server started on port ${PORT}`);
      Log(
        "backend",
        "info",
        "server",
        `Server started successfully on port ${PORT}`
      ).catch(console.error);
    });
  } catch (error) {
    await Log(
      "backend",
      "fatal",
      "server",
      `Server startup failed: ${error.message}`
    );

    console.error("✗ Server startup failed:", error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down server...");
  await Log(
    "backend",
    "info",
    "server",
    "Server shutting down"
  );

  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
