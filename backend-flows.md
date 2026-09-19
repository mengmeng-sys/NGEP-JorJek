# ⚙️ Backend Flows — Complete Picture

---

## 1. 🚀 Server Startup Flow

```
npm start → node src/server.js
    ↓
server.js imports app.js (Express config)
    ↓
Express loads middleware stack:
    ├── CORS (allow specific origins + *.vercel.app previews)
    ├── express.json() (parse JSON bodies)
    ├── logger (log method, URL, status, duration)
    └── All route modules mounted
    ↓
server.js creates HTTP server from Express app
    ↓
Socket.IO attaches to HTTP server
    ↓
Socket.IO registers connection handler:
    ├── "join" → track user online
    ├── "join_post" / "leave_post" → scoped post rooms
    └── "disconnect" → cleanup + broadcast offline
    ↓
Server listens on process.env.PORT (Render assigns)
    ↓
GET /health → returns { ok: true, microsoftAuth: boolean }
```

---

## 2. 🔑 Signup Flow (Email/Password)

```
POST /auth/signup
    ↓
requireCadtEmail middleware → checks email ends with @student.cadt.edu.kh
    ↓
    ├── Not CADT email → 403 Forbidden
    │
    └── CADT email → continue
    ↓
Validate: email, password, display_name present
    ↓
Check if email already exists in DB
    ↓
    ├── Exists → 409 Conflict
    │
    └── New email → continue
    ↓
bcrypt.hash(password, 10) → hash password
    ↓
INSERT INTO users (email, password_hash, display_name, role: "STUDENT")
    ↓
Generate 6-digit OTP (crypto.randomInt)
    ↓
sendMail({ to: email, subject: "Verify your email", html: otpTemplate(otp) })
    ↓
    ├── If RESEND_API_KEY set → Resend HTTPS API
    └── Else → Nodemailer SMTP (Gmail)
    ↓
Generate JWT tokens:
    ├── signAccessToken({ sub: userId, ver: 0 }) → 7 day expiry
    └── signRefreshToken({ sub: userId, ver: 0 }) → 30 day expiry
    ↓
Broadcast "user_registered" via Socket.IO (global)
    ↓
Return 201 { accessToken, refreshToken, user: userSafe(user) }
```

---

## 3. 🔑 Login Flow (Email/Password)

```
POST /auth/login
    ↓
Validate: email + password present
    ↓
SELECT * FROM users WHERE email = $1
    ↓
    ├── Not found → 401 Unauthorized
    │
    └── Found → continue
    ↓
Check user.status
    ├── "BANNED" → 403 Forbidden
    └── "SUSPENDED" → check suspended_until
        ├── Still suspended → 403 Forbidden
        └── Suspension expired → set status = "ACTIVE", continue
    ↓
bcrypt.compare(password, user.password_hash)
    ↓
    ├── No match → 401 Unauthorized
    │
    └── Match → continue
    ↓
Generate JWT tokens with current token_version
    ↓
Return 200 { accessToken, refreshToken, user: userSafe(user) }
```

---

## 4. 🔐 Token Verification Flow (Every Protected Request)

```
Request arrives with: Authorization: Bearer <token>
    ↓
requireAuth middleware runs
    ↓
Extract token from header
    ↓
    ├── No token → 401 Unauthorized
    │
    └── Token present → continue
    ↓
jwt.verify(token, JWT_SECRET)
    ↓
    ├── Invalid signature → 401 Unauthorized
    ├── Expired → 401 Unauthorized
    │
    └── Valid → continue
    ↓
Extract { sub: userId, ver: tokenVersion } from payload
    ↓
SELECT * FROM users WHERE id = userId
    ↓
    ├── User not found → 401 Unauthorized
    │
    └── Found → continue
    ↓
Compare payload.ver vs user.token_version
    ↓
    ├── Mismatch (tokens revoked) → 401 Unauthorized
    │
    └── Match → continue
    ↓
Set req.userId = user.id
Set req.user = user
    ↓
next() → route handler executes
```

---

## 5. 🔄 Token Refresh Flow

```
POST /auth/refresh
    ↓
Extract refreshToken from body
    ↓
jwt.verify(refreshToken, JWT_REFRESH_SECRET)
    ↓
    ├── Invalid → 401 Unauthorized
    │
    └── Valid → continue
    ↓
Look up user by sub (userId)
    ↓
Check payload.ver vs user.token_version
    ↓
    ├── Mismatch → 401 Unauthorized (refresh token revoked)
    │
    └── Match → continue
    ↓
Generate NEW pair:
    ├── New access token (7 day)
    └── New refresh token (30 day)
    ↓
Return 200 { accessToken, refreshToken }
```

---

## 6. 🚪 Logout Flow

```
POST /auth/logout
    ↓
requireAuth → verify JWT
    ↓
Call increment_token_version(userId)
    ↓
PostgreSQL function atomically increments users.token_version
    ↓
ALL previously issued tokens are now INVALID
(because their embedded ver no longer matches DB)
    ↓
Return 200 { message: "Logged out" }
```

---

## 7. 📝 Create Post Flow

```
POST /posts
    ↓
requireAuth → verify JWT
    ↓
requireVerifiedEmail → check user.email_verified
    ↓
    ├── Not verified → 403 Forbidden
    │
    └── Verified (or skip if optional) → continue
    ↓
Validate: title present, type in [question, offer, resource]
    ↓
INSERT INTO posts (author_id, type, title, body, image_url, allow_mentoring)
    ↓
If tags provided:
    ↓
    For each tag slug:
        INSERT INTO skill_tags (slug, name) ON CONFLICT (slug) DO NOTHING
        INSERT INTO post_tags (post_id, tag_id)
    ↓
Fetch complete post with author, tags
    ↓
Broadcast "new_post" via Socket.IO (global emit)
    ↓
Return 201 { post }
```

---

## 8. 📖 Get Posts Feed Flow

```
GET /posts?page=1&limit=10&tag=react
    ↓
optionalAuth → try to verify JWT (works for guests too)
    ↓
Build Supabase query:
    ↓
    ├── Filter: deleted_at IS NULL
    ├── Optional: tag filter → join post_tags + skill_tags
    ├── Order: created_at DESC
    ├── Range: offset = (page-1) * limit, limit = 10
    │
    └── Select: post.*, author:users(*), tags:post_tags(skill_tags(*))
    ↓
If authenticated:
    ↓
    Add computed fields:
        ├── isSaved → check saved_posts where user_id + post_id
        ├── voteScore → sum of votes.value
        └── currentUserVote → votes.value where user_id + post_id
    ↓
Return 200 { posts: [...], total: count, page, hasMore }
```

---

## 9. 💬 Create Comment Flow

```
POST /posts/:postId/comments
    ↓
requireAuth → verify JWT
    ↓
requireVerifiedEmail → check email_verified
    ↓
Validate: body present
    ↓
Check post exists
    ↓
INSERT INTO comments (post_id, author_id, body, parent_comment_id?)
    ↓
Generate notification for post author:
    ↓
    notify(postAuthorId, "reply", { commentId, postId, commenterId })
        ├── INSERT INTO notifications (user_id, type, payload)
        └── If websocket: io.to(postAuthorId).emit("notification", {...})
    ↓
Broadcast "new_comment" to post:{postId} room
    ↓
Return 201 { comment }
```

---

## 10. 👍 Vote Flow

```
POST /vote
    ↓
requireAuth → verify JWT
    ↓
requireVerifiedEmail → check email_verified
    ↓
Validate: value in [1, -1], postId OR commentId present (not both, not neither)
    ↓
UPSERT vote:
    ↓
    INSERT INTO votes (user_id, post_id, comment_id, value)
    ON CONFLICT (user_id, post_id) WHERE comment_id IS NULL
    DO UPDATE SET value = EXCLUDED.value
    ↓
(or same for comment)
    ↓
recalculateKarma(contentAuthorId)
    ↓
    ├── Count upvotes on author's posts
    ├── Count upvotes on author's comments
    ├── Sum = total karma
    └── UPDATE users SET karma = total WHERE id = authorId
    ↓
If value = 1 (upvote):
    ↓
    notify(contentAuthorId, "upvote", { postId/commentId, voterId })
    ↓
Broadcast "vote_update" to post:{postId} room
    ↓
Return 200 { vote, voteScore }
```

---

## 11. 🔔 Notification Service Flow

```
notify(userId, type, payload)
    ↓
Always:
    ↓
    INSERT INTO notifications (user_id, type, payload, read: false)
    ↓
    Fetch the inserted row (with id, created_at)
    ↓
If env.notificationTransport === "websocket":
    ↓
    io.to(`userId`).emit("notification", notificationRow)
    ↓
    └── Frontend Navbar receives → shows badge + flyout
    ↓
If env.notificationTransport === "polling":
    ↓
    └── Frontend polls GET /notifications/unread-count periodically
```

---

## 12. 🔌 Socket.IO Connection Flow

```
Client connects → Socket.IO handshake
    ↓
Client emits "join" with { userId }
    ↓
Server: socket.join(userId)
Server: onlineUsers.add(userId, socketId)
    ↓
If first socket for this user:
    ↓
    Check users.show_online_status
        ├── true → io.emit("user_online", userId) → public
        └── false → io.emit("user_hidden_online", userId) → privacy-aware
    ↓
Send back: socket.emit("users_online", [allOnlineIds])
    ↓
Client emits "join_post" with { postId }
    ↓
Server: socket.join("post:{postId}")
    ↓
    └── Now receives scoped events: new_comment, vote_update, save_update
    ↓
Client emits "leave_post" with { postId }
    ↓
Server: socket.leave("post:{postId}")
    ↓
Client disconnects
    ↓
Server: onlineUsers.remove(userId, socketId)
    ↓
If last socket for this user:
    ↓
    io.emit("user_offline", userId)
    (or "user_hidden_offline" if show_online_status = false)
```

---

## 13. 📁 File Upload Flow

```
POST /uploads
    ↓
requireAuth → verify JWT
    ↓
multer middleware (memoryStorage)
    ↓
    ├── No file → 400 Bad Request
    ├── File > 5MB → 413 Payload Too Large
    ├── Invalid type (not JPEG/PNG/WebP/PDF) → 415 Unsupported Media
    │
    └── Valid file → continue
    ↓
Generate unique filename: {userId}-{timestamp}-{random}.{ext}
    ↓
supabase.storage.from("attachments").upload(fileName, fileBuffer)
    ↓
    ├── Upload error → 500 Internal Server Error
    │
    └── Success → continue
    ↓
supabase.storage.from("attachments").getPublicUrl(fileName)
    ↓
Return 200 { url: "https://xxxx.supabase.co/storage/v1/object/public/attachments/xxx" }
```

---

## 14. 🔍 Search Flow

```
GET /search?q=javascript
    ↓
Validate: query string present
    ↓
Search across multiple sources:
    ↓
    1. Posts: WHERE title ILIKE '%javascript%' OR body ILIKE '%javascript%'
    2. Authors: WHERE display_name ILIKE '%javascript%'
    3. Tags: WHERE name ILIKE '%javascript%'
    ↓
For matching authors → get their posts
For matching tags → get tagged posts
    ↓
Merge all result sets → deduplicate by post ID
    ↓
Sort by created_at DESC → limit to 20
    ↓
Return 200 { results: [...posts] }
```

---

## 15. 📧 Email Sending Flow

```
sendMail({ to, subject, html })
    ↓
Check env.RESEND_API_KEY
    ↓
    ├── SET → use Resend:
    │   ↓
    │   POST https://api.resend.com/emails
    │   Headers: Authorization: Bearer RESEND_API_KEY
    │   Body: { from: "JorJek <noreply@domain>", to, subject, html }
    │   ↓
    │   └── Returns 200 OK (HTTPS, works on Render free tier)
    │
    └── NOT SET → use Nodemailer:
        ↓
        Create transporter: { host: SMTP_HOST, port: SMTP_PORT, auth: {...} }
        transporter.sendMail({ from: SMTP_FROM, to, subject, html })
        ↓
        └── Sends via SMTP (Gmail, port 587)
```

---

## 16. 🛡️ Admin Access Flow

```
Request to /api/admin/*
    ↓
requireAuth → verify JWT → set req.user
    ↓
requireRole("SUPER_ADMIN", "MODERATOR")
    ↓
SELECT role FROM users WHERE id = req.userId
    ↓
    ├── role not in [SUPER_ADMIN, MODERATOR] → 403 Forbidden
    │
    └── Valid admin → continue
    ↓
Route handler executes:
    ├── GET /overview → aggregate metrics
    ├── GET /users → list with filters
    ├── POST /users/:id/action → suspend/ban/restore
    ├── GET /reports → moderation queue
    ├── POST /reports/:id/action → dismiss/soft-delete/warn
    ├── GET /mentors → application pipeline
    ├── POST /mentors/:id/action → approve/reject
    ├── GET /tags → all tags
    └── POST /tags → create/update/delete tag
```

---

## 17. 🚫 User Enforcement (Suspend/Ban/Restore) Flow

```
POST /api/admin/users/:id/action
    ↓
requireAuth → requireRole(SUPER_ADMIN, MODERATOR)
    ↓
Validate: type in [SUSPEND, BAN, RESTOR], reason present
    ↓
Prevent self-moderation:
    ↓
    ├── adminId === targetUserId → 403 Forbidden
    │
    └── Different user → continue
    ↓
Based on type:
    ↓
    SUSPEND:
        ├── UPDATE users SET status = "SUSPENDED", suspended_until = now + duration_days
        └── INSERT INTO moderation_actions (admin_id, target_user_id, type, duration_days, reason)
    ↓
    BAN:
        ├── UPDATE users SET status = "BANNED", suspended_until = NULL (permanent)
        └── INSERT INTO moderation_actions (...)
    ↓
    RESTORE:
        ├── UPDATE users SET status = "ACTIVE", suspended_until = NULL
        └── INSERT INTO moderation_actions (...)
    ↓
notify(targetUserId, "account_action", { type, reason })
    ↓
    ├── INSERT INTO notifications (...)
    └── io.to(targetUserId).emit("notification", {...})
    ↓
Return 200 { user: updatedUser }
```

---

## 18. 📋 Report & Moderation Flow

```
POST /reports
    ↓
requireAuth → requireVerifiedEmail
    ↓
Validate: reason present, at least one of (postId, commentId, targetUserId)
    ↓
INSERT INTO reports (reporter_id, post_id, comment_id, target_user_id, reason, status: "PENDING")
    ↓
Return 201 { report }

---

POST /api/admin/reports/:id/action
    ↓
requireAuth → requireRole(SUPER_ADMIN, MODERATOR)
    ↓
Validate: action in [DISMISS, SOFT_DELETE, WARN]
    ↓
Based on action:
    ↓
    DISMISS:
        └── UPDATE reports SET status = "DISMISSED", resolved_at = now, resolved_by = adminId
    ↓
    SOFT_DELETE:
        ├── UPDATE reports SET status = "APPROVED", resolved_at = now
        ├── If postId: UPDATE posts SET deleted_at = now WHERE id = postId
        └── If commentId: UPDATE comments SET deleted_at = now WHERE id = commentId
    ↓
    WARN:
        ├── UPDATE reports SET status = "WARNED", resolved_at = now
        ├── INSERT INTO moderation_actions (admin_id, target_user_id, type: "WARN", reason)
        └── notify(targetUserId, "content_warn", { reason, reportId })
    ↓
Return 200 { report: updatedReport }
```

---

## 19. 🎓 Mentor Application Flow

```
POST /api/admin/mentors/:id/action
    ↓
requireAuth → requireRole(SUPER_ADMIN, MODERATOR)
    ↓
Validate: action in [APPROVE, REJECT], review_note present
    ↓
    APPROVE:
        ├── UPDATE mentor_applications SET status = "APPROVED", review_note, reviewed_by, reviewed_at
        ├── UPDATE users SET is_mentor = true WHERE id = userId
        └── notify(userId, "mentor_application", { status: "APPROVED" })
    ↓
    REJECT:
        ├── UPDATE mentor_applications SET status = "REJECTED", review_note, reviewed_by, reviewed_at
        └── notify(userId, "mentor_application", { status: "REJECTED" })
    ↓
Return 200 { application }
```

---

## 20. ❌ Error Handling Flow

```
Any route throws an error
    ↓
next(error) → errorHandler middleware catches
    ↓
Console logs error (stack trace in development)
    ↓
Determine status code:
    ├── err.status set → use that
    └── No status → 500 Internal Server Error
    ↓
Return JSON response:
    ↓
    {
      error: err.message
    }
    ↓
Client Axios interceptor catches error
    ↓
    ├── 401 → attempt token refresh (see Token Refresh Flow)
    ├── 403 → show "Access Denied" message
    ├── 404 → show "Not Found" message
    ├── 409 → show "Conflict" message (e.g., duplicate email)
    └── 500 → show "Server Error" message
```

---

## 21. 🔐 Microsoft Auth Flow (Backend)

```
POST /auth/microsoft/login
    ↓
Extract idToken from body
    ↓
Fetch Microsoft JWKS keys from discovery endpoint
    ↓
    ├── Cache hit → use cached keys (1 hour TTL)
    └── Cache miss → fetch fresh keys → cache for 1 hour
    ↓
Find matching key by kid (key ID from token header)
    ↓
Convert JWK to PEM public key
    ↓
jwt.verify(idToken, PEM, { algorithms: ["RS256"] })
    ↓
    ├── Invalid signature → 401 Unauthorized
    ├── Expired → 401 Unauthorized
    │
    └── Valid → continue
    ↓
Extract { email, name, oid } from validated token
    ↓
SELECT * FROM users WHERE email = $1
    ↓
    ├── Not found → 404 (frontend redirects to signup)
    │
    └── Found → continue
    ↓
Check user.status (BANNED/SUSPENDED same as email login)
    ↓
Generate JWT tokens → Return 200 { accessToken, refreshToken, user }

---

POST /auth/microsoft/signup
    ↓
Validate idToken (same as above)
    ↓
Check email NOT already registered
    ↓
    ├── Exists → 409 Conflict
    │
    └── New → continue
    ↓
INSERT INTO users (email, password_hash: "MS-AUTH", display_name, role: "STUDENT")
    ↓
Generate JWT tokens → Return 201 { accessToken, refreshToken, user }
```

---

## 22. 📊 Database Access Pattern

```
Route handler needs data
    ↓
Build Supabase query (service role key)
    ↓
    ↓  Example: Get post with author and tags
    ↓
    supabase
      .from("posts")
      .select("*, author:users(*), tags:post_tags(skill_tags(*))")
      .eq("id", postId)
      .is("deleted_at", null)
      .single()
    ↓
    ├── Error → throw (caught by errorHandler)
    │
    └── Success → raw data
    ↓
Transform if needed (snake_case → camelCase in frontend adapters)
    ↓
Return JSON response
```

**Why service role key?**
- Express is the ONLY client (no direct browser-to-DB)
- All authorization enforced by middleware (requireAuth, requireRole, etc.)
- Simpler queries (no need to pass user context for RLS policies)
- Migration-tolerant (code probes for column existence)

---

## Quick Reference — Questions & Answers

| Question | Answer |
|----------|--------|
| How does auth work? | JWT access (7d) + refresh (30d) tokens. Token versioning for instant revocation |
| How are passwords stored? | bcrypt with 10 rounds |
| How is token revocation instant? | token_version column — increment on logout, all old tokens fail check |
| How does real-time work? | Socket.IO with room-based presence (userId room + post rooms) |
| How are notifications delivered? | Always saved to DB. Optionally pushed via WebSocket (env flag) |
| How does file upload work? | Multer → Supabase Storage bucket "attachments" → public URL returned |
| How is admin access protected? | requireRole middleware checks DB role after JWT verification |
| How are emails sent? | Resend (HTTPS) preferred, Nodemailer SMTP fallback |
| How does Microsoft auth work? | Validate RS256 ID token with Microsoft's JWKS keys (cached 1h) |
| How is search implemented? | ILIKE across posts, authors, tags → merge → deduplicate → limit 20 |
| How are soft deletes handled? | deleted_at column, queries filter WHERE deleted_at IS NULL |
| How does karma work? | Derived value — count all upvotes on user's posts + comments, recalculated on every vote |
| How does content moderation work? | Reports → admin triage → dismiss/soft-delete/warn → moderation_actions audit trail |
| How is CADT email enforced? | requireCadtEmail middleware on signup/password-reset routes |
| How does the service role key stay safe? | Only in backend/.env + Render env vars — never exposed to frontend |
| How are database errors handled? | Supabase throws → route throws → errorHandler returns 500 with message |
| How does email verification work? | 6-digit OTP generated on signup → emailed → user enters → flag set in DB |
| How does the mentor pipeline work? | User applies → admin reviews → approve/reject → is_mentor flag set |
| What happens on server error? | errorHandler logs + returns { error: message } with appropriate status |
