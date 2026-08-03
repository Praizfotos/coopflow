import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`Error ${statusCode}: ${message}`, {
    stack: err.stack,
    path: _req.path,
    method: _req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      statusCode: 404,
    },
  });
};