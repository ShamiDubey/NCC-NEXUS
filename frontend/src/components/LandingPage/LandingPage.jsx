import logoImage from "../assets/ncc-logo.png";

const LandingPage = ({ onCadetLogin, onAnoLogin }) => {
  const scrollToAbout = () => {
    const el = document.getElementById("about");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page" id="home">
      <main className="hero">
        <section className="hero-content">
          <span className="hero-pill">Official Digital Command Center</span>
          <h1>NCC Nexus</h1>
          <p className="hero-tagline">
            Empowering Discipline Through Digital Command
          </p>
          <p className="hero-body">
            A centralized digital platform for NCC Cadets, SUOs, Alumni, and ANOs.
            Streamlining operations, enhancing communication, and fostering excellence
            in the National Cadet Corps.
          </p>

          <div className="hero-actions">
            <button
              className="primary"
              type="button"
              onClick={onCadetLogin}
            >
              Cadet Login
            </button>
            <button
              className="secondary"
              type="button"
              onClick={onAnoLogin}
            >
              ANO Login
            </button>
          </div>

          {/* NCC Stats Highlights */}
          <div className="ncc-stats">
            <div className="ncc-stat">
              <div className="ncc-stat-icon red">&#9733;</div>
              <div className="ncc-stat-text">
                <span className="ncc-stat-value">Est. 1948</span>
                <span className="ncc-stat-label">Founded</span>
              </div>
            </div>
            <div className="ncc-stat">
              <div className="ncc-stat-icon navy">&#9873;</div>
              <div className="ncc-stat-text">
                <span className="ncc-stat-value">14 Lakh+</span>
                <span className="ncc-stat-label">Active Cadets</span>
              </div>
            </div>
            <div className="ncc-stat">
              <div className="ncc-stat-icon lightblue">&#9878;</div>
              <div className="ncc-stat-text">
                <span className="ncc-stat-value">3 Wings</span>
                <span className="ncc-stat-label">Army &middot; Navy &middot; Air</span>
              </div>
            </div>
          </div>
        </section>

        <section className="hero-visual" aria-hidden="true">
          <div className="glow-ring">
            <div className="logo-circle">
              <img src={logoImage} alt="" />
            </div>
          </div>
        </section>
      </main>

      {/* Scroll down indicator */}
      <div className="scroll-indicator" onClick={scrollToAbout}>
        <span>Scroll Down</span>
        <div className="scroll-mouse" />
      </div>
    </div>
  );
};

export default LandingPage;