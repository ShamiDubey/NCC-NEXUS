import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PhoneOff, Shield, Users, Clock } from "lucide-react";
import { updateMeetingStatusAsync } from "../../store/meetingSlice";
import { emitToggleBriefing } from "../../features/ui/socket";
import { MEETING_STATUS } from "./meetingUtils";
import "./meetingModule.css";

const AuthorityControlPanel = ({
  meeting,
  basePath = "/meetings",
  canToggleBriefing = true,
  onViewDetails,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const participants = useSelector((state) => state.meetings.participants[meeting.id] || []);
  const waitingRoom = useSelector((state) => state.meetings.waitingRoom[meeting.id] || []);
  const isBriefing = useSelector((state) => state.meetings.briefingMode[meeting.id] || false);

  const endMeeting = () => {
    dispatch(updateMeetingStatusAsync({ meetingId: meeting.id, status: MEETING_STATUS.ENDED }));
    if (onViewDetails) { onViewDetails(meeting.id); } else { navigate(`${basePath}/${meeting.id}`); }
  };

  const handleBriefingToggle = () => {
    // No local dispatch here — the server broadcasts "meeting:briefing_mode"
    // back to the whole room (host included), and that's what updates Redux.
    // This keeps every participant's banner in sync with the host's actual
    // click instead of only the host's own browser.
    emitToggleBriefing(meeting.id);
  };

  return (
    <div className="meeting-authority-panel">
      <h3 className="meeting-authority-panel-title">
        <Shield size={18} />
        Command Control Panel
      </h3>

      <div className="meeting-authority-stats">
        <div className="meeting-authority-stat">
          <Users size={16} />
          <span>{participants.length}</span>
          <label>Participants</label>
        </div>
        <div className="meeting-authority-stat">
          <Clock size={16} />
          <span>{waitingRoom.length}</span>
          <label>Waiting</label>
          {waitingRoom.length > 0 ? (
            <span className="meeting-authority-badge">{waitingRoom.length}</span>
          ) : null}
        </div>
      </div>

      <div className="meeting-authority-actions">
        {canToggleBriefing ? (
          <button
            className={`meeting-btn ${isBriefing ? "meeting-btn-briefing-active" : "meeting-btn-secondary"}`}
            onClick={handleBriefingToggle}
          >
            <Shield size={14} />
            {isBriefing ? "Briefing Mode ON" : "Briefing Mode"}
          </button>
        ) : null}

        <button className="meeting-btn meeting-btn-danger" onClick={endMeeting}>
          <PhoneOff size={14} />
          End Meeting
        </button>
      </div>
    </div>
  );
};

export default AuthorityControlPanel;
