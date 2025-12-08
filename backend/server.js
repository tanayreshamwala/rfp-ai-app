const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/database");

// Initialize Express app
const app = express();

// Middleware
// CORS configuration - allow requests from frontend URL in production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Basic health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Server running",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", require("./src/routes"));

// 404 handler (must be before error handler)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware (must be last, with 4 parameters)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
