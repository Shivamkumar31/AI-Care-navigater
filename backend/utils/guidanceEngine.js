/*
  Stage-aware contextual guidance generator.
  For each care-journey stage, surfaces plain-language, insurance-aware
  prompts based on the user's policy — purely informational, never a
  binding insurance decision or medical recommendation.
*/

const STAGE_TEMPLATES = {
  "Pre-Admission": (policy) => [
    `Confirm the hospital is listed as in-network for your ${policy.schemeType} coverage before admission.`,
    `Keep your policy number${policy.policyNumber ? ` (${policy.policyNumber})` : ""} and ID proof ready — most cashless approvals need these at the desk.`,
    policy.copayPercentage > 0
      ? `Your policy has a ${policy.copayPercentage}% co-pay — budget for that portion out-of-pocket.`
      : `Your policy shows no co-pay, but always double-check for procedure-specific exclusions.`,
  ],
  Admission: (policy) => [
    `Room booked should not exceed your eligible category: "${policy.roomEligibility}". Booking a higher category may lead to proportionate deduction on the whole bill, not just the room charge.`,
    `Ask the hospital's insurance desk to raise a pre-authorization request if this is a cashless claim.`,
  ],
  Investigation: (policy) => [
    `Diagnostic tests are usually covered as part of the treatment package — retain all test bills/reports for claim documentation.`,
    (policy.exclusions || []).length
      ? `Double-check none of the ordered tests/procedures fall under your listed exclusions: ${policy.exclusions.join(", ")}.`
      : `No specific exclusions are on file for your policy — but always confirm with the insurer for uncommon tests.`,
  ],
  Procedure: (policy) => [
    `Major procedures may have their own sub-limits. ${
      (policy.subLimits || []).length
        ? "Sub-limits on file: " + policy.subLimits.map((s) => `${s.category}: ₹${s.limit?.toLocaleString("en-IN")}`).join(", ")
        : "No sub-limits are on file — verify procedure-specific caps with your insurer."
    }`,
    `Keep a copy of the procedure/surgery notes — required for most claim settlements.`,
  ],
  Recovery: (policy) => [
    `Room category can be downgraded during recovery if clinically appropriate — this can reduce your out-of-pocket cost without affecting eligibility.`,
    `If considering a transfer to a lower-cost network hospital for recovery, confirm both hospitals are in-network to avoid reimbursement-only status.`,
  ],
  Discharge: (policy) => [
    `Review the final bill against your coverage limit (₹${policy.coverageLimit?.toLocaleString("en-IN")}) and remaining balance before signing off.`,
    `Collect all original bills, discharge summary, and payment receipts — required for any reimbursement claims.`,
  ],
};

function getGuidanceForStage(stage, policy) {
  const generator = STAGE_TEMPLATES[stage];
  if (!generator || !policy) return [];
  return generator(policy);
}

module.exports = { getGuidanceForStage, STAGE_TEMPLATES };
