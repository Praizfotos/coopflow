export interface ContributionTrend {
  period: string;
  totalContributed: string;
  paymentCount: number;
  averageContribution: string;
}

export interface LoanRepaymentRate {
  status: string;
  count: number;
  avgInterestRate: number;
  avgTermDays: number;
  totalAmount: string;
  totalRepaid: string;
}

export interface TreasuryHealth {
  asset: string;
  balance: string;
  totalDeposited: string;
  totalWithdrawn: string;
}

export interface MemberParticipation {
  id: string;
  name: string;
  role: string;
  status: string;
  totalPayments: number;
  totalContributed: string;
  lastContribution: string;
}

export interface DashboardStats {
  totalMembers: number;
  totalTreasury: string;
  activeCycles: number;
  activeLoans: number;
  pendingProposals: number;
}