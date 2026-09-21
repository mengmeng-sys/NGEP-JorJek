const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { notify } = require("../services/notification.service");

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

adminRouter.use(requireAuth, requireRole("SUPER_ADMIN", "MODERATOR"));

// ─── Overview / Metrics ───────────────────────────────────────
adminRouter.get("/overview", async (_req, res, next) => {
  try {
    const [{ count: totalUsers }, { count: totalPosts }, { count: totalComments }, { count: pendingReports }, { count: pendingMentors }, { data: byStatus }, { data: byRole }, { data: karmaTop }, { data: sessionThroughput }, { data: recentReports }] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      supabase.from("mentor_applications").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      supabase.from("users").select("status"),
      supabase.from("users").select("role"),
      supabase.from("users").select("id,display_name,karma").order("karma", { ascending: false }).limit(5),
      supabase.from("mentoring_sessions").select("status"),
      supabase.from("reports").select("id,reason,created_at,target_user_id,status").eq("status", "PENDING").order("created_at", { ascending: false }).limit(5),
    ]);

    // NOTE: users.status/role are stored as uppercase enum strings (ACTIVE,
    // SUSPENDED, BANNED, SUPER_ADMIN, MODERATOR, PROFESSOR, STUDENT — see
    // seed.js and the check constraints in database.sql). Keeping these keys
    // uppercase, instead of lowercasing them, matches what the frontend
    // overview cards read (accountStanding.ACTIVE, roles.SUPER_ADMIN, etc.) —
    // the previous lowercase keys meant every lookup missed and fell back to
    // the `|| 0` default, so the cards always showed zero regardless of data.
    const statusCounts = { ACTIVE: 0, SUSPENDED: 0, BANNED: 0 };
    if (byStatus) byStatus.forEach((s) => {
      const key = s.status;
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });

    const roleCounts = { SUPER_ADMIN: 0, MODERATOR: 0, PROFESSOR: 0, STUDENT: 0 };
    if (byRole) byRole.forEach((r) => {
      const key = r.role;
      roleCounts[key] = (roleCounts[key] || 0) + 1;
    });

    const throughput = {};
    if (sessionThroughput) sessionThroughput.forEach((s) => {
      const key = s.status.toLowerCase();
      throughput[key] = (throughput[key] || 0) + 1;
    });

    const formattedReports = await Promise.all((recentReports || []).map(async (r) => {
      const { data: targetUser } = await supabase.from("users").select("id,display_name").eq("id", r.target_user_id).maybeSingle();
      return {
        id: r.id,
        reason: r.reason,
        createdAt: r.created_at,
        status: r.status,
        targetUser: targetUser ? { id: targetUser.id, displayName: targetUser.display_name } : null,
      };
    }));

    res.json({
      totals: {
        users: totalUsers,
        posts: totalPosts,
        comments: totalComments,
        reportsPending: pendingReports,
        mentorsPending: pendingMentors,
      },
      accountStanding: statusCounts,
      roles: roleCounts,
      karmaTop: (karmaTop || []).map((u) => ({ id: u.id, displayName: u.display_name, karma: u.karma })),
      sessionThroughput: throughput,
      recentReports: formattedReports,
    });
  } catch (err) {
    next(err);
  }
});

// ─── User Directory ────────────────────────────────────────────
adminRouter.get("/users", async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    let query = supabase.from("users").select("id,email,display_name,role,karma,status,suspended_until,is_mentor,created_at");

    if (["SUPER_ADMIN", "MODERATOR", "PROFESSOR", "STUDENT"].includes(role)) {
      query = query.eq("role", role);
    }
    if (["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
      query = query.eq("status", status);
    }
    if (search) {
      const term = String(search);
      query = query.or(`display_name.ilike.%${term}%,email.ilike.%${term}%`);
    }

    const { data: users, error } = await query.order("created_at", { ascending: false }).limit(100);
    if (error) throw error;

    const { data: postsCounts } = await supabase.from("posts").select("author_id");
    const { data: commentsCounts } = await supabase.from("comments").select("author_id");

    const postMap = {};
    const commentMap = {};
    if (postsCounts) postsCounts.forEach((p) => { postMap[p.author_id] = (postMap[p.author_id] || 0) + 1; });
    if (commentsCounts) commentsCounts.forEach((c) => { commentMap[c.author_id] = (commentMap[c.author_id] || 0) + 1; });

    res.json({
      users: (users || []).map((u) => ({
        ...u,
        _count: { posts: postMap[u.id] || 0, comments: commentMap[u.id] || 0 },
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── Enforcement history for one user ──────────────────────────
adminRouter.get("/users/:id/actions", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id,display_name,email,karma,status")
      .eq("id", id)
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) return res.status(404).json({ error: "User not found" });

    const { data: actions, error } = await supabase
      .from("moderation_actions")
      .select("id,type,duration_days,reason,created_at,admin_id")
      .eq("target_user_id", id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;

    res.json({ user, actions: actions || [] });
  } catch (err) {
    next(err);
  }
});

// ─── User enforcement action ───────────────────────────────────
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

    const { data: target, error: findErr } = await supabase
      .from("users")
      .select("id,display_name")
      .eq("id", id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!target) return res.status(404).json({ error: "User not found" });
    if (admin.id === target.id) {
      return res.status(400).json({ error: "You cannot take enforcement action on yourself" });
    }

    let updateData = {};
    let actionType = action === "suspend" ? "SUSPEND" : action === "ban" ? "BAN" : "RESTORE";
    let note = null;

    if (action === "suspend") {
      const days = Number(durationDays ?? 7);
      if (!Number.isInteger(days) || days <= 0) {
        return res.status(400).json({ error: "duration_days must be a positive number of days" });
      }
      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      updateData = { status: "SUSPENDED", suspended_until: until.toISOString() };
      note = `Suspended for ${days} day(s). ${reason}`;
      await notify(target.id, "account_suspended", { durationDays: days, suspendedUntil: until.toISOString(), reason });
    } else if (action === "ban") {
      updateData = { status: "BANNED", suspended_until: null };
      note = `Permanent ban. ${reason}`;
      await notify(target.id, "account_banned", { reason });
    } else {
      updateData = { status: "ACTIVE", suspended_until: null };
      note = `Account restored. ${reason}`;
      await notify(target.id, "account_restored", { reason });
    }

    const { error: updateErr } = await supabase.from("users").update(updateData).eq("id", id);
    if (updateErr) throw updateErr;

    const { error: actionErr } = await supabase.from("moderation_actions").insert({
      admin_id: admin.id,
      target_user_id: id,
      type: actionType,
      duration_days: action === "suspend" ? Number(durationDays) : null,
      reason: note,
    });
    if (actionErr) throw actionErr;

    res.json({
      user: { id, status: updateData.status, suspendedUntil: updateData.suspended_until ?? null },
      action: { type: actionType, reason: note },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Content Moderation Feed ───────────────────────────────────
adminRouter.get("/reports", async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from("reports")
      .select("id,post_id,comment_id,target_user_id,reporter_id,reason,status,moderation_note,resolved_at,resolved_by,created_at");

    if (status === "pending" || status === "approved" || status === "dismissed" || status === "warned") {
      query = query.eq("status", status.toUpperCase());
    }

    const { data: reports, error } = await query.order("created_at", { ascending: false }).limit(100);
    if (error) throw error;

    const enriched = await Promise.all((reports || []).map(async (r) => {
      const isComment = Boolean(r.comment_id);
      // NOTE: each destructured variable below (reporter, targetUser, post, comment,
      // resolvedBy) is already the *unwrapped* row from Supabase (or null) — do not
      // append another `.data` when reading from it (that was the bug: it silently
      // produced `undefined` for every field, since a plain row has no `.data`).
      const [{ data: reporter }, { data: targetUser }, { data: post }, { data: comment }, { data: resolvedBy }] = await Promise.all([
        supabase.from("users").select("id,display_name,email").eq("id", r.reporter_id).maybeSingle(),
        r.target_user_id ? supabase.from("users").select("id,display_name,email").eq("id", r.target_user_id).maybeSingle() : Promise.resolve({ data: null }),
        r.post_id ? supabase.from("posts").select("id,title,body").eq("id", r.post_id).maybeSingle() : Promise.resolve({ data: null }),
        r.comment_id ? supabase.from("comments").select("id,body").eq("id", r.comment_id).maybeSingle() : Promise.resolve({ data: null }),
        r.resolved_by ? supabase.from("users").select("id,display_name").eq("id", r.resolved_by).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      const target = isComment ? comment : post;
      return {
        id: r.id,
        target_type: isComment ? "comment" : "post",
        target_id: target?.id,
        author: { id: targetUser?.id ?? null, name: targetUser?.display_name ?? "Unknown", email: targetUser?.email ?? null },
        snippet: isComment ? comment?.body : post?.body ?? post?.title ?? "",
        reason: r.reason,
        status: r.status.toLowerCase(),
        created_at: r.created_at,
        reporter: { name: reporter?.display_name ?? "Unknown", email: reporter?.email ?? null },
        moderation_note: r.moderation_note,
        resolved_by: resolvedBy?.display_name ?? null,
        resolved_at: r.resolved_at,
        flagged_deleted: false,
      };
    }));

    res.json({ reports: enriched });
  } catch (err) {
    next(err);
  }
});

// ─── Triage workflow ───────────────────────────────────────────
adminRouter.post("/reports/:id/action", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, moderationNote, rule } = req.body;
    const admin = req.admin;

    if (!["dismiss", "soft_delete", "warn"].includes(action)) {
      return res.status(400).json({ error: "action must be one of: dismiss, soft_delete, warn" });
    }

    const { data: report, error: findErr } = await supabase
      .from("reports")
      .select("id,post_id,comment_id,reason,status")
      .eq("id", id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.status !== "PENDING") {
      return res.status(400).json({ error: "Report already resolved" });
    }

    let reportStatus;
    let warningNote = null;

    if (action === "dismiss") {
      reportStatus = "DISMISSED";
    } else if (action === "soft_delete") {
      const deleteField = report.comment_id ? "comments" : "posts";
      const deleteId = report.comment_id || report.post_id;
      await supabase.from(deleteField).update({ deleted_at: new Date().toISOString() }).eq("id", deleteId);
      reportStatus = "APPROVED";
    } else {
      reportStatus = "WARNED";
      const ruleKey = Object.keys(COMMUNITY_RULES).find((k) => rule?.includes(k)) ?? "Rule 1";
      warningNote = communityRuleLabel(ruleKey);
    }

    const { error: updateErr } = await supabase
      .from("reports")
      .update({ status: reportStatus, moderation_note: moderationNote || null, resolved_at: new Date().toISOString(), resolved_by: admin.id })
      .eq("id", id);
    if (updateErr) throw updateErr;

    res.json({
      report_id: id,
      status: reportStatus.toLowerCase(),
      target_type: report.comment_id ? "comment" : "post",
      target_id: report.comment_id || report.post_id,
      label: action === "dismiss" ? "Dismissed" : action === "soft_delete" ? "Soft deleted" : `Warning sent — ${warningNote}`,
      rule: warningNote,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Mentor Verification Pipeline ──────────────────────────────
adminRouter.get("/mentors", async (_req, res, next) => {
  try {
    const { data: applications, error } = await supabase
      .from("mentor_applications")
      .select("id,user_id,department,credential_summary,claimed_tags,status,review_note,reviewed_by,reviewed_at,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const enriched = await Promise.all((applications || []).map(async (a) => {
      // NOTE: `user` and `reviewedBy` are already the unwrapped rows (or null) —
      // see the same note in the /reports handler above.
      const [{ data: user }, { data: reviewedBy }] = await Promise.all([
        supabase.from("users").select("id,display_name,email,role,karma,is_mentor").eq("id", a.user_id).maybeSingle(),
        a.reviewed_by ? supabase.from("users").select("id,display_name").eq("id", a.reviewed_by).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      return {
        id: a.id,
        applicant: user,
        department: a.department,
        credential_summary: a.credential_summary,
        claimed_tags: a.claimed_tags || [],
        status: a.status.toLowerCase(),
        review_note: a.review_note,
        reviewed_by: reviewedBy?.display_name ?? null,
        reviewed_at: a.reviewed_at,
        created_at: a.created_at,
      };
    }));

    enriched.sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1));
    res.json({ applications: enriched });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/mentors/:id/action", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;
    const admin = req.admin;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "action must be one of: approve, reject" });
    }

    const { data: application, error: findErr } = await supabase
      .from("mentor_applications")
      .select("id,user_id,department,claimed_tags,status")
      .eq("id", id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!application) return res.status(404).json({ error: "Mentor application not found" });
    if (application.status !== "PENDING") {
      return res.status(400).json({ error: "Application already reviewed" });
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";
    const { error: updateErr } = await supabase
      .from("mentor_applications")
      .update({ status: newStatus, review_note: note || null, reviewed_at: new Date().toISOString(), reviewed_by: admin.id })
      .eq("id", id);
    if (updateErr) throw updateErr;

    if (action === "approve") {
      await supabase.from("users").update({ is_mentor: true }).eq("id", application.user_id);
    }

    await notify(application.user_id, "mentor_application", {
      status: newStatus.toLowerCase(),
      department: application.department,
      claimedTags: application.claimed_tags,
      note: note || null,
    });

    res.json({
      application_id: id,
      status: newStatus.toLowerCase(),
      mentor: action === "approve" ? { id: application.user_id, isMentor: true } : null,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Session compliance ────────────────────────────────────────
adminRouter.get("/sessions", async (_req, res, next) => {
  try {
    const { data: sessions, error } = await supabase
      .from("mentoring_sessions")
      .select("id,mentor_id,mentee_id,status,meeting_link,scheduled_at,created_at,cancelled_at,cancel_reason")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const enriched = await Promise.all((sessions || []).map(async (s) => {
      // NOTE: same unwrap note as above — `requester`/`mentor` are already rows.
      const [{ data: requester }, { data: mentor }] = await Promise.all([
        supabase.from("users").select("id,display_name").eq("id", s.mentee_id).maybeSingle(),
        supabase.from("users").select("id,display_name").eq("id", s.mentor_id).maybeSingle(),
      ]);
      return {
        id: s.id,
        requester: requester?.display_name ?? "Unknown",
        requester_id: s.mentee_id,
        mentor: mentor?.display_name ?? "Unknown",
        mentor_id: s.mentor_id,
        topic: null,
        meeting_link: s.meeting_link,
        status: s.status,
        capacity: { enrolled: 0, max: s.max_students || 3 },
        cancelled_at: s.cancelled_at,
        cancel_reason: s.cancel_reason,
        created_at: s.created_at,
      };
    }));

    res.json({ sessions: enriched });
  } catch (err) {
    next(err);
  }
});

// ─── Tags & Taxonomy ───────────────────────────────────────────
adminRouter.post("/tags", async (req, res, next) => {
  try {
    const { name, featured } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Tag name is required" });
    }
    const { data: existing } = await supabase.from("skill_tags").select("id").eq("name", name.trim()).maybeSingle();
    if (existing) {
      const { data: tag, error } = await supabase.from("skill_tags").update({ featured: Boolean(featured) }).eq("id", existing.id).select().single();
      if (error) throw error;
      return res.json(tag);
    }
    const { data: tag, error } = await supabase.from("skill_tags").insert({ name: name.trim(), featured: Boolean(featured) }).select().single();
    if (error) throw error;
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/tags/:id", async (req, res, next) => {
  try {
    const { name, featured } = req.body;
    const update = {};
    if (name && name.trim()) update.name = name.trim();
    if (typeof featured === "boolean") update.featured = featured;
    const { data: tag, error } = await supabase.from("skill_tags").update(update).eq("id", req.params.id).select().single();
    if (error) throw error;
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    res.json(tag);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/tags/:id", async (req, res, next) => {
  try {
    const { data: found } = await supabase.from("skill_tags").select("id").eq("id", req.params.id).maybeSingle();
    if (!found) return res.status(404).json({ error: "Tag not found" });
    await supabase.from("post_tags").delete().eq("tag_id", req.params.id);
    await supabase.from("tag_follows").delete().eq("tag_id", req.params.id);
    await supabase.from("skill_tags").delete().eq("id", req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { adminRouter };
