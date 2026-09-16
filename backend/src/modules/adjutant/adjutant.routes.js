// Responsibility: Route definitions for the AI Adjutant (/api/adjutant).
// Layer: AI Adjutant (Layer 3) routes.
// Depends on: existing auth.middleware (authenticate) + adjutant.controller.
// Must never be depended on by: any existing/legacy module.
// Mounted additively in app.js as app.use("/api/adjutant", ...). All routes are
// staff-only (ANO, or a CADET whose rank is Senior Under Officer) — the Adjutant
// reasons over cohort-wide data a regular cadet must never see.

const express = require("express");
const { authenticate } = require("../../middlewares/auth.middleware");
const controller = require("./adjutant.controller");

const router = express.Router();

const staffOnly = (req, res, next) => {
  const role = String(req.user?.role || "").toUpperCase();
  const isSuo =
    role === "CADET" &&
    String(req.user?.rank || "").toLowerCase() === "senior under officer";
  if (role === "ANO" || isSuo) return next();
  return res.status(403).json({ message: "Access denied" });
};

router.use(authenticate);
router.use(staffOnly);

router.get("/conversations", controller.listConversations);
router.post("/conversations", controller.createConversation);
router.patch("/conversations/:id", controller.renameConversation);
router.delete("/conversations/:id", controller.deleteConversation);
router.get("/conversations/:id/messages", controller.getMessages);
router.post("/conversations/:id/messages", controller.sendMessage);

router.get("/proposals", controller.listProposals);
router.post("/proposals/:id/approve", controller.approveProposal);
router.post("/proposals/:id/reject", controller.rejectProposal);

// Adjutant-scoped error handler (additive — the global app handler masks every
// 5xx as "Internal Server Error"). Errors we raised ourselves (err.status set,
// message written for the officer) pass through verbatim so the UI can show
// WHY a turn failed; anything unexpected stays generic.
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  const status = Number(err.status || err.statusCode);
  if (Number.isInteger(status) && status >= 400) {
    return res.status(status).json({ message: err.message });
  }
  console.error("[adjutant] unexpected error:", err);
  return res.status(500).json({ message: "Adjutant internal error." });
});

module.exports = router;
