import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./DashboardHome.css";

function DashboardHome() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // =======================================
  // Get logged-in patient's name
  // =======================================
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName = user?.name || "Patient";

  useEffect(() => {
    fetchAppointments();
    fetchNotifications();

    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  // =======================================
  // Fetch logged-in patient's appointments
  // =======================================
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const res = await API.get("/appointments/my");

      console.log("My Appointments:", res.data);

      setAppointments(
        Array.isArray(res.data.appointments)
          ? res.data.appointments
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching my appointments:",
        error.response?.data || error.message
      );

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // =======================================
  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        API.get("/notifications"),
        API.get("/notifications/unread-count")
      ]);

      setNotifications(
        Array.isArray(listRes.data.notifications)
          ? listRes.data.notifications
          : []
      );
      setUnreadCount(Number(countRes.data.count) || 0);
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error.response?.data || error.message
      );
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, is_read: 1 } : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error.response?.data || error.message
      );
    }
  };
  // Check whether appointment is upcoming
  // =======================================
  const isUpcoming = (appointment) => {
    if (appointment.status !== "scheduled") {
      return false;
    }

    if (
      !appointment.appointment_date ||
      !appointment.start_time
    ) {
      return false;
    }

    const appointmentDateTime = new Date(
      `${appointment.appointment_date}T${appointment.start_time}`
    );

    if (Number.isNaN(appointmentDateTime.getTime())) {
      return false;
    }

    return appointmentDateTime >= new Date();
  };

  // =======================================
  // Upcoming appointments
  // =======================================
  const upcomingAppointments = appointments
    .filter(isUpcoming)
    .sort((a, b) => {
      const dateA = new Date(
        `${a.appointment_date}T${a.start_time}`
      );

      const dateB = new Date(
        `${b.appointment_date}T${b.start_time}`
      );

      return dateA - dateB;
    });

  // =======================================
  // Logout
  // =======================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");

    navigate("/login");
  };

  return (
    <div className="dashboard-container">

      {/* ==============================
          Header
      ============================== */}

      <header className="dashboard-header">

        <div>
          <h1>Patient Dashboard</h1>

          <p>
            Welcome back, {userName} 👋
          </p>
        </div>

        <div className="notification-center">
          <button
            type="button"
            className="notification-toggle"
            onClick={() => setShowNotifications((visible) => !visible)}
            aria-expanded={showNotifications}
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <span aria-hidden="true">{"\uD83D\uDD14"}</span>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <h2>Notifications</h2>
                <span>{unreadCount} unread</span>
              </div>

              {notifications.length === 0 ? (
                <p className="notification-empty">No notifications yet.</p>
              ) : (
                <div className="notification-items">
                  {notifications.map((notification) => (
                    <article
                      className={`notification-item ${
                        Number(notification.is_read) === 0 ? "unread" : ""
                      }`}
                      key={notification.id}
                    >
                      <div className="notification-item-heading">
                        <strong>{notification.title}</strong>
                        {Number(notification.is_read) === 0 && (
                          <span className="notification-unread-dot" />
                        )}
                      </div>
                      <p>{notification.message}</p>
                      <small>
                        {notification.created_at
                          ? new Date(notification.created_at).toLocaleString()
                          : ""}
                      </small>
                      {Number(notification.is_read) === 0 && (
                        <button
                          type="button"
                          className="notification-read-btn"
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          Mark as read
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>


      {/* ==============================
          Quick Stats
      ============================== */}

      <div className="stats-container">

        {/* Appointments */}

        <div
          className="stat-card"
          onClick={() =>
            navigate("/patient/appointments")
          }
          style={{ cursor: "pointer" }}
        >
          <h3>📅</h3>

          <p>Appointments</p>

          <strong>
            {appointments.length}
          </strong>
        </div>


        {/* Upcoming */}

        <div
          className="stat-card"
          onClick={() =>
            navigate("/patient/appointments")
          }
          style={{ cursor: "pointer" }}
        >
          <h3>⏰</h3>

          <p>Upcoming</p>

          <strong>
            {upcomingAppointments.length}
          </strong>
        </div>


        {/* Doctors */}

        <div
          className="stat-card"
          onClick={() =>
            navigate("/patient/doctors")
          }
          style={{ cursor: "pointer" }}
        >
          <h3>👨‍⚕️</h3>

          <p>Doctors</p>

          <strong>View</strong>
        </div>

      </div>


      {/* ==============================
          Quick Actions
      ============================== */}

      <section className="quick-actions">

        <h2>Quick Actions</h2>

        <div className="action-buttons">

          {/* Find Doctor */}

          <button
            onClick={() =>
              navigate("/patient/doctors")
            }
          >
            👨‍⚕️ Find a Doctor
          </button>


          {/* Book Appointment */}

          <button
            onClick={() =>
              navigate(
                "/patient/book-appointment"
              )
            }
          >
            📅 Book Appointment
          </button>


          {/* My Appointments */}

          <button
            onClick={() =>
              navigate(
                "/patient/appointments"
              )
            }
          >
            📋 My Appointments
          </button>


          {/* My Profile */}

          <button
            onClick={() =>
              navigate("/patient/profile")
            }
          >
            👤 My Profile
          </button>

        </div>

      </section>


      {/* ==============================
          Upcoming Appointments
      ============================== */}

      <section className="appointments-section">

        <div className="section-header">

          <h2>
            Upcoming Appointments
          </h2>

          <button
            className="view-all"
            onClick={() =>
              navigate(
                "/patient/appointments"
              )
            }
          >
            View All
          </button>

        </div>


        {/* ==============================
            Loading
        ============================== */}

        {loading && (
          <p className="message">
            Loading appointments...
          </p>
        )}


        {/* ==============================
            No Appointments
        ============================== */}

        {!loading &&
          upcomingAppointments.length === 0 && (

            <div className="empty-card">

              <h3>
                No upcoming appointments
              </h3>

              <p>
                Book an appointment with a
                doctor to get started.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/patient/book-appointment"
                  )
                }
              >
                📅 Book Appointment
              </button>

            </div>
          )}


        {/* ==============================
            Appointments
        ============================== */}

        {!loading &&
          upcomingAppointments.length > 0 && (

            <div className="appointment-list">

              {upcomingAppointments
                .slice(0, 3)
                .map((appointment) => (

                  <div
                    className="appointment-card"
                    key={appointment.id}
                  >

                    <div>

                      <h3>
                        Dr.{" "}
                        {appointment.doctor_name ||
                          "Doctor"}
                      </h3>

                      <p>
                        📅{" "}
                        {appointment.appointment_date}
                      </p>

                      <p>
                        ⏰{" "}
                        {appointment.start_time}
                        {" - "}
                        {appointment.end_time}
                      </p>

                      {appointment.specialization && (
                        <p>
                          🩺{" "}
                          {appointment.specialization}
                        </p>
                      )}

                    </div>


                    <span className="status">
                      {appointment.status}
                    </span>

                  </div>

                ))}

            </div>
          )}

      </section>

    </div>
  );
}

export default DashboardHome;