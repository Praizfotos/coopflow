export const config = {
  server: {
    port: parseInt(process.env.PORT || "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME || "coopflow",
    password: process.env.DB_PASSWORD || "coopflow_secret",
    name: process.env.DB_NAME || "coopflow_db",
    syncOnStartup: process.env.DB_SYNC_ON_STARTUP === "true",
    logging: process.env.DB_LOGGING === "true",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  stellar: {
    horizonUrl: process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org",
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
    friendbotUrl: process.env.STELLAR_FRIENDBOT_URL || "https://friendbot-testnet.stellar.org",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || "",
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },
  email: {
    host: process.env.EMAIL_HOST || "",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
  sms: {
    provider: process.env.SMS_PROVIDER || "twilio",
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    fromNumber: process.env.TWILIO_FROM_NUMBER || "",
  },
  notifications: {
    discordWebhook: process.env.DISCORD_WEBHOOK_URL || "",
    slackWebhook: process.env.SLACK_WEBHOOK_URL || "",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "json",
  },
} as const;