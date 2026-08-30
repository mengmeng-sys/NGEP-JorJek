/**
 * PHASE 2 — deliberately disabled for the Sep 17 demo.
 * See JorJek_Project_Scope.pdf, Section 4: the button stays visible so the
 * mentoring-bridge vision is still communicated, but it does nothing yet.
 * The backend route it would call (POST /sessions) intentionally 501s —
 * see backend/src/routes/sessions.routes.js.
 *
 * When Phase 2 starts: wire this up to open a time-slot proposal form and
 * POST /sessions, per the booking flow in JorJek.pdf.
 */
// eslint-disable-next-line no-unused-vars
export function RequestSessionButton({ mentorId, commentId }) {
  return (
    <button disabled title="Coming soon — session booking launches in Phase 2">
      Request Session (Coming Soon)
    </button>
  );
}
