export interface Loan {
  id: string;
  cooperativeId: string;
  borrowerId: string;
  amount: string;
  asset: string;
  interestRate: number;
  termDays: number;
  status: "Pending" | "Approved" | "Rejected" | "Active" | "Repaid" | "Defaulted" | "Seized";
  approvedBy: string | null;
  collateralAmount: string;
  collateralAsset: string;
  disbursedAt: string | null;
  dueDate: string;
  repaidAmount: string;
  remainingBalance: string;
  missedPayments: number;
  totalPaid: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  installmentNumber: number;
  amountDue: string;
  amountPaid: string;
  paidAt: string | null;
  status: string;
  penaltyAmount: string;
  createdAt: string;
}

export interface MemberLoanSummary {
  memberId: string;
  totalLoans: number;
  activeLoans: number;
  totalBorrowed: string;
  totalRepaid: string;
  totalInterestPaid: string;
  missedPayments: number;
  defaultedLoans: number;
  creditScore: number;
}