/* =======================================================
   FinWise AI — js/emi.js
   EMI Calculator page logic (Section 12)
   Reuses calculateEMI() defined in eligibility.js
   ======================================================= */

function computeEMIBreakdown(principal, annualRatePercent, tenureYears) {
  const tenureMonths = Math.round(tenureYears * 12);
  const emi = calculateEMI(principal, annualRatePercent, tenureMonths);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: Math.round(principal),
    tenureMonths
  };
}
