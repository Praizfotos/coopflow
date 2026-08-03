import { v4 as uuidv4 } from "uuid";
import { pool } from "../database/connection";
import logger from "../utils/logger";

export const getActiveCycles = async (cooperativeId: string) => {
  const result = await pool.query(
    "SELECT * FROM contribution_cycles WHERE cooperative_id = $1 AND completed = false ORDER BY start_date ASC",
    [cooperativeId]
  );
  return result.rows;
};

export const getCycle = async (id: string) => {
  const result = await pool.query("SELECT * FROM contribution_cycles WHERE id = $1", [id]);
  return result.rows[0] || null;
};

export const createCycle = async (data: {
  cooperativeId: string;
  cycleType: string;
  amount: number;
  asset: string;
  startDate: string;
  endDate: string;
  penaltyConfig?: Record<string, unknown>;
}) => {
  const id = uuidv4();
  await pool.query(
    "INSERT INTO contribution_cycles (id, cooperative_id, cycle_type, amount, asset, start_date, end_date, penalty_config) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [id, data.cooperativeId, data.cycleType, data.amount, data.asset, data.startDate, data.endDate, JSON.stringify(data.penaltyConfig || {})]
  );

  return getCycle(id);
};

export const recordPayment = async (cycleId: string, data: {
  memberId: string;
  amount: number;
  asset: string;
  txHash: string;
}) => {
  const cycle = await getCycle(cycleId);
  if (!cycle) {
    throw new Error("Cycle not found");
  }

  if (cycle.completed) {
    throw new Error("Cycle is already completed");
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  await pool.query(
    "INSERT INTO contribution_records (id, member_id, cycle_id, amount, asset, paid_at, tx_hash, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [id, data.memberId, cycleId, data.amount, data.asset, now, data.txHash, "completed"]
  );

  await pool.query(
    "UPDATE contribution_cycles SET total_collected = total_collected + $1 WHERE id = $2",
    [data.amount, cycleId]
  );

  return { id, cycleId, memberId: data.memberId, amount: data.amount, asset: data.asset, paidAt: now };
};

export const getCyclePayments = async (cycleId: string) => {
  const result = await pool.query(
    "SELECT * FROM contribution_records WHERE cycle_id = $1 ORDER BY paid_at ASC",
    [cycleId]
  );
  return result.rows;
};

export const getMemberSummary = async (memberId: string) => {
  const result = await pool.query(
    `SELECT 
      member_id,
      SUM(amount) as total_contributed,
      COUNT(DISTINCT cycle_id) as cycles_completed,
      COUNT(CASE WHEN status = 'late' THEN 1 END) as late_payments,
      COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed_payments
    FROM contribution_records
    WHERE member_id = $1
    GROUP BY member_id`,
    [memberId]
  );

  if (result.rows.length === 0) {
    throw new Error("Member not found");
  }

  return result.rows[0];
};

export const calculatePenalty = async (cycleId: string, memberId: string) => {
  const cycle = await getCycle(cycleId);
  if (!cycle) {
    throw new Error("Cycle not found");
  }

  const penaltyConfig = cycle.penalty_config || { late_fee_percent: 500, grace_period_days: 3, max_penalty: 5000 };
  const gracePeriodMs = (penaltyConfig.grace_period_days || 3) * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const result = await pool.query(
    "SELECT paid_at FROM contribution_records WHERE member_id = $1 AND cycle_id = $2 ORDER BY paid_at DESC LIMIT 1",
    [memberId, cycleId]
  );

  if (result.rows.length === 0) {
    return 0;
  }

  const lastPaymentDate = new Date(result.rows[0].paid_at).getTime();
  const elapsed = now - lastPaymentDate;

  if (elapsed <= gracePeriodMs) {
    return 0;
  }

  const penalty = Math.round((penaltyConfig.late_fee_percent || 500) * cycle.amount / 10000);
  const maxPenalty = penaltyConfig.max_penalty || 5000;

  return Math.min(penalty, maxPenalty);
};

export const completeCycle = async (cycleId: string) => {
  const cycle = await getCycle(cycleId);
  if (!cycle) {
    throw new Error("Cycle not found");
  }

  await pool.query("UPDATE contribution_cycles SET completed = true WHERE id = $1", [cycleId]);
  return getCycle(cycleId);
};

export const sendReminder = async (cycleId: string, memberId: string) => {
  const cycle = await getCycle(cycleId);
  if (!cycle) {
    throw new Error("Cycle not found");
  }

  logger.info("Contribution reminder sent", { cycleId, memberId, amount: cycle.amount, asset: cycle.asset });
  return { cycleId, memberId, reminderSent: true };
};