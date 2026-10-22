import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="med-home">
        <section className="med-hero">
          <div className="med-hero-content">
            <span className="med-eyebrow">YOUR HEALTH, OUR PRIORITY</span>
            <h1>Better care.<br /><span>Healthier lives.</span></h1>
            <p>
              Your health journey starts here. Connect with trusted doctors,
              book appointments easily, and take control of your wellbeing.
            </p>
            <div className="med-hero-actions">
              <button onClick={() => navigate("/login")} className="med-btn">
                Book an Appointment <span>→</span>
              </button>
              <button onClick={() => navigate("/doctors")} className="med-btn-outline">
                Find a Doctor
              </button>
            </div>
            <div className="med-trust">
              <span className="med-trust-icon">✓</span>
              Trusted care <span>·</span> Easy booking <span>·</span> Your health first
            </div>
          </div>

          <div className="med-hero-visual">
            <div className="med-image-frame">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85"
                alt="Friendly healthcare professional"
              />
              <div className="med-image-label">
                <span className="med-label-icon">✚</span>
                <div>
                  <strong>Care that comes first</strong>
                  <small>Your health matters to us</small>
                </div>
              </div>
            </div>
            <div className="med-floating-card">
              <span className="med-online-dot"></span>
              <div><strong>Here for your health</strong><small>Care made simple</small></div>
            </div>
            <div className="med-circle-decoration"></div>
          </div>
        </section>

        <section className="med-stats">
          <div><strong>01</strong><span>Easy appointment booking</span></div>
          <div><strong>02</strong><span>Qualified healthcare professionals</span></div>
          <div><strong>03</strong><span>Patient-focused care</span></div>
        </section>

        <section className="med-services">
          <div className="med-section-heading">
            <span className="med-eyebrow">WHAT WE OFFER</span>
            <h2>Healthcare made <span>simpler.</span></h2>
            <p>Everything you need to manage your healthcare in one place.</p>
          </div>

          <div className="med-service-grid">
            <article className="med-service-card">
              <div className="med-service-icon">✚</div>
              <h3>Doctor Consultation</h3>
              <p>Find doctors and explore the care that fits your needs.</p>
              <Link to="/doctors">Explore doctors <span>→</span></Link>
            </article>
            <article className="med-service-card">
              <div className="med-service-icon med-icon-blue">▦</div>
              <h3>Easy Appointments</h3>
              <p>Choose an available slot and manage your appointments.</p>
              <Link to="/login">Book a visit <span>→</span></Link>
            </article>
            <article className="med-service-card">
              <div className="med-service-icon med-icon-purple">♡</div>
              <h3>Personal Health</h3>
              <p>Access your patient dashboard and appointment history.</p>
              <Link to="/login">Go to login <span>→</span></Link>
            </article>
          </div>
        </section>

        <section className="med-cta">
          <div>
            <span className="med-eyebrow">TAKE THE FIRST STEP</span>
            <h2>Your health deserves the best care.</h2>
            <p>Get started with MedCare today.</p>
          </div>
          <button className="med-btn" onClick={() => navigate("/register")}>
            Create Your Account <span>→</span>
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
