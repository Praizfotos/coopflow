# Smart Contracts

## Overview

CoopFlow uses six separate Soroban smart contracts, each handling a specific domain of cooperative finance.

## Contract Registry

### Registry Contract (`coopflow-registry`)

**Purpose:** Manage organizations, cooperatives, and members.

**Key Functions:**
- `createOrganization` - Create a new organization
- `createCooperative` - Create a new cooperative under an organization
- `addMember` - Add a member to a cooperative
- `removeMember` - Remove a member from a cooperative
- `updateMemberRole` - Change a member's role
- `verifyMemberIdentity` - Verify member identity
- `getCooperativeMembers` - Get all members of a cooperative

**Data Types:**
- `Organization` - Organization entity
- `Cooperative` - Cooperative entity
- `Member` - Member entity with role and status
- `MemberRole` - Enum: Founder, Administrator, Treasurer, Secretary, Auditor, Member
- `MembershipStatus` - Enum: Active, Inactive, Suspended, Pending, Revoked

### Treasury Contract (`coopflow-treasury`)

**Purpose:** Secure custody of cooperative funds.

**Key Functions:**
- `deposit` - Deposit funds into treasury
- `requestWithdrawal` - Request a withdrawal with approval workflow
- `approveWithdrawal` - Approve a withdrawal request
- `executeWithdrawal` - Execute an approved withdrawal
- `getBalance` - Get balance for a specific asset
- `getAllBalances` - Get all treasury balances
- `getTransactionHistory` - Get transaction history

**Security Features:**
- Multi-signature approval for withdrawals
- Withdrawal threshold enforcement
- Supported asset whitelist
- Emergency pause functionality
- Audit logging

### Contribution Contract (`coopflow-contribution`)

**Purpose:** Manage contribution schedules and payment records.

**Key Functions:**
- `createCycle` - Create a new contribution cycle
- `recordPayment` - Record a member's contribution
- `calculatePenalty` - Calculate late payment penalties
- `completeCycle` - Mark a cycle as completed
- `getMemberSummary` - Get a member's contribution summary
- `generateReceipt` - Generate a contribution receipt
- `sendReminder` - Send contribution reminder

**Cycle Types:**
- Weekly
- Biweekly
- Monthly
- Quarterly
- Yearly
- Custom

### Rotation Contract (`coopflow-rotation`)

**Purpose:** Manage rotating savings payouts.

**Key Functions:**
- `createRotationCycle` - Create a new rotation cycle
- `recordContribution` - Record a member's contribution
- `executePayout` - Execute the next payout in rotation
- `randomDraw` - Perform a random draw for payout order
- `voteForPayoutOrder` - Vote on payout order
- `setPayoutOrder` - Set the payout order type

**Payout Order Types:**
- Lottery
- Manual
- Priority
- Random Draw
- Voting

### Governance Contract (`coopflow-governance`)

**Purpose:** On-chain governance for cooperative decisions.

**Key Functions:**
- `createProposal` - Create a new governance proposal
- `vote` - Cast a vote on a proposal
- `executeProposal` - Execute a passed proposal
- `getActiveProposals` - Get all active proposals
- `setVotingPower` - Set a member's voting power

**Proposal Types:**
- Spend
- MemberApproval
- MemberRemoval
- RuleChange
- Pause
- Resume
- Custom

### Loan Contract (`coopflow-loan`)

**Purpose:** Manage member loans with approval workflow.

**Key Functions:**
- `requestLoan` - Request a new loan
- `approveLoan` - Approve a loan request
- `rejectLoan` - Reject a loan request
- `disburseLoan` - Disburse an approved loan
- `recordRepayment` - Record a loan repayment
- `markDefaulted` - Mark a loan as defaulted
- `seizeCollateral` - Seize collateral for defaulted loans
- `generateLoanReceipt` - Generate a loan receipt

**Loan Statuses:**
- Pending
- Approved
- Rejected
- Active
- Repaid
- Defaulted
- Seized

## Testing

All contracts include comprehensive unit tests:

```bash
cd contracts
cargo test --all
```

## Deployment

### Testnet Deployment

```bash
cargo soroban deploy --network testnet
```

### Mainnet Deployment

```bash
cargo soroban deploy --network public
```

## Upgrade Strategy

Contracts use the Soroban upgrade mechanism:

1. Deploy new contract WASM
2. Update contract reference in registry
3. Migrate storage if needed
4. Verify on-chain state