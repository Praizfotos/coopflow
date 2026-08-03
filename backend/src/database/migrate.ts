import { pool } from "./connection";

const migrations = [
  `CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id VARCHAR(255) NOT NULL,
    metadata JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    treasury_address VARCHAR(255),
    contribution_contract_address VARCHAR(255),
    rotation_contract_address VARCHAR(255),
    governance_contract_address VARCHAR(255),
    loan_contract_address VARCHAR(255),
    settings JSONB,
    active BOOLEAN DEFAULT true,
    total_members INTEGER DEFAULT 0,
    total_assets DECIMAL(18,7) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id VARCHAR(255) NOT NULL,
    organization_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(56) NOT NULL,
    role VARCHAR(20) DEFAULT 'Member',
    status VARCHAR(20) DEFAULT 'Active',
    identity_verified BOOLEAN DEFAULT false,
    metadata JSONB,
    joined_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(255) NOT NULL,
    address VARCHAR(56) NOT NULL,
    asset VARCHAR(10) DEFAULT 'XLM',
    balance DECIMAL(18,7) DEFAULT 0,
    reserved_balance DECIMAL(18,7) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS contribution_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id VARCHAR(255) NOT NULL,
    cycle_type VARCHAR(20) NOT NULL,
    amount DECIMAL(18,7) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    members JSONB,
    completed BOOLEAN DEFAULT false,
    total_collected DECIMAL(18,7) DEFAULT 0,
    penalty_config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS contribution_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(255) NOT NULL,
    cycle_id VARCHAR(255) NOT NULL,
    amount DECIMAL(18,7) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    paid_at TIMESTAMP NOT NULL,
    tx_hash VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS treasuries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id VARCHAR(255) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    balance DECIMAL(18,7) DEFAULT 0,
    total_deposited DECIMAL(18,7) DEFAULT 0,
    total_withdrawn DECIMAL(18,7) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    treasury_id VARCHAR(255),
    loan_id VARCHAR(255),
    from_address VARCHAR(56),
    to_address VARCHAR(56),
    amount DECIMAL(18,7) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    tx_hash VARCHAR(64),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id VARCHAR(255) NOT NULL,
    borrower_id VARCHAR(255) NOT NULL,
    amount DECIMAL(18,7) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_days INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    approved_by VARCHAR(255),
    collateral_amount DECIMAL(18,7) DEFAULT 0,
    collateral_asset VARCHAR(10) DEFAULT 'XLM',
    disbursed_at TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    repaid_amount DECIMAL(18,7) DEFAULT 0,
    remaining_balance DECIMAL(18,7) NOT NULL,
    missed_payments INTEGER DEFAULT 0,
    total_paid DECIMAL(18,7) DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id VARCHAR(255) NOT NULL,
    installment_number INTEGER NOT NULL,
    amount_due DECIMAL(18,7) NOT NULL,
    amount_paid DECIMAL(18,7) DEFAULT 0,
    paid_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    penalty_amount DECIMAL(18,7) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS emergency_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id VARCHAR(255) NOT NULL,
    balance DECIMAL(18,7) DEFAULT 0,
    total_contributed DECIMAL(18,7) DEFAULT 0,
    total_withdrawn DECIMAL(18,7) DEFAULT 0,
    monthly_contribution_target DECIMAL(18,7) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS investment_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_contributed DECIMAL(18,7) DEFAULT 0,
    total_returns DECIMAL(18,7) DEFAULT 0,
    current_value DECIMAL(18,7) DEFAULT 0,
    total_members INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    settings JSONB,
    returns_history JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id VARCHAR(255) NOT NULL,
    proposer_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    votes_for DECIMAL(18,7) DEFAULT 0,
    votes_against DECIMAL(18,7) DEFAULT 0,
    required_approval_percent DECIMAL(5,2) NOT NULL,
    voting_start TIMESTAMP NOT NULL,
    voting_end TIMESTAMP NOT NULL,
    executed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id VARCHAR(255) NOT NULL,
    member_id VARCHAR(255) NOT NULL,
    vote BOOLEAN NOT NULL,
    voting_power DECIMAL(18,7) DEFAULT 0,
    voted_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(255) NOT NULL,
    cooperative_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    cooperative_id VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_notification_member ON notifications(member_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_cooperative ON audit_logs(cooperative_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)`,
  `CREATE INDEX IF NOT EXISTS idx_session_token ON sessions(token)`,
  `CREATE INDEX IF NOT EXISTS idx_contribution_records_member ON contribution_records(member_id)`,
  `CREATE INDEX IF NOT EXISTS idx_contribution_records_cycle ON contribution_records(cycle_id)`,
  `CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrower_id)`,
  `CREATE INDEX IF NOT EXISTS idx_loans_cooperative ON loans(cooperative_id)`,
  `CREATE INDEX IF NOT EXISTS idx_proposals_cooperative ON proposals(cooperative_id)`,
  `CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id)`,
];

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const migration of migrations) {
      await client.query(migration);
    }
    await client.query("COMMIT");
    console.log("Database migrations completed successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
  }
};

runMigrations().then(() => {
  pool.end();
  process.exit(0);
});