import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { config } from "../config";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    cooperativeId?: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { message: "Access token required", statusCode: 401 },
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      cooperativeId?: string;
    };
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    logger.warn("Authentication failed", { error: (error as Error).message });
    return res.status(401).json({
      success: false,
      error: { message: "Invalid or expired token", statusCode: 401 },
    });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user || !authReq.user.role) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied", statusCode: 403 },
      });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: "Insufficient permissions", statusCode: 403 },
      });
    }

    next();
  };
};