/**
 * PHASE 2 — the booking form is not live yet (see sessions.routes.js: the
 * backend route it calls intentionally 501s). The button now routes to the
 * Request Session page, which shows the real booking UI blurred behind a
 * "Coming Soon!" overlay so the Phase 2 vision is still communicated.
 *
 * When Phase 2 starts: the RequestSessionPage form will POST to /sessions.
 */
import React from "react";
import { useNavigate } from "react-router-dom";

export function RequestSessionButton({ mentorId, commentId }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/request-session/${mentorId || ""}`)}
      title="Request a mentoring session"
      className="text-[10px] sm:text-[11px] font-bold text-[#FF4F00] hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer"
    >
      Request Session
    </button>
  );
}