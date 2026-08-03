export interface Organization {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  metadata: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cooperative {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  treasuryAddress: string;
  contributionContractAddress: string;
  rotationContractAddress: string;
  governanceContractAddress: string;
  loanContractAddress: string;
  settings: Record<string, unknown>;
  active: boolean;
  totalMembers: number;
  totalAssets: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  cooperativeId: string;
  organizationId: string;
  name: string;
  email: string;
  walletAddress: string;
  role: "Founder" | "Administrator" | "Treasurer" | "Secretary" | "Auditor" | "Member";
  status: "Active" | "Inactive" | "Suspended" | "Pending" | "Revoked";
  identityVerified: boolean;
  metadata: Record<string, unknown>;
  joinedAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  memberId: string;
  address: string;
  asset: string;
  balance: string;
  reservedBalance: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}