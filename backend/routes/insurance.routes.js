const express = require("express");
const { body, validationResult } = require("express-validator");
const InsurancePolicy = require("../models/InsurancePolicy");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// Create / ingest a new insurance policy (structured input, normalized internally by the schema)
router.post(
  "/",
  [
    body("schemeType").notEmpty(),
    body("insurerName").notEmpty(),
    body("coverageLimit").isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const payload = { ...req.body, user: req.user._id };
      if (payload.remainingCoverage === undefined) payload.remainingCoverage = payload.coverageLimit;
      const policy = await InsurancePolicy.create(payload);
      res.status(201).json(policy);
    } catch (err) {
      res.status(500).json({ message: "Failed to save insurance policy", error: err.message });
    }
  }
);

// List current user's policies
router.get("/", async (req, res) => {
  const policies = await InsurancePolicy.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(policies);
});

router.get("/:id", async (req, res) => {
  const policy = await InsurancePolicy.findOne({ _id: req.params.id, user: req.user._id });
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  res.json(policy);
});

router.put("/:id", async (req, res) => {
  const policy = await InsurancePolicy.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  res.json(policy);
});

router.delete("/:id", async (req, res) => {
  const result = await InsurancePolicy.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!result) return res.status(404).json({ message: "Policy not found" });
  res.json({ message: "Policy deleted" });
});

module.exports = router;
