import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";
import logger from "../utils/logger";
import { pool } from "../database/connection";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  cooperativeId?: string;
}

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  cooperativeId?: string;
}): Promise<User> => {
  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [data.email]
  );

  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
  }

  const id = uuidv4();
  await pool.query(
    "INSERT INTO users (id, name, email, password, role, cooperative_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, data.name, data.email, data.password, "Member", data.cooperativeId || null]
  );

  return { id, name: data.name, email: data.email, role: "Member", cooperativeId: data.cooperativeId };
};

export const login = async (email: string, password: string): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    cooperativeId: user.cooperative_id,
  };
};

export const getMe = async (id: string): Promise<User | null> => {
  const result = await pool.query("SELECT id, name, email, role, cooperative_id FROM users WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    cooperativeId: user.cooperative_id,
  };
};

export const refreshToken = async (refreshTokenValue: string): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    const decoded = jwt.verify(refreshTokenValue, config.jwt.refreshSecret) as { id: string };
    const user = await getMe(decoded.id);

    if (!user) {
      return null;
    }

    const tokens = {
      accessToken: jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as any),
      refreshToken: jwt.sign({ id: user.id, type: "refresh" }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn } as any),
    };

    return tokens;
  } catch (error) {
    logger.warn("Token refresh failed", { error: (error as Error).message });
    return null;
  }
};