const mongoose = require("mongoose");

const STAGES = ["Pre-Admission", "Admission", "Investigation", "Procedure", "Recovery", "Discharge"];

const CareJourneySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    insurancePolicy: { type: mongoose.Schema.Types.ObjectId, ref: "InsurancePolicy" },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },

    patientName: { type: String, trim: true },
    selectedRoomCategory: {
      type: String,
      enum: ["General Ward", "Semi-Private", "Private", "ICU-only"],
    },
    currentStage: { type: String, enum: STAGES, default: "Pre-Admission" },

    stageHistory: [
      {
        stage: { type: String, enum: STAGES },
        enteredAt: { type: Date, default: Date.now },
        notes: { type: String, trim: true },
      },
    ],

    // Non-binding, informational only — never a diagnosis or clinical/insurance decision.
    notes: { type: String, trim: true },
    closed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CareJourneySchema.statics.STAGES = STAGES;

module.exports = mongoose.model("CareJourney", CareJourneySchema);
