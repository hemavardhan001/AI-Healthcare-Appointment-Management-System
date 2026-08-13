import { useEffect, useState } from "react";
import API from "../../services/api";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments/my");
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "25px" }}>
      <h2>📅 My Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((appt) => (
          <div
            key={appt.id}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "20px",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,.1)"
            }}
          >
            <h3>👨‍⚕️ Dr. {appt.doctor_name}</h3>

            <p>
              <strong>Specialization:</strong> {appt.specialization}
            </p>

            <p>
              <strong>Date:</strong> {appt.appointment_date}
            </p>

            <p>
              <strong>Time:</strong> {appt.start_time} - {appt.end_time}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span style={{ color: "green" }}>
                {appt.status}
              </span>
            </p>

            <p>
              <strong>Notes:</strong> {appt.notes}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyAppointments;