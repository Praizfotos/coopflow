export const APP_NAME = "CoopFlow";
export const APP_VERSION = "1.0.0";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
export const STELLAR_HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON || "https://horizon-testnet.stellar.org";
export const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "Test SDF Network ; September 2015";

export const ROLES = ["Founder", "Administrator", "Treasurer", "Secretary", "Auditor", "Member"] as const;

export const MEMBER_STATUSES = ["Active", "Inactive", "Suspended", "Pending", "Revoked"] as const;

export const CYCLE_TYPES = ["Weekly", "Biweekly", "Monthly", "Quarterly", "Yearly", "Custom"] as const;

export const LOAN_STATUSES = ["Pending", "Approved", "Rejected", "Active", "Repaid", "Defaulted", "Seized"] as const;

export const PROPOSAL_TYPES = ["Spend", "MemberApproval", "MemberRemoval", "RuleChange", "Pause", "Resume", "Custom"] as const;

export const PROPOSAL_STATUSES = ["Active", "Passed", "Rejected", "Executed", "Expired"] as const;