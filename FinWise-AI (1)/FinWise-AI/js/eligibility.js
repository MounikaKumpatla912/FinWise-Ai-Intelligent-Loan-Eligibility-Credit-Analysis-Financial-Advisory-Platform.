/* =======================================================
   FinWise AI — js/eligibility.js
   Loan Eligibility Checker business logic (Sections 7–10)
   ======================================================= */

function validateEligibilityForm(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = "Please enter your full name.";
  if (!data.age || data.age < 18 || data.age > 80) errors.age = "Age must be between 18 and 80.";
  if (!data.income || data.income <= 0) errors.income = "Monthly income must be greater than 0.";
  if (!data.employmentType) errors.employmentType = "Please select your employment type.";
  if (!data.creditScore || data.creditScore < 300 || data.creditScore > 900) errors.creditScore = "Credit score must be between 300 and 900.";
  if (data.existingEmi === "" || data.existingEmi < 0) errors.existingEmi = "Existing EMI cannot be negative.";
  if (!data.loanAmount || data.loanAmount <= 0) errors.loanAmount = "Loan amount must be greater than 0.";
  if (!data.loanTenure || data.loanTenure <= 0) errors.loanTenure = "Loan tenure must be greater than 0.";
  if (!data.loanType) errors.loanType = "Please select a loan type.";
  return errors;
}

function computeRiskLevel(creditScore, existingEmi) {
  const R = FINWISE_CONFIG.RULES;
  if (creditScore >= 750 && existingEmi < 10000) return "Low Risk";
  if ((creditScore >= 701 && creditScore <= 749) || (existingEmi >= 10000 && existingEmi <= 20000)) return "Medium Risk";
  return "High Risk";
}

function assessEligibility(data) {
  const R = FINWISE_CONFIG.RULES;
  const reasons = [];

  if (data.income <= R.MIN_SALARY) reasons.push(`Income does not meet the minimum requirement of ₹${R.MIN_SALARY.toLocaleString("en-IN")}.`);
  if (data.creditScore <= R.MIN_CREDIT_SCORE) reasons.push(`Credit score is below the required threshold of ${R.MIN_CREDIT_SCORE}.`);
  if (data.existingEmi >= R.MAX_EXISTING_EMI) reasons.push(`Existing EMI obligations exceed the ₹${R.MAX_EXISTING_EMI.toLocaleString("en-IN")} limit.`);
  if (data.age < R.MIN_AGE) reasons.push(`Minimum age requirement of ${R.MIN_AGE} is not satisfied.`);

  const eligible = reasons.length === 0;
  const riskLevel = computeRiskLevel(data.creditScore, data.existingEmi);
  const eligibleAmount = eligible ? Math.round(data.income * R.LOAN_MULTIPLIER) : 0;
  const interestRate = FINWISE_CONFIG.INTEREST_RATES[data.loanType] || 11;

  const principal = eligible ? Math.min(eligibleAmount, data.loanAmount) : data.loanAmount;
  const emi = calculateEMI(principal, interestRate, data.loanTenure);

  const suggestions = eligible ? [] : buildImprovementSuggestions(data, R);

  return {
    eligible,
    reasons,
    riskLevel,
    eligibleAmount,
    interestRate,
    approxEmi: Math.round(emi),
    tenure: data.loanTenure,
    suggestions
  };
}

function buildImprovementSuggestions(data, R) {
  const tips = [];
  if (data.income <= R.MIN_SALARY) tips.push("Consider adding a co-applicant's income or waiting until your income grows past the minimum threshold.");
  if (data.creditScore <= R.MIN_CREDIT_SCORE) tips.push("Improve your credit score by paying bills on time and reducing outstanding balances before reapplying.");
  if (data.existingEmi >= R.MAX_EXISTING_EMI) tips.push("Pay down or close some existing loans to lower your monthly EMI obligations.");
  if (data.age < R.MIN_AGE) tips.push("Reapply once you meet the minimum age requirement, or add an eligible co-applicant.");
  return tips;
}

/* Standard EMI formula: EMI = P x R x (1+R)^N / ((1+R)^N - 1) */
function calculateEMI(principal, annualRatePercent, tenureMonths) {
  if (!principal || !tenureMonths) return 0;
  const R = annualRatePercent / 12 / 100;
  if (R === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + R, tenureMonths);
  return (principal * R * factor) / (factor - 1);
}
