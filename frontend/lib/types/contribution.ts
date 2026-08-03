export interface ContributionCycle {
  id: string;
  cooperativeId: string;
  cycleType: "Weekly" | "Biweekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";
  amount: string;
  asset: string;
  startDate: string;
  endDate: string;
  members: string[];
  completed: boolean;
  totalCollected: string;
  penaltyConfig: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionRecord {
  id: string;
  memberId: string;
  cycleId: string;
  amount: string;
  asset: string;
  paidAt: string;
  txHash: string;
  status: string;
  receiptUrl: string | null;
  createdAt: string;
}

export interface MemberContributionSummary {
  memberId: string;
  totalContributed: string;
  cyclesCompleted: number;
  latePayments: number;
  missedPayments: number;
  lastContributionDate: string;
  streakDays: number;
}