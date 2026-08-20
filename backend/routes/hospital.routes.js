const express = require("express");
const Hospital = require("../models/Hospital");
const InsurancePolicy = require("../models/InsurancePolicy");
const { protect } = require("../middleware/auth");
const { rankHospitals } = require("../utils/matchEngine");

const router = express.Router();

// Public: browse raw hospital dataset (e.g. for exploration without a policy yet)
router.get("/", async (req, res) => {
  const { city, specialty } = req.query;
  const filter = {};
  if (city) filter.city = new RegExp(`^${city}$`, "i");
  if (specialty) filter.specialties = new RegExp(specialty, "i");
  const hospitals = await Hospital.find(filter).limit(100);
  res.json(hospitals);
});

router.get("/:id", async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) return res.status(404).json({ message: "Hospital not found" });
  res.json(hospital);
});

// Core matching endpoint: given a policy (owned by the logged-in user) + optional
// procedure/specialty/city, return ranked, explained hospital + room suggestions.
router.post("/match", protect, async (req, res) => {
  try {
    const { policyId, procedureOrSpecialty, city } = req.body;
    if (!policyId) return res.status(400).json({ message: "policyId is required" });

    const policy = await InsurancePolicy.findOne({ _id: policyId, user: req.user._id });
    if (!policy) return res.status(404).json({ message: "Insurance policy not found" });

    const hospitals = await Hospital.find(city ? { city: new RegExp(`^${city}$`, "i") } : {});
    const allHospitals = city ? hospitals.concat(await Hospital.find({ city: { $ne: city } })) : hospitals;

    const ranked = rankHospitals(allHospitals, policy, { procedureOrSpecialty, city });

    res.json({
      policy,
      resultCount: ranked.length,
      suggestions: ranked.slice(0, 15).map((r) => ({
        hospital: r.hospital,
        score: r.score,
        eligibleRooms: r.eligibleRooms,
        recommendedRoom: r.recommendedRoom,
        explanation: r.explanation,
      })),
      disclaimer:
        "This is decision-support information only, based on the data provided/available. It is not a medical diagnosis or a binding insurance approval — always confirm final eligibility with your insurer and hospital.",
    });
  } catch (err) {
    res.status(500).json({ message: "Matching failed", error: err.message });
  }
});

module.exports = router;
