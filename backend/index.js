require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const connection = require("./config/connection");
const logger = require("./config/logger");
const requestLogger = require("./middleware/requestLogger.middleware");
const { apiLimiter } = require("./middleware/rateLimiter");
const authRoutes = require("./routes/auth.route");
const createHealthRouter = require("./routes/health.route");
const createDeviceRouter = require("./routes/device.route");
const { authenticate } = require("./middleware/authenticate");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const asyncHandler = require("./util/asyncHandler");
const userService = require("./service/user.service");

const hasDatabaseUrl = Boolean(
  process.env.DB_URL || process.env.DATABASE_URL
);
const hasDiscreteDatabase = Boolean(
  process.env.DB_NAME && process.env.DB_USER && process.env.DB_HOST
);

const missingEnv = [];
if (!hasDatabaseUrl && !hasDiscreteDatabase) {
  missingEnv.push("DB_URL/DATABASE_URL or DB_NAME/DB_USER/DB_HOST");
}
if (!process.env.JWT_SECRET) {
  missingEnv.push("JWT_SECRET");
}

if (missingEnv.length > 0) {
  logger.error(
    { missing: missingEnv },
    "Missing required environment variables"
  );
  process.exit(1);
}

if (
  process.env.NODE_ENV === "production" &&
  process.env.JWT_SECRET.length < 32
) {
  logger.error("JWT_SECRET must be at least 32 characters in production");
  process.exit(1);
}

const app = express();

const trustProxy = process.env.TRUST_PROXY;
if (trustProxy && trustProxy !== "false") {
  const parsed = Number(trustProxy);
  app.set("trust proxy", Number.isNaN(parsed) ? trustProxy : parsed);
}

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : null;

const corsOrigin =
  allowedOrigins && allowedOrigins.length > 0
    ? allowedOrigins
    : process.env.NODE_ENV === "production"
      ? false
      : true;

app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(requestLogger);
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(apiLimiter);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to AlertU API",
  });
});

app.use("/health", createHealthRouter());
app.use("/auth", authRoutes);

app.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);
    res.json({
      data: {
        id: user.id,
        name: user.displayName,
        email: user.email,
        role: user.role,
        campusId: user.campusId,
        accountStatus: user.accountStatus,
        campus: user.campus
          ? { id: user.campus.id, name: user.campus.name }
          : null,
      },
    });
  })
);

app.use("/devices", createDeviceRouter({ authenticate }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

connection
  .authenticate()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info({ port: PORT }, "Database connected and server running");
    });
  })
  .catch((error) => {
    logger.error({ err: error }, "Database connection failed");
    process.exit(1);
  });

const shutdown = (signal) => {
  logger.info({ signal }, "Shutting down");

  if (!server) {
    process.exit(0);
  }

  server.close(async () => {
    try {
      await connection.close();
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, "Shutdown failed");
      process.exit(1);
    }
  });

  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled rejection");
});
process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught exception");
  process.exit(1);
});
