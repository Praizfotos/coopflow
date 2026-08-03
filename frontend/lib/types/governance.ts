export interface Proposal {
  id: string;
  cooperativeId: string;
  proposerId: string;
  title: string;
  description: string;
  type: "Spend" | "MemberApproval" | "MemberRemoval" | "RuleChange" | "Pause" | "Resume" | "Custom";
  status: "Active" | "Passed" | "Rejected" | "Executed" | "Expired";
  votesFor: string;
  votesAgainst: string;
  requiredApprovalPercent: number;
  votingStart: string;
  votingEnd: string;
  executedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  memberId: string;
  vote: boolean;
  votingPower: string;
  votedAt: string;
}

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  totalVotesCast: number;
  participationRate: number;
}