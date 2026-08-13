import "./DoctorCard.css";

function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card">

      <img
        src={doctor.image}
        alt={doctor.name}
        className="doctor-image"
      />

      <h3>{doctor.name}</h3>

      <p className="specialization">
        {doctor.specialization}
      </p>

      <p>{doctor.experience} Years Experience</p>

      <p className="rating">
        ⭐ {doctor.rating}
      </p>

      <button className="book-btn">
        Book Appointment
      </button>

    </div>
  );
}

export default DoctorCard;