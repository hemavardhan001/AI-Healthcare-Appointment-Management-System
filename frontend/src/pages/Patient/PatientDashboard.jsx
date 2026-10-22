import { useNavigate, useLocation } from "react-router-dom";
import DashboardHome from "../../components/Dashboard/DashboardHome";
import BookAppointment from "../../components/Dashboard/BookAppointment";
import MyAppointments from "../../components/Dashboard/MyAppointments";
import Doctors from "../../components/Dashboard/Doctors";
import Profile from "../../components/Dashboard/Profile";
import SymptomChecker from "../../components/Dashboard/SymptomChecker";
import "./PatientDashboard.css";

function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.name || localStorage.getItem("userName") || "Patient";
  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const menuItems = [
    { path: "/patient", icon: "⌂", label: "Dashboard" },
    { path: "/patient/book-appointment", icon: "+", label: "Book Appointment" },
    { path: "/patient/appointments", icon: "▣", label: "My Appointments" },
    { path: "/patient/doctors", icon: "✚", label: "Find Doctors" },
    { path: "/patient/ai-assistant", icon: "✧", label: "AI Health Assistant" },
    { path: "/patient/profile", icon: "◎", label: "My Profile" },
  ];

  const renderPage = () => {
    switch (currentPath) {
      case "/patient/book-appointment": return <BookAppointment />;
      case "/patient/appointments": return <MyAppointments />;
      case "/patient/doctors": return <Doctors />;
      case "/patient/ai-assistant": return <SymptomChecker />;
      case "/patient/profile": return <Profile />;
      case "/patient": default: return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard med-dashboard">
      <aside className="sidebar med-sidebar">
        <div className="med-brand">
          <div className="med-brand-icon">✚</div>
          <div><h2>MedCare</h2><span>HEALTHCARE PORTAL</span></div>
        </div>

        <p className="med-menu-label">MENU</p>
        <ul className="med-nav">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={currentPath === item.path ? "active" : ""}
              onClick={() => navigate(item.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate(item.path);
              }}
            >
              <span className="med-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {currentPath === item.path && <span className="med-nav-arrow">›</span>}
            </li>
          ))}
        </ul>

        <div className="med-sidebar-help">
          <div className="med-help-icon">♡</div>
          <strong>Need assistance?</strong>
          <p>Your health matters to us.</p>
        </div>

        <button className="med-logout" onClick={handleLogout}>
          <span>↪</span> Sign Out
        </button>
      </aside>

      <main className="content med-content">
        <header className="med-topbar">
          <div>
            <span className="med-top-eyebrow">PATIENT PORTAL</span>
            <h2>Your Health Dashboard</h2>
          </div>
          <div className="med-user">
            <div className="med-user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div><strong>{userName}</strong><span>Patient Account</span></div>
          </div>
        </header>

        <section className="welcome-card med-welcome">
          <div className="med-welcome-copy">
            <span className="med-welcome-tag">YOUR HEALTH, OUR PRIORITY</span>
            <h1>Hello, {userName}!</h1>
            <p>Welcome to MedCare. Manage your appointments and take the next step toward better health.</p>
            <button onClick={() => navigate("/patient/book-appointment")}>
              + Book an Appointment
            </button>
          </div>
          <div className="med-welcome-art" aria-hidden="true">
            <div className="med-art-circle"><span>✚</span></div>
            <div className="med-art-plus med-art-plus-one">+</div>
            <div className="med-art-plus med-art-plus-two">+</div>
            <div className="med-art-dot"></div>
          </div>
        </section>

        <div className="med-page-content">{renderPage()}</div>

        <footer className="med-footer">
          <span>© {new Date().getFullYear()} MedCare Healthcare</span>
          <span>Your wellness journey starts here.</span>
        </footer>
      </main>
    </div>
  );
}

export default PatientDashboard;
