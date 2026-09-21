const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { authRouter } = require("./routes/auth.routes");
const { microsoftAuthRouter } = require("./routes/microsoftAuth.routes");
const { mfaRouter } = require("./routes/mfa.routes");
const { postsRouter } = require("./routes/posts.routes");
const { commentsRouter } = require("./routes/comments.routes");
const { votesRouter } = require("./routes/votes.routes");
const { tagsRouter } = require("./routes/tags.routes");
const { notificationsRouter } = require("./routes/notifications.routes");
const { searchRouter } = require("./routes/search.routes");
const { reportsRouter } = require("./routes/reports.routes");
const { usersRouter } = require("./routes/users.routes");
const { savedRouter } = require("./routes/saved.routes");
const { sessionsRouter } = require("./routes/sessions.routes");
const { adminRouter } = require("./routes/admin.routes");
const { uploadsRouter } = require("./routes/uploads.routes");
const { errorHandler } = require("./middleware/errorHandler");
const { logger } = require("./middleware/logger.middleware");
const { swaggerSpec } = require("./config/swagger");
const { env } = require("./config/env");
const {
  authLimiter,
  signupLimiter,
  searchLimiter,
  uploadLimiter,
  generalLimiter,
} = require("./middleware/rateLimit.middleware");

const app = express();

const ALLOWED_ORIGINS = [
  "https://jorjek-frontend.onrender.com",
  "https://ngep-jor-jek.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    const allowed =
      !origin ||
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin);
    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed =
    !origin ||
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/.*\.vercel\.app$/.test(origin);
  if (allowed) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type", "Authorization");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());
app.use(logger);

app.use(generalLimiter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    microsoftAuth: Boolean(env.microsoftClientId),
  })
);

app.use("/sessions", sessionsRouter);
app.use("/auth", authLimiter, authRouter);
app.use("/auth/microsoft", authLimiter, microsoftAuthRouter);
app.use("/auth/mfa", authLimiter, mfaRouter);
app.use("/posts", postsRouter);
app.use("/", commentsRouter);
app.use("/", votesRouter);
app.use("/tags", tagsRouter);
app.use("/notifications", notificationsRouter);
app.use("/search", searchLimiter, searchRouter);
app.use("/reports", reportsRouter);
app.use("/users", usersRouter);
app.use("/saved", savedRouter);
app.use("/uploads", uploadLimiter, uploadsRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

module.exports = { app, ALLOWED_ORIGINS };
