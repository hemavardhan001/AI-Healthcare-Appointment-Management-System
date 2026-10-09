import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./DoctorHome.css";

function DoctorHome() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // Get logged-in doctor
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const doctorName = user?.name || "Doctor";

  // ==========================================
  // Get today's date
  // ==========================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // Format date
  // ==========================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // Format time
  // ==========================================

  const formatTime = (timeString) => {
    if (!timeString) {
      return "N/A";
    }

    const [hours, minutes] = timeString.split(":");

    const hour = Number(hours);

    if (Number.isNaN(hour)) {
      return timeString;
    }

    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${period}`;
  };

  // ==========================================
  // Format status
  // ==========================================

  const formatStatus = (status) => {
    if (!status) {
      return "";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  // ==========================================
  // Load appointments
  // ==========================================

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/appointments/doctor");

      console.log(
        "Doctor Dashboard Appointments:",
        res.data
      );

      setAppointments(
        Array.isArray(res.data?.appointments)
          ? res.data.appointments
          : []
      );
    } catch (err) {
      console.error(
        "Doctor Dashboard Error:",
        err
      );

      setAppointments([]);

      setError(
        err.response?.data?.message ||
          "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Load on page open
  // ==========================================

  useEffect(() => {
    loadAppointments();
  }, []);

  // ==========================================
  // Sort appointments
  // ==========================================

  const sortedAppointments = [...appointments].sort(
    (a, b) => {
      const dateA = new Date(
        `${a.appointment_date}T${a.start_time || "00:00"}`
      );

      const dateB = new Date(
        `${b.appointment_date}T${b.start_time || "00:00"}`
      );

      return dateA - dateB;
    }
  );

  // ==========================================
  // Today's appointments
  // ==========================================

  const todayDate = getTodayDate();

  const todayAppointments = sortedAppointments.filter(
    (appointment) =>
      appointment.appointment_date === todayDate
  );

  // ==========================================
  // Appointment statistics
  // ==========================================

  const totalAppointments = appointments.length;

  const scheduledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "scheduled"
    ).length;

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "completed"
    ).length;

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "cancelled"
    ).length;

  // ==========================================
  // Recent appointments
  // ==========================================

  const recentAppointments = [...appointments]
    .sort((a, b) => {
      const dateA = new Date(
        `${a.appointment_date}T${a.start_time || "00:00"}`
      );

      const dateB = new Date(
        `${b.appointment_date}T${b.start_time || "00:00"}`
      );

      return dateB - dateA;
    })
    .slice(0, 5);

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="doctor-dashboard">
        <div className="doctor-header">
          <div>
            <h1>Doctor Dashboard</h1>
            <p>
              Loading your appointment information...
            </p>
          </div>
        </div>

        <div className="empty-message">
          <div>⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Main dashboard
  // ==========================================

  return (
    <div className="doctor-dashboard">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="doctor-header">
        <div>
          <h1>
            Welcome Dr. {doctorName} 👋
          </h1>

          <p>
            Manage your appointments and
            availability from your dashboard.
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={() => navigate("/doctor/profile")}
        >
          👤 Profile
        </button>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div
          className="error-message"
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="doctor-stats">

        <div className="doctor-stat-card">
          <div className="stat-icon">
            📅
          </div>

          <div>
            <p>Total Appointments</p>
            <h2>{totalAppointments}</h2>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="stat-icon">
            ⏰
          </div>

          <div>
            <p>Scheduled</p>
            <h2>{scheduledAppointments}</h2>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="stat-icon">
            ✅
          </div>

          <div>
            <p>Completed</p>
            <h2>{completedAppointments}</h2>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="stat-icon">
            ❌
          </div>

          <div>
            <p>Cancelled</p>
            <h2>{cancelledAppointments}</h2>
          </div>
        </div>

      </div>

      {/* ======================================
          QUICK ACTIONS
      ====================================== */}

      <div className="doctor-actions">

        <h2>Quick Actions</h2>

        <div className="action-grid">

          <button
            onClick={() =>
              navigate("/doctor/today")
            }
          >
            📅
            <span>
              Today's Appointments
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/doctor/availability")
            }
          >
            ⏰
            <span>
              Manage Availability
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/doctor/profile")
            }
          >
            👤
            <span>
              My Profile
            </span>
          </button>

        </div>

      </div>

      {/* ======================================
          TODAY'S APPOINTMENTS
      ====================================== */}

      <div className="today-section">

        <div className="section-header">

          <div>
            <h2>
              Today's Appointments
            </h2>

            <p>
              {todayAppointments.length} appointment
              {todayAppointments.length !== 1
                ? "s"
                : ""}{" "}
              scheduled today.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/doctor/today")
            }
          >
            View All
          </button>

        </div>

        {todayAppointments.length === 0 ? (
          <div className="empty-message">
            <div>📭</div>
            <p>
              No appointments scheduled for today.
            </p>
          </div>
        ) : (
          <div className="appointment-list">

            {todayAppointments
              .slice(0, 5)
              .map((appointment) => (
                <div
                  className="doctor-appointment-card"
                  key={appointment.id}
                >

                  <div className="appointment-time">
                    <strong>
                      {formatTime(
                        appointment.start_time
                      )}
                    </strong>

                    <span>
                      to{" "}
                      {formatTime(
                        appointment.end_time
                      )}
                    </span>
                  </div>

                  <div className="patient-info">

                    <h3>
                      👤{" "}
                      {appointment.patient_name ||
                        "Patient"}
                    </h3>

                    {appointment.patient_email && (
                      <p>
                        📧{" "}
                        {appointment.patient_email}
                      </p>
                    )}

                    {appointment.patient_phone && (
                      <p>
                        📞{" "}
                        {appointment.patient_phone}
                      </p>
                    )}

                    {appointment.notes && (
                      <p>
                        📝{" "}
                        {appointment.notes}
                      </p>
                    )}

                  </div>

                  <div>
                    <span
                      className={`status ${
                        appointment.status
                      }`}
                    >
                      {formatStatus(
                        appointment.status
                      )}
                    </span>
                  </div>

                </div>
              ))}

          </div>
        )}

      </div>

      {/* ======================================
          RECENT APPOINTMENTS
      ====================================== */}

      <div className="recent-section">

        <div className="section-header">

          <div>
            <h2>
              Recent Appointments
            </h2>

            <p>
              Your latest appointment records.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/doctor/appointments")
            }
          >
            View All
          </button>

        </div>

        {recentAppointments.length === 0 ? (
          <div className="empty-message">
            <div>📭</div>
            <p>
              No appointment records found.
            </p>
          </div>
        ) : (
          <div className="recent-list">

            {recentAppointments.map(
              (appointment) => (
                <div
                  className="recent-row"
                  key={appointment.id}
                >

                  <div>
                    <strong>
                      👤{" "}
                      {appointment.patient_name ||
                        "Patient"}
                    </strong>

                    <small>
                      {formatDate(
                        appointment.appointment_date
                      )}
                    </small>
                  </div>

                  <div>
                    {formatTime(
                      appointment.start_time
                    )}
                  </div>

                  <div>
                    <span
                      className={`status ${
                        appointment.status
                      }`}
                    >
                      {formatStatus(
                        appointment.status
                      )}
                    </span>
                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default DoctorHome;