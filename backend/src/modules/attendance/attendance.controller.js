const service = require("./attendance.service");
const {
  parseOrThrow,
  createSessionSchema,
  createDrillSchema,
  patchRecordsSchema,
  leaveCreateSchema,
  leaveReviewSchema,
  paramsIdSchema,
  paramsSessionIdSchema,
  paramsRegimentalSchema,
} = require("./attendance.validation");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const createSession = asyncHandler(async (req, res) => {
  const body = parseOrThrow(createSessionSchema, req.body);
  const data = await service.createSession({ reqUser: req.user, sessionName: body.session_name });
  res.status(201).json({ message: "Session created.", data });
});

const deleteSession = asyncHandler(async (req, res) => {
  const params = parseOrThrow(paramsIdSchema, req.params);
  await service.deleteSession({ reqUser: req.user, sessionId: params.id });
  res.status(200).json({ message: "Session deleted." });
});

const createDrill = asyncHandler(async (req, res) => {
  const body = parseOrThrow(createDrillSchema, req.body);
  const data = await service.createDrill({ reqUser: req.user, payload: body });
  res.status(201).json({ message: "Drill created.", data });
});

const deleteDrill = asyncHandler(async (req, res) => {
  const params = parseOrThrow(paramsIdSchema, req.params);
  await service.deleteDrill({ reqUser: req.user, drillId: params.id });
  res.status(200).json({ message: "Drill deleted." });
});

const patchRecords = asyncHandler(async (req, res) => {
  const body = parseOrThrow(patchRecordsSchema, req.body);
  await service.patchAttendanceRecords({ reqUser: req.user, updates: body.updates });
  res.status(200).json({ message: "Attendance records updated." });
});

const getSessions = asyncHandler(async (req, res) => {
  const data = await service.listSessions({ reqUser: req.user });
  res.status(200).json({ data });
});

const getSessionById = asyncHandler(async (req, res) => {
  const params = parseOrThrow(paramsIdSchema, req.params);
  const data = await service.getSessionDetail({ reqUser: req.user, sessionId: params.id });
  res.status(200).json({ data });
});

const exportSession = asyncHandler(async (req, res) => {
  const params = parseOrThrow(paramsSessionIdSchema, req.params);
  const { csv, sessionName } = await service.exportSessionCsv({
    reqUser: req.user,
    sessionId: params.sessionId,
  });

  const safeName = String(sessionName || "attendance").replace(/[^\w.-]+/g, "_");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="attendance_${safeName}.csv"`);
  res.status(200).send(csv);
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const params = parseOrThrow(paramsRegimentalSchema, req.params);
  const data = await service.getMyAttendance({
    reqUser: req.user,
    regimentalNo: params.regimental_no,
  });
  res.status(200).json({ data });
});

const submitLeave = asyncHandler(async (req, res) => {
  const body = parseOrThrow(leaveCreateSchema, req.body);
  const data = await service.submitLeave({
    reqUser: req.user,
    payload: body,
    file: req.file || null,
  });
  res.status(201).json({ message: "Leave submitted.", data });
});

const reviewLeave = asyncHandler(async (req, res) => {
  const params = parseOrThrow(paramsIdSchema, req.params);
  const body = parseOrThrow(leaveReviewSchema, req.body);
  const data = await service.reviewLeave({
    reqUser: req.user,
    leaveId: params.id,
    status: body.status,
  });
  res.status(200).json({ message: "Leave status updated.", data });
});

module.exports = {
  createSession,
  deleteSession,
  createDrill,
  deleteDrill,
  patchRecords,
  getSessions,
  getSessionById,
  exportSession,
  getMyAttendance,
  submitLeave,
  reviewLeave,
};

