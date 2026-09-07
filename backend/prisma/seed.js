// Seed script for the JorJek Admin Dashboard (SRS v1.0.0).
// Creates the initial SUPER_ADMIN / MODERATOR accounts plus enough sample
// data for every dashboard module to be demo-able: user directory with mixed
// account standings, a pending moderation queue, mentor applications, active
// sessions, and tags.
//
// Run with: npx prisma db seed   (or manually: node prisma/seed.js)
// Passwords: all seeded accounts use "password123".

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@cadt.edu.kh";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "password123";

async function upsertUser({ cadtEmail, displayName, role, status, isMentor, karma = 0 }) {
  const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD ?? ADMIN_PASSWORD, 10);
  return prisma.user.upsert({
    where: { cadtEmail },
    update: { role, status, isMentor, karma },
    create: { cadtEmail, displayName, passwordHash, role, status, isMentor, karma },
  });
}

async function main() {
  console.log(`Seeding with admin account ${ADMIN_EMAIL}`);

  const admin = await upsertUser({
    cadtEmail: ADMIN_EMAIL,
    displayName: "System Administrator",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    isMentor: false,
  });
  const moderator = await upsertUser({
    cadtEmail: "mod@cadt.edu.kh",
    displayName: "Malis Neak",
    role: "MODERATOR",
    status: "ACTIVE",
    isMentor: false,
  });

  const prof = await upsertUser({
    cadtEmail: "dr.vichara@cadt.edu.kh",
    displayName: "Dr. Vichara Eng",
    role: "PROFESSOR",
    status: "ACTIVE",
    isMentor: true,
    karma: 42,
  });
  const prof2 = await upsertUser({
    cadtEmail: "dr.sopheap@cadt.edu.kh",
    displayName: "Dr. Sopheap Chan",
    role: "PROFESSOR",
    status: "ACTIVE",
    isMentor: true,
    karma: 27,
  });

  const studKwame = await upsertUser({
    cadtEmail: "kwame@student.cadt.edu.kh",
    displayName: "Kwame Mensah",
    role: "STUDENT",
    status: "ACTIVE",
    isMentor: true,
    karma: 18,
  });
  const studRada = await upsertUser({
    cadtEmail: "rada.sok@student.cadt.edu.kh",
    displayName: "Rada Sok",
    role: "STUDENT",
    status: "ACTIVE",
    isMentor: false,
    karma: 9,
  });
  const suspended = await upsertUser({
    cadtEmail: "pheaktra@student.cadt.edu.kh",
    displayName: "Pheaktra Nop",
    role: "STUDENT",
    status: "SUSPENDED",
    isMentor: false,
    karma: 3,
  });
  await prisma.user.update({
    where: { cadtEmail: "pheaktra@student.cadt.edu.kh" },
    data: { suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  const banned = await upsertUser({
    cadtEmail: "spam.user@student.cadt.edu.kh",
    displayName: "Spam Merchant",
    role: "STUDENT",
    status: "BANNED",
    isMentor: false,
    karma: 0,
  });

  // Tags & Taxonomy — skill tags + a featured banner topic (SRS 4).
  const tags = {};
  for (const [name, featured] of [
    ["C++", true],
    ["SQL", false],
    ["JavaScript", true],
    ["Data Structures", false],
  ]) {
    tags[name] = await prisma.tag.upsert({
      where: { name },
      update: { featured },
      create: { name, featured },
    });
  }

  // Posts — one of them gets flagged by a report later.
  const seedPosts = [
    {
      key: "three-way-join",
      authorId: studKwame.id,
      type: "QUESTION",
      title: "Joining three tables in Postgres",
      body: "I'm stuck on joining three tables, can we do a quick review? Something about orders, line_items and products.",
      tagNames: ["SQL"],
    },
    {
      key: "cxx-raii",
      authorId: prof.id,
      type: "RESOURCE",
      title: "C++ RAII cheat sheet",
      body: "A quick reference on smart pointers, ownership and move semantics for students.",
      tagNames: ["C++"],
    },
    {
      key: "shiny-bootcamp",
      authorId: banned.id,
      type: "RESOURCE",
      title: "PAID: SQL Bootcamp at 50% off - DMs open",
      body: "DM me for unapproved commercial spots. Buy my course, 3x your salary.",
      tagNames: ["SQL"],
    },
  ];

  const postIds = {};
  for (const p of seedPosts) {
    const existing = await prisma.post.findFirst({ where: { title: p.title } });
    if (existing) {
      postIds[p.key] = existing.id;
      continue;
    }
    const post = await prisma.post.create({
      data: {
        authorId: p.authorId,
        type: p.type,
        title: p.title,
        body: p.body,
        tags: {
          create: p.tagNames.map((name) => ({ tag: { connect: { id: tags[name].id } } })),
        },
      },
    });
    postIds[p.key] = post.id;
  }

  // Comments — a threaded reply that also gets reported.
  const commentOnJoin = await prisma.comment.findFirst({
    where: { postId: postIds["three-way-join"], authorId: studRada.id },
  });
  const joinComment =
    commentOnJoin ??
    (await prisma.comment.create({
      data: {
        postId: postIds["three-way-join"],
        authorId: studRada.id,
        body: "I went through this last week — happy to walk you through it over a session.",
      },
    }));

  // Votes to produce some karma distribution.
  const votePairs = [
    [studKwame.id, postIds["cxx-raii"], "post"],
    [studRada.id, postIds["cxx-raii"], "post"],
    [prof.id, postIds["three-way-join"], "post"],
    [suspended.id, postIds["three-way-join"], "post"],
    [prof.id, joinComment.id, "comment"],
  ];
  for (const [userId, targetId, kind] of votePairs) {
    if (kind === "comment") {
      await prisma.vote.upsert({
        where: { userId_commentId: { userId, commentId: targetId } },
        update: { value: "UP" },
        create: { userId, commentId: targetId, value: "UP" },
      });
    } else {
      await prisma.vote.upsert({
        where: { userId_postId: { userId, postId: targetId } },
        update: { value: "UP" },
        create: { userId, postId: targetId, value: "UP" },
      });
    }
  }

  // Moderation queue (SRS 3.1): pending reports on posts and comments.
  const reportSpecs = [
    {
      reporterId: studKwame.id,
      targetUserId: banned.id,
      postId: postIds["shiny-bootcamp"],
      reason: "Off-topic solicitation / non-academic spam",
    },
    {
      reporterId: prof.id,
      targetUserId: banned.id,
      postId: postIds["shiny-bootcamp"],
      reason: "Unapproved commercial promotion (Community Rule #4)",
    },
    {
      reporterId: prof2.id,
      targetUserId: studKwame.id,
      commentId: joinComment.id,
      reason: "Soliciting paid sessions off-platform",
    },
  ];
  for (const r of reportSpecs) {
    const count = await prisma.report.count({
      where: { postId: r.postId ?? undefined, commentId: r.commentId ?? undefined, status: "PENDING" },
    });
    if (count > 0) continue;
    await prisma.report.create({ data: { ...r } });
  }

  // Mentor verification pipeline (SRS 2.3).
  const mentorSpecs = [
    {
      user: studKwame,
      department: "Computer Science (Year 3)",
      credentialSummary: "Verified transcript on file; TA for CS201.",
      claimedTags: ["SQL", "JavaScript"],
    },
    {
      user: studRada,
      department: "Software Engineering (Year 4)",
      credentialSummary: "Certified Meta Front-End Developer; portfolio reviewed.",
      claimedTags: ["JavaScript", "C++"],
    },
  ];
  for (const m of mentorSpecs) {
    const exists = await prisma.mentorApplication.findFirst({
      where: { userId: m.user.id, status: "PENDING" },
    });
    if (exists) continue;
    await prisma.mentorApplication.create({
      data: {
        userId: m.user.id,
        department: m.department,
        credentialSummary: m.credentialSummary,
        claimedTags: m.claimedTags,
      },
    });
  }

  // Session compliance data (SRS 2.3): active + cancelled sessions.
  const sessionSpecs = [
    {
      requesterId: studRada.id,
      mentorId: prof.id,
      postId: postIds["three-way-join"],
      meetingLink: "https://meet.google.com/jor-jek001",
      status: "ACCEPTED",
      proposedTimes: ["2026-09-08T10:00:00Z"],
    },
    {
      requesterId: studKwame.id,
      mentorId: prof2.id,
      postId: postIds["cxx-raii"],
      meetingLink: "https://meet.google.com/jor-jek002",
      status: "CANCELLED",
      cancelledAt: new Date("2026-09-02T12:00:00Z"),
      cancelReason: "Mentor unavailable — rescheduled to next week",
      proposedTimes: ["2026-09-05T14:00:00Z"],
    },
    {
      requesterId: suspended.id,
      mentorId: prof.id,
      postId: postIds["three-way-join"],
      meetingLink: null,
      status: "PENDING",
      proposedTimes: ["2026-09-10T09:00:00Z"],
    },
  ];
  for (const s of sessionSpecs) {
    const exists = await prisma.sessionRequest.findFirst({
      where: { requesterId: s.requesterId, mentorId: s.mentorId, status: s.status },
    });
    if (exists) continue;
    await prisma.sessionRequest.create({
      data: {
        requesterId: s.requesterId,
        mentorId: s.mentorId,
        postId: s.postId ?? undefined,
        proposedTimes: { time: s.proposedTimes },
        meetingLink: s.meetingLink,
        status: s.status,
        cancelledAt: s.cancelledAt ?? undefined,
        cancelReason: s.cancelReason,
      },
    });
  }

  // Enforcement audit trail for the User Directory.
  const banLogCount = await prisma.moderationAction.count({
    where: { targetUserId: banned.id, type: "BAN" },
  });
  if (banLogCount === 0) {
    await prisma.moderationAction.create({
      data: {
        adminId: admin.id,
        targetUserId: banned.id,
        type: "BAN",
        reason: "Permanent ban. Unapproved commercial promotion (Community Rule #4).",
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login:  ${ADMIN_EMAIL} / ${process.env.SEED_PASSWORD ?? ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());