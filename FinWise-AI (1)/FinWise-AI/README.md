# FinWise AI

**Intelligent Loan Eligibility, Credit Analysis & Financial Advisory Platform**

A complete, working, static web application built for the BFSI (Banking, Financial Services and Insurance) domain, designed as a final-year AIML project. Runs directly with **VS Code Live Server** — no Node.js, no build step, no framework required.

---

## 1. Overview

FinWise AI brings four tools together in one consistent experience:

- **Loan Eligibility Checker** — rule-based eligibility assessment with a maximum-loan estimate, risk classification and improvement guidance.
- **Credit Score Analyzer** — an animated gauge, rating classification and personalized recommendations.
- **EMI Calculator** — instant EMI, total interest and total payment breakdown using the standard amortization formula.
- **AI Financial Advisor** — a chat interface that answers questions about loans, credit, EMI, budgeting, debt and savings, personalized using your latest eligibility result.

## 2. Problem Statement

People often have to visit several bank portals or apps to understand whether they qualify for a loan, what their credit score means, and what a loan will actually cost them monthly. FinWise AI consolidates that into one transparent, judgment-free tool.

## 3. Objectives

- Simplify loan assessment with clear, transparent eligibility rules.
- Improve financial awareness through instant, understandable analysis.
- Explain credit health in plain language, with actionable recommendations.
- Provide accurate EMI planning before a loan is ever applied for.
- Deliver AI-powered financial guidance available around the clock.

## 4. Features

- 7 fully connected pages with a shared, responsive sidebar/hamburger navigation.
- Complete client-side form validation with inline error messages.
- Dynamic result rendering with no page reloads.
- Animated stats, credit gauge, EMI breakdown bar and number counters.
- Toast notifications for every major action.
- LocalStorage-backed recent activity (loan assessments & EMI calculations) with a "Clear History" option.
- AI Financial Advisor with a fully working **offline demo mode** — the whole app works even with zero backend/API configured — plus an optional live Claude API proxy mode.
- Optional Google Sheets logging via Google Apps Script.
- Accessible: semantic HTML, labeled inputs, visible focus states, keyboard navigable, `prefers-reduced-motion` respected.

## 5. Technology Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Structure  | HTML5                                    |
| Styling    | CSS3 (custom properties, Grid, Flexbox)  |
| Logic      | Vanilla JavaScript (ES6)                 |
| Icons      | Font Awesome 6 (CDN)                     |
| Font       | Google Fonts — Poppins                   |
| AI         | Anthropic Claude API (optional, via your own backend proxy) with an offline fallback advisor |
| Storage    | Browser LocalStorage + optional Google Sheets (Google Apps Script) |

## 6. Project Structure

```
FinWise-AI/
├── index.html
├── loan.html
├── credit.html
├── emi.html
├── advisor.html
├── about.html
├── contact.html
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── animations.css
├── js/
│   ├── script.js        # global UI: sidebar, footer, toasts, counters, local storage
│   ├── eligibility.js   # loan eligibility business logic + EMI formula
│   ├── credit.js        # credit score classification & recommendations
│   ├── emi.js           # EMI breakdown calculation
│   ├── advisor.js       # AI advisor chat interface
│   ├── api.js           # AI advisor + Google Sheets network calls
│   └── config.js        # all configuration (API mode, endpoints, business rules)
├── assets/
│   ├── images/
│   └── icons/
├── apps-script/
│   └── google-apps-script.gs   # sample backend for Google Sheets logging
└── README.md
```

## 7. Installation & Running Locally

1. Download/copy the `FinWise-AI` folder.
2. Open the folder in **VS Code**.
3. Install the **Live Server** extension if you don't already have it.
4. Right-click `index.html` → **Open with Live Server**.
5. The app opens at something like `http://127.0.0.1:5500/index.html`. All navigation, forms and calculators work immediately — no further setup required.

## 8. Claude API Configuration (optional)

The AI Financial Advisor works fully out of the box in **demo mode** using a realistic offline rule-based engine (`DemoAdvisor` inside `js/api.js`) — no API key needed.

To connect a real Claude model instead:

1. **Never put a real Anthropic API key directly in this frontend code** — any key placed in browser JavaScript is visible to every visitor and will be abused.
2. Stand up a small backend (Node/Express, a serverless function, etc.) that holds your Anthropic API key server-side and calls `POST https://api.anthropic.com/v1/messages`.
3. Have that backend accept `{ message, profile }` and return `{ reply: "..." }`.
4. In `js/config.js`, set:
   ```js
   API_MODE: "proxy",
   PROXY_ENDPOINT: "https://your-backend.example.com/api/finwise-advisor",
   ```
5. If the proxy call ever fails, FinWise AI automatically falls back to the offline demo advisor so the feature never breaks for the user.

## 9. Google Apps Script & Google Sheets Setup (optional)

Every loan eligibility assessment can optionally be logged to a Google Sheet.

1. Open [Google Sheets](https://sheets.google.com) and create a new spreadsheet. Add a header row matching the fields in `apps-script/google-apps-script.gs`.
2. In the sheet, go to **Extensions → Apps Script**.
3. Paste the contents of `apps-script/google-apps-script.gs` into the editor.
4. Click **Deploy → New deployment → Web app**. Set "Execute as" to yourself and "Who has access" to "Anyone" (or "Anyone with the link").
5. Copy the deployed Web App URL.
6. Paste it into `js/config.js`:
   ```js
   GOOGLE_SHEETS_ENDPOINT: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```
7. If you leave this blank, the app continues to work normally and shows: *"Cloud storage is not configured. Your analysis is still available on this device."*

## 10. Business Rules (Loan Eligibility)

| Rule                      | Threshold        |
|---------------------------|------------------|
| Minimum Monthly Salary    | > ₹30,000        |
| Minimum Credit Score      | > 700            |
| Maximum Existing EMI      | < ₹20,000        |
| Minimum Age               | ≥ 21 years       |
| Eligible Loan Amount      | Monthly Salary × 20 |

**Risk Classification**
- **Low Risk** — Credit Score ≥ 750 and Existing EMI < ₹10,000
- **Medium Risk** — Credit Score 701–749, or Existing EMI ₹10,000–₹20,000
- **High Risk** — Credit Score ≤ 700, or high financial obligations

All thresholds live in `js/config.js` under `FINWISE_CONFIG.RULES` for easy tuning.

## 11. Testing

Manually verified scenarios include:

- **Loan Eligibility:** eligible applicant; salary below ₹30,000; credit score below 700; existing EMI above ₹20,000; age below 21; empty/invalid fields.
- **Credit Score:** boundary values 300, 500, 649, 650, 700, 749, 750, 800, 900.
- **EMI:** varying loan amounts, interest rates and tenures; zero/negative input rejection.
- **AI Advisor:** demo mode responses; simulated proxy failure (falls back gracefully); suggested-question buttons.
- **Google Sheets:** unconfigured endpoint (graceful message); configured endpoint (fire-and-forget POST).
- **Responsive layout:** 1920 / 1440 / 1024 / 768 / 480 / 360 px.

## 12. Deployment

Because this is a static site, it can be deployed as-is to any static host: GitHub Pages, Netlify, Vercel (static), or a plain web server. No build step is required. If you enable the live Claude API mode, deploy your backend proxy separately and update `PROXY_ENDPOINT` accordingly.

## 13. Future Enhancements

- Persist chat history per session.
- Multi-currency support.
- PDF export of the eligibility/EMI report.
- Real bank-grade credit bureau integration.
- User accounts with saved profiles across devices.

## 14. Disclaimer

FinWise AI provides educational and decision-support information. It does not guarantee loan approval or replace professional financial advice.
