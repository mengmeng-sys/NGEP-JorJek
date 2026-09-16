import { useState, useEffect, useCallback, useRef } from "react";
import { postsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiClient";

/**
 * Fetch the post feed from the backend, with Facebook-style infinite scroll:
 * the first page loads on mount, and `loadMore()` appends the next page to
 * the existing list instead of replacing it. Changing `tag` resets back to
 * page 1 (used by TagFeedPage).
 *
 * @param {Object} options
 * @param {string} [options.tag]    filter by a single tag (used by TagFeedPage)
 * @param {number} [options.limit]  page size for each batch (default 8)
 */
export function usePosts({ tag, limit = 8 } = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // first page only
  const [loadingMore, setLoadingMore] = useState(false); // subsequent pages
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const pageRef = useRef(1);
  const requestedRef = useRef(null);
  const inFlightRef = useRef(false);

  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem("jorjek_auth_user");
      return raw ? JSON.parse(raw).id : null;
    } catch {
      return null;
    }
  })();

  // Initial load (and reload whenever `tag` changes) — always resets to page 1.
  const load = useCallback(async () => {
    const key = tag ?? "";
    if (requestedRef.current === key) return;
    requestedRef.current = key;

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.list({ tag, page: 1, limit, currentUserId });
      pageRef.current = 1;
      setPosts(data.posts);
      setTotal(data.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [tag, limit, currentUserId]);

  // Fetch the next page and append it — the "keep scrolling" part.
  const loadMore = useCallback(async () => {
    if (inFlightRef.current || loading) return;
    if (posts.length >= total) return; // nothing more to fetch
    inFlightRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const data = await postsApi.list({ tag, page: nextPage, limit, currentUserId });
      pageRef.current = nextPage;
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...data.posts.filter((p) => !seen.has(p.id))];
      });
      setTotal(data.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoadingMore(false);
      inFlightRef.current = false;
    }
  }, [tag, limit, currentUserId, posts.length, total, loading]);

  const updatePost = useCallback((updated) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasMore = posts.length < total;

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    total,
    refresh: load,
    loadMore,
    updatePost,
    setPosts,
  };
}
