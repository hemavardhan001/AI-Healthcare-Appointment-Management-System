import { useEffect, useState } from "react";
import API from "../../services/api";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/doctors");
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>👨‍⚕️ Available Doctors</h2>

      <div className="doctor-grid">
        {doctors.map((doctor) => (
          <div className="doctor-card" key={doctor.id}>
            <div className="doctor-avatar">👨‍⚕️</div>

            <h3>Dr. {doctor.name}</h3>

            <p>
              <strong>Specialization:</strong>
              <br />
              {doctor.specialization}
            </p>

            <p>
              <strong>Experience:</strong>
              <br />
              {doctor.experience_years} Years
            </p>

            <p>
              <strong>Email:</strong>
              <br />
              {doctor.email}
            </p>

            <p>
              <strong>Phone:</strong>
              <br />
              {doctor.phone}
            </p>

            <button
              onClick={() =>
                alert("Go to Book Appointment to schedule with this doctor.")
              }
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Doctors;