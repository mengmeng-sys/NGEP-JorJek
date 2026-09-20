# 🌊 Frontend Flows — Complete Picture

---

## 1. 🚀 App Startup Flow

```
User opens browser
    ↓
index.html loads
    ↓
main.jsx runs → renders <App />
    ↓
MsalProvider wraps everything (Microsoft auth ready)
    ↓
AuthProvider mounts → checks localStorage for "jorjek_token"
    ↓
    ├── Token EXISTS → calls /auth/me → sets user → app ready
    │
    └── No token → user = null → show public pages
    ↓
SocketProvider mounts → checks if user is authenticated
    ↓
    ├── User logged IN → creates Socket.IO connection → emit "join" with userId
    │
    └── No user → no socket (guest mode)
    ↓
OnlineProvider mounts → listens to socket events
    ↓
    └── Tracks who's online via user_online/user_offline events
    ↓
App renders → React Router shows the right page based on URL
```

---

## 2. 🔑 Login Flow (Email/Password)

```
User clicks "Login"
    ↓
LoginPage shows form (email + password)
    ↓
User submits → authApi.login(email, password)
    ↓
POST /auth/login → backend checks credentials
    ↓
Success → returns { accessToken, refreshToken, user }
    ↓
AuthProvider stores tokens in localStorage:
    ├── jorjek_token = accessToken
    ├── jorjek_refresh_token = refreshToken
    └── jorjek_auth_user = user JSON
    ↓
setUser(user) → triggers re-render
    ↓
SocketProvider detects user change → creates socket connection
    ↓
Navigate to "/" (home feed)
```

---

## 3. 🔑 Login Flow (Microsoft)

```
User clicks "Sign in with Microsoft"
    ↓
MSAL: instance.loginRedirect()
    ↓
Browser goes to Microsoft login page
    ↓
User logs in with school email
    ↓
Microsoft redirects back to JorJek
    ↓
MSAL: handleRedirectPromise() → gets ID token
    ↓
authApi.microsoftLogin(idToken)
    ↓
Backend validates ID token with Microsoft's public keys
    ↓
Returns JorJek JWT tokens + user
    ↓
Store tokens → setUser() → connect socket → redirect to "/"
```

---

## 4. 📝 Signup Flow (Microsoft)

```
User clicks "Sign up with Microsoft"
    ↓
Microsoft login → get ID token
    ↓
authApi.microsoftCheck(idToken) → checks if account exists
    ↓
404 (no account) → show SignupPage form
    ↓
User fills: name, password, gen, department, specialization
    ↓
authApi.microsoftSignup({ idToken, ...profile })
    ↓
Backend creates user → returns tokens
    ↓
Store tokens → setUser() → redirect to "/"
    ↓
Show TechInterestsPage → user picks skill tags
    ↓
POST /tags/:name/follow for each selected tag
    ↓
Onboarding complete → redirect to "/"
```

---

## 5. 🏠 Home Feed Flow (Loading Posts)

```
HomePage mounts
    ↓
usePosts() hook initializes → posts = [], page = 1
    ↓
useEffect triggers → loadMore()
    ↓
postsApi.list({ page: 1, limit: 10 })
    ↓
GET /posts?page=1&limit=10
    ↓
Backend queries posts → returns normalized data
    ↓
adapter.normalizePost() for each post
    ↓
setPosts([...]) → UI renders PostCard for each
    ↓
User scrolls down → IntersectionObserver triggers loadMore()
    ↓
page++ → fetch next page → append to posts
    ↓
hasMore = false → stop loading (reached end)
```

---

## 6. 📤 Create Post Flow

```
User clicks "Create Post" → openCreatePostModal()
    ↓
CreatePostModal opens → user types title, body, selects tags
    ↓
Optional: user uploads image
    ↓
    → uploadsApi.upload(file)
    → POST /uploads (multipart form)
    → File saved to Supabase Storage
    → Returns public URL
    ↓
User clicks "Post" → postsApi.create({ title, body, tags, imageUrl })
    ↓
POST /posts → backend saves to DB
    ↓
Backend broadcasts "new_post" via Socket.IO (global)
    ↓
HomePage receives "new_post" event → addPost(post) → inserts at top of feed
    ↓
Modal closes → feed shows new post instantly
```

---

## 7. 💬 Comment Flow

```
User on PostDetailPage → types comment → clicks "Reply"
    ↓
commentsApi.create(postId, { body })
    ↓
POST /posts/:id/comments → backend saves comment
    ↓
Backend sends notification to post author
    ↓
Backend broadcasts "new_comment" to post:{postId} room
    ↓
PostDetailPage receives "new_comment" → add comment to list
    ↓
Comment count on PostCard updates (if viewing feed)
```

---

## 8. 👍 Vote Flow

```
User clicks upvote/downvote arrow on a PostCard
    ↓
votesApi.cast({ postId, value: 1 or -1 })
    ↓
POST /vote → backend upserts vote
    ↓
Backend recalculates karma for content author
    ↓
Backend broadcasts "vote_update" to post:{postId} room
    ↓
ALL clients viewing that post receive "vote_update"
    ↓
PostCard updates vote score in real-time
    ↓
Note: own vote is handled optimistically (UI updates before API response)
```

---

## 9. 🔔 Notification Flow

```
Something happens (reply, upvote, report, etc.)
    ↓
Backend saves notification row to DB
    ↓
If NOTIFICATION_TRANSPORT = "websocket":
    → Backend emits "notification" to user's socket room
    ↓
    Frontend Navbar receives "notification" event
    → Shows red badge with count
    → Flyout panel shows notification details
    ↓
    User clicks notification → mark as read → POST /notifications/:id/read
    ↓
If NOTIFICATION_TRANSPORT = "polling":
    → Navbar polls GET /notifications/unread-count every X seconds
    → Updates badge count
```

---

## 10. 🔌 Real-Time Feed Updates (Socket Flow)

```
Socket connected → emit "join" with userId
    ↓
Server joins socket to "userId" room + tracks online status
    ↓
User browsing — socket listens for:
    ↓
    "new_post" → add to feed top
    "post_updated" → update post in place
    "post_deleted" → remove from feed
    "new_comment" → increment comment count
    "comment_updated" → update comment text
    "comment_deleted" → remove comment
    "vote_update" → update vote score
    "save_update" → update save state
    "notification" → show notification flyout
    "profile_updated" → update profile info
    "user_online" → show green dot on avatar
    "user_offline" → hide green dot
```

---

## 11. 👤 Profile Update Flow

```
User goes to /settings → clicks "Edit Profile"
    ↓
GeneralTab shows form → user edits name, bio, avatar
    ↓
User changes field → AuthProvider.updateUserProfile(fields)
    ↓
Optimistic update:
    1. Immediately update local state: setUser({ ...user, ...fields })
    2. UI re-renders instantly with new data
    3. Call API in background: PATCH /users/:id
    ↓
    ├── Success → setUser(data) with server response
    │
    └── Error → rollback: setUser(prev)
    ↓
Backend broadcasts "profile_updated"
    ↓
Any PostCard showing this author → updates name/avatar
```

---

## 12. 🛡️ Session Expiry Flow

```
User is idle for a while (token expired)
    ↓
Next API call → 401 Unauthorized
    ↓
Axios response interceptor catches 401
    ↓
Tries: POST /auth/refresh with refreshToken
    ↓
    ├── Success → new tokens saved → retry original request → user doesn't notice
    │
    └── Refresh failed (refreshToken also expired)
        ↓
        Dispatches "jorjek:session-expired" event on window
        ↓
        AuthProvider listens → clears localStorage → setUser(null)
        ↓
        Socket disconnects → user = null
        ↓
        Redirect to /auth/login
```

---

## 13. 🔒 Admin Access Flow

```
User logs in with admin account
    ↓
authApi.me() → returns user with role: "SUPER_ADMIN" or "MODERATOR"
    ↓
AuthProvider sets user → App.jsx checks isAdmin
    ↓
Admin routes are protected: <Route path="/admin/*" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
    ↓
If non-admin tries to visit /admin → redirected to /
    ↓
If admin visits public page → redirected to /admin
    ↓
AdminLayout renders → shows admin sidebar with:
    ├── Overview (dashboard metrics)
    ├── Users (directory + enforcement)
    ├── Moderation (reports triage)
    ├── Mentors (application pipeline)
    └── Tags (taxonomy management)
    ↓
All admin API calls go to /api/admin/* → backend checks requireRole("SUPER_ADMIN", "MODERATOR")
```

---

## 14. 🔄 Token Refresh Flow (Background)

```
Every API call → Axios interceptor checks response
    ↓
If 401 → pause original request
    ↓
POST /auth/refresh with jorjek_refresh_token
    ↓
    ├── 200 OK → new accessToken + refreshToken
    │   ├── Update localStorage
    │   ├── Set new Authorization header
    │   └── Retry original request with new token
    │
    └── 401 (refreshToken expired/invalid)
        ├── Clear all tokens from localStorage
        ├── Dispatch "jorjek:session-expired"
        ├── AuthProvider logs out → setUser(null)
        └── Redirect to /auth/login
```

---

## 15. 🔍 Search Flow

```
User types in Navbar search box
    ↓
Debounce (wait 300ms after last keystroke)
    ↓
searchApi.search(query)
    ↓
GET /search?q=query
    ↓
Backend searches across:
    ├── Post title & body (ilike)
    ├── Author display_name (ilike)
    └── Skill tag names (ilike)
    ↓
Merges + deduplicates results → returns up to 20
    ↓
SearchPage renders results as PostCards
```

---

## 16. 📱 Mobile / Responsive Flow

```
Page renders with ThreeColumnLayout
    ↓
Tailwind responsive breakpoints:
    ├── xs (320px) → mobile: single column, hamburger menu
    ├── sm (640px) → large phone
    ├── md (768px) → tablet
    ├── lg (1024px) → laptop: left sidebar appears
    └── xl (1280px) → desktop: right sidebar appears
    ↓
Navbar collapses to drawer on mobile
    ↓
PostCard adjusts: full-width on mobile, fixed columns on desktop
    ↓
Modals slide up from bottom on mobile, centered on desktop
```

---

## Quick Reference — Questions & Answers

| Question | Answer |
|----------|--------|
| How do real-time updates work? | Socket.IO — server emits events, frontend listens and updates React state |
| How does login work? | Two ways: email/password with OTP, or Microsoft SSO via Azure AD |
| How do you handle session expiry? | Axios interceptor catches 401 → tries refresh → if fails, logout |
| How does infinite scroll work? | usePosts hook — loads pages on scroll, deduplicates by ID |
| How are new posts shown instantly? | Backend broadcasts "new_post" → frontend adds to feed top |
| How does voting work? | Optimistic UI update + API call → backend broadcasts vote_update |
| How do notifications work? | WebSocket push (or polling fallback) → badge + flyout |
| How do you protect admin routes? | Frontend: isAdmin check → redirect. Backend: requireRole middleware |
| How is profile update optimistic? | Update UI immediately → API call → rollback on error |
| Why Tailwind CSS? | Utility-first, fast development, consistent design system, small bundle |
| Why Vite? | Fast dev server (HMR), optimized production build, modern ES modules |
| What happens if socket disconnects? | Auto-reconnect (10 attempts), pending events queued until reconnect |
| How does search work? | Full-text ILIKE across posts, authors, tags — merged + deduplicated |
| Why two auth methods? | Email/password for flexibility, Microsoft SSO for institutional trust |
