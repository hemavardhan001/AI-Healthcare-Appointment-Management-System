import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

const Home = () => {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your Health, Our Priority</h1>

          <p>
            Book appointments with experienced doctors quickly and securely.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Book Appointment</button>
            <button className="secondary-btn">Find Doctors</button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services">

        <h2>Our Services</h2>

        <div className="service-container">

          <div className="service-card">
            <h3>👨‍⚕️ Doctor Consultation</h3>
            <p>Book appointments with experienced specialists.</p>
          </div>

          <div className="service-card">
            <h3>📅 Appointment Scheduling</h3>
            <p>Choose your preferred doctor and time slot.</p>
          </div>

          <div className="service-card">
            <h3>🩺 Health Records</h3>
            <p>Securely manage patient appointment history.</p>
          </div>

        </div>

      </section>

      {/* Featured Doctors */}
      <section className="doctors">

        <h2>Featured Doctors</h2>

        <div className="doctor-container">

          <div className="doctor-card">
            <h3>Dr. John Smith</h3>
            <p>Cardiologist</p>
          </div>

          <div className="doctor-card">
            <h3>Dr. Sarah Johnson</h3>
            <p>Dermatologist</p>
          </div>

          <div className="doctor-card">
            <h3>Dr. David Lee</h3>
            <p>Neurologist</p>
          </div>

        </div>

      </section>

      <Footer />
    </>
  );
};

export default Home;