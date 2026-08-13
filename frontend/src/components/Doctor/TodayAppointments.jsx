import { useEffect, useState } from "react";
import API from "../../services/api";

function TodayAppointments() {

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data.appointments);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>

      <h2>📅 Today's Appointments</h2>

      <table>

        <thead>
          <tr>
            <th>Patient</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {appointments.map((appt) => (

            <tr key={appt.id}>
              <td>{appt.patient_name}</td>
              <td>{appt.appointment_date}</td>
              <td>{appt.start_time}</td>
              <td>{appt.status}</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default TodayAppointments;