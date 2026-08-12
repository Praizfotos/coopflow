import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import { errorHandler } from "./middleware/errorHandler";
import { auth as authRoutes } from "./routes/auth";
import { cooperative as cooperativeRoutes } from "./routes/cooperative";
import { contribution as contributionRoutes } from "./routes/contribution";
import { loan as loanRoutes } from "./routes/loan";
import { treasury as treasuryRoutes } from "./routes/treasury";
import { notification as notificationRoutes } from "./routes/notification";
import { analytics as analyticsRoutes } from "./routes/analytics";
import { eventIndexer as eventIndexerRoutes } from "./routes/eventIndexer";
import { config } from "./config";
import logger from "./utils/logger";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cooperatives", cooperativeRoutes);
app.use("/api/v1/contributions", contributionRoutes);
app.use("/api/v1/loans", loanRoutes);
app.use("/api/v1/treasury", treasuryRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/events", eventIndexerRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await createConnection({
      type: "postgres",
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.name,
      entities: [__dirname + "/../database/entities/*.ts"],
      migrations: [__dirname + "/../database/migrations/*.ts"],
      synchronize: config.database.syncOnStartup,
      logging: config.database.logging,
    });

    logger.info("Database connected successfully");

    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`CoopFlow Backend server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;