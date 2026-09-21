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
  microsoftCheck: (idToken) =>
    apiFetch("/auth/microsoft/check", { method: "POST", body: { idToken } }),
  microsoftSignup: (payload) =>
    apiFetch("/auth/microsoft/signup", { method: "POST", body: payload }),
  microsoftLogin: (idToken) =>
    apiFetch("/auth/microsoft/login", { method: "POST", body: { idToken } }),
  microsoftResetPassword: (idToken, newPassword) =>
    apiFetch("/auth/microsoft/reset-password", { method: "POST", body: { idToken, newPassword } }),
  mfaSetup: () => apiFetch("/auth/mfa/setup", { method: "POST" }),
  mfaEnable: (token) => apiFetch("/auth/mfa/enable", { method: "POST", body: { token } }),
  mfaDisable: (token) => apiFetch("/auth/mfa/disable", { method: "POST", body: { token } }),
  mfaValidate: (mfaToken, totpCode) =>
    apiFetch("/auth/mfa/validate", { method: "POST", body: { mfaToken, totpCode } }),
  mfaStatus: () => apiFetch("/auth/mfa/status"),
  forgotPassword: (email) =>
    apiFetch("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (email, otpCode, newPassword) =>
    apiFetch("/auth/reset-password", { method: "POST", body: { email, otpCode, newPassword } }),
};

export const uploadsApi = {
  // Sends a raw File to POST /uploads (multipart) and returns its public URL.
  upload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    // The shared axios instance (apiClient.js) hardcodes a default
    // Content-Type of application/json, which — unlike a merely-defaulted
    // header — axios will NOT override for FormData on its own. Explicitly
    // clearing it here lets the browser set its own
    // "multipart/form-data; boundary=..." header, which the server actually
    // needs to split the request into fields/files. Without this, the
    // request goes out mislabeled as JSON and multer sees no file at all.
    return apiFetch("/uploads", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": undefined },
    });
  },
};

// CreatePostModal hands us either a raw File (a brand-new picture the user
// just picked/dropped — needs uploading) or a plain URL (an existing post's
// image, unchanged, or explicitly cleared to null). This turns either into
// the URL string /posts should actually store, uploading only when needed.
// Returns undefined when there's nothing to change, so callers can tell "no
// image info was sent" apart from "the image was intentionally cleared."
async function resolveImageUrl(payload) {
  if (payload.imageFile) {
    const { url } = await uploadsApi.upload(payload.imageFile);
    return url;
  }
  if (payload.image_url === null) return null; // explicit removal
  if (payload.image_url && !String(payload.image_url).startsWith("blob:")) {
    return payload.image_url; // unchanged existing image
  }
  return undefined; // no image info supplied — leave whatever's there alone
}

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
      body: payload.content ?? payload.body ?? "",
      tagNames: safeArray(payload.tags).map((t) => String(t).replace(/^#/, "")),
    };
    if (payload.allowMentoring !== undefined) postBody.allowMentoring = payload.allowMentoring;
    // Uploads the picked file (if any) before creating the post, so the post
    // is written with a real, permanent URL rather than a local blob: one.
    const imageUrl = await resolveImageUrl(payload);
    if (imageUrl !== undefined) postBody.image_url = imageUrl;
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
    const imageUrl = await resolveImageUrl(payload);
    if (imageUrl !== undefined) updates.image_url = imageUrl;
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
  list: ({ featured } = {}) =>
    apiFetch(`/tags?limit=100${featured ? "&featured=true" : ""}`),
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
  search: async (q) => {
    const data = await apiFetch(`/users/search?q=${encodeURIComponent(q)}`);
    return safeArray(data.users).map(normalizeMentor);
  },
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
