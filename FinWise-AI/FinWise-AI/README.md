# FinWise AI

**Intelligent Loan Eligibility, Credit Analysis & Financial Advisory Platform**

FinWise AI is a premium fintech front-end that helps users check loan eligibility, analyze their credit score, calculate EMIs, and chat with an AI financial advisor grounded in their own financial profile.

---

## Overview

FinWise AI is a static HTML/CSS/JavaScript application (no build step required) with an optional Flask backend that proxies AI advisor requests to the Anthropic Claude API, and an optional Google Apps Script integration for logging eligibility checks to Google Sheets.

## Features

- **Landing page** — hero, animated stats, features, services, AI benefits, testimonials, FAQ, CTA
- **Loan Eligibility Checker** — validated form, business-rule eligibility engine, Green/Yellow/Red risk classification, personalized advice
- **Credit Score Analyzer** — animated circular progress ring, Excellent/Good/Poor classification, tailored improvement tips
- **EMI Calculator** — live sliders, standard reducing-balance EMI formula, canvas-based principal/interest breakdown chart
- **AI Financial Advisor** — chat interface grounded in the user's salary, credit score, and existing EMI, backed by Claude
- **Google Sheets logging** — every completed eligibility check can be appended to a spreadsheet you control
- Fully responsive (desktop / tablet / mobile), accessible (semantic HTML, ARIA labels, keyboard navigation), and animated (fade, slide, scale, glow, floating, counters, typing, progress bars, ripple buttons)

## Folder Structure

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
│   ├── script.js
│   ├── eligibility.js
│   ├── credit.js
│   ├── emi.js
│   ├── advisor.js
│   ├── api.js
│   └── config.js
├── assets/
│   ├── images/
│   └── icons/
├── backend/
│   ├── app.py                    (optional Flask proxy for the Claude API)
│   └── google-apps-script.gs     (optional Google Sheets logger)
└── README.md
```

## Installation

1. Clone or download this repository.
2. Open `index.html` directly in a browser — the site works standalone. The AI advisor will run in a local **offline fallback mode** until you connect the backend (step 3), and Google Sheets logging is skipped until configured (step 4).
3. To power the AI advisor with real Claude responses, deploy the backend (see below) and update `CONFIG.BACKEND_BASE_URL` in `js/config.js`.
4. To log eligibility checks to Google Sheets, deploy the Apps Script (see below) and update `CONFIG.GOOGLE_SHEETS_ENDPOINT` in `js/config.js`.

## Claude API Setup (Backend Proxy)

The browser can't call `api.anthropic.com` directly — this would expose your API key and is blocked by CORS. `backend/app.py` is a minimal Flask server that holds the key server-side.

```bash
cd backend
pip install flask flask-cors anthropic
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
python app.py
```

The server starts on `http://localhost:5000` with a single endpoint: `POST /api/advisor`. Update `js/config.js`:

```js
BACKEND_BASE_URL: "http://localhost:5000"   // or your deployed URL
```

Deploy `app.py` anywhere that runs Python (Render, Railway, Fly.io, a VPS) and set `ANTHROPIC_API_KEY` as an environment variable there.

## Google Apps Script Setup

1. Create a Google Sheet with a header row: `Timestamp | Name | Salary | Credit Score | Existing EMI | Age | Loan Eligibility | Eligible Amount | Risk | AI Summary`
2. Open **Extensions → Apps Script**, paste the contents of `backend/google-apps-script.gs`.
3. **Deploy → New deployment → Web app**. Execute as **Me**, access **Anyone**.
4. Copy the deployment URL into `CONFIG.GOOGLE_SHEETS_ENDPOINT` in `js/config.js`.

## Deployment

**GitHub Pages**
1. Push this repository to GitHub.
2. Repo **Settings → Pages → Deploy from branch**, select `main` and `/root`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

**Netlify**
1. Drag the `FinWise-AI` folder into Netlify's deploy dashboard, or connect the GitHub repo.
2. No build command is needed — publish directory is the project root.

> Note: the frontend is static and deploys anywhere. The Flask backend (for live AI responses) needs a separate host that runs Python, since GitHub Pages and Netlify's free tier only serve static files.

## Future Enhancements

- User accounts with saved eligibility history
- Multi-currency support
- PDF export of eligibility and EMI reports
- Bank-grade document upload for KYC-verified eligibility
- Multi-language support (Hindi, Telugu, Tamil, and more)

---

*FinWise AI is a demonstration platform for informational purposes only and is not a licensed financial institution.*
