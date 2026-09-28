# Digital VSLA & SACCO Ledger System for Northern Uganda

A robust, offline-capable digital ledger system designed specifically for Village Savings and Loan Associations (VSLAs) and micro-SACCOs operating in Northern Uganda (Acholi, Lango, West Nile, and Karamoja sub-regions).

Powered by **Google Workspace (Google Sheets, Google Drive, Google Apps Script, Google Workspace APIs)**, **Google AppSheet**, and **Google Gemini API**.

---

## 📌 Core Features

1. **Member Management**: Digital KYC, photo capture, next of kin details, unique Member ID generation.
2. **Weekly Meeting Ledger**:
   - **Share Purchasing**: Record savings in terms of shares (e.g., UGX 2,000 per share).
   - **Welfare / Emergency Fund**: Mandatory or voluntary social fund contributions.
   - **Fine & Penalty Tracking**: Log penalties for lateness, missed meetings, or policy breaches.
3. **Loan Lifecycle Management**:
   - Loan Application & Guarantee tracking (requiring 2 member guarantors).
   - Interest Calculation (Flat rate or Reducing Balance; standard 5% - 10% monthly interest).
   - Loan Repayment Schedule & Payment Tracking.
   - Default Risk Flagging.
4. **End-of-Cycle Share-Out Calculator**:
   - Automatically computes total profit (interest collected + fines) and distributes earnings proportionally based on accumulated shares.
5. **Offline-First Capabilities**:
   - Designed with AppSheet so field agents can record data in remote villages without internet connectivity; syncs automatically when network is available.
6. **Automated PDF Passbooks & SMS/Email Notifications**:
   - Google Apps Script generates digital passbooks stored in Google Drive and sent via SMS/Email/WhatsApp links.
7. **Gemini AI Financial Assistant**:
   - Voice audio input in local languages (Acholi, Lango, Lugbara, English) to query loan status, defaulted payments, or meeting summaries.

---

## 🗄️ Database Architecture (Google Sheets Structure)

The system uses a structured Google Spreadsheet as a cloud relational database with the following tables:

| Sheet Name | Description | Key Fields |
| :--- | :--- | :--- |
| `Members` | Master list of all VSLA/SACCO members | `MemberID`, `FullName`, `PhoneNumber`, `Village`, `Subcounty`, `NationalID_NIN`, `JoiningDate`, `Status`, `PhotoURL` |
| `Meetings` | Attendance and meeting session logs | `MeetingID`, `MeetingDate`, `CycleNumber`, `Location`, `RecordedBy`, `TotalPresent`, `TotalSavingsUGX` |
| `Savings_Transactions` | Weekly share purchases and social fund deposits | `TransactionID`, `MeetingID`, `MemberID`, `SharesBought`, `ShareValueUGX`, `TotalSavingsUGX`, `WelfareFundUGX`, `FineAmountUGX`, `Notes` |
| `Loans` | Loan applications, approvals, and terms | `LoanID`, `MemberID`, `PrincipalUGX`, `InterestRateMonthly%`, `DurationMonths`, `TotalInterestUGX`, `TotalRepayableUGX`, `Guarantor1_ID`, `Guarantor2_ID`, `ApplicationDate`, `ApprovalStatus`, `BalanceRemainingUGX` |
| `Loan_Repayments` | Repayment ledger entries | `RepaymentID`, `LoanID`, `MemberID`, `MeetingID`, `RepaymentDate`, `PrincipalPaidUGX`, `InterestPaidUGX`, `FinePaidUGX`, `ReceiptNumber` |
| `ShareOut_Cycles` | End of year/cycle profit distribution logs | `CycleID`, `StartDate`, `EndDate`, `TotalSharesAccumulated`, `TotalNetProfitUGX`, `DividendPerShareUGX`, `Status` |

---

## 🚀 Setup & Deployment Guide

### Step 1: Create the Google Spreadsheet Database
- Create a new Google Spreadsheet named `VSLA_Digital_Ledger_Database`.
- Set up the tabs corresponding to the table definitions in `schema/database_schema.json`.

### Step 2: Install Google Apps Script Automation
- Open `Extensions` > `Apps Script` in your Google Sheet.
- Copy the code from `apps_script/code.js` and `apps_script/pdf_generator.js`.
- Authorize execution of Google Apps Script for Google Drive and Mail services.

### Step 3: Deploy Google AppSheet Mobile App
- Go to [AppSheet.com](https://www.appsheet.com) and create a new app from your Google Sheet.
- Configure views, offline settings, and security filters (refer to `appsheet/appsheet_config.md`).

---

## 🛠️ Directory Structure

```
├── README.md                          # Project documentation
├── schema/
│   ├── database_schema.json           # Sheet definitions and data types
│   └── generate_sample_data.py        # Python script to generate mock dataset for testing
├── apps_script/
│   ├── Code.gs                        # Main Apps Script triggers, calculations & share-out
│   ├── PdfGenerator.gs                # Passbook & PDF receipt generation script
│   └── GeminiAssistant.gs             # Vertex AI / Gemini API integration for voice & text queries
└── appsheet/
    └── appsheet_config.md             # Guide to building AppSheet views, actions, and slices
```
