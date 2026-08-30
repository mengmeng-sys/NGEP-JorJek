const express = require("express");
const cors = require("cors");
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

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/", commentsRouter); // mounts /posts/:postId/comments
app.use("/", votesRouter); // mounts /vote
app.use("/tags", tagsRouter);
app.use("/notifications", notificationsRouter);
app.use("/search", searchRouter);
app.use("/reports", reportsRouter);
app.use("/users", usersRouter);
app.use("/sessions", sessionsRouter); // Phase 2 stub — see routes/sessions.routes.js

app.use(errorHandler);

module.exports = { app };
