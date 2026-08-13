import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DoctorHome from "../components/Doctor/DoctorHome";
import TodayAppointments from "../components/Doctor/TodayAppointments";
import Availability from "../components/Doctor/Availability";
import DoctorProfile from "../components/Doctor/DoctorProfile";

import "./DoctorDashboard.css";

function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorName = user?.name || "Doctor";

  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const renderPage = () => {
    switch (activePage) {
      case "appointments":
        return <TodayAppointments />;

      case "availability":
        return <Availability />;

      case "profile":
        return <DoctorProfile />;

      default:
        return <DoctorHome />;
    }
  };

  return (
    <div className="dashboard">

      <aside className="sidebar">

        <h2>👨‍⚕️ Doctor Panel</h2>

        <ul>

          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            🏠 Dashboard
          </li>

          <li
            className={activePage === "appointments" ? "active" : ""}
            onClick={() => setActivePage("appointments")}
          >
            📅 Today's Appointments
          </li>

          <li
            className={activePage === "availability" ? "active" : ""}
            onClick={() => setActivePage("availability")}
          >
            ⏰ Availability
          </li>

          <li
            className={activePage === "profile" ? "active" : ""}
            onClick={() => setActivePage("profile")}
          >
            👤 Profile
          </li>

        </ul>

        <button onClick={handleLogout}>
          🚪 Logout
        </button>

      </aside>

      <main className="content">

        <div className="welcome-card">
          <h1>Welcome Dr. {doctorName} 👋</h1>
          <p>Manage appointments and your availability.</p>
        </div>

        <div style={{ marginTop: "30px" }}>
          {renderPage()}
        </div>

      </main>

    </div>
  );
}

export default DoctorDashboard;