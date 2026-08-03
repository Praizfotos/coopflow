export interface TreasuryBalance {
  id: string;
  cooperativeId: string;
  asset: string;
  balance: string;
  totalDeposited: string;
  totalWithdrawn: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | "interest" | "penalty" | "payout" | "repayment" | "investment";
  treasuryId: string | null;
  loanId: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  amount: string;
  asset: string;
  txHash: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  cooperativeId: string;
  amount: string;
  asset: string;
  toAddress: string;
  reason: string | null;
  status: "Pending" | "Approved" | "Rejected" | "Executed";
  requiredApprovals: number;
  approvals: number;
  createdAt: string;
}