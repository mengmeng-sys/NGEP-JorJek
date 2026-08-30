const { Router } = require("express");

/**
 * PHASE 2 — deliberately not implemented for the Sep 17 demo.
 * See JorJek_Project_Scope.pdf, Section 4.
 *
 * This route exists (rather than being absent) so the frontend's
 * disabled "Request a Session" button has something real to point at,
 * and so it's obvious in the API surface that this is planned, not
 * forgotten. Owner when Phase 2 starts: TN1.
 */
const sessionsRouter = Router();

sessionsRouter.all("*", (_req, res) => {
  res.status(501).json({
    error: "Session booking is Phase 2 and is not implemented yet.",
    seeAlso: "JorJek_Project_Scope.pdf, Section 4",
  });
});

module.exports = { sessionsRouter };
