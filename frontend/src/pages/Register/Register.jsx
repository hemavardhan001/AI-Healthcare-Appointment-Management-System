import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", role: "patient",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await API.post("/auth/register", form);
      setSuccess(res.data.message || "Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="med-register-page">
      <Link to="/" className="med-register-brand"><span>✚</span> MedCare</Link>
      <div className="med-register-layout">
        <section className="med-register-welcome">
          <span className="med-register-symbol">♡</span>
          <span className="med-register-kicker">YOUR WELLBEING, OUR MISSION</span>
          <h1>Start your journey to <span>better health.</span></h1>
          <p>Create your MedCare account to book appointments and keep your healthcare journey organized.</p>
          <div className="med-register-note"><span>✚</span><div><strong>Healthcare made simple</strong><small>Care and convenience in one place.</small></div></div>
        </section>

        <form className="med-register-card" onSubmit={handleRegister}>
          <span className="med-register-kicker">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="med-register-subtitle">Fill in your details to join MedCare.</p>

          <label htmlFor="reg-name">Full name</label>
          <input id="reg-name" type="text" name="name" placeholder="Enter your full name"
            value={form.name} onChange={handleChange} autoComplete="name" required />

          <label htmlFor="reg-email">Email address</label>
          <input id="reg-email" type="email" name="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange} autoComplete="email" required />

          <label htmlFor="reg-phone">Phone number</label>
          <input id="reg-phone" type="tel" name="phone" placeholder="Enter your phone number"
            value={form.phone} onChange={handleChange} autoComplete="tel" required />

          <label htmlFor="reg-password">Password</label>
          <input id="reg-password" type="password" name="password" placeholder="Create a password"
            value={form.password} onChange={handleChange} autoComplete="new-password" minLength="6" required />

          <input type="hidden" name="role" value="patient" />

          {success && <p className="med-register-success">{success}</p>}
          {error && <p className="med-register-error">{error}</p>}

          <button className="med-register-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"} <span>→</span>
          </button>

          <p className="med-register-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <Link to="/" className="med-register-home-link">← Back to home</Link>
        </form>
      </div>
      <p className="med-register-footer">© {new Date().getFullYear()} MedCare · Your health matters.</p>
    </main>
  );
}

export default Register;
