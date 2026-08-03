import { v4 as uuidv4 } from "uuid";
import { pool } from "../database/connection";
import logger from "../utils/logger";

export const getBalance = async (cooperativeId: string, asset: string) => {
  const result = await pool.query(
    "SELECT * FROM treasuries WHERE cooperative_id = $1 AND asset = $2",
    [cooperativeId, asset]
  );
  return result.rows[0] || { asset, balance: "0", total_deposited: "0", total_withdrawn: "0" };
};

export const getAllBalances = async (cooperativeId: string) => {
  const result = await pool.query(
    "SELECT * FROM treasuries WHERE cooperative_id = $1",
    [cooperativeId]
  );
  return result.rows;
};

export const deposit = async (data: {
  cooperativeId: string;
  amount: number;
  asset: string;
  fromAddress: string;
  txHash: string;
}) => {
  const id = uuidv4();
  const now = new Date().toISOString();

  const existing = await getBalance(data.cooperativeId, data.asset);

  if (existing.id) {
    await pool.query(
      "UPDATE treasuries SET balance = balance + $1, total_deposited = total_deposited + $1 WHERE id = $2",
      [data.amount, existing.id]
    );
  } else {
    await pool.query(
      "INSERT INTO treasuries (cooperative_id, asset, balance, total_deposited) VALUES ($1, $2, $3, $4)",
      [data.cooperativeId, data.asset, data.amount, data.amount]
    );
  }

  await pool.query(
    "INSERT INTO transactions (type, treasury_id, from_address, amount, asset, tx_hash, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    ["deposit", id, data.fromAddress, data.amount, data.asset, data.txHash, now]
  );

  return { id, type: "deposit", amount: data.amount, asset: data.asset, txHash: data.txHash, timestamp: now };
};

export const requestWithdrawal = async (data: {
  cooperativeId: string;
  amount: number;
  asset: string;
  toAddress: string;
  reason?: string;
  requiredApprovals?: number;
}) => {
  const balance = await getBalance(data.cooperativeId, data.asset);
  if (!balance.id || parseFloat(balance.balance) < data.amount) {
    throw new Error("Insufficient balance");
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  await pool.query(
    `INSERT INTO withdrawal_requests (id, cooperative_id, amount, asset, to_address, reason, status, required_approvals, approvals)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, data.cooperativeId, data.amount, data.asset, data.toAddress, data.reason || null, "Pending", data.requiredApprovals || 2, 0]
  );

  return { id, type: "withdrawal_request", amount: data.amount, asset: data.asset, status: "Pending", createdAt: now };
};

export const approveWithdrawal = async (requestId: string, approverId: string) => {
  const result = await pool.query("SELECT * FROM withdrawal_requests WHERE id = $1", [requestId]);
  const request = result.rows[0];

  if (!request) {
    throw new Error("Withdrawal request not found");
  }

  if (request.status !== "Pending") {
    throw new Error("Request is not pending");
  }

  const newApprovals = (request.approvals || 0) + 1;
  const requiredApprovals = request.required_approvals || 2;

  await pool.query(
    "UPDATE withdrawal_requests SET approvals = $1, status = CASE WHEN $1 >= $2 THEN 'Approved' ELSE 'Pending' END WHERE id = $3",
    [newApprovals, requiredApprovals, requestId]
  );

  return { requestId, approvals: newApprovals, status: newApprovals >= requiredApprovals ? "Approved" : "Pending" };
};

export const rejectWithdrawal = async (requestId: string, rejectorId: string) => {
  await pool.query("UPDATE withdrawal_requests SET status = 'Rejected' WHERE id = $1", [requestId]);
  return { requestId, status: "Rejected" };
};

export const executeWithdrawal = async (requestId: string) => {
  const result = await pool.query("SELECT * FROM withdrawal_requests WHERE id = $1", [requestId]);
  const request = result.rows[0];

  if (!request) {
    throw new Error("Withdrawal request not found");
  }

  if (request.status !== "Approved") {
    throw new Error("Request is not approved");
  }

  const balance = await getBalance(request.cooperative_id, request.asset);
  if (!balance.id || parseFloat(balance.balance) < request.amount) {
    throw new Error("Insufficient balance");
  }

  await pool.query(
    "UPDATE treasuries SET balance = balance - $1, total_withdrawn = total_withdrawn + $1 WHERE id = $2",
    [request.amount, balance.id]
  );

  await pool.query("UPDATE withdrawal_requests SET status = 'Executed' WHERE id = $1", [requestId]);

  const id = uuidv4();
  const now = new Date().toISOString();

  await pool.query(
    "INSERT INTO transactions (type, treasury_id, to_address, amount, asset, tx_hash, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    ["withdrawal", id, request.to_address, request.amount, request.asset, `exec-${requestId}`, now]
  );

  return { requestId, status: "Executed", amount: request.amount, asset: request.asset, toAddress: request.to_address };
};

export const getTransactionHistory = async (cooperativeId: string, start: number, limit: number) => {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE treasury_id IN (SELECT id FROM treasuries WHERE cooperative_id = $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [cooperativeId, limit, start]
  );
  return result.rows;
};

export const getDepositHistory = async (cooperativeId: string, start: number, limit: number) => {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE type = 'deposit' AND treasury_id IN (SELECT id FROM treasuries WHERE cooperative_id = $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [cooperativeId, limit, start]
  );
  return result.rows;
};