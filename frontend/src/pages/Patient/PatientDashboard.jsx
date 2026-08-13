import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHome from "../../components/Dashboard/DashboardHome";
import BookAppointment from "../../components/Dashboard/BookAppointment";
import MyAppointments from "../../components/Dashboard/MyAppointments";
import Doctors from "../../components/Dashboard/Doctors";
import Profile from "../../components/Dashboard/Profile";

import "./PatientDashboard.css";

function PatientDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");

  const user = JSON.parse(localStorage.getItem("user"));
const userName = user?.name || "Patient";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const renderPage = () => {
    switch (activePage) {
      case "book":
        return <BookAppointment />;

      case "appointments":
        return <MyAppointments />;

      case "doctors":
        return <Doctors />;

      case "profile":
        return <Profile />;

      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>🏥 AI HealthCare</h2>

        <ul>
          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            🏠 Dashboard
          </li>

          <li
            className={activePage === "book" ? "active" : ""}
            onClick={() => setActivePage("book")}
          >
            📅 Book Appointment
          </li>

          <li
            className={activePage === "appointments" ? "active" : ""}
            onClick={() => setActivePage("appointments")}
          >
            📖 My Appointments
          </li>

          <li
            className={activePage === "doctors" ? "active" : ""}
            onClick={() => setActivePage("doctors")}
          >
            👨‍⚕️ Doctors
          </li>

          <li
            className={activePage === "profile" ? "active" : ""}
            onClick={() => setActivePage("profile")}
          >
            👤 Profile
          </li>
        </ul>

        <button onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="content">
        <div className="welcome-card">
          <h1>Welcome, {userName} 👋</h1>
          <p>
            Manage your appointments, doctors and profile from one place.
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