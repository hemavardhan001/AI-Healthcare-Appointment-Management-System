import { useEffect, useState } from "react";
import API from "../../services/api";

function DoctorHome() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data.appointments);
    } catch (err) {
      console.log(err);
    }
  };

  const scheduled = appointments.filter(
    (a) => a.status === "scheduled"
  ).length;

  const completed = appointments.filter(
    (a) => a.status === "completed"
  ).length;

  return (
    <div>
      <h2>👨‍⚕️ Doctor Dashboard</h2>

      <div className="cards">

        <div className="card">
          <h2>📅</h2>
          <h3>Total Appointments</h3>
          <h1>{appointments.length}</h1>
        </div>

        <div className="card">
          <h2>⏳</h2>
          <h3>Scheduled</h3>
          <h1>{scheduled}</h1>
        </div>

        <div className="card">
          <h2>✅</h2>
          <h3>Completed</h3>
          <h1>{completed}</h1>
        </div>

      </div>
    </div>
  );
}

export default DoctorHome;