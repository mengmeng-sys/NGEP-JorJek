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
const { sessionsRouter } = require("./routes/sessions.routes");
const { errorHandler } = require("./middleware/errorHandler");
const { logger } = require("./middleware/logger.middleware");
const { swaggerSpec } = require("./config/swagger");

const app = express();

app.use(cors());
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

app.use(errorHandler);

module.exports = { app };
