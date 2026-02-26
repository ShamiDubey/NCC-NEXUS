exports.up = async function up(knex) {
  await knex.schema.createTable("attendance_sessions", (t) => {
    t.bigIncrements("session_id").primary();
    t
      .integer("college_id")
      .notNullable()
      .references("college_id")
      .inTable("colleges")
      .onDelete("CASCADE");
    t.string("session_name", 255).notNullable();
    t
      .integer("created_by_user_id")
      .notNullable()
      .references("user_id")
      .inTable("users")
      .onDelete("RESTRICT");
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("deleted_at");

    t.index(["college_id", "deleted_at"], "idx_attendance_sessions_college_active");
    t.index(["created_by_user_id"], "idx_attendance_sessions_created_by");
    t.index(["deleted_at"], "idx_attendance_sessions_deleted_at");
  });

  await knex.raw(`
    CREATE UNIQUE INDEX uq_attendance_sessions_college_name_active
    ON attendance_sessions (college_id, lower(session_name))
    WHERE deleted_at IS NULL
  `);

  await knex.schema.createTable("attendance_drills", (t) => {
    t.bigIncrements("drill_id").primary();
    t
      .bigInteger("session_id")
      .notNullable()
      .references("session_id")
      .inTable("attendance_sessions")
      .onDelete("CASCADE");
    t.string("drill_name", 255).notNullable();
    t.date("drill_date").notNullable();
    t.time("drill_time").notNullable();
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("deleted_at");

    t.index(["session_id", "deleted_at"], "idx_attendance_drills_session_active");
    t.index(["drill_date", "drill_time"], "idx_attendance_drills_date_time");
    t.index(["deleted_at"], "idx_attendance_drills_deleted_at");
  });

  await knex.raw(`
    CREATE UNIQUE INDEX uq_attendance_drills_session_name_active
    ON attendance_drills (session_id, lower(drill_name))
    WHERE deleted_at IS NULL
  `);

  await knex.schema.createTable("attendance_records", (t) => {
    t.bigIncrements("record_id").primary();
    t
      .bigInteger("drill_id")
      .notNullable()
      .references("drill_id")
      .inTable("attendance_drills")
      .onDelete("CASCADE");
    t
      .string("regimental_no")
      .notNullable()
      .references("regimental_no")
      .inTable("cadet_profiles")
      .onDelete("CASCADE");
    t.enu("status", ["P", "A"]).notNullable();
    t
      .integer("marked_by_user_id")
      .notNullable()
      .references("user_id")
      .inTable("users")
      .onDelete("RESTRICT");
    t.timestamp("marked_at").notNullable().defaultTo(knex.fn.now());

    t.unique(["drill_id", "regimental_no"], "uq_attendance_records_drill_cadet");
    t.index(["drill_id"], "idx_attendance_records_drill");
    t.index(["regimental_no"], "idx_attendance_records_regimental");
    t.index(["marked_by_user_id"], "idx_attendance_records_marked_by");
  });

  await knex.schema.createTable("leave_applications", (t) => {
    t.bigIncrements("leave_id").primary();
    t
      .string("regimental_no")
      .notNullable()
      .references("regimental_no")
      .inTable("cadet_profiles")
      .onDelete("CASCADE");
    t
      .bigInteger("session_id")
      .notNullable()
      .references("session_id")
      .inTable("attendance_sessions")
      .onDelete("CASCADE");
    t
      .bigInteger("drill_id")
      .notNullable()
      .references("drill_id")
      .inTable("attendance_drills")
      .onDelete("CASCADE");
    t.text("reason").notNullable();
    t.text("attachment_url");
    t.enu("status", ["pending", "approved", "rejected"]).notNullable().defaultTo("pending");
    t
      .integer("reviewed_by_user_id")
      .references("user_id")
      .inTable("users")
      .onDelete("SET NULL");
    t.timestamp("reviewed_at");
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    t.index(["regimental_no", "created_at"], "idx_leave_applications_regimental_created");
    t.index(["session_id", "status"], "idx_leave_applications_session_status");
    t.index(["drill_id"], "idx_leave_applications_drill");
    t.index(["status", "created_at"], "idx_leave_applications_status_created");
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at_attendance()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER trg_attendance_sessions_updated_at
    BEFORE UPDATE ON attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_attendance();
  `);

  await knex.raw(`
    CREATE TRIGGER trg_attendance_drills_updated_at
    BEFORE UPDATE ON attendance_drills
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_attendance();
  `);

  await knex.raw(`
    CREATE TRIGGER trg_leave_applications_updated_at
    BEFORE UPDATE ON leave_applications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_attendance();
  `);
};

exports.down = async function down(knex) {
  await knex.raw("DROP TRIGGER IF EXISTS trg_leave_applications_updated_at ON leave_applications");
  await knex.raw("DROP TRIGGER IF EXISTS trg_attendance_drills_updated_at ON attendance_drills");
  await knex.raw("DROP TRIGGER IF EXISTS trg_attendance_sessions_updated_at ON attendance_sessions");
  await knex.raw("DROP FUNCTION IF EXISTS set_updated_at_attendance");

  await knex.raw("DROP INDEX IF EXISTS uq_attendance_drills_session_name_active");
  await knex.raw("DROP INDEX IF EXISTS uq_attendance_sessions_college_name_active");

  await knex.schema.dropTableIfExists("leave_applications");
  await knex.schema.dropTableIfExists("attendance_records");
  await knex.schema.dropTableIfExists("attendance_drills");
  await knex.schema.dropTableIfExists("attendance_sessions");
};

