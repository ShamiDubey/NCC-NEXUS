const express = require("express");
const { authenticate } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const controller = require("./attendance.controller");

const router = express.Router();

const allowAttendanceRoles = (...roles) => (req, res, next) => {
  const isSuo = req.user?.role === "CADET" && String(req.user?.rank || "").toLowerCase() === "senior under officer";
  const resolvedRole = isSuo ? "SUO" : req.user?.role;
  if (!roles.includes(resolvedRole)) {
    return res.status(403).json({ message: "Access denied" });
  }
  return next();
};

router.use(authenticate);

// SUO
router.post("/sessions", allowAttendanceRoles("SUO"), controller.createSession);
router.delete("/sessions/:id", allowAttendanceRoles("SUO"), controller.deleteSession);
router.post("/drills", allowAttendanceRoles("SUO"), controller.createDrill);
router.delete("/drills/:id", allowAttendanceRoles("SUO"), controller.deleteDrill);
router.patch("/records", allowAttendanceRoles("SUO"), controller.patchRecords);
router.get("/export/:sessionId", allowAttendanceRoles("SUO", "ANO"), controller.exportSession);

// ANO
router.get("/sessions", allowAttendanceRoles("ANO", "SUO"), controller.getSessions);
router.get("/session/:id", allowAttendanceRoles("ANO", "SUO"), controller.getSessionById);

// CADET
router.get("/my/:regimental_no", allowAttendanceRoles("CADET"), controller.getMyAttendance);
router.post("/leave", allowAttendanceRoles("CADET"), upload.single("attachment"), controller.submitLeave);
router.patch("/leave/:id", allowAttendanceRoles("ANO", "SUO"), controller.reviewLeave);

module.exports = router;

