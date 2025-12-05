require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow frontend URL in production, all in dev
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/future-analysis', require('./routes/futureRoutes'));
app.use('/api/market', require('./routes/marketDataRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/comparisons', require('./routes/comparisonRoutes'));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Public health check (no auth middleware applied)
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
