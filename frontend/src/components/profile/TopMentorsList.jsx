import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { KarmaBadge } from "./KarmaBadge";

// Owner: CS2. Phase 1: ranked by karma, which is fed by upvotes
// (see backend/src/services/karma.service.js) — not session ratings yet.
export function TopMentorsList() {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    apiFetch("/users/top-mentors").then(setMentors);
  }, []);

  return (
    <ol>
      {mentors.map((m) => (
        <li key={m.id}>
          {m.displayName} <KarmaBadge karma={m.karma} />
        </li>
      ))}
    </ol>
  );
}
