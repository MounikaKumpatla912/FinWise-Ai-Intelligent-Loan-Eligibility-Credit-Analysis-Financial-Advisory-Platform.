/* =======================================================
   FinWise AI — js/api.js
   Handles all outbound communication:
     - AI Financial Advisor (Claude API via proxy, or demo fallback)
     - Google Sheets logging via Google Apps Script
   ======================================================= */

const FinWiseAPI = (() => {

  /**
   * Ask the AI advisor a question, optionally with the user's
   * financial profile for a personalized answer.
   * Always resolves (never throws) so the UI can rely on it —
   * failures resolve with { ok:false, message } instead.
   */
  async function askAdvisor(userMessage, profile = null) {
    if (FINWISE_CONFIG.API_MODE === "proxy" && FINWISE_CONFIG.PROXY_ENDPOINT) {
      try {
        const res = await fetch(FINWISE_CONFIG.PROXY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, profile })
        });
        if (!res.ok) throw new Error("Advisor service returned an error.");
        const data = await res.json();
        return { ok: true, text: data.reply || data.text || "", source: "live" };
      } catch (err) {
        console.warn("Live AI advisor unavailable, using offline advisor instead:", err);
        return { ok: true, text: DemoAdvisor.respond(userMessage, profile), source: "demo-fallback" };
      }
    }
    // Demo mode: realistic offline rule-based advisor, always available.
    await wait(650 + Math.random() * 550);
    return { ok: true, text: DemoAdvisor.respond(userMessage, profile), source: "demo" };
  }

  /** Save an assessment record to Google Sheets, if configured. */
  async function saveToGoogleSheets(record) {
    const endpoint = FINWISE_CONFIG.GOOGLE_SHEETS_ENDPOINT;
    if (!endpoint) {
      return { ok: false, configured: false, message: "Cloud storage is not configured. Your analysis is still available on this device." };
    }
    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors", // Apps Script web apps commonly require no-cors from the browser
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(record)
      });
      return { ok: true, configured: true, message: "Data saved successfully." };
    } catch (err) {
      console.error("Google Sheets save failed:", err);
      return { ok: false, configured: true, message: "Unable to reach cloud storage right now. Your analysis is still available on this device." };
    }
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  return { askAdvisor, saveToGoogleSheets };
})();


/* =======================================================
   Offline / fallback financial advisor engine.
   Produces genuinely useful, profile-aware answers without
   needing any network access — this is what keeps FinWise AI
   fully working when no Claude API key/proxy is configured.
   ======================================================= */
const DemoAdvisor = (() => {

  function respond(message, profile) {
    const q = (message || "").toLowerCase();

    if (profile && /afford|eligib|qualify/.test(q)) return affordabilityAdvice(profile);
    if (/credit score|improve.*credit/.test(q)) return creditAdvice(profile);
    if (/emi|repay|instalment|installment/.test(q)) return emiAdvice(profile);
    if (/budget/.test(q)) return budgetAdvice(profile);
    if (/debt/.test(q)) return debtAdvice();
    if (/emergency fund|savings/.test(q)) return savingsAdvice();
    if (/before taking a loan|consider.*loan|things to know/.test(q)) return preLoanAdvice();
    if (profile) return profileSummary(profile);

    return "I can help with loan guidance, credit improvement, EMI planning, budgeting, debt management and savings. " +
      "Try asking something like \"How can I improve my credit score?\" or fill in the Loan Eligibility form first so I can " +
      "tailor my answer to your numbers.";
  }

  function profileSummary(p) {
    const lines = [];
    lines.push(`Here's a quick read on ${p.name || "your"} profile:`);
    lines.push(`- Monthly income: ₹${Number(p.income).toLocaleString("en-IN")}`);
    lines.push(`- Credit score: ${p.creditScore} (${creditBand(p.creditScore)})`);
    lines.push(`- Existing EMI: ₹${Number(p.existingEmi).toLocaleString("en-IN")}`);
    if (p.eligibility) lines.push(`- Eligibility result: ${p.eligibility} (${p.riskLevel || "risk level not set"})`);
    lines.push("", "Ask me about credit, EMI affordability, budgeting or debt and I'll go deeper on any of these.");
    return lines.join("\n");
  }

  function affordabilityAdvice(p) {
    const income = Number(p.income) || 0;
    const emi = Number(p.existingEmi) || 0;
    const freeIncome = income - emi;
    const safeEmi = Math.round(income * 0.4 - emi);
    let verdict;
    if (p.eligibility === "Eligible") {
      const safeEmiText = Math.max(safeEmi, 0).toLocaleString("en-IN");
      verdict = "Based on the figures you entered, you're eligible, and a comfortable additional EMI would be " +
        "roughly \u20B9" + safeEmiText + " per month, keeping your total obligations under 40% of income.";
    } else {
      verdict = "Based on the figures you entered, you're not currently eligible. The biggest lever is usually reducing " +
        "existing EMI or raising your credit score before reapplying.";
    }
    return [
      verdict,
      "",
      `Free monthly income after existing EMI: ₹${freeIncome.toLocaleString("en-IN")}.`,
      "As a rule of thumb, lenders prefer your total EMIs (existing + new) to stay under 40% of your monthly income."
    ].join("\n");
  }

  function creditAdvice(p) {
    const band = p && p.creditScore ? creditBand(p.creditScore) : null;
    const tips = [
      "Pay every EMI and credit card bill on or before the due date — payment history carries the most weight.",
      "Keep credit utilization under 30% of your total limit across all cards.",
      "Avoid applying for several loans or cards in a short window; each hard inquiry dents your score slightly.",
      "Maintain a healthy mix of secured and unsecured credit over time rather than closing old accounts.",
      "Check your credit report periodically and dispute any incorrect entries."
    ];
    const intro = band
      ? `Your score falls in the "${band}" band. Here's how to move it higher:`
      : "Here's how to build and protect a strong credit score:";
    return intro + "\n\n- " + tips.join("\n- ");
  }

  function emiAdvice(p) {
    const income = Number(p && p.income) || 0;
    const cap = income ? Math.round(income * 0.4) : null;
    const base = "A comfortable EMI is one that, combined with your other obligations, stays at or below 40% of your monthly income.";
    return cap
      ? `${base}\n\nFor an income of ₹${income.toLocaleString("en-IN")}, that works out to roughly ₹${cap.toLocaleString("en-IN")} per month across all loans combined.`
      : `${base}\n\nTry the EMI Calculator page to see exactly how loan amount, interest rate and tenure change your monthly instalment.`;
  }

  function budgetAdvice() {
    return [
      "A simple starting framework is the 50/30/20 rule:",
      "- 50% of income toward needs (rent, groceries, utilities, existing EMIs).",
      "- 30% toward wants (dining out, entertainment, subscriptions).",
      "- 20% toward savings, investments and debt repayment beyond the minimum.",
      "",
      "If your existing EMIs already exceed roughly 40% of income, prioritize reducing that before adding new commitments."
    ].join("\n");
  }

  function debtAdvice() {
    return [
      "Two proven approaches to paying down debt faster:",
      "- Avalanche method: pay minimums everywhere, then throw extra money at the highest-interest debt first — saves the most money overall.",
      "- Snowball method: pay off the smallest balance first for quick wins, then roll that payment into the next smallest — better for motivation.",
      "",
      "Either way, avoid taking on new debt while you're paying down existing balances, and consider consolidating high-interest debt into a single lower-rate loan if you qualify."
    ].join("\n");
  }

  function savingsAdvice() {
    return [
      "Aim to build an emergency fund covering 3–6 months of essential expenses, kept in a liquid, low-risk account.",
      "Automate a fixed transfer to savings right after payday so it happens before discretionary spending.",
      "Once your emergency fund is in place, direct extra savings toward high-interest debt first, then long-term goals."
    ].join("\n");
  }

  function preLoanAdvice() {
    return [
      "Before taking any loan, it helps to check:",
      "- Total cost: the interest rate, processing fees and any prepayment penalties, not just the EMI.",
      "- Affordability: keep total EMIs under ~40% of your monthly income.",
      "- Tenure trade-off: a longer tenure lowers the EMI but increases total interest paid.",
      "- Your credit score: a higher score usually unlocks a meaningfully lower interest rate.",
      "- Purpose: whether the loan funds something that builds value (education, home) versus discretionary spending."
    ].join("\n");
  }

  function creditBand(score) {
    score = Number(score);
    if (score >= 750) return "Excellent";
    if (score >= 650) return "Good";
    return "Poor";
  }

  return { respond };
})();
