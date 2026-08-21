const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");

// Routes
const authRoutes = require("./routes/auth");
const athleteRoutes = require("./routes/athletes");
const assessmentRoutes = require("./routes/assessments");
const scoutRoutes = require("./routes/scout");
const trialRoutes = require("./routes/trials");

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file streaming for uploaded assessment videos & skeleton overlays
app.use("/uploads", express.static(config.LOCAL_STORAGE_DIR));

// Healthcheck
app.get("/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "sports-talent-core-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// API Routes (v1)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/athletes", athleteRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/scout", scoutRoutes);
app.use("/api/v1/trials", trialRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

module.exports = app;
