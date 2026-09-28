# AppSheet Setup & Configuration Guide for VSLA Digital Ledger

This document details the configuration required to convert your Google Sheet into a user-friendly, offline-capable mobile app for field officers and VSLA treasurers in Northern Uganda.

---

## 📱 1. AppSheet Data Source Configuration

1. Log into [AppSheet.com](https://www.appsheet.com) using your Google Workspace account.
2. Click **Create** > **App** > **Start with existing data**.
3. Name your app: `VSLA Digital Ledger Northern Uganda`.
4. Connect to your Google Sheet: `VSLA_Digital_Ledger_Database`.

### Table Readiness Checklist:
- `Members`: Read / Add / Edit
- `Meetings`: Read / Add / Edit
- `Savings_Transactions`: Read / Add / Edit
- `Loans`: Read / Add / Edit
- `Loan_Repayments`: Read / Add / Edit

---

## ⚙️ 2. Key AppSheet Column Formulas & Types

### Table: `Savings_Transactions`
- `ShareValueUGX`: Type `Price`, Initial Value = `2000`
- `TotalSavingsUGX`: Type `Price`, AppSheet Formula = `[SharesBought] * [ShareValueUGX]`
- `WelfareFundUGX`: Type `Price`, Initial Value = `1000`
- `MemberID`: Type `Ref` -> Table `Members`

### Table: `Loans`
- `InterestRateMonthlyPercent`: Type `Percent`, Initial Value = `0.05` (5%)
- `TotalInterestUGX`: Type `Price`, Formula = `[PrincipalUGX] * [InterestRateMonthlyPercent] * [DurationMonths]`
- `TotalRepayableUGX`: Type `Price`, Formula = `[PrincipalUGX] + [TotalInterestUGX]`
- `BalanceRemainingUGX`: Type `Price`, Formula = `[TotalRepayableUGX] - SUM(SELECT(Loan_Repayments[TotalPaidUGX], [LoanID] = [_THISROW].[LoanID]))`

---

## 📴 3. Offline Data Synchronization Settings

Since network connectivity in rural Northern Uganda (e.g., satellite villages in Pabo, Awach, Palabek) can be intermittent:

1. Navigate to **Behavior** > **Offline Mode**.
2. Enable **Store content for offline use**.
3. Enable **Delayed sync (background sync)**.
4. Set **Offline sync behaviour**: *Sync on app launch & periodically when online*.

This allows field agents to record an entire 2-hour VSLA meeting offline without internet. All savings and loan repayments sync automatically when returning to town (Gulu/Lira/Arua).

---

## 🎨 4. Primary UX Views

1. **Meeting Session Ledger (Form / Form View)**:
   - Optimized for fast entry during weekly meetings.
   - Shows inline member checklist with number of shares bought.
2. **Member Passbooks (Deck / Detail View)**:
   - Displays member photo, accumulated shares, total savings, and active loan balances.
3. **Loan Approval & Portfolio (Table View)**:
   - Filtered slices: *Active Loans*, *Pending Approvals*, *Defaulted / Overdue Loans*.
4. **End-of-Cycle Share-Out Dashboard (Dashboard View)**:
   - Interactive summary displaying total group capital, accumulated interest, and estimated member share value.

---

## 🛡️ 5. Role-Based Access & Security Filters

- **Admin / Treasurer**: Full edit access to approve loans, edit historical records, and execute share-outs.
- **Field Agent / Record Keeper**: Can add new meeting transactions and loan requests, but cannot modify past approved cycles.
- Security Filter Formula on `Members`: `TRUE` (Allow offline caching for all members).
