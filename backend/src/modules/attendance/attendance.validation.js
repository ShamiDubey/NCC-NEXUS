const { z } = require("zod");

const pgDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "drill_date must be YYYY-MM-DD");
const pgTimeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "drill_time must be HH:mm or HH:mm:ss");

const createSessionSchema = z.object({
  session_name: z.string().trim().min(3).max(255),
});

const createDrillSchema = z.object({
  session_id: z.coerce.number().int().positive(),
  drill_name: z.string().trim().min(1).max(255),
  drill_date: pgDateSchema,
  drill_time: pgTimeSchema,
});

const patchRecordsSchema = z.object({
  updates: z
    .array(
      z.object({
        drill_id: z.coerce.number().int().positive(),
        regimental_no: z.string().trim().min(1).max(64),
        status: z.enum(["P", "A"]),
      })
    )
    .min(1),
});

const leaveCreateSchema = z.object({
  regimental_no: z.string().trim().min(1).max(64),
  session_id: z.coerce.number().int().positive(),
  drill_id: z.coerce.number().int().positive(),
  reason: z.string().trim().min(5).max(2000),
});

const leaveReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

const paramsIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const paramsSessionIdSchema = z.object({
  sessionId: z.coerce.number().int().positive(),
});

const paramsRegimentalSchema = z.object({
  regimental_no: z.string().trim().min(1).max(64),
});

const parseOrThrow = (schema, payload) => {
  const parsed = schema.safeParse(payload);
  if (parsed.success) return parsed.data;
  const issue = parsed.error.issues[0];
  const err = new Error(issue?.message || "Validation failed");
  err.status = 400;
  err.code = "VALIDATION_ERROR";
  throw err;
};

module.exports = {
  parseOrThrow,
  createSessionSchema,
  createDrillSchema,
  patchRecordsSchema,
  leaveCreateSchema,
  leaveReviewSchema,
  paramsIdSchema,
  paramsSessionIdSchema,
  paramsRegimentalSchema,
};

