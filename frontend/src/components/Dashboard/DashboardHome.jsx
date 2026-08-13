import { useEffect, useState } from "react";
import API from "../../services/api";

function DashboardHome() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const appointmentRes = await API.get("/appointments/my");
      setAppointments(appointmentRes.data.appointments);

      const doctorRes = await API.get("/doctors");
      setDoctors(doctorRes.data.doctors);
    } catch (err) {
      console.log(err);
    }
  };

  const upcoming = appointments.filter(
    (a) => a.status === "scheduled"
  ).length;

  const completed = appointments.filter(
    (a) => a.status === "completed"
  ).length;

  return (
    <div>
      <h2>🏠 Dashboard Overview</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Welcome to your Healthcare Appointment Management System.
      </p>

      <div className="cards">
        <div className="card">
          <h2>📅</h2>
          <h3>Total Appointments</h3>
          <h1>{appointments.length}</h1>
        </div>

        <div className="card">
          <h2>👨‍⚕️</h2>
          <h3>Available Doctors</h3>
          <h1>{doctors.length}</h1>
        </div>

        <div className="card">
          <h2>⏳</h2>
          <h3>Upcoming</h3>
          <h1>{upcoming}</h1>
        </div>

        <div className="card">
          <h2>✅</h2>
          <h3>Completed</h3>
          <h1>{completed}</h1>
        </div>
      </div>

      <div
        style={{
          marginTop: "35px",
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,.1)",
        }}
      >
        <h3>📌 Recent Appointments</h3>

        {appointments.length === 0 ? (
          <p>No appointments booked yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              marginTop: "15px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th align="left">Doctor</th>
                <th align="left">Date</th>
                <th align="left">Time</th>
                <th align="left">Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.slice(0, 5).map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.doctor_name}</td>
                  <td>{appt.appointment_date}</td>
                  <td>
                    {appt.start_time} - {appt.end_time}
                  </td>
                  <td>{appt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;