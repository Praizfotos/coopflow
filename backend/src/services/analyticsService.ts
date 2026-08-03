import { pool } from "../database/connection";
import logger from "../utils/logger";

export const getContributionTrends = async (cooperativeId: string, period: string = "monthly") => {
  const query = `
    SELECT
      DATE_TRUNC('${period}', paid_at) as period,
      SUM(amount) as total_contributed,
      COUNT(*) as payment_count,
      AVG(amount) as average_contribution
    FROM contribution_records
    WHERE cycle_id IN (SELECT id FROM contribution_cycles WHERE cooperative_id = $1)
    GROUP BY DATE_TRUNC('${period}', paid_at)
    ORDER BY period DESC
    LIMIT 12
  `;

  const result = await pool.query(query, [cooperativeId]);
  return result.rows;
};

export const getLoanRepaymentRates = async (cooperativeId: string) => {
  const result = await pool.query(
    `SELECT
      status,
      COUNT(*) as count,
      AVG(interest_rate) as avg_interest_rate,
      AVG(term_days) as avg_term_days,
      SUM(amount) as total_amount,
      SUM(repaid_amount) as total_repaid
    FROM loans
    WHERE cooperative_id = $1
    GROUP BY status`,
    [cooperativeId]
  );
  return result.rows;
};

export const getTreasuryHealth = async (cooperativeId: string) => {
  const result = await pool.query(
    "SELECT asset, balance, total_deposited, total_withdrawn FROM treasuries WHERE cooperative_id = $1",
    [cooperativeId]
  );
  return result.rows;
};

export const getMemberParticipation = async (cooperativeId: string) => {
  const result = await pool.query(
    `SELECT
      m.id,
      m.name,
      m.role,
      m.status,
      COUNT(cr.id) as total_payments,
      COALESCE(SUM(cr.amount), 0) as total_contributed,
      MAX(cr.paid_at) as last_contribution
    FROM members m
    LEFT JOIN contribution_records cr ON m.id = cr.member_id
    WHERE m.cooperative_id = $1
    GROUP BY m.id, m.name, m.role, m.status
    ORDER BY total_contributed DESC`,
    [cooperativeId]
  );
  return result.rows;
};

export const getProposalParticipation = async (cooperativeId: string) => {
  const result = await pool.query(
    `SELECT
      p.id,
      p.title,
      p.status,
      p.votes_for,
      p.votes_against,
      COUNT(v.id) as total_votes,
      p.required_approval_percent,
      CASE WHEN COUNT(v.id) > 0 THEN (p.votes_for::float / (p.votes_for + p.votes_against) * 100) ELSE 0 END as approval_rate
    FROM proposals p
    LEFT JOIN votes v ON p.id = v.proposal_id
    WHERE p.cooperative_id = $1
    GROUP BY p.id, p.title, p.status, p.votes_for, p.votes_against, p.required_approval_percent
    ORDER BY p.created_at DESC`,
    [cooperativeId]
  );
  return result.rows;
};

export const getCashFlow = async (cooperativeId: string, startDate: string, endDate: string) => {
  const result = await pool.query(
    `SELECT
      DATE(created_at) as date,
      type,
      SUM(amount) as total_amount,
      COUNT(*) as transaction_count
    FROM transactions
    WHERE treasury_id IN (SELECT id FROM treasuries WHERE cooperative_id = $1)
      AND created_at BETWEEN $2 AND $3
    GROUP BY DATE(created_at), type
    ORDER BY date ASC`,
    [cooperativeId, startDate, endDate]
  );
  return result.rows;
};

export const getFinancialForecasting = async (cooperativeId: string) => {
  const trends = await getContributionTrends(cooperativeId, "monthly");
  const treasury = await getTreasuryHealth(cooperativeId);
  const loans = await getLoanRepaymentRates(cooperativeId);

  const totalMonthlyContributions = trends.reduce((sum: number, row: any) => sum + parseFloat(row.total_contributed || 0), 0);
  const avgMonthlyContribution = trends.length > 0 ? totalMonthlyContributions / trends.length : 0;

  const totalLoans = loans.reduce((sum: number, row: any) => sum + parseFloat(row.total_amount || 0), 0);
  const totalRepaid = loans.reduce((sum: number, row: any) => sum + parseFloat(row.total_repaid || 0), 0);
  const repaymentRate = totalLoans > 0 ? (totalRepaid / totalLoans) * 100 : 0;

  const totalTreasury = treasury.reduce((sum: number, row: any) => sum + parseFloat(row.balance || 0), 0);

  return {
    projectedMonthlyContribution: avgMonthlyContribution,
    projectedAnnualContribution: avgMonthlyContribution * 12,
    totalTreasuryValue: totalTreasury,
    loanRepaymentRate: repaymentRate,
    activeLoans: loans.filter((row: any) => row.status === "Active").length,
    totalLoans,
    totalRepaid,
    trends,
  };
};

export const getDashboardStats = async (cooperativeId: string) => {
  const [memberCount, treasuryResult, activeCycles, activeLoans, pendingProposals] = await Promise.all([
    pool.query("SELECT COUNT(*) as count FROM members WHERE cooperative_id = $1 AND status = 'Active'", [cooperativeId]),
    pool.query("SELECT COALESCE(SUM(balance), 0) as total FROM treasuries WHERE cooperative_id = $1", [cooperativeId]),
    pool.query("SELECT COUNT(*) as count FROM contribution_cycles WHERE cooperative_id = $1 AND completed = false", [cooperativeId]),
    pool.query("SELECT COUNT(*) as count FROM loans WHERE cooperative_id = $1 AND status = 'Active'", [cooperativeId]),
    pool.query("SELECT COUNT(*) as count FROM proposals WHERE cooperative_id = $1 AND status = 'Active'", [cooperativeId]),
  ]);

  return {
    totalMembers: parseInt(memberCount.rows[0].count, 10),
    totalTreasury: treasuryResult.rows[0].total,
    activeCycles: parseInt(activeCycles.rows[0].count, 10),
    activeLoans: parseInt(activeLoans.rows[0].count, 10),
    pendingProposals: parseInt(pendingProposals.rows[0].count, 10),
  };
};