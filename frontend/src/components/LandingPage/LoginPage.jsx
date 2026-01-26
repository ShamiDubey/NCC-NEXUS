import { useState } from "react";
import { FaMedal, FaLock, FaTimes } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import nccLogo from "../assets/ncc-logo.png";

const LoginPage = ({ isModal = false, onClose }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState("CADET");

  // ✅ Updated Login Logic
  const handleLogin = () => {
    if (role === "CADET") {
      navigate("/dashboard");
    } else if (role === "SUO") {
      navigate("/suo-dashboard");
    } else if (role === "ALUMNI") {
      navigate("/alumni-dashboard");
    } else {
      alert("Invalid Role Selected");
    }
    
    // Agar login modal ke andar hai, toh redirect ke baad modal band kardein
    if (isModal && onClose) {
      onClose();
    }
  };

  const card = (
    <div className="login-card">
      {isModal && (
        <button className="card-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      )}

      <span className="card-glow" />

      <img src={nccLogo} alt="NCC Logo" className="login-logo" />
      <h1 className="login-title">NCC NEXUS</h1>
      
      <div className="role-select">
        {["CADET", "SUO", "ALUMNI"].map((item) => (
          <button
            key={item}
            className={role === item ? "active" : ""}
            onClick={() => setRole(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="login-form">
        <div className="input-wrapper">
          <div className="input-group has-icon">
            <FaMedal className="input-icon" />
            <input type="text" placeholder="Regimental Number" />
          </div>
        </div>

        <div className="input-wrapper">
          <div className="input-group has-icon">
            <FaLock className="input-icon" />
            <input type="password" placeholder="Password" />
          </div>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          LOGIN
        </button>
      </div>
    </div>
  );

  return isModal ? card : <div className="login-page">{card}</div>;
};

export default LoginPage;