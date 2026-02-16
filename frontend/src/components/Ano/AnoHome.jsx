import { useState, useEffect } from "react";
import { FaUsers, FaUserPlus, FaClipboardCheck, FaChartLine } from "react-icons/fa";

const AnoHome = () => {
  const [cadets, setCadets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCadets = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/api/ano/cadets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setCadets(data);
      } catch (err) {
        console.error("Failed to fetch cadets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCadets();
  }, []);

  const totalCadets = cadets.length;
  const activeCadets = cadets.filter((c) => c.role === "Cadet").length;
  const suoCount = cadets.filter((c) => c.role === "SUO").length;
  const alumniCount = cadets.filter((c) => c.role === "Alumni").length;

  const userName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.name || "Officer";
    } catch {
      return "Officer";
    }
  })();

  return (
    <div className="ano-welcome-header">
      <div className="ano-welcome-banner">
        <h1>Welcome, {userName}</h1>
        <p>ANO Command Center — Manage your NCC unit effectively</p>
        <p className="ncc-motto-small">Unity and Discipline — Ekta Aur Anushasan</p>
      </div>

      <div className="ano-tricolor-divider" />

      <div className="ano-quick-stats">
        <div className="ano-stat-card">
          <div className="ano-stat-icon navy">
            <FaUsers />
          </div>
          <div className="ano-stat-info">
            <h3>{loading ? "..." : totalCadets}</h3>
            <p>Total Cadets</p>
          </div>
        </div>

        <div className="ano-stat-card">
          <div className="ano-stat-icon red">
            <FaUserPlus />
          </div>
          <div className="ano-stat-info">
            <h3>{loading ? "..." : activeCadets}</h3>
            <p>Active Cadets</p>
          </div>
        </div>

        <div className="ano-stat-card">
          <div className="ano-stat-icon lightblue">
            <FaClipboardCheck />
          </div>
          <div className="ano-stat-info">
            <h3>{loading ? "..." : suoCount}</h3>
            <p>SUOs</p>
          </div>
        </div>

        <div className="ano-stat-card">
          <div className="ano-stat-icon green">
            <FaChartLine />
          </div>
          <div className="ano-stat-info">
            <h3>{loading ? "..." : alumniCount}</h3>
            <p>Alumni</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnoHome;
