# Database Schema

## Overview

CoopFlow uses PostgreSQL as its primary database with TypeORM for ORM.

## Tables

### organizations

Stores organization data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Organization name |
| description | TEXT | Description |
| owner_id | VARCHAR(255) | Owner user ID |
| metadata | JSONB | Additional metadata |
| active | BOOLEAN | Active status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

### cooperatives

Stores cooperative data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | VARCHAR(255) | Foreign key to organizations |
| name | VARCHAR(255) | Cooperative name |
| description | TEXT | Description |
| treasury_address | VARCHAR(255) | Treasury contract address |
| contribution_contract_address | VARCHAR(255) | Contribution contract address |
| rotation_contract_address | VARCHAR(255) | Rotation contract address |
| governance_contract_address | VARCHAR(255) | Governance contract address |
| loan_contract_address | VARCHAR(255) | Loan contract address |
| settings | JSONB | Cooperative settings |
| active | BOOLEAN | Active status |
| total_members | INTEGER | Total member count |
| total_assets | DECIMAL | Total assets |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

### members

Stores member data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| cooperative_id | VARCHAR(255) | Foreign key to cooperatives |
| organization_id | VARCHAR(255) | Foreign key to organizations |
| name | VARCHAR(255) | Member name |
| email | VARCHAR(255) | Email address |
| wallet_address | VARCHAR(56) | Stellar wallet address |
| role | VARCHAR(20) | Member role |
| status | VARCHAR(20) | Membership status |
| identity_verified | BOOLEAN | Identity verification status |
| metadata | JSONB | Additional metadata |
| joined_at | TIMESTAMP | Join timestamp |
| updated_at | TIMESTAMP | Update timestamp |

### contribution_cycles

Stores contribution cycle data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| cooperative_id | VARCHAR(255) | Foreign key to cooperatives |
| cycle_type | VARCHAR(20) | Cycle type |
| amount | DECIMAL | Contribution amount |
| asset | VARCHAR(10) | Asset type |
| start_date | TIMESTAMP | Cycle start |
| end_date | TIMESTAMP | Cycle end |
| members | JSONB | Member list |
| completed | BOOLEAN | Completion status |
| total_collected | DECIMAL | Total collected |
| penalty_config | JSONB | Penalty configuration |

### contribution_records

Stores individual contribution records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| member_id | VARCHAR(255) | Foreign key to members |
| cycle_id | VARCHAR(255) | Foreign key to cycles |
| amount | DECIMAL | Contribution amount |
| asset | VARCHAR(10) | Asset type |
| paid_at | TIMESTAMP | Payment timestamp |
| tx_hash | VARCHAR(64) | Transaction hash |
| status | VARCHAR(20) | Payment status |

### treasuries

Stores treasury balances.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| cooperative_id | VARCHAR(255) | Foreign key to cooperatives |
| asset | VARCHAR(10) | Asset type |
| balance | DECIMAL | Current balance |
| total_deposited | DECIMAL | Total deposited |
| total_withdrawn | DECIMAL | Total withdrawn |

### transactions

Stores all financial transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| type | VARCHAR(20) | Transaction type |
| treasury_id | VARCHAR(255) | Foreign key to treasuries |
| loan_id | VARCHAR(255) | Foreign key to loans |
| from_address | VARCHAR(56) | Source address |
| to_address | VARCHAR(56) | Destination address |
| amount | DECIMAL | Transaction amount |
| asset | VARCHAR(10) | Asset type |
| tx_hash | VARCHAR(64) | Transaction hash |

### loans

Stores loan data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| cooperative_id | VARCHAR(255) | Foreign key to cooperatives |
| borrower_id | VARCHAR(255) | Foreign key to members |
| amount | DECIMAL | Loan amount |
| asset | VARCHAR(10) | Asset type |
| interest_rate | DECIMAL | Interest rate |
| term_days | INTEGER | Loan term in days |
| status | VARCHAR(20) | Loan status |
| disbursed_at | TIMESTAMP | Disbursement timestamp |
| due_date | TIMESTAMP | Due date |
| repaid_amount | DECIMAL | Total repaid |
| remaining_balance | DECIMAL | Remaining balance |

### proposals

Stores governance proposals.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| cooperative_id | VARCHAR(255) | Foreign key to cooperatives |
| proposer_id | VARCHAR(255) | Foreign key to members |
| title | VARCHAR(255) | Proposal title |
| description | TEXT | Proposal description |
| type | VARCHAR(20) | Proposal type |
| status | VARCHAR(20) | Proposal status |
| votes_for | DECIMAL | Votes in favor |
| votes_against | DECIMAL | Votes against |
| required_approval_percent | DECIMAL | Required approval percentage |
| voting_start | TIMESTAMP | Voting start |
| voting_end | TIMESTAMP | Voting end |

### votes

Stores votes on proposals.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| proposal_id | VARCHAR(255) | Foreign key to proposals |
| member_id | VARCHAR(255) | Foreign key to members |
| vote | BOOLEAN | Vote value |
| voting_power | DECIMAL | Voting power |
| voted_at | TIMESTAMP | Vote timestamp |

### notifications

Stores notification data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| member_id | VARCHAR(255) | Foreign key to members |
| cooperative_id | VARCHAR(255) | Foreign key to cooperatives |
| type | VARCHAR(50) | Notification type |
| title | VARCHAR(255) | Notification title |
| message | TEXT | Notification message |
| read | BOOLEAN | Read status |

### audit_logs

Stores audit log entries.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| cooperative_id | VARCHAR(255) | Foreign key to cooperatives |
| user_id | VARCHAR(255) | User ID |
| action | VARCHAR(100) | Action performed |
| entity_type | VARCHAR(100) | Entity type |
| entity_id | VARCHAR(255) | Entity ID |
| details | JSONB | Action details |
| ip_address | VARCHAR(45) | IP address |
| user_agent | VARCHAR(255) | User agent |
| created_at | TIMESTAMP | Creation timestamp |