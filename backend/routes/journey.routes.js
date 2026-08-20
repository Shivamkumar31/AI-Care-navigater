const express = require("express");
const CareJourney = require("../models/CareJourney");
const InsurancePolicy = require("../models/InsurancePolicy");
const { protect } = require("../middleware/auth");
const { getGuidanceForStage } = require("../utils/guidanceEngine");

const router = express.Router();
router.use(protect);

const STAGES = CareJourney.STAGES;

router.post("/", async (req, res) => {
  try {
    const { insurancePolicy, hospital, patientName, selectedRoomCategory, notes } = req.body;
    const journey = await CareJourney.create({
      user: req.user._id,
      insurancePolicy,
      hospital,
      patientName,
      selectedRoomCategory,
      notes,
      currentStage: "Pre-Admission",
      stageHistory: [{ stage: "Pre-Admission", notes: "Journey created" }],
    });
    res.status(201).json(journey);
  } catch (err) {
    res.status(500).json({ message: "Failed to create care journey", error: err.message });
  }
});

router.get("/", async (req, res) => {
  const journeys = await CareJourney.find({ user: req.user._id })
    .populate("hospital")
    .populate("insurancePolicy")
    .sort({ createdAt: -1 });
  res.json(journeys);
});

router.get("/stages", (req, res) => res.json(STAGES));

router.get("/:id", async (req, res) => {
  const journey = await CareJourney.findOne({ _id: req.params.id, user: req.user._id })
    .populate("hospital")
    .populate("insurancePolicy");
  if (!journey) return res.status(404).json({ message: "Care journey not found" });

  const guidance = getGuidanceForStage(journey.currentStage, journey.insurancePolicy);
  res.json({ journey, guidance });
});

// Advance / update the stage of a journey and get fresh contextual guidance
router.patch("/:id/stage", async (req, res) => {
  try {
    const { stage, notes } = req.body;
    if (!STAGES.includes(stage)) return res.status(400).json({ message: `stage must be one of: ${STAGES.join(", ")}` });

    const journey = await CareJourney.findOne({ _id: req.params.id, user: req.user._id }).populate("insurancePolicy");
    if (!journey) return res.status(404).json({ message: "Care journey not found" });

    journey.currentStage = stage;
    journey.stageHistory.push({ stage, notes });
    if (stage === "Discharge") journey.closed = true;
    await journey.save();

    const guidance = getGuidanceForStage(stage, journey.insurancePolicy);
    res.json({ journey, guidance });
  } catch (err) {
    res.status(500).json({ message: "Failed to update stage", error: err.message });
  }
});

module.exports = router;
