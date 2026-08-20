const mongoose = require("mongoose");

/*
  Normalized internal representation of a user's insurance policy.
  Supports both government schemes (ESI, PM-JAY, Arogya Karnataka, Yeshaswini)
  and private/employer insurance. All data here is synthetic / user-entered
  mock data as per hackathon guidelines — never treated as verified truth.
*/
const InsurancePolicySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    schemeType: {
      type: String,
      enum: ["ESI", "PM-JAY", "Arogya-Karnataka", "Yeshaswini", "Private", "Employer", "Other"],
      required: true,
    },
    insurerName: { type: String, required: true, trim: true },
    policyNumber: { type: String, trim: true },
    policyType: { type: String, enum: ["Individual", "Family Floater", "Group"], default: "Individual" },

    coverageLimit: { type: Number, required: true }, // total sum insured, INR
    remainingCoverage: { type: Number }, // computed / updatable as claims progress

    roomEligibility: {
      type: String,
      enum: ["General Ward", "Semi-Private", "Private", "ICU-only", "Any"],
      default: "General Ward",
    },

    networkType: { type: String, enum: ["Cashless-Network", "Reimbursement-Only", "Both"], default: "Both" },

    exclusions: [{ type: String, trim: true }], // e.g. ["cosmetic surgery", "pre-existing (waiting period)"]
    coveredProcedures: [{ type: String, trim: true }], // optional whitelist of covered procedure categories

    copayPercentage: { type: Number, default: 0 }, // e.g. 10 = patient pays 10%
    subLimits: [
      {
        category: { type: String, trim: true }, // e.g. "Room Rent", "ICU", "Ambulance"
        limit: { type: Number },
      },
    ],

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InsurancePolicy", InsurancePolicySchema);
