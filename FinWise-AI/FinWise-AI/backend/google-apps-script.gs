/**
 * FinWise AI — Google Sheets Logger
 * ==================================
 * Deploy this as a Web App (Deploy > New deployment > Web app,
 * execute as "Me", access "Anyone") from within a Google Sheet's
 * Extensions > Apps Script editor. Paste the resulting URL into
 * CONFIG.GOOGLE_SHEETS_ENDPOINT in js/config.js.
 *
 * Expected sheet header row (row 1), in this order:
 * Timestamp | Name | Salary | Credit Score | Existing EMI | Age |
 * Loan Eligibility | Eligible Amount | Risk | AI Summary
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.salary || "",
      data.creditScore || "",
      data.existingEmi || "",
      data.age || "",
      data.loanEligibility ? "Eligible" : "Not Eligible",
      data.eligibleAmount || 0,
      data.risk || "",
      data.aiSummary || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "FinWise AI Sheets logger is running." }))
    .setMimeType(ContentService.MimeType.JSON);
}
