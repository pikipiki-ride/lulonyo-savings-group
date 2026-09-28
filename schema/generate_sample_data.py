import csv
import json
import os
import random
from datetime import datetime, timedelta

def generate_vsla_dataset():
    output_dir = os.path.join(os.path.dirname(__file__), 'sample_csvs')
    os.makedirs(output_dir, exist_ok=True)

    # Common Acholi/Lango names
    first_names = [
        "Akena", "Adong", "Oketayot", "Otim", "Aber", "Oloya", "Apio", "Opio", "Acen", "Ocen",
        "Amony", "Okello", "Aryemo", "Oyet", "Lalam", "Komakech", "Akello", "Odong", "Acan", "Ojok"
    ]
    last_names = [
        "Francis", "Grace", "Richard", "Dennis", "Florence", "Patrick", "Beatrice", "Innocent",
        "Evelyn", "Charles", "Harriet", "David", "Nancy", "Moses", "Brenda", "Geoffrey", "Christine", "James"
    ]

    villages = ["Bardege", "Layibi", "Laroo", "Pece", "Unyama", "Koro", "Awach", "Bobobi", "Patiko", "Pabo"]
    subcounties = ["Laroo-Pece", "Bardege-Layibi", "Unyama Subcounty", "Awach Subcounty", "Pabo Town Council"]
    district = "Gulu"

    # 1. Generate Members
    members = []
    for i in range(1, 31):
        member_id = f"MEM-{i:03d}"
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        full_name = f"{fname} {lname}"
        phone = f"+25677{random.randint(1000000, 9999999)}"
        gender = "Female" if fname in ["Adong", "Aber", "Apio", "Acen", "Amony", "Aryemo", "Lalam", "Akello", "Acan"] else "Male"
        village = random.choice(villages)
        subcounty = random.choice(subcounties)
        nin = f"CM{random.randint(8000000, 9999999)}{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ')}"
        joining_date = "2026-01-10"
        status = "Active"

        members.append({
            "MemberID": member_id,
            "FullName": full_name,
            "PhoneNumber": phone,
            "Gender": gender,
            "Village": village,
            "Subcounty": subcounty,
            "District": district,
            "NationalID_NIN": nin,
            "JoiningDate": joining_date,
            "Status": status
        })

    # Write Members CSV
    members_path = os.path.join(output_dir, "Members.csv")
    with open(members_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=members[0].keys())
        writer.writeheader()
        writer.writerows(members)

    print(f"Generated {len(members)} members -> {members_path}")

    # 2. Generate Meetings & Savings Transactions (12 weekly meetings)
    meetings = []
    savings_txns = []
    txn_counter = 1001

    start_date = datetime(2026, 7, 3)
    share_val = 2000
    welfare_val = 1000

    for m_idx in range(1, 13):
        m_date = start_date + timedelta(weeks=m_idx-1)
        m_id = f"MTG-2026-{m_idx:03d}"
        total_present = random.randint(24, 30)
        total_shares_meeting = 0
        total_savings_meeting = 0
        total_welfare_meeting = 0
        total_fines_meeting = 0

        # Attendees sample
        attendees = random.sample(members, total_present)

        for m in attendees:
            shares = random.randint(1, 5) # Max 5 shares per meeting
            total_sav = shares * share_val
            fine = 2000 if random.random() < 0.08 else 0
            fine_reason = "Late arrival to meeting" if fine > 0 else ""

            savings_txns.append({
                "TransactionID": f"TXN-{txn_counter}",
                "MeetingID": m_id,
                "MemberID": m["MemberID"],
                "SharesBought": shares,
                "ShareValueUGX": share_val,
                "TotalSavingsUGX": total_sav,
                "WelfareFundUGX": welfare_val,
                "FineAmountUGX": fine,
                "FineReason": fine_reason,
                "RecordedTimestamp": m_date.strftime("%Y-%m-%dT14:30:00")
            })
            txn_counter += 1

            total_shares_meeting += shares
            total_savings_meeting += total_sav
            total_welfare_meeting += welfare_val
            total_fines_meeting += fine

        meetings.append({
            "MeetingID": m_id,
            "MeetingDate": m_date.strftime("%Y-%m-%d"),
            "CycleNumber": 1,
            "MeetingNumber": m_idx,
            "VenueLocation": "Pece Primary School Ground",
            "RecordedBy": "Secretary - Adong Grace",
            "TotalMembersPresent": total_present,
            "TotalSharesBoughtThisMeeting": total_shares_meeting,
            "TotalSavingsCollectedUGX": total_savings_meeting,
            "TotalWelfareCollectedUGX": total_welfare_meeting,
            "TotalFinesCollectedUGX": total_fines_meeting
        })

    # Write Meetings CSV
    meetings_path = os.path.join(output_dir, "Meetings.csv")
    with open(meetings_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=meetings[0].keys())
        writer.writeheader()
        writer.writerows(meetings)

    # Write Savings Transactions CSV
    txns_path = os.path.join(output_dir, "Savings_Transactions.csv")
    with open(txns_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=savings_txns[0].keys())
        writer.writeheader()
        writer.writerows(savings_txns)

    print(f"Generated {len(meetings)} meetings -> {meetings_path}")
    print(f"Generated {len(savings_txns)} savings transactions -> {txns_path}")

    # 3. Generate Loans & Repayments
    loans = []
    repayments = []
    rep_counter = 5001

    for l_idx in range(1, 9):
        borrower = members[l_idx*3]
        guarantors = random.sample([m for m in members if m["MemberID"] != borrower["MemberID"]], 2)
        principal = random.choice([100000, 200000, 300000, 500000])
        interest_rate = 0.05
        duration = 3
        total_interest = int(principal * interest_rate * duration)
        total_repayable = principal + total_interest

        app_date = datetime(2026, 7, 10) + timedelta(days=l_idx * 5)
        due_date = app_date + timedelta(days=90)
        loan_id = f"LN-2026-{l_idx:03d}"

        # Repayment logic
        principal_paid = 0
        interest_paid = 0

        # Partial repayments over meeting dates
        for rep_idx in range(1, random.randint(2, 4)):
            rep_date = app_date + timedelta(days=rep_idx * 25)
            p_pay = int((principal / 3))
            i_pay = int((total_interest / 3))
            principal_paid += p_pay
            interest_paid += i_pay

            repayments.append({
                "RepaymentID": f"REP-{rep_counter}",
                "LoanID": loan_id,
                "MemberID": borrower["MemberID"],
                "MeetingID": f"MTG-2026-00{random.randint(4, 12)}",
                "PrincipalPaidUGX": p_pay,
                "InterestPaidUGX": i_pay,
                "LatePenaltyPaidUGX": 0,
                "TotalPaidUGX": p_pay + i_pay,
                "PaymentDate": rep_date.strftime("%Y-%m-%d"),
                "ReceiptNumber": f"REC-{random.randint(1000, 9999)}"
            })
            rep_counter += 1

        balance = total_repayable - (principal_paid + interest_paid)
        status = "Fully Paid" if balance <= 0 else "Active"

        loans.append({
            "LoanID": loan_id,
            "MemberID": borrower["MemberID"],
            "PrincipalUGX": principal,
            "InterestRateMonthlyPercent": "5%",
            "DurationMonths": duration,
            "TotalInterestUGX": total_interest,
            "TotalRepayableUGX": total_repayable,
            "Guarantor1_ID": guarantors[0]["MemberID"],
            "Guarantor2_ID": guarantors[1]["MemberID"],
            "ApplicationDate": app_date.strftime("%Y-%m-%d"),
            "DueDate": due_date.strftime("%Y-%m-%d"),
            "PrincipalPaidUGX": principal_paid,
            "InterestPaidUGX": interest_paid,
            "BalanceRemainingUGX": balance,
            "Status": status
        })

    # Write Loans CSV
    loans_path = os.path.join(output_dir, "Loans.csv")
    with open(loans_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=loans[0].keys())
        writer.writeheader()
        writer.writerows(loans)

    # Write Repayments CSV
    rep_path = os.path.join(output_dir, "Loan_Repayments.csv")
    with open(rep_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=repayments[0].keys())
        writer.writeheader()
        writer.writerows(repayments)

    print(f"Generated {len(loans)} loans -> {loans_path}")
    print(f"Generated {len(repayments)} loan repayments -> {rep_path}")

    print("\nDataset generation completed successfully!")

if __name__ == "__main__":
    generate_vsla_dataset()
