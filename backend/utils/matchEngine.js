/*
  Core decision-support engine: maps a normalized insurance policy to
  eligible hospitals + room categories, and produces a plain-language
  explanation for each suggestion. This is informational/decision-support
  only — it never issues a medical diagnosis or a binding insurance ruling.
*/

const ROOM_RANK = { "General Ward": 0, "Semi-Private": 1, "Private": 2, "ICU-only": 3 };

function isSchemeAccepted(hospital, policy) {
  if (policy.schemeType && hospital.networkSchemes.includes(policy.schemeType)) return true;
  if (policy.schemeType === "Private" || policy.schemeType === "Employer") {
    return hospital.networkInsurers.some(
      (ins) => ins.toLowerCase() === (policy.insurerName || "").toLowerCase()
    );
  }
  return false;
}

function eligibleRoomCategories(policy) {
  if (policy.roomEligibility === "Any") {
    return ["General Ward", "Semi-Private", "Private", "ICU-only"];
  }
  const maxRank = ROOM_RANK[policy.roomEligibility] ?? 0;
  return Object.keys(ROOM_RANK).filter((room) => ROOM_RANK[room] <= maxRank);
}

function matchSpecialty(hospital, procedureOrSpecialty) {
  if (!procedureOrSpecialty) return true;
  const needle = procedureOrSpecialty.toLowerCase();
  return (
    hospital.specialties.some((s) => s.toLowerCase().includes(needle)) ||
    hospital.indicativeProcedureCosts.some((p) => p.procedure.toLowerCase().includes(needle))
  );
}

/**
 * Score + explain a hospital's fit for a given policy/query.
 * Returns null if the hospital is not in-network for this policy.
 */
function evaluateHospital(hospital, policy, { procedureOrSpecialty, city } = {}) {
  const inNetwork = isSchemeAccepted(hospital, policy);
  if (!inNetwork) return null;

  const eligibleRooms = eligibleRoomCategories(policy);
  const availableEligibleRooms = hospital.roomTypes.filter(
    (r) => eligibleRooms.includes(r.category) && r.available
  );

  if (availableEligibleRooms.length === 0) {
    return null; // no room category this policy covers is available here
  }

  const specialtyMatch = matchSpecialty(hospital, procedureOrSpecialty);
  const cityMatch = !city || hospital.city.toLowerCase() === city.toLowerCase();

  let score = 0;
  score += cityMatch ? 30 : 0;
  score += specialtyMatch ? 30 : 0;
  score += hospital.rating * 5; // up to 25
  score += availableEligibleRooms.length * 3; // more room options = more flexibility

  const bestRoom = availableEligibleRooms.sort(
    (a, b) => ROOM_RANK[b.category] - ROOM_RANK[a.category]
  )[0];

  const explanationParts = [];
  explanationParts.push(
    `${hospital.name} is in-network for your ${policy.schemeType} coverage.`
  );
  explanationParts.push(
    `Your policy covers up to "${policy.roomEligibility}", so you're eligible for: ${availableEligibleRooms
      .map((r) => r.category)
      .join(", ")} at this hospital.`
  );
  if (bestRoom.indicativeCostPerDay) {
    explanationParts.push(
      `Indicative cost for ${bestRoom.category}: ~₹${bestRoom.indicativeCostPerDay.toLocaleString("en-IN")}/day.`
    );
  }
  if (!specialtyMatch && procedureOrSpecialty) {
    explanationParts.push(
      `Note: this hospital's listed specialties don't clearly match "${procedureOrSpecialty}" — please verify directly before choosing.`
    );
  }
  if (!cityMatch && city) {
    explanationParts.push(`Note: located in ${hospital.city}, outside your searched city (${city}).`);
  }

  return {
    hospital,
    score,
    eligibleRooms: availableEligibleRooms,
    recommendedRoom: bestRoom,
    inNetwork,
    specialtyMatch,
    cityMatch,
    explanation: explanationParts.join(" "),
  };
}

/**
 * Rank all candidate hospitals for a given policy + search context.
 */
function rankHospitals(hospitals, policy, context = {}) {
  return hospitals
    .map((h) => evaluateHospital(h, policy, context))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

module.exports = { evaluateHospital, rankHospitals, eligibleRoomCategories, isSchemeAccepted };
