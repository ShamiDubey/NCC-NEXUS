import React, { useState, useRef } from "react";
import {
  CalendarDays,
  Clock,
  FileText,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Paperclip,
} from "lucide-react";
import "./cadetAttendance.css";

/* ── Mock data (will be replaced by API calls to database) ── */
const mockSessions = [
  {
    name: "Session Completed - January 2026",
    status: "completed",
    drills: [
      { name: "Drill 1", date: "05-01-2026", time: "06:00 AM" },
      { name: "Drill 2", date: "12-01-2026", time: "06:30 AM" },
      { name: "Drill 3", date: "19-01-2026", time: "04:00 PM" },
      { name: "Drill 4", date: "26-01-2026", time: "07:00 AM" },
    ],
    attendance: [true, true, false, true],
  },
  {
    name: "Session Completed - February 2026",
    status: "completed",
    drills: [
      { name: "Drill 1", date: "02-02-2026", time: "06:00 AM" },
      { name: "Drill 2", date: "09-02-2026", time: "04:30 PM" },
      { name: "Drill 3", date: "16-02-2026", time: "07:00 AM" },
      { name: "Drill 4", date: "23-02-2026", time: "06:00 AM" },
    ],
    attendance: [true, false, true, true],
  },
  {
    name: "Current Session - March 2026",
    status: "current",
    drills: [
      { name: "Drill 1", date: "02-03-2026", time: "06:00 AM" },
      { name: "Drill 2", date: "09-03-2026", time: "06:30 AM" },
      { name: "Drill 3", date: "16-03-2026", time: "04:00 PM" },
      { name: "Drill 4", date: "23-03-2026", time: "07:00 AM" },
      { name: "Drill 5", date: "30-03-2026", time: "06:00 AM" },
    ],
    attendance: [true, true, null, null, null],
  },
  {
    name: "Upcoming Session - April 2026",
    status: "upcoming",
    drills: [
      { name: "Drill 1", date: "06-04-2026", time: "06:30 AM" },
      { name: "Drill 2", date: "13-04-2026", time: "04:00 PM" },
      { name: "Drill 3", date: "20-04-2026", time: "07:00 AM" },
      { name: "Drill 4", date: "27-04-2026", time: "06:00 AM" },
    ],
    attendance: [null, null, null, null],
  },
];

/* Only current/upcoming sessions are eligible for leave */
const leaveEligibleSessions = mockSessions.filter(
  (s) => s.status === "current" || s.status === "upcoming"
);

const mockLeaveApplications = [
  {
    id: 1,
    date: "16-03-2026",
    drill: "Drill 3",
    session: "Current Session - March 2026",
    time: "04:00 PM",
    reason: "University exam scheduled on the same day",
    document: "exam_schedule.pdf",
    status: "pending",
    reviewedBy: null,
  },
  {
    id: 2,
    date: "23-03-2026",
    drill: "Drill 4",
    session: "Current Session - March 2026",
    time: "07:00 AM",
    reason: "Medical appointment - doctor visit for regular check-up",
    document: "medical_certificate.pdf",
    status: "approved",
    reviewedBy: "SUO Rajesh Kumar",
  },
  {
    id: 3,
    date: "06-04-2026",
    drill: "Drill 1",
    session: "Upcoming Session - April 2026",
    time: "06:30 AM",
    reason: "Family function - sister's wedding ceremony",
    document: null,
    status: "rejected",
    reviewedBy: "SUO Rajesh Kumar",
  },
];

/* ── Helpers ── */
function getAttendanceStats(sessions) {
  let total = 0;
  let present = 0;
  sessions.forEach((s) => {
    s.attendance.forEach((a) => {
      if (a !== null) {
        total++;
        if (a) present++;
      }
    });
  });
  const percent = total ? ((present / total) * 100).toFixed(1) : "0.0";
  return { total, present, absent: total - present, percent };
}

function getStatusIcon(status) {
  switch (status) {
    case "approved":
      return <CheckCircle2 size={16} />;
    case "rejected":
      return <XCircle size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
}

/* ── Component ── */
export default function CadetAttendance() {
  const [expandedSessions, setExpandedSessions] = useState({ 0: true });
  const [leaveApplications, setLeaveApplications] = useState(mockLeaveApplications);
  const [leaveForm, setLeaveForm] = useState({
    session: "",
    drill: "",
    date: "",
    time: "",
    reason: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const stats = getAttendanceStats(mockSessions);

  const toggleSession = (idx) => {
    setExpandedSessions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  /* Derive available drills — only future/unmarked drills (attendance === null) */
  const selectedSessionObj = leaveEligibleSessions.find((s) => s.name === leaveForm.session);
  const availableDrills = selectedSessionObj
    ? selectedSessionObj.drills.filter((_, i) => selectedSessionObj.attendance[i] === null)
    : [];

  const handleSessionChange = (val) => {
    setLeaveForm({ ...leaveForm, session: val, drill: "", date: "", time: "" });
  };

  const handleDrillChange = (val) => {
    const drill = availableDrills.find((d) => d.name === val);
    setLeaveForm({
      ...leaveForm,
      drill: val,
      date: drill ? drill.date : "",
      time: drill ? drill.time : "",
    });
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!leaveForm.session || !leaveForm.drill || !leaveForm.reason.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const newApp = {
      id: Date.now(),
      date: leaveForm.date,
      drill: leaveForm.drill,
      session: leaveForm.session,
      time: leaveForm.time,
      reason: leaveForm.reason.trim(),
      document: selectedFile ? selectedFile.name : null,
      status: "pending",
      reviewedBy: null,
    };

    setLeaveApplications([newApp, ...leaveApplications]);
    setLeaveForm({ session: "", drill: "", date: "", time: "", reason: "" });
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="ca-root">
      {/* ─── HEADER ─── */}
      <div className="ca-header">
        <div className="ca-header-text">
          <h1 className="ca-title">Attendance</h1>
          <p className="ca-subtitle">Track your drill attendance and manage leave applications</p>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="ca-stats-grid">
        <div className="ca-stat-card ca-stat-total">
          <span className="ca-stat-number">{stats.total}</span>
          <span className="ca-stat-label">Total Drills</span>
        </div>
        <div className="ca-stat-card ca-stat-present">
          <span className="ca-stat-number">{stats.present}</span>
          <span className="ca-stat-label">Present</span>
        </div>
        <div className="ca-stat-card ca-stat-absent">
          <span className="ca-stat-number">{stats.absent}</span>
          <span className="ca-stat-label">Absent</span>
        </div>
        <div className="ca-stat-card ca-stat-percent">
          <span className="ca-stat-number">{stats.percent}%</span>
          <span className="ca-stat-label">Attendance</span>
        </div>
      </div>

      {/* ─── ATTENDANCE TABLE ─── */}
      <div className="ca-section-card">
        <h2 className="ca-section-heading">Session-wise Attendance</h2>

        <div className="ca-sessions-list">
          {mockSessions.map((session, sIdx) => {
            const isExpanded = expandedSessions[sIdx];
            const sessionStats = {
              total: session.attendance.filter((a) => a !== null).length,
              present: session.attendance.filter((a) => a === true).length,
            };
            const sessionPercent = sessionStats.total
              ? ((sessionStats.present / sessionStats.total) * 100).toFixed(0)
              : "--";

            return (
              <div key={sIdx} className="ca-session-block">
                <button className="ca-session-header" onClick={() => toggleSession(sIdx)}>
                  <div className="ca-session-header-left">
                    <span className="ca-session-name">{session.name}</span>
                    <span className="ca-session-badge">
                      {sessionStats.present}/{sessionStats.total} present ({sessionPercent}%)
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {isExpanded && (
                  <div className="ca-session-table-wrap">
                    <table className="ca-att-table">
                      <thead>
                        <tr className="ca-drill-header-row">
                          {session.drills.map((drill, dIdx) => (
                            <th key={dIdx} className="ca-drill-th">
                              <div className="ca-drill-name">{drill.name}</div>
                              <div className="ca-drill-meta">
                                <CalendarDays size={12} />
                                <span>{drill.date}</span>
                              </div>
                              <div className="ca-drill-meta">
                                <Clock size={12} />
                                <span>{drill.time}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {session.attendance.map((att, aIdx) => (
                            <td key={aIdx} className="ca-att-cell">
                              {att === null ? (
                                <span className="ca-att-upcoming">--</span>
                              ) : att ? (
                                <span className="ca-att-present">Present</span>
                              ) : (
                                <span className="ca-att-absent">Absent</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── APPLY FOR LEAVE ─── */}
      <div className="ca-section-card">
        <h2 className="ca-section-heading">Apply for Leave</h2>

        <form className="ca-leave-form" onSubmit={handleSubmitLeave}>
          <div className="ca-form-grid">
            <div className="ca-form-group">
              <label className="ca-form-label">Session *</label>
              <select
                className="ca-form-select"
                value={leaveForm.session}
                onChange={(e) => handleSessionChange(e.target.value)}
              >
                <option value="">Select Session</option>
                {leaveEligibleSessions.map((s, i) => (
                  <option key={i} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="ca-form-group">
              <label className="ca-form-label">Drill *</label>
              <select
                className="ca-form-select"
                value={leaveForm.drill}
                onChange={(e) => handleDrillChange(e.target.value)}
                disabled={!leaveForm.session}
              >
                <option value="">Select Drill</option>
                {availableDrills.map((d, i) => (
                  <option key={i} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="ca-form-group">
              <label className="ca-form-label">Date</label>
              <div className="ca-form-readonly">
                <CalendarDays size={16} />
                <span>{leaveForm.date || "Auto-filled on drill selection"}</span>
              </div>
            </div>

            <div className="ca-form-group">
              <label className="ca-form-label">Time</label>
              <div className="ca-form-readonly">
                <Clock size={16} />
                <span>{leaveForm.time || "Auto-filled on drill selection"}</span>
              </div>
            </div>
          </div>

          <div className="ca-form-group ca-form-full">
            <label className="ca-form-label">Reason *</label>
            <textarea
              className="ca-form-textarea"
              rows={3}
              placeholder="Explain your reason for leave..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
            />
          </div>

          <div className="ca-form-group ca-form-full">
            <label className="ca-form-label">Supporting Documents</label>
            <div className="ca-file-area">
              {selectedFile ? (
                <div className="ca-file-chosen">
                  <Paperclip size={16} />
                  <span className="ca-file-name">{selectedFile.name}</span>
                  <button type="button" className="ca-file-remove" onClick={removeFile}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="ca-file-upload-btn"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={18} />
                  <span>Upload Document</span>
                  <span className="ca-file-hint">(PDF, JPG, PNG — Max 5 MB)</span>
                </button>
              )}
              <input
                type="file"
                ref={fileRef}
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files[0]) setSelectedFile(e.target.files[0]);
                }}
              />
            </div>
          </div>

          <button type="submit" className="ca-submit-btn">
            <Send size={18} />
            <span>Submit Leave Application</span>
          </button>
        </form>
      </div>

      {/* ─── LEAVE APPLICATION STATUS ─── */}
      <div className="ca-section-card">
        <h2 className="ca-section-heading">Leave Application Status</h2>

        {leaveApplications.length === 0 ? (
          <p className="ca-empty-msg">No leave applications submitted yet.</p>
        ) : (
          <div className="ca-leave-list">
            {leaveApplications.map((app) => (
              <div key={app.id} className={`ca-leave-card ca-leave-${app.status}`}>
                <div className="ca-leave-card-top">
                  <div className="ca-leave-info">
                    <span className="ca-leave-drill">{app.drill}</span>
                    <span className="ca-leave-sep">|</span>
                    <span className="ca-leave-session-name">{app.session}</span>
                  </div>
                  <div className={`ca-leave-status ca-status-${app.status}`}>
                    {getStatusIcon(app.status)}
                    <span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                  </div>
                </div>

                <div className="ca-leave-card-body">
                  <div className="ca-leave-detail-row">
                    <CalendarDays size={14} />
                    <span>{app.date}</span>
                    <Clock size={14} />
                    <span>{app.time}</span>
                  </div>
                  <p className="ca-leave-reason">
                    <FileText size={14} />
                    <span>{app.reason}</span>
                  </p>
                  {app.document && (
                    <div className="ca-leave-doc">
                      <Paperclip size={14} />
                      <span>{app.document}</span>
                    </div>
                  )}
                </div>

                {app.reviewedBy && (
                  <div className="ca-leave-card-footer">
                    Reviewed by: <strong>{app.reviewedBy}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
