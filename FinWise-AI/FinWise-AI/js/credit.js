/* ==========================================================================
   FinWise AI — Credit Analyzer Module
   ========================================================================== */

const CreditAnalyzer = (() => {

  const bands = CONFIG.CREDIT_BANDS;
  const CIRC = 2 * Math.PI * 96; // matches r=96 in the SVG below

  function analyzeCredit(score) {
    let classification, colorVar, message;

    if (score >= bands.EXCELLENT.min) {
      classification = "Excellent";
      colorVar = "var(--green)";
      message = "You're in the top tier — lenders will compete for your business with their best rates.";
    } else if (score >= bands.GOOD.min) {
      classification = "Good";
      colorVar = "var(--cyan-accent)";
      message = "A solid score. A few targeted improvements could unlock premium interest rates.";
    } else {
      classification = "Poor";
      colorVar = "var(--red)";
      message = "Lenders will see this as higher risk. Focus on the improvement tips below before applying for credit.";
    }

    const recommendations = buildRecommendations(score);
    return { score, classification, colorVar, message, recommendations };
  }

  function buildRecommendations(score) {
    const tips = [
      { icon: "fa-calendar-check", title: "Pay on time, every time", text: "Payment history is the single biggest factor — set up autopay to never miss a due date." },
      { icon: "fa-chart-line", title: "Lower your utilisation", text: "Keep credit card balances under 30% of your limit; under 10% is even better." },
      { icon: "fa-layer-group", title: "Don't close old accounts", text: "Length of credit history matters — keep older accounts open even if unused." },
      { icon: "fa-magnifying-glass", title: "Check your report often", text: "Dispute errors on your credit report as soon as you spot them." }
    ];

    if (score < bands.GOOD.min) {
      tips.unshift({ icon: "fa-triangle-exclamation", title: "Address overdue accounts first", text: "Clear any past-due balances — this has the fastest impact on a low score." });
    }
    if (score >= bands.EXCELLENT.min) {
      tips.unshift({ icon: "fa-star", title: "Leverage your score", text: "Negotiate better rates on existing loans — lenders often reprice for excellent credit." });
    }
    return tips.slice(0, 4);
  }

  function renderCircle(svgProg, textEl, labelEl, score) {
    const max = 900;
    const pct = Math.min(Math.max(score / max, 0), 1);
    const offset = CIRC - pct * CIRC;

    svgProg.style.strokeDasharray = `${CIRC}`;
    svgProg.style.strokeDashoffset = `${CIRC}`;
    requestAnimationFrame(() => {
      svgProg.style.strokeDashoffset = `${offset}`;
    });

    animateCounter(textEl, score);
    labelEl.textContent = "out of 900";
  }

  function renderTips(container, tips) {
    container.innerHTML = tips.map(t => `
      <div class="tip-card reveal in-view">
        <i class="fa-solid ${t.icon}"></i>
        <h4>${t.title}</h4>
        <p>${t.text}</p>
      </div>
    `).join("");
  }

  function init() {
    const form = document.getElementById("credit-form");
    if (!form) return;

    const resultPanel = document.getElementById("credit-result");
    const svgProg = document.getElementById("score-progress");
    const scoreNum = document.getElementById("score-num");
    const scoreLabel = document.getElementById("score-sublabel");
    const classificationEl = document.getElementById("credit-classification");
    const messageEl = document.getElementById("credit-message");
    const tipsGrid = document.getElementById("tips-grid");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const wrapper = form.querySelector('[data-field="creditScore"]');
      const errorMsg = wrapper.querySelector(".error-msg");
      const score = parseFloat(form.creditScore.value);

      if (!score || score < 300 || score > 900) {
        wrapper.classList.add("has-error");
        errorMsg.textContent = "Enter a score between 300 and 900.";
        showToast("Please enter a valid credit score.", "error");
        return;
      }
      wrapper.classList.remove("has-error");
      errorMsg.textContent = "";

      showLoader();
      await new Promise(r => setTimeout(r, 500));

      const analysis = analyzeCredit(score);
      svgProg.style.stroke = analysis.colorVar;
      renderCircle(svgProg, scoreNum, scoreLabel, analysis.score);
      classificationEl.textContent = analysis.classification;
      classificationEl.style.color = analysis.colorVar;
      messageEl.textContent = analysis.message;
      renderTips(tipsGrid, analysis.recommendations);

      resultPanel.classList.add("show");
      hideLoader();
      showToast(`Analysis complete — classified as ${analysis.classification}.`, "success");
      resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return { init, analyzeCredit };
})();

document.addEventListener("DOMContentLoaded", CreditAnalyzer.init);
