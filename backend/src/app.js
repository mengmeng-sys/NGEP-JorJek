<<<<<<< Updated upstream
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { authRouter } = require("./routes/auth.routes");
const { microsoftAuthRouter } = require("./routes/microsoftAuth.routes");
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
const { errorHandler } = require("./middleware/errorHandler");
const { logger } = require("./middleware/logger.middleware");
const { swaggerSpec } = require("./config/swagger");
const { env } = require("./config/env");

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: |
 *       Returns an ok:true payload when the server is up. Used by uptime monitors and the frontend.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    microsoftAuth: Boolean(env.microsoftClientId),
  })
);

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Session booking (Phase 2 — not implemented)
 *     description: |
 *       Placeholder for the Phase 2 mentoring-session feature. Mounted at `/sessions/*`,
 *       deliberately returns `501 Not Implemented` for the Sep 17 demo. See `JorJek_Project_Scope.pdf, Section 4`.
 *     tags: [Sessions]
 *     responses:
 *       501:
 *         description: Not implemented yet (Phase 2)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Session booking is Phase 2 and is not implemented yet.
 *                 seeAlso:
 *                   type: string
 *                   example: "JorJek_Project_Scope.pdf, Section 4"
 */
app.use("/sessions", sessionsRouter); // Phase 2 stub — see routes/sessions.routes.js

app.use("/auth", authRouter);
app.use("/auth/microsoft", microsoftAuthRouter);
app.use("/posts", postsRouter);
app.use("/", commentsRouter); // mounts /posts/:postId/comments
app.use("/", votesRouter); // mounts /vote
app.use("/tags", tagsRouter);
app.use("/notifications", notificationsRouter);
app.use("/search", searchRouter);
app.use("/reports", reportsRouter);
app.use("/users", usersRouter);
app.use("/saved", savedRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

module.exports = { app };
=======
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { authRouter } = require("./routes/auth.routes");
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
const { errorHandler } = require("./middleware/errorHandler");
const { logger } = require("./middleware/logger.middleware");
const { swaggerSpec } = require("./config/swagger");

const app = express();

const ALLOWED_ORIGINS = [
  "https://jorjek-frontend.onrender.com",
  "http://localhost:5173",
  // vite.config.js pins this project's dev server to port 3000 (not Vite's
  // 5173 default), so that origin has to be allow-listed explicitly too.
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
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
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: |
 *       Returns an ok:true payload when the server is up. Used by uptime monitors and the frontend.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
app.get("/health", (_req, res) => res.json({ ok: true }));

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Session booking (Phase 2 — not implemented)
 *     description: |
 *       Placeholder for the Phase 2 mentoring-session feature. Mounted at `/sessions/*`,
 *       deliberately returns `501 Not Implemented` for the Sep 17 demo. See `JorJek_Project_Scope.pdf, Section 4`.
 *     tags: [Sessions]
 *     responses:
 *       501:
 *         description: Not implemented yet (Phase 2)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Session booking is Phase 2 and is not implemented yet.
 *                 seeAlso:
 *                   type: string
 *                   example: "JorJek_Project_Scope.pdf, Section 4"
 */
app.use("/sessions", sessionsRouter); // Phase 2 stub — see routes/sessions.routes.js

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/", commentsRouter); // mounts /posts/:postId/comments
app.use("/", votesRouter); // mounts /vote
app.use("/tags", tagsRouter);
app.use("/notifications", notificationsRouter);
app.use("/search", searchRouter);
app.use("/reports", reportsRouter);
app.use("/users", usersRouter);
app.use("/saved", savedRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

module.exports = { app };
>>>>>>> Stashed changes
