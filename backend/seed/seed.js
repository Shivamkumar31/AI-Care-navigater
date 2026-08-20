require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Hospital = require("../models/Hospital");
const hospitalData = require("./data/hospitals.json");

const run = async () => {
  await connectDB();
  console.log("[Seed] Clearing existing hospitals...");
  await Hospital.deleteMany({});
  console.log(`[Seed] Inserting ${hospitalData.length} hospitals...`);
  await Hospital.insertMany(hospitalData);
  console.log("[Seed] Done.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});
