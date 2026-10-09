import { useNavigate, useLocation } from "react-router-dom";

import DashboardHome from "../../components/Dashboard/DashboardHome";
import BookAppointment from "../../components/Dashboard/BookAppointment";
import MyAppointments from "../../components/Dashboard/MyAppointments";
import Doctors from "../../components/Dashboard/Doctors";
import Profile from "../../components/Dashboard/Profile";

import "./PatientDashboard.css";

function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // =======================================
  // Get logged-in user
  // =======================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName = user?.name || "Patient";

  // =======================================
  // Determine current page from URL
  // =======================================

  const currentPath = location.pathname;

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
  // Navigation helper
  // =======================================

  const goTo = (path) => {
    navigate(path);
  };

  // =======================================
  // Render current page
  // =======================================

  const renderPage = () => {
    switch (currentPath) {
      case "/patient/book-appointment":
        return <BookAppointment />;

      case "/patient/appointments":
        return <MyAppointments />;

      case "/patient/doctors":
        return <Doctors />;

      case "/patient/profile":
        return <Profile />;

      case "/patient":
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard">

      {/* =================================
          Sidebar
      ================================= */}

      <aside className="sidebar">

        <h2>🏥 AI HealthCare</h2>

        <ul>

          {/* Dashboard */}

          <li
            className={
              currentPath === "/patient"
                ? "active"
                : ""
            }
            onClick={() => goTo("/patient")}
          >
            🏠 Dashboard
          </li>


          {/* Book Appointment */}

          <li
            className={
              currentPath === "/patient/book-appointment"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/patient/book-appointment")
            }
          >
            📅 Book Appointment
          </li>


          {/* My Appointments */}

          <li
            className={
              currentPath === "/patient/appointments"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/patient/appointments")
            }
          >
            📖 My Appointments
          </li>


          {/* Doctors */}

          <li
            className={
              currentPath === "/patient/doctors"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/patient/doctors")
            }
          >
            👨‍⚕️ Doctors
          </li>


          {/* Profile */}

          <li
            className={
              currentPath === "/patient/profile"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/patient/profile")
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
            Welcome, {userName} 👋
          </h1>

          <p>
            Manage your appointments, doctors
            and profile from one place.
          </p>

        </div>


        <div style={{ marginTop: "30px" }}>
          {renderPage()}
        </div>

      </main>

    </div>
  );
}

export default PatientDashboard;