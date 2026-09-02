/* =======================================================
   FinWise AI — js/config.js
   Central configuration file.
   -------------------------------------------------------
   1) CLAUDE / ANTHROPIC API
      This demo NEVER puts a real secret key in frontend code
      (that would leak to every visitor's browser). Instead:
        - If you are running this behind your own backend proxy,
          set API_MODE to "proxy" and point PROXY_ENDPOINT at your
          server route that calls Anthropic's API server-side.
        - Otherwise leave API_MODE as "demo" and FinWise AI will
          use a realistic local fallback advisor so every feature
          still works fully on Live Server with no backend at all.

   2) GOOGLE SHEETS (Google Apps Script)
      Paste the deployed Web App URL of your Apps Script project
      into GOOGLE_SHEETS_ENDPOINT below. Leave it empty ("") to
      keep everything working locally without cloud storage.
   ======================================================= */

const FINWISE_CONFIG = {
  // "demo"  -> use built-in offline financial-advisor engine (default, always works)
  // "proxy" -> call your own backend, which securely calls Anthropic's API
  API_MODE: "demo",

  // Example: "https://your-backend.example.com/api/finwise-advisor"
  PROXY_ENDPOINT: "",

  // Google Apps Script Web App URL (see README for setup steps). Leave blank to disable.
  GOOGLE_SHEETS_ENDPOINT: "",

  APP_NAME: "FinWise AI",
  APP_TAGLINE: "Intelligent Loan Eligibility, Credit Analysis & Financial Advisory Platform",

  RULES: {
    MIN_SALARY: 30000,
    MIN_CREDIT_SCORE: 700,
    MAX_EXISTING_EMI: 20000,
    MIN_AGE: 21,
    LOAN_MULTIPLIER: 20
  },

  INTEREST_RATES: {
    "Personal Loan": 13.5,
    "Home Loan": 8.5,
    "Vehicle Loan": 9.5,
    "Education Loan": 10.5
  }
};
