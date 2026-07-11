/* ==========================================================================
   FinWise AI — Loan Eligibility Module
   ========================================================================== */

const Eligibility = (() => {

  const rules = CONFIG.ELIGIBILITY;

  /**
   * Validates every field in the loan eligibility form.
   * Returns { valid: boolean, errors: { fieldName: message } }
   */
  function validateForm(data) {
    const errors = {};

    if (!data.name || !data.name.trim()) errors.name = "Please enter the applicant's name.";
    if (!data.salary || isNaN(data.salary)) errors.salary = "Enter a valid monthly salary.";
    if (!data.creditScore || isNaN(data.creditScore)) errors.creditScore = "Enter a valid credit score.";
    else if (data.creditScore < 300 || data.creditScore > 900) errors.creditScore = "Credit score must be between 300 and 900.";
    if (data.existingEmi === "" || isNaN(data.existingEmi)) errors.existingEmi = "Enter existing EMI (0 if none).";
    if (!data.age || isNaN(data.age)) errors.age = "Enter a valid age.";
    if (!data.employmentType) errors.employmentType = "Select an employment type.";
    if (!data.loanType) errors.loanType = "Select a loan type.";
    if (!data.city || !data.city.trim()) errors.city = "Enter your city.";
    if (!data.requiredAmount || isNaN(data.requiredAmount)) errors.requiredAmount = "Enter the required loan amount.";

    return { valid: Object.keys(errors).length === 0, errors };
  }

  /**
   * Applies the eligibility business rules and computes risk classification.
   */
  function checkEligibility(data) {
    const reasons = [];
    let eligible = true;

    if (data.salary <= rules.MIN_SALARY) {
      eligible = false;
      reasons.push(`Monthly salary must be above ₹${rules.MIN_SALARY.toLocaleString("en-IN")}.`);
    }
    if (data.creditScore <= rules.MIN_CREDIT_SCORE) {
      eligible = false;
      reasons.push(`Credit score must be above ${rules.MIN_CREDIT_SCORE}.`);
    }
    if (data.existingEmi >= rules.MAX_EXISTING_EMI) {
      eligible = false;
      reasons.push(`Existing EMI must be below ₹${rules.MAX_EXISTING_EMI.toLocaleString("en-IN")}.`);
    }
    if (data.age < rules.MIN_AGE) {
      eligible = false;
      reasons.push(`Applicant age must be at least ${rules.MIN_AGE} years.`);
    }

    const eligibleAmount = eligible ? data.salary * rules.LOAN_MULTIPLIER : 0;
    const risk = classifyRisk(data);
    const advice = buildAdvice(data, eligible, risk);

    if (eligible) reasons.push("All eligibility parameters were met.");

    return { eligible, eligibleAmount, risk, reasons, advice };
  }

  /**
   * Risk classification — Green (low), Yellow (medium), Red (high).
   * Based on credit score, EMI-to-income ratio, and age.
   */
  function classifyRisk(data) {
    const emiRatio = data.salary > 0 ? data.existingEmi / data.salary : 1;
    let score = 0;

    if (data.creditScore >= 750) score += 2;
    else if (data.creditScore >= 700) score += 1;

    if (emiRatio < 0.2) score += 2;
    else if (emiRatio < 0.4) score += 1;

    if (data.age >= 25 && data.age <= 55) score += 1;

    if (score >= 4) return { level: "low", label: "Low Risk" };
    if (score >= 2) return { level: "medium", label: "Medium Risk" };
    return { level: "high", label: "High Risk" };
  }

  function buildAdvice(data, eligible, risk) {
    if (!eligible) {
      return "Focus on improving the factor(s) above — raising your credit score, reducing existing EMI obligations, or building income stability — then reapply. A secured loan option may also be worth exploring in the meantime.";
    }
    if (risk.level === "low") {
      return "You're in a strong position. Consider negotiating for a lower interest rate given your profile, and keep your EMI-to-income ratio under 30% going forward.";
    }
    if (risk.level === "medium") {
      return "You qualify, but lenders may price in a moderate risk premium. Paying down existing EMIs before applying could improve your terms.";
    }
    return "You're eligible, but flagged higher risk — expect closer scrutiny and possibly a higher interest rate. Strengthening your credit score first is recommended.";
  }

  /**
   * Renders the result panel into the DOM.
   */
  function renderResult(container, result) {
    const { eligible, eligibleAmount, risk, reasons, advice } = result;

    container.innerHTML = `
      <div class="result-status">
        <span class="badge ${eligible ? "badge-approved" : "badge-rejected"}">
          <i class="fa-solid ${eligible ? "fa-circle-check" : "fa-circle-xmark"}"></i>
          ${eligible ? "Eligible" : "Not Eligible"}
        </span>
        <span class="risk-pill risk-${risk.level}"><span class="risk-dot"></span>${risk.label}</span>
      </div>

      <div class="result-metrics">
        <div class="metric-box">
          <div class="val">₹${eligibleAmount.toLocaleString("en-IN")}</div>
          <div class="lab">Eligible Loan Amount</div>
        </div>
        <div class="metric-box">
          <div class="val">${risk.label}</div>
          <div class="lab">Risk Classification</div>
        </div>
        <div class="metric-box">
          <div class="val">${eligible ? "Approved" : "Declined"}</div>
          <div class="lab">Approval Status</div>
        </div>
      </div>

      <h4 style="margin-bottom:10px;font-size:1rem;">Assessment Details</h4>
      <ul class="reasons-list">
        ${reasons.map(r => `<li><i class="fa-solid fa-circle-dot"></i>${r}</li>`).join("")}
      </ul>

      <h4 style="margin-bottom:10px;font-size:1rem;">Financial Advice</h4>
      <div class="advice-box">${advice}</div>
    `;
    container.classList.add("show");
  }

  function clearErrors(form) {
    form.querySelectorAll(".field").forEach(f => {
      f.classList.remove("has-error");
      const msg = f.querySelector(".error-msg");
      if (msg) msg.textContent = "";
    });
  }

  function showErrors(form, errors) {
    Object.entries(errors).forEach(([field, message]) => {
      const wrapper = form.querySelector(`[data-field="${field}"]`);
      if (!wrapper) return;
      wrapper.classList.add("has-error");
      const msg = wrapper.querySelector(".error-msg");
      if (msg) msg.textContent = message;
    });
  }

  function init() {
    const form = document.getElementById("eligibility-form");
    if (!form) return;
    const resultPanel = document.getElementById("eligibility-result");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(form);

      const data = {
        name: form.name.value,
        salary: parseFloat(form.salary.value),
        creditScore: parseFloat(form.creditScore.value),
        existingEmi: parseFloat(form.existingEmi.value),
        age: parseFloat(form.age.value),
        employmentType: form.employmentType.value,
        loanType: form.loanType.value,
        city: form.city.value,
        requiredAmount: parseFloat(form.requiredAmount.value)
      };

      const { valid, errors } = validateForm(data);
      if (!valid) {
        showErrors(form, errors);
        showToast("Please fix the highlighted fields.", "error");
        return;
      }

      showLoader();
      await new Promise(r => setTimeout(r, 700)); // perceived processing delay

      const result = checkEligibility(data);
      renderResult(resultPanel, result);

      const logResult = await FinAPI.saveToGoogleSheets({
        timestamp: new Date().toISOString(),
        name: data.name,
        salary: data.salary,
        creditScore: data.creditScore,
        existingEmi: data.existingEmi,
        age: data.age,
        loanEligibility: result.eligible,
        eligibleAmount: result.eligibleAmount,
        risk: result.risk.label,
        aiSummary: result.advice
      });

      hideLoader();
      showToast(
        result.eligible ? "Eligibility check complete — you're approved!" : "Eligibility check complete.",
        result.eligible ? "success" : "info"
      );
      if (logResult && logResult.skipped) {
        console.info("Google Sheets logging skipped:", logResult.reason || "disabled");
      }

      resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return { init, validateForm, checkEligibility, classifyRisk };
})();

document.addEventListener("DOMContentLoaded", Eligibility.init);
