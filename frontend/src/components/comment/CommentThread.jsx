import { VoteButtons } from "./VoteButtons";
import { RequestSessionButton } from "../session/RequestSessionButton";

// Owner: CS1
// comments shape: [{ id, body, author: { id, displayName }, parentId }]
export function CommentThread({ comments }) {
  const topLevel = comments.filter((c) => !c.parentId);

  return (
    <ul>
      {topLevel.map((c) => (
        <li key={c.id}>
          <p>{c.body}</p>
          <span>{c.author.displayName}</span>
          <VoteButtons commentId={c.id} />
          {/* Phase 2 stub — see component for why this is disabled */}
          <RequestSessionButton mentorId={c.author.id} commentId={c.id} />
        </li>
      ))}
    </ul>
  );
}
