/**
 * Gemini AI Financial Assistant for VSLA Ledger
 * Uses Google Gemini API to answer questions about VSLA savings, loans, defaults, and share-outs.
 */

const GEMINI_API_KEY_PROPERTY = "GEMINI_API_KEY";

/**
 * Dialog prompt for Gemini Assistant
 */
function openGeminiDialog() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    '🤖 Gemini AI VSLA Assistant',
    'Ask any question about your VSLA ledger (e.g., "Summarize loan default risks", "Who saved the most shares?", or ask in Luo/English):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const userQuery = response.getResponseText().trim();
  if (!userQuery) {
    ui.alert('Please enter a question.');
    return;
  }

  const apiKey = PropertiesService.getScriptProperties().getProperty(GEMINI_API_KEY_PROPERTY) || "YOUR_GEMINI_API_KEY_HERE";

  if (apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    ui.alert('Gemini API Key is not configured in Script Properties.\n\nPlease set GEMINI_API_KEY in Project Settings > Script Properties.');
    return;
  }

  // Gather sheet context summary
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const membersSheet = ss.getSheetByName('Members');
  const loansSheet = ss.getSheetByName('Loans');

  const totalMembers = membersSheet ? membersSheet.getLastRow() - 1 : 0;
  const loansData = loansSheet ? loansSheet.getDataRange().getValues() : [];

  let totalLoansCount = 0;
  let totalOutstandingUGX = 0;
  let activeLoansList = [];

  for (let i = 1; i < loansData.length; i++) {
    totalLoansCount++;
    const mId = loansData[i][1];
    const bal = Number(loansData[i][13]) || 0; // BalanceRemainingUGX
    const status = loansData[i][14];

    if (bal > 0) {
      totalOutstandingUGX += bal;
      activeLoansList.push(`Member: ${mId}, Outstanding: UGX ${bal.toLocaleString()}, Status: ${status}`);
    }
  }

  const contextPrompt = `
    You are an intelligent financial assistant for a Village Savings and Loans Association (VSLA) in Northern Uganda.
    Here is the current VSLA Ledger Status Summary:
    - Total Registered Members: ${totalMembers}
    - Total Active Loans Count: ${totalLoansCount}
    - Total Outstanding Loan Balance: UGX ${totalOutstandingUGX.toLocaleString()}
    - Active Outstanding Loans: ${activeLoansList.join("; ")}

    User Query: "${userQuery}"

    Please provide a concise, accurate, helpful, and polite response tailored for a VSLA manager or treasurer in Northern Uganda.
  `;

  try {
    const payload = {
      contents: [{
        parts: [{ text: contextPrompt }]
      }]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(res.getContentText());

    if (json.candidates && json.candidates[0] && json.candidates[0].content) {
      const answer = json.candidates[0].content.parts[0].text;
      ui.alert('🤖 Gemini AI Response', answer, ui.ButtonSet.OK);
    } else {
      ui.alert('Error from Gemini API: ' + res.getContentText());
    }

  } catch (err) {
    ui.alert('Failed to connect to Gemini API: ' + err.toString());
  }
}
