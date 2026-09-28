/**
 * Passbook & PDF Receipt Generator for VSLA Members
 * Automates PDF generation and saves files to Google Drive.
 */

function generateMemberPassbookPDF() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Generate Member Passbook', 'Enter Member ID (e.g. MEM-001):', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const targetMemberId = response.getResponseText().trim();
  if (!targetMemberId) {
    ui.alert('Please enter a valid Member ID.');
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const membersSheet = ss.getSheetByName('Members');
  const txnsSheet = ss.getSheetByName('Savings_Transactions');
  const loansSheet = ss.getSheetByName('Loans');

  // Find member
  const membersData = membersSheet.getDataRange().getValues();
  let memberRow = null;
  for (let i = 1; i < membersData.length; i++) {
    if (membersData[i][0] === targetMemberId) {
      memberRow = membersData[i];
      break;
    }
  }

  if (!memberRow) {
    ui.alert(`Member ID ${targetMemberId} was not found in the database.`);
    return;
  }

  const memberName = memberRow[1];
  const memberPhone = memberRow[2];
  const village = memberRow[4];

  // Fetch Member Transactions
  const txnsData = txnsSheet.getDataRange().getValues();
  let totalShares = 0;
  let totalSavings = 0;
  let totalWelfare = 0;
  let txnRows = [];

  for (let j = 1; j < txnsData.length; j++) {
    if (txnsData[j][2] === targetMemberId) {
      const shares = Number(txnsData[j][3]) || 0;
      const sav = Number(txnsData[j][5]) || 0;
      const welf = Number(txnsData[j][6]) || 0;
      const date = txnsData[j][9] ? new Date(txnsData[j][9]).toLocaleDateString() : '';

      totalShares += shares;
      totalSavings += sav;
      totalWelfare += welf;

      txnRows.push(`<tr><td>${date}</td><td>${txnsData[j][1]}</td><td>${shares}</td><td>UGX ${sav.toLocaleString()}</td><td>UGX ${welf.toLocaleString()}</td></tr>`);
    }
  }

  // Construct HTML Document for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #2E7D32; padding-bottom: 10px; }
          .header h1 { color: #2E7D32; margin: 0; }
          .header p { margin: 5px 0 0 0; color: #555; }
          .member-info { margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { padding: 6px; font-size: 14px; }
          .summary-box { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .card { background: #e8f5e9; border-left: 5px solid #2E7D32; padding: 10px 15px; width: 30%; }
          .card h3 { margin: 0; font-size: 12px; color: #555; text-transform: uppercase; }
          .card p { margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #2E7D32; }
          table.data { width: 100%; border-collapse: collapse; margin-top: 15px; }
          table.data th, table.data td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          table.data th { background-color: #2E7D32; color: white; }
          table.data tr:nth-child(even){ background-color: #f2f2f2; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VSLA DIGITAL LEDGER PASSBOOK</h1>
          <p>Northern Uganda Community Micro-Savings Association</p>
        </div>

        <div class="member-info">
          <table class="info-table">
            <tr>
              <td><strong>Member ID:</strong> ${targetMemberId}</td>
              <td><strong>Full Name:</strong> ${memberName}</td>
            </tr>
            <tr>
              <td><strong>Phone Number:</strong> ${memberPhone}</td>
              <td><strong>Village/Subcounty:</strong> ${village}</td>
            </tr>
          </table>
        </div>

        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="width: 33%; background: #E8F5E9; padding: 10px; border-radius: 4px;">
              <span style="font-size: 11px; color: #555;">TOTAL SHARES BOUGHT</span><br/>
              <strong style="font-size: 16px; color: #2E7D32;">${totalShares} Shares</strong>
            </td>
            <td style="width: 33%; background: #E8F5E9; padding: 10px; border-radius: 4px;">
              <span style="font-size: 11px; color: #555;">TOTAL SAVINGS BALANCE</span><br/>
              <strong style="font-size: 16px; color: #2E7D32;">UGX ${totalSavings.toLocaleString()}</strong>
            </td>
            <td style="width: 33%; background: #E8F5E9; padding: 10px; border-radius: 4px;">
              <span style="font-size: 11px; color: #555;">WELFARE FUND SAVED</span><br/>
              <strong style="font-size: 16px; color: #2E7D32;">UGX ${totalWelfare.toLocaleString()}</strong>
            </td>
          </tr>
        </table>

        <h3>SAVINGS TRANSACTION HISTORY</h3>
        <table class="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Meeting ID</th>
              <th>Shares</th>
              <th>Savings Deposit</th>
              <th>Welfare Deposit</th>
            </tr>
          </thead>
          <tbody>
            ${txnRows.join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated via VSLA Digital Ledger System powered by Google Workspace & Apps Script.</p>
          <p>Document Date: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  // Create Blob & Save PDF to Drive
  const htmlBlob = Utilities.newBlob(htmlContent, 'text/html', `Passbook_${targetMemberId}.html`);
  const pdfFile = DriveApp.createFile(htmlBlob.getAs('application/pdf')).setName(`Passbook_${targetMemberId}_${memberName.replace(/\s+/g, '_')}.pdf`);

  ui.alert(`Passbook PDF successfully generated and saved to Google Drive!\nFile Name: ${pdfFile.getName()}\nDownload URL: ${pdfFile.getUrl()}`);
}
