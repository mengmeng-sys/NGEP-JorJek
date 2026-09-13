import { useState } from "react";
import { votesApi } from "@/lib/api";

// Owner: CS1
export function VoteButtons({ postId, commentId }) {
  const [error, setError] = useState("");

  async function vote(value) {
    setError("");
    try {
      const target = postId ? { postId } : { commentId };
      await votesApi.cast(target, value === "DOWN" ? -1 : 1);
    } catch (err) {
      setError(err?.message || "Could not update vote");
    }
  }

  return (
    <span title="Vote">
      <button onClick={() => vote("UP")} aria-label="Upvote">▲</button>
      <button onClick={() => vote("DOWN")} aria-label="Downvote">▼</button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </span>
  );
}