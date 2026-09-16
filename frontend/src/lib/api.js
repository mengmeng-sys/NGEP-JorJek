import { apiFetch } from "./apiClient";
import {
  normalizeMentor,
  normalizeNotification,
  normalizePost,
  normalizeUser,
  safeArray,
} from "./adapters";

export const authApi = {
  me: () => apiFetch("/auth/me"),
  signup: (payload) => apiFetch("/auth/signup", { method: "POST", body: payload }),
  login: (cadtEmail, password) =>
    apiFetch("/auth/login", { method: "POST", body: { cadtEmail, password } }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  microsoftSignup: (payload) =>
    apiFetch("/auth/microsoft/signup", { method: "POST", body: payload }),
  microsoftLogin: (idToken) =>
    apiFetch("/auth/microsoft/login", { method: "POST", body: { idToken } }),
  microsoftResetPassword: (idToken, newPassword) =>
    apiFetch("/auth/microsoft/reset-password", { method: "POST", body: { idToken, newPassword } }),
};

export const postsApi = {
  list: async ({ tag, page = 1, limit = 50, currentUserId } = {}) => {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (tag) q.set("tag", tag);
    const data = await apiFetch(`/posts?${q.toString()}`);
    return {
      posts: safeArray(data.posts).map((p) => normalizePost(p, currentUserId)),
      total: data.total ?? 0,
      page,
      limit,
    };
  },

  get: async (id, currentUserId) => normalizePost(await apiFetch(`/posts/${id}`), currentUserId),

  create: async (payload) => {
    const postBody = {
      type: payload.type || "question",
      title: payload.title,
      body: payload.content || payload.body,
      tagNames: safeArray(payload.tags).map((t) => String(t).replace(/^#/, "")),
    };
    if (payload.allowMentoring !== undefined) postBody.allowMentoring = payload.allowMentoring;
    const post = await apiFetch("/posts", { method: "POST", body: postBody });
    return normalizePost(post);
  },

  update: async (id, payload) => {
    const updates = {};
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.content !== undefined) updates.body = payload.content;
    if (payload.type !== undefined) updates.type = payload.type;
    if (payload.allowMentoring !== undefined) updates.allowMentoring = payload.allowMentoring;
    if (payload.tags !== undefined) {
      updates.tagNames = safeArray(payload.tags)
        .map((t) => String(t).replace(/^#/, ""))
        .filter(Boolean);
    }
    return normalizePost(await apiFetch(`/posts/${id}`, { method: "PATCH", body: updates }));
  },

  remove: (id) => apiFetch(`/posts/${id}`, { method: "DELETE" }),
  save: (id) => apiFetch(`/posts/${id}/save`, { method: "POST" }),
  unsave: (id) => apiFetch(`/posts/${id}/save`, { method: "DELETE" }),
};

export const savedApi = {
  list: async (currentUserId) => {
    const data = await apiFetch("/saved?limit=50");
    return {
      posts: safeArray(data.posts).map((p) => normalizePost(p, currentUserId)),
      total: data.total ?? 0,
    };
  },
  count: async () => {
    const data = await apiFetch("/saved/count");
    return data?.count ?? 0;
  },
};

export const commentsApi = {
  list: async (postId) => {
    const data = await apiFetch(`/posts/${postId}/comments?limit=50`);
    return safeArray(data.comments);
  },
  create: (postId, body, parentId = null) =>
    apiFetch(`/posts/${postId}/comments`, {
      method: "POST",
      body: { body, parentId: parentId || undefined },
    }),
  update: (id, body) => apiFetch(`/comments/${id}`, { method: "PATCH", body: { body } }),
  remove: (id) => apiFetch(`/comments/${id}`, { method: "DELETE" }),
};

export const votesApi = {
  cast: (target, value) =>
    apiFetch("/vote", {
      method: "POST",
      body: { ...target, value: value === -1 ? "DOWN" : "UP" },
    }),
  remove: (target) => apiFetch("/vote", { method: "DELETE", body: target }),
};

export const tagsApi = {
  list: () => apiFetch("/tags?limit=100"),
  follow: (tagName) =>
    apiFetch(`/tags/${encodeURIComponent(tagName)}/follow`, { method: "POST" }),
};

export const searchApi = {
  posts: async (q, currentUserId) =>
    safeArray(await apiFetch(`/search?q=${encodeURIComponent(q)}`)).map((p) =>
      normalizePost(p, currentUserId)
    ),
};

export const usersApi = {
  topMentors: async () => safeArray(await apiFetch("/users/top-mentors")).map(normalizeMentor),
  get: async (idOrSlug) => {
    // Backend has no "get by handle" endpoint, so resolve a slug/id from the
    // paginated user list. Walk every page until we find a match so the profile
    // resolves regardless of how many users exist.
    const normalizedSlug = String(idOrSlug || "").toLowerCase().replace(/\s+/g, "");
    const limit = 50;
    let page = 1;
    let match = null;
    for (;;) {
      const data = await apiFetch(`/users?limit=${limit}&page=${page}`);
      const users = safeArray(data.users);
      match =
        users.find((u) => String(u.id) === String(idOrSlug)) ||
        users.find(
          (u) =>
            String(u.display_name || "")
              .toLowerCase()
              .replace(/\s+/g, "") === normalizedSlug
        );
      if (match) break;
      const total = data.total ?? users.length;
      if (!Array.isArray(data.users) || users.length === 0 || page * limit >= total) break;
      page += 1;
    }
    if (!match) return null;
    const detail = await apiFetch(`/users/${match.id}`);
    return normalizeUser(detail);
  },
  getById: async (id) => {
    try {
      return normalizeUser(await apiFetch(`/users/${id}`));
    } catch {
      return null;
    }
  },
  update: (id, fields) => apiFetch(`/users/${id}`, { method: "PATCH", body: fields }),
};

export const notificationsApi = {
  list: async () =>
    safeArray((await apiFetch("/notifications?limit=50"))?.notifications).map(normalizeNotification),
  unreadCount: () => apiFetch("/notifications/unread-count"),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () => apiFetch("/notifications/read-all", { method: "POST" }),
  remove: (id) => apiFetch(`/notifications/${id}`, { method: "DELETE" }),
  clearRead: () => apiFetch("/notifications/read", { method: "DELETE" }),
};

export const reportsApi = {
  create: (payload) => apiFetch("/reports", { method: "POST", body: payload }),
};