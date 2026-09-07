const { Router } = require("express");
const { prisma } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { notify } = require("../services/notification.service");

// Owner: TN1/DB — the JorJek Admin Dashboard (SRS v1.0.0). All routes are
// mounted under /api/admin in src/app.js and guarded by RBAC so only
// SUPER_ADMIN / MODERATOR accounts can reach them (SRS 2.1).
//
// Reference schemas from the SRS:
//   GET  /api/admin/reports            -> SRS 3.1 moderation queue shape
//   POST /api/admin/users/:id/action   -> SRS 3.2 user enforcement shape
// Sidebar nav architecture it serves (SRS 4):
//   Overview / Metrics, User Directory, Moderation Feed,
//   Mentor Pipeline, Tags & Topics.

// Human-readable community rules referenced by rule-enforcement warnings.
const COMMUNITY_RULES = {
  "Rule 1": "Be Respectful",
  "Rule 2": "Stay On-Topic",
  "Rule 3": "No Spam",
  "Rule 4": "No Unapproved Promotion",
};

function communityRuleLabel(rule) {
  return `${rule}: ${COMMUNITY_RULES[rule] ?? rule}`;
}

const adminRouter = Router();

// Every admin route requires a valid session AND a management role.
adminRouter.use(requireAuth, requireRole("SUPER_ADMIN", "MODERATOR"));

// ─── Overview / Metrics (SRS 4 sidebar) ───────────────────────────────────
adminRouter.get("/overview", async (_req, res, next) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      pendingReports,
      pendingMentors,
      byStatus,
      byRole,
      karmaTop,
      sessionThroughput,
      recentReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.mentorApplication.count({ where: { status: "PENDING" } }),
      prisma.user.groupBy({ by: ["status"], _count: true }),
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.user.findMany({
        orderBy: { karma: "desc" },
        take: 5,
        select: { id: true, displayName: true, karma: true },
      }),
      prisma.sessionRequest.groupBy({ by: ["status"], _count: true }),
      prisma.report.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { post: true, comment: true, targetUser: true },
      }),
    ]);

    res.json({
      totals: {
        users: totalUsers,
        posts: totalPosts,
        comments: totalComments,
        reportsPending: pendingReports,
        mentorsPending: pendingMentors,
      },
      accountStanding: {
        active: 0,
        suspended: 0,
        banned: 0,
        ...Object.fromEntries(byStatus.map((s) => [s.status.toLowerCase(), s._count])),
      },
      roles: {
        super_admin: 0,
        moderator: 0,
        professor: 0,
        student: 0,
        ...Object.fromEntries(byRole.map((r) => [r.role.toLowerCase(), r._count])),
      },
      karmaTop,
      sessionThroughput: Object.fromEntries(
        sessionThroughput.map((s) => [s.status.toLowerCase(), s._count]),
      ),
      recentReports,
    });
  } catch (err) {
    next(err);
  }
});

// ─── User Directory (SRS 2.1) ─────────────────────────────────────────────
// Filterable by role, account standing (ACTIVE/SUSPENDED/BANNED), and
// university domain search.
adminRouter.get("/users", async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const where = {
      ...(["SUPER_ADMIN", "MODERATOR", "PROFESSOR", "STUDENT"].includes(role) ? { role } : {}),
      ...(["ACTIVE", "SUSPENDED", "BANNED"].includes(status) ? { status } : {}),
      ...(search
        ? {
            OR: [
              { displayName: { contains: String(search), mode: "insensitive" } },
              { cadtEmail: { contains: String(search), mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        cadtEmail: true,
        displayName: true,
        role: true,
        karma: true,
        status: true,
        suspendedUntil: true,
        isMentor: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// Enforcement history + karma log for one user (SRS 2.1 "inspect karma logs").
adminRouter.get("/users/:id/actions", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, displayName: true, cadtEmail: true, karma: true, status: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const actions = await prisma.moderationAction.findMany({
      where: { targetUserId: id },
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { id: true, displayName: true } } },
      take: 50,
    });

    res.json({ user, actions });
  } catch (err) {
    next(err);
  }
});

// User enforcement action (SRS 3.2):
//   POST /api/admin/users/:id/action
//   { "action": "suspend", "duration_days": 7, "reason": "..." }
// Supports timed suspensions (1/7/30 days), permanent bans, and restore.
adminRouter.post("/users/:id/action", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, duration_days: durationDays, reason } = req.body;
    const admin = req.admin;

    if (!["suspend", "ban", "restore"].includes(action)) {
      return res.status(400).json({ error: "action must be one of: suspend, ban, restore" });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "A mandatory moderator note (reason) is required" });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (admin.id === target.id) {
      return res.status(400).json({ error: "You cannot take enforcement action on yourself" });
    }

    let data = {};
    let actionType = action === "suspend" ? "SUSPEND" : action === "ban" ? "BAN" : "RESTORE";
    let note = null;

    if (action === "suspend") {
      const days = Number(durationDays ?? 7);
      if (!Number.isInteger(days) || days <= 0) {
        return res.status(400).json({ error: "duration_days must be a positive number of days" });
      }
      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      data = { status: "SUSPENDED", suspendedUntil: until };
      note = `Suspended for ${days} day(s). ${reason}`;
      await notify(target.id, "account_suspended", {
        durationDays: days,
        suspendedUntil: until.toISOString(),
        reason,
        rule: reason,
      });
    } else if (action === "ban") {
      data = { status: "BANNED", suspendedUntil: null };
      note = `Permanent ban. ${reason}`;
      await notify(target.id, "account_banned", { reason });
    } else {
      data = { status: "ACTIVE", suspendedUntil: null };
      note = `Account restored. ${reason}`;
      await notify(target.id, "account_restored", { reason });
    }

    await prisma.user.update({ where: { id: target.id }, data });
    await prisma.moderationAction.create({
      data: {
        adminId: admin.id,
        targetUserId: target.id,
        type: actionType,
        durationDays: action === "suspend" ? Number(durationDays) : null,
        reason: note,
      },
    });

    res.json({
      user: { id: target.id, status: data.status, suspendedUntil: data.suspendedUntil ?? null },
      action: { type: actionType, reason: note },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Content Moderation Feed (SRS 2.2, 3.1) ───────────────────────────────
// Returns the exact report shape from SRS 3.1, with a target snapshot.
adminRouter.get("/reports", async (req, res, next) => {
  try {
    const { status } = req.query;
    const reports = await prisma.report.findMany({
      where: status === "pending" || status === "approved" || status === "dismissed" || status === "warned"
        ? { status: status.toUpperCase() }
        : undefined,
      include: {
        reporter: { select: { id: true, displayName: true, cadtEmail: true } },
        targetUser: { select: { id: true, displayName: true, cadtEmail: true } },
        post: { select: { id: true, title: true, body: true, deletedAt: true } },
        comment: { select: { id: true, body: true, deletedAt: true } },
        resolvedBy: { select: { id: true, displayName: true } },
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { createdAt: "desc" },
      ],
    });

    res.json({
      reports: reports.map((r) => {
        const isComment = Boolean(r.comment);
        const target = isComment ? r.comment : r.post;
        return {
          id: r.id,
          target_type: isComment ? "comment" : "post",
          target_id: target.id,
          author: {
            id: r.targetUser?.id ?? null,
            name: r.targetUser?.displayName ?? "Unknown",
            email: r.targetUser?.cadtEmail ?? null,
          },
          snippet: isComment ? target.body : target.body ?? `${target.title}\n${target.body}`,
          reason: r.reason,
          status: r.status.toLowerCase(),
          created_at: r.createdAt.toISOString(),
          reporter: { name: r.reporter.displayName, email: r.reporter.cadtEmail },
          moderation_note: r.moderationNote,
          resolved_by: r.resolvedBy?.displayName ?? null,
          resolved_at: r.resolvedAt?.toISOString() ?? null,
          flagged_deleted: Boolean(target.deletedAt),
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// Triage workflow (SRS 2.2): dismiss | soft_delete | warn
adminRouter.post("/reports/:id/action", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, moderationNote, rule } = req.body;
    const admin = req.admin;

    if (!["dismiss", "soft_delete", "warn"].includes(action)) {
      return res.status(400).json({ error: "action must be one of: dismiss, soft_delete, warn" });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        post: { include: { author: { select: { id: true, displayName: true } } } },
        comment: { include: { author: { select: { id: true, displayName: true } } } },
      },
    });
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.status !== "PENDING") {
      return res.status(400).json({ error: "Report already resolved" });
    }

    const target = report.comment ?? report.post;
    const author = report.comment ? report.comment.author : report.post.author;
    const targetType = report.commentId ? "comment" : "post";

    let result = { action, moderationNote };
    let reportStatus;
    let warningNote = null;

    if (action === "dismiss") {
      // Approve / Dismiss — removes the report flag, marks content reviewed.
      reportStatus = "DISMISSED";
      result.label = "Dismissed — content remains visible.";
    } else if (action === "soft_delete") {
      // Soft delete — hides from the feed while archiving for admin audit.
      if (targetType === "comment") {
        await prisma.comment.update({ where: { id: report.commentId }, data: { deletedAt: new Date() } });
      } else {
        await prisma.post.update({ where: { id: report.postId }, data: { deletedAt: new Date() } });
      }
      reportStatus = "APPROVED";
      result.label = "Soft deleted — hidden from the feed, kept for audits.";
      await notify(author.id, "moderation_action", {
        targetType,
        action: "soft_delete",
        reason: moderationNote ?? report.reason,
      });
    } else {
      // Rule enforcement — sends a targeted warning citing a Community Rule.
      reportStatus = "WARNED";
      const ruleKey = Object.keys(COMMUNITY_RULES).find((k) => rule?.includes(k)) ?? "Rule 1";
      warningNote = communityRuleLabel(ruleKey);
      await notify(author.id, "moderation_warning", {
        targetType,
        rule: ruleKey,
        label: warningNote,
        reason: moderationNote ?? report.reason,
      });
      result.label = `Warning sent — ${warningNote}.`;
    }

    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: reportStatus,
        moderationNote: moderationNote ?? null,
        resolvedAt: new Date(),
        resolvedById: admin.id,
      },
    });

    res.json({
      report_id: report.id,
      status: reportStatus.toLowerCase(),
      target_type: targetType,
      target_id: target.id,
      label: result.label,
      rule: warningNote,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Mentor Verification Pipeline (SRS 2.3) ───────────────────────────────
adminRouter.get("/mentors", async (_req, res, next) => {
  try {
    const applications = await prisma.mentorApplication.findMany({
      include: {
        user: { select: { id: true, displayName: true, cadtEmail: true, role: true, isMentor: true, karma: true } },
        reviewedBy: { select: { id: true, displayName: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    applications.sort(
      (a, b) =>
        (a.status === "PENDING" ? 0 : 1) - (b.status === "PENDING" ? 0 : 1) ||
        new Date(b.createdAt) - new Date(a.createdAt),
    );

    // The enum is sorted alphabetically by the DB (APPROVED < DISMISSED <
    // PENDING < WARNED), but the triage queue should lead with PENDING
    // (handled by the JS sort above).

    res.json({
      applications: applications.map((a) => ({
        id: a.id,
        applicant: a.user,
        department: a.department,
        credential_summary: a.credentialSummary,
        claimed_tags: a.claimedTags,
        status: a.status.toLowerCase(),
        review_note: a.reviewNote,
        reviewed_by: a.reviewedBy?.displayName ?? null,
        reviewed_at: a.reviewedAt?.toISOString() ?? null,
        created_at: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Verification review — approve by verifying credentials/departments/skill
// tags (SRS 2.3), or reject with a note.
adminRouter.post("/mentors/:id/action", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;
    const admin = req.admin;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "action must be one of: approve, reject" });
    }

    const application = await prisma.mentorApplication.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!application) return res.status(404).json({ error: "Mentor application not found" });
    if (application.status !== "PENDING") {
      return res.status(400).json({ error: "Application already reviewed" });
    }

    const status = action === "approve" ? "APPROVED" : "REJECTED";
    await prisma.mentorApplication.update({
      where: { id },
      data: { status, reviewNote: note ?? null, reviewedAt: new Date(), reviewedById: admin.id },
    });

    if (action === "approve") {
      await prisma.user.update({ where: { id: application.userId }, data: { isMentor: true } });
    }

    await notify(application.userId, "mentor_application", {
      status: status.toLowerCase(),
      department: application.department,
      claimedTags: application.claimedTags,
      note: note ?? null,
    });

    res.json({
      application_id: application.id,
      status: status.toLowerCase(),
      mentor: action === "approve" ? { id: application.userId, isMentor: true } : null,
    });
  } catch (err) {
    next(err);
  }
});

// Session compliance — monitors live meeting links, capacity limits, and
// cancellation logs (SRS 2.3). Sessions are Phase 2: read-only here.
adminRouter.get("/sessions", async (_req, res, next) => {
  try {
    const sessions = await prisma.sessionRequest.findMany({
      include: {
        requester: { select: { id: true, displayName: true, cadtEmail: true } },
        mentor: { select: { id: true, displayName: true, cadtEmail: true } },
        post: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const acceptedByMentor = await prisma.sessionRequest.groupBy({
      by: ["mentorId"],
      where: { status: "ACCEPTED" },
      _count: true,
    });
    const enrolledByMentor = Object.fromEntries(
      acceptedByMentor.map((m) => [m.mentorId, m._count]),
    );

    res.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        requester: s.requester.displayName,
        requester_id: s.requester.id,
        mentor: s.mentor.displayName,
        mentor_id: s.mentor.id,
        topic: s.post?.title ?? null,
        meeting_link: s.meetingLink,
        status: s.status.toLowerCase(),
        capacity: {
          enrolled: enrolledByMentor[s.mentorId] ?? 0,
          max: s.maxStudents,
        },
        cancelled_at: s.cancelledAt?.toISOString() ?? null,
        cancel_reason: s.cancelReason,
        proposed_times: s.proposedTimes,
        created_at: s.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── Tags & Taxonomy (SRS 4) ──────────────────────────────────────────────
// Category CRUD + featured banner-topic settings for the left-sidebar promo.
adminRouter.post("/tags", async (req, res, next) => {
  try {
    const { name, featured } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Tag name is required" });
    }
    const tag = await prisma.tag.upsert({
      where: { name: name.trim() },
      update: { featured: Boolean(featured) },
      create: { name: name.trim(), featured: Boolean(featured) },
    });
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/tags/:id", async (req, res, next) => {
  try {
    const { name, featured } = req.body;
    const found = await prisma.tag.findUnique({ where: { id: req.params.id } });
    if (!found) return res.status(404).json({ error: "Tag not found" });
    const tag = await prisma.tag.update({
      where: { id: req.params.id },
      data: {
        ...(name && name.trim() ? { name: name.trim() } : {}),
        ...(typeof featured === "boolean" ? { featured } : {}),
      },
    });
    res.json(tag);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/tags/:id", async (req, res, next) => {
  try {
    const found = await prisma.tag.findUnique({ where: { id: req.params.id } });
    if (!found) return res.status(404).json({ error: "Tag not found" });
    // Remove follow + post join rows first so no orphans remain.
    await prisma.$transaction([
      prisma.tagFollow.deleteMany({ where: { tagId: found.id } }),
      prisma.postTag.deleteMany({ where: { tagId: found.id } }),
      prisma.tag.delete({ where: { id: found.id } }),
    ]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { adminRouter, COMMUNITY_RULES };