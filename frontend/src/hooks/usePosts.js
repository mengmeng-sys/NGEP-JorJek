import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// Owner: CS1. Fetches the tag feed / home feed.
export function usePosts(tag) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(tag ? `/posts?tag=${encodeURIComponent(tag)}` : "/posts")
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [tag]);

  return { posts, loading };
}
