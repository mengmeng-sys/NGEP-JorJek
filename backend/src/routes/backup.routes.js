const { Router } = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const {
  createBackup,
  listBackups,
  deleteBackup,
  restoreBackup,
} = require("../services/backup.service");
const {
  getStatus,
  getMigrationSql,
  recordMigration,
} = require("../services/migration.service");

const backupRouter = Router();

backupRouter.use(requireAuth, requireRole("SUPER_ADMIN"));

backupRouter.post("/backup", async (_req, res, next) => {
  try {
    const result = await createBackup();
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

backupRouter.get("/backups", async (_req, res, next) => {
  try {
    const backups = await listBackups();
    res.json({ backups });
  } catch (err) {
    next(err);
  }
});

backupRouter.delete("/backups/:name", async (req, res, next) => {
  try {
    const name = decodeURIComponent(req.params.name);
    await deleteBackup(name);
    res.json({ ok: true, deleted: name });
  } catch (err) {
    next(err);
  }
});

backupRouter.post("/backups/:name/restore", async (req, res, next) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const safety = await createBackup();
    const result = await restoreBackup(name);
    res.json({ ok: true, safetyBackup: safety.name, ...result });
  } catch (err) {
    next(err);
  }
});

backupRouter.get("/migrations", async (_req, res, next) => {
  try {
    const result = await getStatus();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

backupRouter.get("/migrations/:name/sql", async (req, res, next) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const sql = getMigrationSql(name);
    res.json({ name, sql });
  } catch (err) {
    next(err);
  }
});

backupRouter.post("/migrations/:name/apply", async (req, res, next) => {
  try {
    const name = decodeURIComponent(req.params.name);
    getMigrationSql(name);
    await recordMigration(name);
    res.json({ ok: true, applied: name });
  } catch (err) {
    next(err);
  }
});

module.exports = { backupRouter };
