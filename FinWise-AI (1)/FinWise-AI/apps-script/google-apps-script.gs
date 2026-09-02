/**
 * FinWise AI — Google Apps Script backend
 * Deploy as a Web App (Deploy > New deployment > Web app)
 * "Execute as": Me   |   "Who has access": Anyone
 * Paste the deployed /exec URL into js/config.js as GOOGLE_SHEETS_ENDPOINT.
 *
 * Expected sheet header row (Row 1):
 * Timestamp | Name | Age | Monthly Income | Employment Type | Credit Score |
 * Existing EMI | Loan Amount | Loan Tenure | Loan Type | Eligibility Status |
 * Eligible Amount | Risk Level | AI Summary
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name || "",
    data.age || "",
    data.income || "",
    data.employmentType || "",
    data.creditScore || "",
    data.existingEmi || "",
    data.loanAmount || "",
    data.loanTenure || "",
    data.loanType || "",
    data.eligibilityStatus || "",
    data.eligibleAmount || "",
    data.riskLevel || "",
    data.aiSummary || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
