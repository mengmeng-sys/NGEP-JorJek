import { apiFetch } from "@/lib/apiClient";

// Owner: CS1
export function VoteButtons({ postId, commentId }) {
  async function vote(value) {
    await apiFetch("/vote", { method: "POST", body: JSON.stringify({ postId, commentId, value }) });
  }

  return (
    <span>
      <button onClick={() => vote("UP")} aria-label="Upvote">▲</button>
      <button onClick={() => vote("DOWN")} aria-label="Downvote">▼</button>
    </span>
  );
}
