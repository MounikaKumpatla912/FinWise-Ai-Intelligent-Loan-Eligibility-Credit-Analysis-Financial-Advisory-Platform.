/* ==========================================================================
   FinWise AI — API Layer
   All network calls (AI advisor + Google Sheets logging) live here so the
   feature modules never touch fetch() directly.
   ========================================================================== */

const FinAPI = (() => {

  /**
   * Calls the AI Financial Advisor. Talks to our own Flask proxy
   * (see /backend/app.py) rather than Anthropic directly — calling
   * api.anthropic.com from browser JS would expose the API key and is
   * blocked by CORS by design. The proxy holds the real key server-side.
   * @param {Object} profile - user's financial profile
   * @param {string} question - the user's free-text question
   * @returns {Promise<string>} AI response text
   */
  async function generateAIAdvice(profile, question) {
    const url = `${CONFIG.BACKEND_BASE_URL}${CONFIG.AI_ADVISOR_ENDPOINT}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, question })
      });

      if (!res.ok) throw new Error(`Advisor backend responded ${res.status}`);
      const data = await res.json();
      return data.reply || "I couldn't generate advice right now. Please try again.";
    } catch (err) {
      console.error("generateAIAdvice failed:", err);
      return FinAPI.offlineAdvice(profile, question);
    }
  }

  /**
   * Local fallback so the Advisor page still feels useful when no backend
   * is running (e.g. opening index.html directly from the filesystem).
   */
  function offlineAdvice(profile, question) {
    const tips = [];
    if (profile.creditScore && profile.creditScore < 700) {
      tips.push("Your credit score is below the 700 threshold most lenders prefer — pay down revolving balances and keep utilisation under 30% before applying.");
    }
    if (profile.existingEmi && profile.monthlySalary && (profile.existingEmi / profile.monthlySalary) > 0.4) {
      tips.push("Your existing EMIs take up a large share of your income. Lenders generally like total EMI obligations under 40% of monthly salary.");
    }
    if (profile.monthlySalary && !profile.existingEmi) {
      tips.push("With no existing EMI, you have healthy repayment capacity — this works in your favour for eligibility.");
    }
    tips.push("Build an emergency fund covering 3–6 months of expenses before taking on new debt.");
    tips.push("Automate a fixed percentage of every paycheck into savings or a SIP so investing doesn't depend on willpower.");

    const heading = question
      ? `Here's guidance based on what you shared (offline mode — connect the backend for live AI answers):`
      : `Here's a quick financial health check (offline mode — connect the backend for live AI answers):`;

    return `${heading}\n\n${tips.map(t => `• ${t}`).join("\n")}`;
  }

  /**
   * Sends a completed eligibility check to Google Sheets via the deployed
   * Apps Script web app (see /backend/google-apps-script.gs).
   */
  async function saveToGoogleSheets(record) {
    if (!CONFIG.ENABLE_GOOGLE_SHEETS) return { skipped: true };
    if (CONFIG.GOOGLE_SHEETS_ENDPOINT.includes("REPLACE_WITH_YOUR_DEPLOYMENT_ID")) {
      console.warn("Google Sheets endpoint not configured — skipping log.");
      return { skipped: true, reason: "not_configured" };
    }

    try {
      const res = await fetch(CONFIG.GOOGLE_SHEETS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight on Apps Script
        body: JSON.stringify(record)
      });
      return { ok: res.ok };
    } catch (err) {
      console.error("saveToGoogleSheets failed:", err);
      return { ok: false, error: String(err) };
    }
  }

  return { generateAIAdvice, offlineAdvice, saveToGoogleSheets };
})();
