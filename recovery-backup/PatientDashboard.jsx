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
    ["token", "role", "user", "userId", "userName"].forEach((key) =>
      localStorage.removeItem(key)
    );
    navigate("/login");
  };

  const menuItems = [
    { path: "/patient", icon: "▦", label: "Dashboard" },
    { path: "/patient/book-appointment", icon: "+", label: "Book Appointment" },
    { path: "/patient/appointments", icon: "▤", label: "My Appointments" },
    { path: "/patient/doctors", icon: "✚", label: "Doctors" },
    { path: "/patient/symptoms", icon: "♡", label: "AI Symptom Checker" },
    { path: "/patient/profile", icon: "◉", label: "My Profile" }
  ];

  const renderPage = () => {
    switch (currentPath) {
      case "/patient/book-appointment": return <BookAppointment />;
      case "/patient/appointments": return <MyAppointments />;
      case "/patient/doctors": return <Doctors />;
      case "/patient/symptoms": return <SymptomChecker />;
      case "/patient/profile": return <Profile />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">+</div>
          <div>
            <h2>AI HealthCare</h2>
            <span>Patient Portal</span>
          </div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>
        <nav className="patient-nav">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.path}
              className={`nav-item ${currentPath === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {currentPath === item.path && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon">i</span>
            <div><strong>Need assistance?</strong><small>We're here to help.</small></div>
          </div>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="patient-topbar">
          <div>
            <span className="topbar-eyebrow">PATIENT PORTAL</span>
            <h1>{currentPath === "/patient" ? "Your Health Dashboard" : (menuItems.find((item) => item.path === currentPath)?.label || "Patient Portal")}</h1>
          </div>
          <div className="patient-greeting">
            <div className="patient-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div><strong>{userName}</strong><span>Patient</span></div>
          </div>
        </header>

        <div className="patient-page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;
