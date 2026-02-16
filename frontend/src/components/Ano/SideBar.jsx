import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaUserPlus, FaUsers, FaClipboardList, FaComments, FaSignOutAlt } from "react-icons/fa";
import nccLogo from "../assets/ncc-logo.png";

const Sidebar = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    if (typeof onClose === "function") onClose();

    navigate("/");
  };

  const closeSidebar = () => {
    if (typeof onClose === "function") onClose();
  };

  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`}>
      <div className="sidebar-header">
        <img src={nccLogo} alt="NCC Logo" className="sidebar-logo" />
        <div>
          <h3>NCC NEXUS</h3>
          <span>ANO Command Portal</span>
        </div>
      </div>

      <nav className="menu">
        <NavLink to="/ano" end className="menu-item" onClick={closeSidebar}>
          <FaHome /> Dashboard
        </NavLink>

        <NavLink to="add-cadet" className="menu-item" onClick={closeSidebar}>
          <FaUserPlus /> Add Cadet
        </NavLink>

        <NavLink to="manage-cadets" className="menu-item" onClick={closeSidebar}>
          <FaUsers /> Manage Cadets
        </NavLink>

        <NavLink to="ano-attendance" className="menu-item" onClick={closeSidebar}>
          <FaClipboardList /> Attendance
        </NavLink>

        <NavLink to="chat" className="menu-item" onClick={closeSidebar}>
          <FaComments /> Chat
        </NavLink>

        <button
          type="button"
          className="menu-item logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
