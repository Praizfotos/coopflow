import { v4 as uuidv4 } from "uuid";
import { pool } from "../database/connection";
import logger from "../utils/logger";

export const getCooperativesForUser = async (userId: string) => {
  const result = await pool.query(
    "SELECT c.* FROM cooperatives c JOIN members m ON c.id = m.cooperative_id WHERE m.user_id = $1 AND c.active = true",
    [userId]
  );
  return result.rows;
};

export const getCooperative = async (id: string) => {
  const result = await pool.query("SELECT * FROM cooperatives WHERE id = $1", [id]);
  return result.rows[0] || null;
};

export const createCooperative = async (userId: string, data: {
  name: string;
  organizationId: string;
  description?: string;
  settings?: Record<string, unknown>;
}) => {
  const id = uuidv4();
  await pool.query(
    "INSERT INTO cooperatives (id, organization_id, name, description, settings, created_by) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, data.organizationId, data.name, data.description || null, JSON.stringify(data.settings || {}), userId]
  );

  await pool.query(
    "INSERT INTO members (id, cooperative_id, user_id, name, email, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [uuidv4(), id, userId, "Admin", "", "Administrator", "Active"]
  );

  const cooperative = await getCooperative(id);
  return cooperative;
};

export const updateCooperative = async (id: string, data: {
  name?: string;
  description?: string;
  settings?: Record<string, unknown>;
}) => {
  const cooperative = await getCooperative(id);
  if (!cooperative) {
    throw new Error("Cooperative not found");
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (data.name) {
    updates.push(`name = $${index++}`);
    values.push(data.name);
  }

  if (data.description !== undefined) {
    updates.push(`description = $${index++}`);
    values.push(data.description);
  }

  if (data.settings) {
    updates.push(`settings = $${index++}`);
    values.push(JSON.stringify(data.settings));
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  await pool.query(`UPDATE cooperatives SET ${updates.join(", ")} WHERE id = $${index}`, values);
  return getCooperative(id);
};

export const deleteCooperative = async (id: string) => {
  await pool.query("UPDATE cooperatives SET active = false WHERE id = $1", [id]);
};

export const getMembers = async (cooperativeId: string) => {
  const result = await pool.query(
    "SELECT * FROM members WHERE cooperative_id = $1 AND status != 'Revoked' ORDER BY joined_at ASC",
    [cooperativeId]
  );
  return result.rows;
};

export const addMember = async (cooperativeId: string, data: {
  name: string;
  email: string;
  walletAddress: string;
  role?: string;
}) => {
  const id = uuidv4();
  await pool.query(
    "INSERT INTO members (id, cooperative_id, user_id, name, email, wallet_address, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [id, cooperativeId, null, data.name, data.email, data.walletAddress, data.role || "Member", "Active"]
  );

  await pool.query("UPDATE cooperatives SET total_members = total_members + 1 WHERE id = $1", [cooperativeId]);

  return getMember(cooperativeId, id);
};

export const removeMember = async (cooperativeId: string, memberId: string) => {
  await pool.query(
    "UPDATE members SET status = 'Revoked' WHERE id = $1 AND cooperative_id = $2",
    [memberId, cooperativeId]
  );

  await pool.query(
    "UPDATE cooperatives SET total_members = GREATEST(0, total_members - 1) WHERE id = $1",
    [cooperativeId]
  );
};

export const getMember = async (cooperativeId: string, memberId: string) => {
  const result = await pool.query(
    "SELECT * FROM members WHERE id = $1 AND cooperative_id = $2",
    [memberId, cooperativeId]
  );
  return result.rows[0] || null;
};