/* ==========================================================================
   FinWise AI — Configuration
   Centralised endpoints & constants. Edit these to point at your own
   deployed backend proxy and Google Apps Script web app.
   ========================================================================== */

const CONFIG = {
  // Flask backend proxy — keeps your Anthropic API key off the client.
  // See /backend/app.py. Point this at wherever you deploy it
  // (e.g. http://localhost:5000 locally, or your Render/Railway URL in prod).
  BACKEND_BASE_URL: "http://localhost:5000",
  AI_ADVISOR_ENDPOINT: "/api/advisor",

  // Google Apps Script Web App URL (deployed from /backend/google-apps-script.gs).
  // Replace with your own deployment ID after publishing the script.
  GOOGLE_SHEETS_ENDPOINT: "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec",

  // Feature flags
  ENABLE_GOOGLE_SHEETS: true,
  ENABLE_AI_ADVISOR: true,

  // Business rules (kept here so eligibility.js / credit.js stay declarative)
  ELIGIBILITY: {
    MIN_SALARY: 30000,
    MIN_CREDIT_SCORE: 700,
    MAX_EXISTING_EMI: 20000,
    MIN_AGE: 21,
    LOAN_MULTIPLIER: 20
  },

  CREDIT_BANDS: {
    EXCELLENT: { min: 750, max: 900 },
    GOOD: { min: 650, max: 749 },
    POOR: { min: 300, max: 649 }
  }
};

// Freeze so no module accidentally mutates shared config at runtime.
Object.freeze(CONFIG);
Object.freeze(CONFIG.ELIGIBILITY);
Object.freeze(CONFIG.CREDIT_BANDS);
