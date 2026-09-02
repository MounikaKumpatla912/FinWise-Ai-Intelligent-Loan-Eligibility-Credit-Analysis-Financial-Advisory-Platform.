/* =======================================================
   FinWise AI — js/credit.js
   Credit Score Analyzer logic (Section 11)
   ======================================================= */

function classifyCredit(score) {
  if (score >= 750) return { rating: "Excellent", range: "750–900", color: "var(--success)" };
  if (score >= 650) return { rating: "Good", range: "650–749", color: "var(--warning)" };
  return { rating: "Poor", range: "300–649", color: "var(--danger)" };
}

function creditExplanation(rating) {
  const map = {
    Excellent: "Your score reflects a strong, consistent repayment history and healthy credit usage. Lenders see you as a low-risk borrower, which typically unlocks their best interest rates.",
    Good: "Your score is solid but has room to grow. A few consistent habits over the next several months can move you into the excellent band.",
    Poor: "Your score suggests lenders currently see higher risk in lending to you. The good news is credit scores are rebuildable with consistent, disciplined habits."
  };
  return map[rating];
}

function creditRecommendations(rating) {
  const common = [
    "Pay all EMIs and credit card bills on or before the due date.",
    "Keep credit utilization below 30% of your total available limit.",
    "Avoid applying for multiple loans or cards in a short span of time.",
    "Maintain a healthy repayment history across all accounts."
  ];
  const byRating = {
    Poor: [
      "Set up auto-pay for at least the minimum due on every card to eliminate missed payments.",
      "Prioritize paying down the highest-interest balance first.",
      "Avoid taking on any new loan applications until your score improves."
    ],
    Good: [
      "Keep utilization comfortably below 30% rather than close to the limit.",
      "Let older accounts stay open and active to lengthen your credit history.",
      "Space out new credit applications by at least 6 months."
    ],
    Excellent: [
      "Continue on-time payments — a single missed payment can meaningfully impact even a top-tier score.",
      "Review your credit report periodically for errors or fraudulent activity.",
      "Use your strong score to negotiate better interest rates on new credit."
    ]
  };
  return [...(byRating[rating] || []), ...common];
}
