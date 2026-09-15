// Normalizers that map backend API payloads (snake_case, nested Supabase joins)
// into the shapes the UI components already expect.

export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function initialsFrom(name) {
  if (!name) return "U";
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function handleFrom(name) {
  if (!name) return "user";
  return String(name).toLowerCase().replace(/\s+/g, "");
}

export function formatTimestamp(iso) {
  if (!iso) return "Recently";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return date.toLocaleDateString();
}

export function voteScore(votes) {
  return safeArray(votes).reduce((sum, v) => sum + (Number(v.value) || 0), 0);
}

/** Returns the current user's vote on an entity: 1 = up, -1 = down, 0 = none */
export function currentUserVote(votes, userId) {
  if (!userId) return 0;
  const mine = safeArray(votes).find(
    (v) => v.user_id === userId || v.userId === userId
  );
  if (!mine) return 0;
  return Number(mine.value) > 0 ? 1 : -1;
}

/** Extract tag names from backend `post_tags(tag: skill_tags(*))` joins. */
export function postTagNames(rawTags) {
  return safeArray(rawTags)
    .map((t) => {
      if (typeof t === "string") return t.replace(/^#/, "");
      if (t?.tag?.name) return String(t.tag.name).replace(/^#/, "");
      if (t?.name) return String(t.name).replace(/^#/, "");
      return "";
    })
    .filter(Boolean);
}

/**
 * Turn a backend user row (snake_case or camelCase) into the UI user shape.
 */
export function normalizeUser(row) {
  if (!row) return null;
  const name =
    row.displayName || row.display_name || row.email || "CADT Student";
  return {
    id: row.id,
    email: row.email,
    displayName: name,
    handle: row.handle || handleFrom(name),
    initials: row.initials || initialsFrom(name),
    role: row.role || "STUDENT",
    bio: row.bio || null,
    gen: row.gen ?? null,
    department: row.department || null,
    specialization: row.specialization || null,
    karma: row.karma ?? 0,
    emailVerified: row.emailVerified ?? row.email_verified ?? false,
    showProfileToGuests: row.showProfileToGuests ?? row.show_profile_to_guests ?? true,
    allowDirectRequests: row.allowDirectRequests ?? row.allow_direct_requests ?? true,
    showOnlineStatus: row.showOnlineStatus ?? row.show_online_status ?? false,
    receiveEmailNotifications: row.receiveEmailNotifications ?? row.receive_email_notifications ?? true,
    createdAt: row.createdAt || row.created_at || null,
  };
}

/**
 * Turn a backend post row into the shape PostCard/feeds expect.
 */
export function normalizePost(raw, currentUserId = null) {
  if (!raw) return null;
  const author = raw.author || {};
  const authorName =
    author.display_name || author.displayName || "CADT Student";
  const tags = postTagNames(raw.tags);
  const votes = safeArray(raw.votes);
  const rawComments = Array.isArray(raw.comments) ? raw.comments : null;

  return {
    id: raw.id,
    userId: raw.author_id || author.id || null,
    author: authorName,
    handle: author.handle || handleFrom(authorName),
    authorHandle: author.handle || handleFrom(authorName),
    authorEmail: author.email || null,
    initials: author.initials || initialsFrom(authorName),
    role: author.role || raw.role || "STUDENT",
    title: raw.title || "Untitled",
    content: raw.body || raw.content || "",
    body: raw.body,
    type: raw.type || "question",
    allowMentoring: raw.allow_mentoring ?? raw.allowMentoring ?? false,
    tags,
    tag: tags.length > 0 ? `#${tags[0]}` : raw.tag ? String(raw.tag).replace(/^#/, "#") : undefined,
    timestamp: formatTimestamp(raw.created_at),
    createdAt: raw.created_at,
    upvotes: voteScore(votes),
    voteTotal: votes.length,
    myVote: currentUserVote(votes, currentUserId),
    hasUpvoted: currentUserId ? currentUserVote(votes, currentUserId) === 1 : Boolean(raw.hasUpvoted),
    hasDownvoted: currentUserId ? currentUserVote(votes, currentUserId) === -1 : false,
    comments: rawComments ? rawComments.length : raw.comments ?? 0,
    commentsCount: rawComments ? rawComments.length : raw.comments ?? 0,
    _comments: rawComments,
    isSaved: Boolean(raw.isSaved),
    image_url: raw.image_url || null,
  };
}

/**
 * Turn a backend comment row into the shape the comment UI expects.
 */
export function normalizeComment(raw) {
  if (!raw) return null;
  const author = raw.author || {};
  const authorName = author.display_name || author.displayName || "CADT Student";
  const votes = safeArray(raw.votes);

  return {
    id: raw.id,
    body: raw.body || "",
    parentId: raw.parent_comment_id || raw.parentId || null,
    author: {
      id: raw.author_id || author.id,
      displayName: authorName,
      role: author.role || "STUDENT",
      initials: author.initials || initialsFrom(authorName),
      handle: author.handle || handleFrom(authorName),
      karma: author.karma,
    },
    authorId: raw.author_id || author.id,
    votes: voteScore(votes),
    myVote: 0,
    createdAt: raw.created_at,
    timestamp: formatTimestamp(raw.created_at),
    replies: [],
  };
}

const NOTIFICATION_TITLES = {
  reply: "New reply on your post",
  upvote: "Someone upvoted your post",
};

const NOTIFICATION_MESSAGES = {
  reply: "A CADT user replied to your discussion.",
  upvote: "Your post received an upvote.",
};

export function normalizeNotification(raw) {
  if (!raw) return null;
  const payload = raw.payload || {};
  const type = String(raw.type || "notification");
  const link = payload.postId
    ? `/posts/${payload.postId}`
    : payload.postId
    ? `/posts/${payload.postId}`
    : null;

  return {
    id: raw.id,
    type,
    read: Boolean(raw.read),
    title: NOTIFICATION_TITLES[type] || type,
    message: NOTIFICATION_MESSAGES[type] || (payload.message || "New activity on JorJek."),
    sibling: typeof payload === "object" ? Object.keys(payload)[0] || null : null,
    timestamp: formatTimestamp(raw.created_at),
    createdAt: raw.created_at,
    actorInitials: "CA",
    link,
    payload,
  };
}

export function normalizeMentor(row) {
  if (!row) return null;
  const name = row.displayName || row.display_name || "Mentor";
  return {
    id: row.id,
    displayName: name,
    name,
    handle: row.handle || handleFrom(name),
    initials: row.initials || initialsFrom(name),
    role: row.role || "STUDENT",
    karma: row.karma ?? 0,
    specialty: row.bio || "Peer mentor",
  };
}

/** Build a nested comment thread (top-level + replies) from a flat list. */
export function buildCommentTree(comments) {
  const normalized = safeArray(comments).map(normalizeComment).filter(Boolean);
  const nodesById = new Map(normalized.map((c) => [c.id, c]));
  const roots = [];

  normalized.forEach((c) => {
    if (c.parentId && nodesById.has(c.parentId)) {
      nodesById.get(c.parentId).replies.push(c);
    } else {
      roots.push(c);
    }
  });

  return roots;
}