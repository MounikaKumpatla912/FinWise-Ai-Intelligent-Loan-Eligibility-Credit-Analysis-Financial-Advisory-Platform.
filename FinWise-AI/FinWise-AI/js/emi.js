/* ==========================================================================
   FinWise AI — EMI Calculator Module
   ========================================================================== */

const EMICalculator = (() => {

  /**
   * Standard reducing-balance EMI formula:
   * EMI = P × R × (1+R)^N / ((1+R)^N − 1)
   * @param {number} principal
   * @param {number} annualRatePct
   * @param {number} tenureYears
   */
  function calculateEMI(principal, annualRatePct, tenureYears) {
    const monthlyRate = annualRatePct / 12 / 100;
    const months = tenureYears * 12;

    if (monthlyRate === 0) {
      const emi = principal / months;
      return finalizeResult(principal, emi, months);
    }

    const factor = Math.pow(1 + monthlyRate, months);
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    return finalizeResult(principal, emi, months);
  }

  function finalizeResult(principal, emi, months) {
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    return {
      emi: round2(emi),
      totalPayment: round2(totalPayment),
      totalInterest: round2(totalInterest),
      principal: round2(principal),
      months
    };
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  function drawDonut(canvas, principal, interest) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const total = principal + interest;
    const cx = size / 2, cy = size / 2, r = size / 2 - 18;
    const lineWidth = 26;
    let startAngle = -Math.PI / 2;

    const segments = [
      { value: principal, color: "#4fd1e8" },
      { value: interest, color: "#9b5cff" }
    ];

    segments.forEach(seg => {
      const angle = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + angle);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();
      startAngle += angle;
    });
  }

  function formatINR(n) {
    return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }

  function render(result) {
    document.getElementById("emi-monthly").textContent = formatINR(result.emi);
    document.getElementById("emi-total-interest").textContent = formatINR(result.totalInterest);
    document.getElementById("emi-total-payment").textContent = formatINR(result.totalPayment);
    document.getElementById("emi-principal-row").textContent = formatINR(result.principal);
    document.getElementById("emi-interest-row").textContent = formatINR(result.totalInterest);
    document.getElementById("emi-months-row").textContent = `${result.months} months`;

    const canvas = document.getElementById("emi-chart");
    if (canvas) drawDonut(canvas, result.principal, result.totalInterest);
  }

  function recalculate() {
    const principal = parseFloat(document.getElementById("emi-principal").value) || 0;
    const rate = parseFloat(document.getElementById("emi-rate").value) || 0;
    const tenure = parseFloat(document.getElementById("emi-tenure").value) || 0;

    document.getElementById("emi-principal-val").textContent = formatINR(principal);
    document.getElementById("emi-rate-val").textContent = `${rate}%`;
    document.getElementById("emi-tenure-val").textContent = `${tenure} yrs`;

    if (principal > 0 && tenure > 0) {
      const result = calculateEMI(principal, rate, tenure);
      render(result);
    }
  }

  function init() {
    const inputs = ["emi-principal", "emi-rate", "emi-tenure"];
    const els = inputs.map(id => document.getElementById(id));
    if (!els[0]) return;

    els.forEach(el => el.addEventListener("input", recalculate));
    recalculate();
  }

  return { init, calculateEMI };
})();

document.addEventListener("DOMContentLoaded", EMICalculator.init);
