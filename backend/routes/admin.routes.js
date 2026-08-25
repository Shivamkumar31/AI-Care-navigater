const express = require("express");
const Hospital = require("../models/Hospital");
const hospitalData = require("../seed/data/hospitals.json");

const router = express.Router();

// One-time remote seed trigger — protected by a secret so random people can't wipe your data.
// Usage: GET /api/admin/seed?key=YOUR_SECRET
router.get("/seed", async (req, res) => {
  try {
    const providedKey = req.query.key;
    if (!process.env.SEED_SECRET || providedKey !== process.env.SEED_SECRET) {
      return res.status(401).json({ message: "Invalid or missing seed key" });
    }
    await Hospital.deleteMany({});
    const inserted = await Hospital.insertMany(hospitalData);
    res.json({ message: `Seeded ${inserted.length} hospitals successfully.` });
  } catch (err) {
    res.status(500).json({ message: "Seed failed", error: err.message });
  }
});

module.exports = router;