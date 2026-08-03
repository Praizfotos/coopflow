import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, json, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  const ts = new Date(timestamp as string).toISOString();
  return `${ts} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: "coopflow-backend" },
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp(),
        logFormat
      ),
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

export default logger;