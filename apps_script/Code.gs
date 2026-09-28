/**
 * VSLA & SACCO Digital Ledger Automation Script
 * Target Environment: Google Apps Script (bound to Google Sheets)
 * Region: Northern Uganda (Gulu, Lira, Kitgum, Arua)
 */

// Global Config
const CONFIG = {
  SHARE_VALUE_UGX: 2000,
  WELFARE_FEE_UGX: 1000,
  MONTHLY_INTEREST_RATE: 0.05, // 5% monthly flat rate
  CURRENCY_SYMBOL: "UGX ",
  PASSOUT_FOLDER_NAME: "VSLA_Member_Passbooks"
};

/**
 * Custom Menu Trigger on Sheet Open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 VSLA Admin Tools')
    .addItem('🔄 Recalculate Member Totals & Loan Balances', 'recalculateAllBalances')
    .addItem('📄 Generate Selected Member Passbook (PDF)', 'generateMemberPassbookPDF')
    .addItem('💰 Compute End-of-Cycle Share-Out Payouts', 'calculateEndofCycleShareOut')
    .addItem('🤖 Ask Gemini AI Assistant', 'openGeminiDialog')
    .addToUi();
}

/**
 * Recalculates all member totals and loan status
 */
function recalculateAllBalances() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const membersSheet = ss.getSheetByName('Members');
  const txnsSheet = ss.getSheetByName('Savings_Transactions');
  const loansSheet = ss.getSheetByName('Loans');
  const repaymentsSheet = ss.getSheetByName('Loan_Repayments');

  if (!membersSheet || !txnsSheet || !loansSheet) {
    SpreadsheetApp.getUi().alert('Error: Required sheets (Members, Savings_Transactions, Loans) are missing.');
    return;
  }

  // Fetch data
  const txnsData = txnsSheet.getDataRange().getValues();
  const loansData = loansSheet.getDataRange().getValues();
  const repaymentsData = repaymentsSheet ? repaymentsSheet.getDataRange().getValues() : [];

  // Compute savings per member
  const memberSavingsMap = {};
  const memberSharesMap = {};

  for (let i = 1; i < txnsData.length; i++) {
    const memberId = txnsData[i][2]; // Column C: MemberID
    const shares = Number(txnsData[i][3]) || 0; // Column D: SharesBought
    const savings = Number(txnsData[i][5]) || (shares * CONFIG.SHARE_VALUE_UGX); // Column F: TotalSavingsUGX

    memberSharesMap[memberId] = (memberSharesMap[memberId] || 0) + shares;
    memberSavingsMap[memberId] = (memberSavingsMap[memberId] || 0) + savings;
  }

  // Compute loan balances per member
  const memberLoanBalMap = {};
  for (let j = 1; j < loansData.length; j++) {
    const memberId = loansData[j][1]; // Column B: MemberID
    const totalRepayable = Number(loansData[j][6]) || 0; // Column G: TotalRepayableUGX
    const principalPaid = Number(loansData[j][11]) || 0; // Column L: PrincipalPaid
    const interestPaid = Number(loansData[j][12]) || 0; // Column M: InterestPaid

    const remaining = totalRepayable - (principalPaid + interestPaid);
    memberLoanBalMap[memberId] = (memberLoanBalMap[memberId] || 0) + Math.max(0, remaining);
  }

  SpreadsheetApp.getUi().alert('Member balances and loan statistics successfully recalculated!');
}

/**
 * Computes End-of-Cycle Share-Out Payout Distribution
 * Formula:
 * Total Distributable Fund = Total Shares Value + Total Interest Collected + Total Fines Collected
 * Net Profit = Interest + Fines
 * Dividend Per Share = Net Profit / Total Group Shares
 * Member Payout = (Member Total Shares * Share Value) + (Member Total Shares * Dividend Per Share)
 */
function calculateEndofCycleShareOut() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const txnsSheet = ss.getSheetByName('Savings_Transactions');
  const repaymentsSheet = ss.getSheetByName('Loan_Repayments');
  const membersSheet = ss.getSheetByName('Members');

  if (!txnsSheet || !membersSheet) {
    SpreadsheetApp.getUi().alert('Error: Required sheets missing.');
    return;
  }

  const txnsData = txnsSheet.getDataRange().getValues();
  const repaymentsData = repaymentsSheet ? repaymentsSheet.getDataRange().getValues() : [];
  const membersData = membersSheet.getDataRange().getValues();

  let totalShares = 0;
  let totalSavingsUGX = 0;
  let totalFinesUGX = 0;

  const memberShares = {};

  // Accumulate Savings & Fines
  for (let i = 1; i < txnsData.length; i++) {
    const memberId = txnsData[i][2];
    const shares = Number(txnsData[i][3]) || 0;
    const savings = Number(txnsData[i][5]) || 0;
    const fine = Number(txnsData[i][7]) || 0;

    totalShares += shares;
    totalSavingsUGX += savings;
    totalFinesUGX += fine;

    memberShares[memberId] = (memberShares[memberId] || 0) + shares;
  }

  // Accumulate Interest Earned from Loans
  let totalInterestEarnedUGX = 0;
  for (let j = 1; j < repaymentsData.length; j++) {
    const interestPaid = Number(repaymentsData[j][5]) || 0;
    totalInterestEarnedUGX += interestPaid;
  }

  const netProfitUGX = totalInterestEarnedUGX + totalFinesUGX;
  const dividendPerShareUGX = totalShares > 0 ? (netProfitUGX / totalShares) : 0;
  const payoutValuePerShareUGX = totalShares > 0 ? ((totalSavingsUGX + netProfitUGX) / totalShares) : 0;

  // Create or update ShareOut_Results Sheet
  let resultSheet = ss.getSheetByName('ShareOut_Results');
  if (!resultSheet) {
    resultSheet = ss.insertSheet('ShareOut_Results');
  } else {
    resultSheet.clear();
  }

  // Write Summary Header
  resultSheet.appendRow(['VSLA END-OF-CYCLE SHARE-OUT SUMMARY REPORT']);
  resultSheet.appendRow(['Calculation Date', new Date().toLocaleDateString()]);
  resultSheet.appendRow(['Total Group Shares Accumulated', totalShares]);
  resultSheet.appendRow(['Total Member Savings (UGX)', totalSavingsUGX]);
  resultSheet.appendRow(['Total Interest Earned from Loans (UGX)', totalInterestEarnedUGX]);
  resultSheet.appendRow(['Total Fines Collected (UGX)', totalFinesUGX]);
  resultSheet.appendRow(['Total Net Distributable Profit (UGX)', netProfitUGX]);
  resultSheet.appendRow(['Dividend Earned Per Share (UGX)', dividendPerShareUGX.toFixed(2)]);
  resultSheet.appendRow(['Total Payout Per Share (UGX)', payoutValuePerShareUGX.toFixed(2)]);
  resultSheet.appendRow([]); // Blank row

  // Write Table Headers
  resultSheet.appendRow([
    'Member ID', 'Member Full Name', 'Shares Owned', 'Savings Share Capital (UGX)',
    'Dividend Share Profit (UGX)', 'Total Payout Received (UGX)', 'Signature / Verification'
  ]);

  // Write Member Breakdown
  for (let k = 1; k < membersData.length; k++) {
    const mId = membersData[k][0];
    const mName = membersData[k][1];
    const mShares = memberShares[mId] || 0;
    const mSavingsCap = mShares * CONFIG.SHARE_VALUE_UGX;
    const mProfit = mShares * dividendPerShareUGX;
    const mTotalPayout = mSavingsCap + mProfit;

    resultSheet.appendRow([
      mId, mName, mShares, mSavingsCap, Math.round(mProfit), Math.round(mTotalPayout), '[ Pending Signature ]'
    ]);
  }

  // Format header styles
  resultSheet.getRange("A1:G1").setFontWeight("bold").setFontSize(14).setBackground("#2E7D32").setFontColor("#FFFFFF");
  resultSheet.getRange("A9:G9").setFontWeight("bold").setBackground("#C8E6C9");

  SpreadsheetApp.getUi().alert(`Share-Out Calculation Completed successfully!\nTotal Distributable Profit: UGX ${netProfitUGX.toLocaleString()}\nPayout Per Share: UGX ${Math.round(payoutValuePerShareUGX).toLocaleString()}`);
}
