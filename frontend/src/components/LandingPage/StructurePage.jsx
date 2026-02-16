import React from "react";
import { FaShieldAlt, FaUserTie, FaUsers } from "react-icons/fa";

const StructurePage = () => {
  const cards = [
    {
      title: "ANO (Associate NCC Officer)",
      description: "Commanding Officers overseeing cadet operations",
      icon: <FaShieldAlt />,
    },
    {
      title: "SUO (Senior Under Officer)",
      description: "Senior cadets leading their units",
      icon: <FaUserTie />,
    },
    {
      title: "Cadets & Alumni",
      description: "Active members and veteran corps",
      icon: <FaUsers />,
    },
  ];

  return (
    // ✅ Added ID="structure" for scrolling
    <div className="page" id="structure">
      
      {/* CONTENT WRAPPER */}
      <main className="about">
        <header className="about-hero">
          <h1>Organizational Structure</h1>
          <p>
            The NCC operates through a well-defined hierarchy ensuring efficient
            command and communication.
          </p>
        </header>

        <section className="about-grid structure-grid">
          {cards.map((card, index) => (
            <article key={index} className="about-card structure-card">
              <div className="about-icon structure-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </section>
      </main>

      {/* Enhanced NCC Footer */}
      <footer className="site-footer">
        <div className="footer-tricolor-bar" />
        <div className="footer-content">
          <p className="footer-motto">Unity and Discipline</p>
          <p className="footer-motto-hindi">Ekta Aur Anushasan</p>
          <div className="footer-wings">
            <span className="footer-wing army">
              <span className="footer-wing-dot" /> Army Wing
            </span>
            <span className="footer-wing navy">
              <span className="footer-wing-dot" /> Naval Wing
            </span>
            <span className="footer-wing air">
              <span className="footer-wing-dot" /> Air Wing
            </span>
          </div>
          <div className="footer-divider" />
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} NCC Nexus &mdash; National Cadet Corps Digital Command Center
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StructurePage;