import { v4 as uuidv4 } from "uuid";
import { pool } from "../database/connection";
import logger from "../utils/logger";

export const getLoans = async (filters: {
  cooperativeId?: string;
  status?: string;
  memberId?: string;
}) => {
  const queryParts: string[] = ["SELECT * FROM loans WHERE 1=1"];
  const values: unknown[] = [];
  let index = 1;

  if (filters.cooperativeId) {
    queryParts.push(`AND cooperative_id = $${index++}`);
    values.push(filters.cooperativeId);
  }

  if (filters.status) {
    queryParts.push(`AND status = $${index++}`);
    values.push(filters.status);
  }

  if (filters.memberId) {
    queryParts.push(`AND borrower_id = $${index++}`);
    values.push(filters.memberId);
  }

  queryParts.push("ORDER BY created_at DESC");

  const result = await pool.query(queryParts.join(" "), values);
  return result.rows;
};

export const getLoan = async (id: string) => {
  const result = await pool.query("SELECT * FROM loans WHERE id = $1", [id]);
  return result.rows[0] || null;
};

export const requestLoan = async (data: {
  cooperativeId: string;
  borrowerId: string;
  amount: number;
  asset: string;
  interestRate: number;
  termDays: number;
  collateralAmount?: number;
  collateralAsset?: string;
  reason?: string;
}) => {
  const id = uuidv4();
  const now = new Date();
  const dueDate = new Date(now.getTime() + data.termDays * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO loans (id, cooperative_id, borrower_id, amount, asset, interest_rate, term_days, status, collateral_amount, collateral_asset, due_date, remaining_balance, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id, data.cooperativeId, data.borrowerId, data.amount, data.asset,
      data.interestRate, data.termDays, "Pending", data.collateralAmount || 0,
      data.collateralAsset || "XLM", dueDate.toISOString(), data.amount,
      JSON.stringify({ reason: data.reason || null })
    ]
  );

  return getLoan(id);
};

export const approveLoan = async (id: string, approverId: string) => {
  const loan = await getLoan(id);
  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "Pending") {
    throw new Error("Loan is not in pending status");
  }

  await pool.query(
    "UPDATE loans SET status = 'Approved', approved_by = $1 WHERE id = $2",
    [approverId, id]
  );

  return getLoan(id);
};

export const rejectLoan = async (id: string, approverId: string) => {
  const loan = await getLoan(id);
  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "Pending") {
    throw new Error("Loan is not in pending status");
  }

  await pool.query("UPDATE loans SET status = 'Rejected', approved_by = $1 WHERE id = $2", [approverId, id]);
  return getLoan(id);
};

export const disburseLoan = async (id: string) => {
  const loan = await getLoan(id);
  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "Approved") {
    throw new Error("Loan is not approved");
  }

  const now = new Date().toISOString();
  await pool.query(
    "UPDATE loans SET status = 'Active', disbursed_at = $1 WHERE id = $2",
    [now, id]
  );

  return getLoan(id);
};

export const recordRepayment = async (loanId: string, data: {
  amount: number;
  asset: string;
  txHash?: string;
}) => {
  const loan = await getLoan(loanId);
  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "Active") {
    throw new Error("Loan is not active");
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  await pool.query(
    "INSERT INTO loan_repayments (id, loan_id, installment_number, amount_due, amount_paid, paid_at, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [id, loanId, 0, data.amount, data.amount, now, "completed"]
  );

  const newRepaidAmount = parseFloat(loan.repaid_amount) + data.amount;
  const newRemainingBalance = parseFloat(loan.remaining_balance) - data.amount;
  const newTotalPaid = parseFloat(loan.total_paid) + data.amount;
  const newStatus = newRemainingBalance <= 0 ? "Repaid" : "Active";

  await pool.query(
    "UPDATE loans SET repaid_amount = $1, remaining_balance = $2, total_paid = $3, status = $4 WHERE id = $5",
    [newRepaidAmount, newRemainingBalance, newTotalPaid, newStatus, loanId]
  );

  return { id, loanId, amount: data.amount, asset: data.asset, paidAt: now };
};

export const getMemberLoans = async (memberId: string) => {
  const result = await pool.query(
    "SELECT * FROM loans WHERE borrower_id = $1 ORDER BY created_at DESC",
    [memberId]
  );
  return result.rows;
};

export const getMemberLoanSummary = async (memberId: string) => {
  const result = await pool.query(
    `SELECT
      borrower_id as member_id,
      COUNT(*) as total_loans,
      COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_loans,
      SUM(amount) as total_borrowed,
      SUM(repaid_amount) as total_repaid,
      SUM(CASE WHEN status = 'Defaulted' THEN 1 ELSE 0 END) as defaulted_loans,
      SUM(missed_payments) as missed_payments
    FROM loans
    WHERE borrower_id = $1
    GROUP BY borrower_id`,
    [memberId]
  );

  if (result.rows.length === 0) {
    throw new Error("Member not found");
  }

  return result.rows[0];
};

export const markDefaulted = async (id: string) => {
  const loan = await getLoan(id);
  if (!loan) {
    throw new Error("Loan not found");
  }

  await pool.query("UPDATE loans SET status = 'Defaulted', missed_payments = missed_payments + 1 WHERE id = $1", [id]);
  return getLoan(id);
};

export const getRepaymentSchedule = async (loanId: string) => {
  const result = await pool.query(
    "SELECT * FROM loan_repayments WHERE loan_id = $1 ORDER BY installment_number ASC",
    [loanId]
  );
  return result.rows;
};