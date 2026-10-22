import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Doctors.css";

function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/doctors");

      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error("Doctors Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load doctors."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (doctorId) => {
  navigate("/patient/book-appointment", {
    state: {
      doctorId: Number(doctorId)
    }
  });
};
  return (
    <div className="doctors-page">

      {/* Header */}
      <div className="doctors-header">

        <div>
          <h1>Find a Doctor</h1>

          <p>
            Choose a doctor and book your appointment
          </p>
        </div>

        <button
          className="dashboard-btn"
          onClick={() => navigate("/patient")}
        >
          ← Dashboard
        </button>

      </div>

      {/* Loading */}
      {loading && (
        <div className="message">
          Loading doctors...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* No Doctors */}
      {!loading &&
        !error &&
        doctors.length === 0 && (
          <div className="empty-doctors">
            <h2>No doctors available</h2>
            <p>
              Please check again later.
            </p>
          </div>
        )}

      {/* Doctors */}
      {!loading &&
        !error &&
        doctors.length > 0 && (

          <div className="doctors-grid">

            {doctors.map((doctor) => (

              <div
                className="doctor-card"
                key={doctor.id}
              >

                {/* Doctor Icon */}
                <div className="doctor-icon">
                  👨‍⚕️
                </div>

                {/* Doctor Information */}
                <h2>
                  Dr. {doctor.name}
                </h2>

                <p className="specialization">
                  {doctor.specialization ||
                    "Medical Specialist"}
                </p>

                <div className="doctor-details">

                  <p>
                    📧 {doctor.email}
                  </p>

                  {doctor.phone && (
                    <p>
                      📞 {doctor.phone}
                    </p>
                  )}

                  {doctor.experience_years !==
                    undefined && (
                    <p>
                      🏥{" "}
                      {doctor.experience_years}{" "}
                      years experience
                    </p>
                  )}

                </div>

                {doctor.bio && (
                  <p className="doctor-bio">
                    {doctor.bio}
                  </p>
                )}

                {/* Book */}
                <button
                  className="book-btn"
                  onClick={() =>
  handleBook(doctor.doctor_id || doctor.id)
}
                >
                  📅 Book Appointment
                </button>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}

export default Doctors;