# JorJek Backend: Finish the Supabase Migration, Then Add Tests

Current state (checked against the `backend.zip` you uploaded 2026-09-02): `src/config/db.js` and
`src/config/env.js` were converted to `@supabase/supabase-js`, but **11 other files were never
updated** and still call `prisma.*`, which no longer exists. `package.json` and `.env.example` are
also stale. Your real `.env` is already correct (`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are
set) — only `.env.example` needs updating, as a template for teammates.

Nothing in the backend will run until this is fixed. Do the steps in order.

## ⚠️ Before you touch any route file

I don't have your actual table/column names — the Prisma schema was deleted, and
`supabase/migrations/00000000000000_init.sql` wasn't in the zip you gave me. The rewrites below
assume typical Supabase/raw-SQL convention: `snake_case` tables and columns (`post_id`, not
`postId`), matching the table list from project memory (`users, tags, tag_follows, posts,
post_tags, comments, votes, notifications, reports, session_requests, session_ratings`).

**Open the migration file first and confirm real column names before copying anything below.**
If it turns out camelCase quoted columns were used instead, every `.eq("post_id", ...)` /
`.select("...")` string here needs the same swap.

---

## Step 1 — `package.json`

Remove:
```json
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev",
```
and the `@prisma/client` / `prisma` entries under `dependencies` / `devDependencies`. Add:
```json
"dependencies": {
  "@supabase/supabase-js": "^2.45.0",
  ...
}
```
Then `npm install` (this is also what actually installs the module `db.js` has been requiring
this whole time but which was never in the manifest).

## Step 2 — `.env.example`

Replace `DATABASE_URL=...` with:
```
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="replace-with-service-role-key"
```
(Get real values from Supabase dashboard → Project Settings → API. Keep the rest of the file
as-is.)

## Step 3 — route/service rewrites

General pattern: `prisma.model.findMany({...})` → `supabase.from("table").select("...")`,
`.create({data})` → `.insert({...}).select().single()`, `.findUnique({where})` →
`.select("...").eq("id", x).single()`, `.update({where,data})` → `.update({...}).eq("id", x)`.
Supabase calls return `{ data, error }` — check `error` and pass it to `next()` instead of relying
on try/catch throwing, since the client doesn't throw on a failed query.

### `src/routes/auth.routes.js`
```js
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { requireCadtEmail } = require("../middleware/cadtEmailGate.middleware");

const authRouter = Router();

authRouter.post("/signup", requireCadtEmail, async (req, res, next) => {
  try {
    const { cadtEmail, password, displayName, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from("users")
      .insert({ cadt_email: cadtEmail, password_hash: passwordHash, display_name: displayName, role: role ?? "STUDENT" })
      .select()
      .single();
    if (error) throw error;

    const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, displayName: user.display_name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { cadtEmail, password } = req.body;
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("cadt_email", cadtEmail)
      .maybeSingle();
    if (error) throw error;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, displayName: user.display_name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

module.exports = { authRouter };
```
Note: `bcryptjs.compare` against `undefined` (when no user found) throws — keep the `!user ||`
short-circuit exactly as above so it never reaches `compare` with a missing hash.

### `src/routes/posts.routes.js`
- `GET /` (list, optional `?tag=`): needs a join through `post_tags` → `tags`. Simplest correct
  version: `supabase.from("posts").select("*, users(*), post_tags(tags(*)), votes(*)")` — Supabase
  auto-detects the FK relationships if they exist in the migration; if a tag filter is present,
  filter client-side after the query, or use `.filter("post_tags.tags.name", "eq", tag)` once
  you've confirmed the relationship name in Supabase's generated schema (check via the Table
  Editor's "API" tab, which shows exact embed syntax for your actual FKs).
- `POST /` (create): insert into `posts`, then insert one row per tag into `post_tags` — Supabase
  has no `connectOrCreate`, so first `upsert` each tag name into `tags` (`onConflict: "name"`),
  then insert the `post_tags` join rows referencing the returned tag ids.
- `GET /:id`: `.select("*, users(*), post_tags(tags(*)), comments(*, users(*), votes(*)), votes(*)").eq("id", req.params.id).single()`.

### `src/routes/comments.routes.js`
```js
const comment = await supabase.from("comments")
  .insert({ post_id: req.params.postId, author_id: req.userId, body, parent_id: parentId })
  .select("*, users(*)")
  .single();
// then fetch the post to find its author, same eq().single() pattern as above
```

### `src/routes/votes.routes.js`
Prisma's `upsert` on a composite key (`userId_postId` / `userId_commentId`) becomes
`.upsert({ user_id, post_id, value }, { onConflict: "user_id,post_id" })` — this requires a real
unique constraint on `(user_id, post_id)` in the migration; confirm it exists. Comment votes need
the mirror call with `onConflict: "user_id,comment_id"`.

### `src/routes/tags.routes.js`
`GET /` → `supabase.from("tags").select("*")`. The follow route needs two upserts in sequence
(tag by name, then `tag_follows` by `(user_id, tag_id)`), same pattern as votes above.

### `src/routes/notifications.routes.js`
`GET /` → `.select("*").eq("user_id", req.userId).order("created_at", { ascending: false }).limit(50)`.
`POST /:id/read` → `.update({ read: true }).eq("id", req.params.id)`.

### `src/routes/reports.routes.js`
Single insert, same shape as comments — `.from("reports").insert({ reporter_id: req.userId, post_id: postId, comment_id: commentId, target_user_id: targetUserId, reason }).select().single()`.

### `src/routes/users.routes.js`
`top-mentors` → `.select("id, display_name, role, karma").order("karma", { ascending: false }).limit(10)`.
`GET /:id` → `.select("id, display_name, role, karma, created_at").eq("id", req.params.id).maybeSingle()`, then 404 if null.

### `src/routes/search.routes.js`
Prisma's `contains`/`insensitive` → Supabase's `.or(\`title.ilike.%${q}%,body.ilike.%${q}%\`).limit(20)`.

### `src/services/karma.service.js`
Prisma's `count` → `.select("*", { count: "exact", head: true })` and read `count` off the
response instead of the row data (your project memory already flags this exact pattern as the
intended rewrite). Two counts (post upvotes, comment upvotes) run as separate queries, then
`supabase.from("users").update({ karma }).eq("id", userId)`.

### `src/services/notification.service.js`
Single insert: `.from("notifications").insert({ user_id: userId, type, payload }).select().single()`.

---

## Step 4 — sanity check before writing any tests

Run `node --check` on every rewritten file (catches syntax errors fast), then start the server
(`npm run dev`) and hit `GET /health` with curl — if that 200s, the app boots, which is the real
gate before test-writing is worth doing at all. Then manually try `POST /auth/signup` with curl or
Postman against a throwaway CADT-looking email, since that's the path every other authenticated
route depends on.

## Step 5 — add Jest + Supertest

```bash
npm install --save-dev jest supertest
```
Add `"test": "jest"` to `package.json` scripts. Create `backend/tests/`.

**Test data problem:** the whole team shares one hosted Supabase project — no per-developer local
DB. Don't let integration tests write and forget. Either:
- Mock `../src/config/db` (`jest.mock`) for pure route-logic tests (fast, no network, good default), or
- For the handful of tests that should hit real Supabase (auth signup/login), use a
  `beforeAll`/`afterAll` that inserts with an obviously-fake email (`test+${Date.now()}@cadt.edu.kh`)
  and deletes the row afterward, so the shared project doesn't accumulate junk.

**Suggested first suite** (`tests/health.test.js`, `tests/auth.test.js`):
1. `GET /health` → `200 { ok: true }` — proves the harness + rewritten app boot.
2. `POST /auth/signup` with a non-`@cadt.edu.kh` email → `400` (tests `requireCadtEmail`).
3. `POST /auth/signup` then `POST /auth/login` with the same real-looking test email → both `200`/`201`,
   response includes a `token`. Delete the test user in `afterAll`.
4. `POST /posts` with no `Authorization` header → `401` (tests `requireAuth` actually blocks).

Once those four pass, expand to `posts.routes.js` and `comments.routes.js` — those are the routes
most teammates' work depends on, so covering them next protects the most surface area heading into
Week 3 (comments, voting, sessions, Sep 4–10).
