# Simple & Friendly End-User Interface Guide for VSLA App

This guide transforms the raw AppSheet interface into a clear, simple, and friendly mobile application for VSLA Secretaries, Treasurers, and Members in Northern Uganda.

---

## 🎯 1. Replacing Technical IDs with Human Names

By default, AppSheet shows `TXN-1001` or `MEM-001`. To make it show real names (e.g., **Adong Grace**):

### In AppSheet Editor:
1. Go to **Data** (left menu) > **Tables** > **Members**.
2. Click **View Columns**.
3. Find the `FullName` row and check the **LABEL** checkbox next to it.
4. Uncheck the **LABEL** checkbox next to `MemberID`.
5. Click **Save** (top right).

*Now, throughout the entire app, member names will appear instead of codes!*

---

## 📱 2. Setting Up 4 Clear Bottom Navigation Buttons

Go to **UX** (left menu) > **Views**. Create these 4 primary views for your phone:

### View 1: 👥 Members Directory
- **View name**: `Members`
- **For this data**: `Members`
- **View type**: `Deck` (or `Card`)
- **Primary header**: `FullName`
- **Secondary header**: `Village`
- **Summary column**: `TotalSavingsUGX`
- **Icon**: `people` / `user`

### View 2: 💰 Savings & Shares
- **View name**: `Weekly Savings`
- **For this data**: `Savings_Transactions`
- **View type**: `Deck`
- **Primary header**: `MemberID` *(will automatically display Member Full Name!)*
- **Secondary header**: `TotalSavingsUGX`
- **Summary column**: `MeetingID`
- **Icon**: `cash` / `dollar-sign`

### View 3: 💳 Loans Portfolio
- **View name**: `Loans & Repayments`
- **For this data**: `Loans`
- **View type**: `Table` or `Deck`
- **Primary header**: `MemberID`
- **Secondary header**: `PrincipalUGX`
- **Summary column**: `BalanceRemainingUGX`
- **Icon**: `credit-card`

### View 4: 📊 Share-Out Results
- **View name**: `Share-Out Results`
- **For this data**: `ShareOut_Results`
- **View type**: `Table`
- **Primary header**: `Member Full Name`
- **Secondary header**: `Total Payout Received (UGX)`
- **Icon**: `chart-bar` / `award`

---

## 🖐️ 3. Simplified 3-Step Workflow for Village Secretaries

When holding a weekly VSLA meeting in the village, the secretary only needs 3 simple taps:

1. **Tap `Weekly Savings`** at the bottom of the screen.
2. **Tap the blue `+` button** to record a member's savings.
3. **Select Member Name**, type **Number of Shares Bought** (e.g., `4`), and tap **Save**.

The app automatically calculates the total money (`UGX 8,000`), adds welfare fee, and updates the member's passbook!
