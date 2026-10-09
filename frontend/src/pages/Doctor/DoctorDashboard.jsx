import { useNavigate, useLocation } from "react-router-dom";

import DoctorHome from "../../components/Doctor/DoctorHome";
import TodayAppointments from "../../components/Doctor/TodayAppointments";
import DoctorAppointments from "../../components/Doctor/DoctorAppointments";
import Availability from "../../components/Doctor/Availability";
import DoctorProfile from "../../components/Doctor/DoctorProfile";

import "./DoctorDashboard.css";

function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // =======================================
  // Get logged-in user
  // =======================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const doctorName = user?.name || "Doctor";

  // =======================================
  // Current URL
  // =======================================

  const currentPath = location.pathname;

  // =======================================
  // Navigation helper
  // =======================================

  const goTo = (path) => {
    navigate(path);
  };

  // =======================================
  // Logout
  // =======================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    navigate("/login");
  };

  // =======================================
  // Render page based on URL
  // =======================================

  const renderPage = () => {
    switch (currentPath) {
      case "/doctor/today":
        return <TodayAppointments />;

      case "/doctor/appointments":
        return <DoctorAppointments />;

      case "/doctor/availability":
        return <Availability />;

      case "/doctor/profile":
        return <DoctorProfile />;

      case "/doctor":
      default:
        return <DoctorHome />;
    }
  };

  return (
    <div className="dashboard">

      {/* =================================
          Sidebar
      ================================= */}

      <aside className="sidebar">

        <h2>
          👨‍⚕️ Doctor Panel
        </h2>

        <ul>

          {/* Dashboard */}

          <li
            className={
              currentPath === "/doctor"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/doctor")
            }
          >
            🏠 Dashboard
          </li>

          {/* Today's Appointments */}

          <li
            className={
              currentPath === "/doctor/today"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/doctor/today")
            }
          >
            📅 Today's Appointments
          </li>

          {/* All Appointments */}

          <li
            className={
              currentPath === "/doctor/appointments"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/doctor/appointments")
            }
          >
            📋 All Appointments
          </li>

          {/* Availability */}

          <li
            className={
              currentPath === "/doctor/availability"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/doctor/availability")
            }
          >
            ⏰ Availability
          </li>

          {/* Profile */}

          <li
            className={
              currentPath === "/doctor/profile"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/doctor/profile")
            }
          >
            👤 Profile
          </li>

        </ul>

        {/* Logout */}

        <button onClick={handleLogout}>
          🚪 Logout
        </button>

      </aside>

      {/* =================================
          Main Content
      ================================= */}

      <main className="content">

        <div className="welcome-card">

          <h1>
            Welcome Dr. {doctorName} 👋
          </h1>

          <p>
            Manage appointments and your
            availability.
          </p>

        </div>

        <div style={{ marginTop: "30px" }}>
          {renderPage()}
        </div>

      </main>

    </div>
  );
}

export default DoctorDashboard;