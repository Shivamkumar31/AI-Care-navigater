require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const insuranceRoutes = require("./routes/insurance.routes");
const hospitalRoutes = require("./routes/hospital.routes");
const journeyRoutes = require("./routes/journey.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "ai-care-navigator-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/journeys", journeyRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] AI Care Navigator backend running on port ${PORT}`));