const mongoose = require("mongoose");

/*
  Publicly-available / simulated hospital dataset as per challenge guidance.
  networkSchemes lists which government/private schemes this hospital accepts.
*/
const HospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    address: { type: String, trim: true },

    specialties: [{ type: String, trim: true }], // e.g. ["Cardiology", "Orthopedics"]

    networkSchemes: [
      {
        type: String,
        enum: ["ESI", "PM-JAY", "Arogya-Karnataka", "Yeshaswini", "Private", "Employer", "Other"],
      },
    ],
    networkInsurers: [{ type: String, trim: true }], // named private insurers this hospital is cashless-network for

    roomTypes: [
      {
        category: {
          type: String,
          enum: ["General Ward", "Semi-Private", "Private", "ICU-only"],
        },
        indicativeCostPerDay: { type: Number }, // INR
        available: { type: Boolean, default: true },
      },
    ],

    indicativeProcedureCosts: [
      {
        procedure: { type: String, trim: true },
        costRange: { type: String, trim: true }, // e.g. "80,000 - 1,20,000"
      },
    ],

    rating: { type: Number, min: 0, max: 5, default: 4 },
    beds: { type: Number },
    contact: { type: String, trim: true },
  },
  { timestamps: true }
);

HospitalSchema.index({ city: "text", name: "text", specialties: "text" });

module.exports = mongoose.model("Hospital", HospitalSchema);
