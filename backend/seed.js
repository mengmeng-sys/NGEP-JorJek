const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SEED_PASSWORD = process.env.SEED_PASSWORD;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@cadt.edu.kh";

if (!SEED_PASSWORD || SEED_PASSWORD.length < 12) {
  console.error("ERROR: SEED_PASSWORD env variable must be set and at least 12 characters long.");
  process.exit(1);
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function upsertUser({ email, display_name, role, status, is_mentor, karma = 0 }) {
  const password_hash = await bcrypt.hash(SEED_PASSWORD, 10);
  const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (existing) {
    await supabase.from("users").update({ role, status, is_mentor, karma }).eq("id", existing.id);
    return { id: existing.id, email };
  }
  const { data, error } = await supabase
    .from("users")
    .insert({ email, display_name, password_hash, role, status, is_mentor, karma, email_verified: true })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

async function findOrCreateTag(name, featured) {
  const slug = slugify(name);
  // Check by slug (case-insensitive) or by name
  const { data: existing } = await supabase.from("skill_tags").select("id").ilike("name", name).maybeSingle();
  if (existing) {
    await supabase.from("skill_tags").update({ featured }).eq("id", existing.id);
    return existing;
  }
  // Check by slug
  const { data: existingSlug } = await supabase.from("skill_tags").select("id").eq("slug", slug).maybeSingle();
  if (existingSlug) {
    await supabase.from("skill_tags").update({ featured }).eq("id", existingSlug.id);
    return existingSlug;
  }
  const { data, error } = await supabase.from("skill_tags").insert({ name, slug, featured }).select("id").single();
  if (error) {
    // If slug conflict, append random suffix
    const { data: retry, error: err2 } = await supabase.from("skill_tags").insert({ name, slug: slug + "-" + Date.now(), featured }).select("id").single();
    if (err2) throw err2;
    return retry;
  }
  return data;
}

async function findOrCreatePost({ author_id, type, title, body, tag_ids }) {
  const { data: existing } = await supabase.from("posts").select("id").eq("title", title).maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase.from("posts").insert({ author_id, type, title, body }).select("id").single();
  if (error) throw error;
  for (const tag_id of tag_ids) {
    await supabase.from("post_tags").insert({ post_id: data.id, tag_id });
  }
  return data;
}

async function main() {
  console.log(`Seeding with admin account ${ADMIN_EMAIL} / password: ${SEED_PASSWORD}`);

  const admin = await upsertUser({ email: ADMIN_EMAIL, display_name: "System Administrator", role: "SUPER_ADMIN", status: "ACTIVE", is_mentor: false });
  const moderator = await upsertUser({ email: "mod@cadt.edu.kh", display_name: "Malis Neak", role: "MODERATOR", status: "ACTIVE", is_mentor: false });
  const prof = await upsertUser({ email: "dr.vichara@cadt.edu.kh", display_name: "Dr. Vichara Eng", role: "PROFESSOR", status: "ACTIVE", is_mentor: true, karma: 42 });
  const prof2 = await upsertUser({ email: "dr.sopheap@cadt.edu.kh", display_name: "Dr. Sopheap Chan", role: "PROFESSOR", status: "ACTIVE", is_mentor: true, karma: 27 });
  const studKwame = await upsertUser({ email: "kwame@student.cadt.edu.kh", display_name: "Kwame Mensah", role: "STUDENT", status: "ACTIVE", is_mentor: true, karma: 18 });
  const studRada = await upsertUser({ email: "rada.sok@student.cadt.edu.kh", display_name: "Rada Sok", role: "STUDENT", status: "ACTIVE", is_mentor: false, karma: 9 });
  const suspended = await upsertUser({ email: "pheaktra@student.cadt.edu.kh", display_name: "Pheaktra Nop", role: "STUDENT", status: "SUSPENDED", is_mentor: false, karma: 3 });
  await supabase.from("users").update({ suspended_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }).eq("id", suspended.id);
  const banned = await upsertUser({ email: "spam.user@student.cadt.edu.kh", display_name: "Spam Merchant", role: "STUDENT", status: "BANNED", is_mentor: false, karma: 0 });

  const tags = {};
  for (const [name, featured] of [["C++", true], ["SQL", false], ["JavaScript", true], ["Data Structures", false]]) {
    tags[name] = await findOrCreateTag(name, featured);
  }

  const posts = {};
  const postSpecs = [
    { key: "three-way-join", author_id: studKwame.id, type: "question", title: "Joining three tables in Postgres", body: "I'm stuck on joining three tables, can we do a quick review?", tagNames: ["SQL"] },
    { key: "cxx-raii", author_id: prof.id, type: "resource", title: "C++ RAII cheat sheet", body: "A quick reference on smart pointers, ownership and move semantics.", tagNames: ["C++"] },
    { key: "shiny-bootcamp", author_id: banned.id, type: "resource", title: "PAID: SQL Bootcamp at 50% off - DMs open", body: "DM me for unapproved commercial spots.", tagNames: ["SQL"] },
  ];
  for (const p of postSpecs) {
    const tag_ids = p.tagNames.map((n) => tags[n].id);
    posts[p.key] = await findOrCreatePost({ author_id: p.author_id, type: p.type, title: p.title, body: p.body, tag_ids });
  }

  const { data: joinComment } = await supabase.from("comments").select("id").eq("post_id", posts["three-way-join"].id).maybeSingle();
  const comment = joinComment ?? (await supabase.from("comments").insert({ post_id: posts["three-way-join"].id, author_id: studRada.id, body: "Happy to walk you through it over a session." }).select("id").single()).data;

  const votePairs = [
    [studKwame.id, posts["cxx-raii"].id, "post"],
    [studRada.id, posts["cxx-raii"].id, "post"],
    [prof.id, posts["three-way-join"].id, "post"],
    [prof.id, comment.id, "comment"],
  ];
  for (const [user_id, target, kind] of votePairs) {
    const col = kind === "post" ? "post_id" : "comment_id";
    await supabase.from("votes").upsert({ user_id, [col]: target, value: 1 }, { onConflict: `user_id,${col}` });
  }

  const { data: existingReports } = await supabase.from("reports").select("id").limit(1);
  if (!existingReports || existingReports.length === 0) {
    await supabase.from("reports").insert([
      { reporter_id: studKwame.id, target_user_id: banned.id, post_id: posts["shiny-bootcamp"].id, reason: "Off-topic solicitation / non-academic spam" },
      { reporter_id: prof.id, target_user_id: banned.id, post_id: posts["shiny-bootcamp"].id, reason: "Unapproved commercial promotion (Community Rule #4)" },
      { reporter_id: prof2.id, target_user_id: studKwame.id, comment_id: comment.id, reason: "Soliciting paid sessions off-platform" },
    ]);
  }

  const { data: existingApps } = await supabase.from("mentor_applications").select("id").limit(1);
  if (!existingApps || existingApps.length === 0) {
    await supabase.from("mentor_applications").insert([
      { user_id: studKwame.id, department: "Computer Science (Year 3)", credential_summary: "Verified transcript on file; TA for CS201.", claimed_tags: ["SQL", "JavaScript"] },
      { user_id: studRada.id, department: "Software Engineering (Year 4)", credential_summary: "Certified Meta Front-End Developer; portfolio reviewed.", claimed_tags: ["JavaScript", "C++"] },
    ]);
  }

  const { data: existingSessions } = await supabase.from("mentoring_sessions").select("id").limit(1);
  if (!existingSessions || existingSessions.length === 0) {
    await supabase.from("mentoring_sessions").insert([
      { mentor_id: prof.id, mentee_id: studRada.id, post_id: posts["three-way-join"].id, meeting_link: "https://meet.google.com/jor-jek001", status: "confirmed", scheduled_at: "2026-09-08T10:00:00Z" },
      { mentor_id: prof2.id, mentee_id: studKwame.id, post_id: posts["cxx-raii"].id, meeting_link: "https://meet.google.com/jor-jek002", status: "cancelled", cancel_reason: "Mentor unavailable", cancelled_at: "2026-09-02T12:00:00Z" },
      { mentor_id: prof.id, mentee_id: suspended.id, post_id: posts["three-way-join"].id, status: "requested" },
    ]);
  }

  const { data: existingBan } = await supabase.from("moderation_actions").select("id").eq("target_user_id", banned.id).eq("type", "BAN").limit(1);
  if (!existingBan || existingBan.length === 0) {
    await supabase.from("moderation_actions").insert({ admin_id: admin.id, target_user_id: banned.id, type: "BAN", reason: "Permanent ban. Unapproved commercial promotion (Community Rule #4)." });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${ADMIN_EMAIL}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
