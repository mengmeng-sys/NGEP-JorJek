import { useState, useEffect, useCallback, useRef } from "react";
import { postsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiClient";

/**
 * Fetch the post feed from the backend.
 *
 * @param {Object} options
 * @param {string} [options.tag]    filter by a single tag (used by TagFeedPage)
 * @param {number} [options.page]
 * @param {number} [options.limit]
 */
export function usePosts({ tag, page = 1, limit = 50 } = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const requestedRef = useRef(null);

  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem("jorjek_auth_user");
      return raw ? JSON.parse(raw).id : null;
    } catch {
      return null;
    }
  })();

  const load = useCallback(async () => {
    const key = `${tag ?? ""}|${page}|${limit}`;
    if (requestedRef.current === key) return;
    requestedRef.current = key;

    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.list({ tag, page, limit, currentUserId });
      setPosts(data.posts);
      setTotal(data.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tag, page, limit, currentUserId]);

  useEffect(() => {
    load();
  }, [load]);

  return { posts, loading, error, total, refresh: load };
}