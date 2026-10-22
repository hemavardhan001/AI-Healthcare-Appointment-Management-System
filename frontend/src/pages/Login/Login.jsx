import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      const user = res.data.user;
      const token = res.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("user", JSON.stringify(user));

      switch (user.role) {
        case "patient": navigate("/patient"); break;
        case "doctor": navigate("/doctor"); break;
        case "admin": navigate("/admin"); break;
        default: navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="med-auth-page">
      <Link to="/" className="med-auth-brand"><span>✚</span> MedCare</Link>
      <div className="med-auth-layout">
        <section className="med-auth-welcome">
          <div className="med-auth-welcome-icon">✚</div>
          <span className="med-auth-kicker">YOUR HEALTH, OUR PRIORITY</span>
          <h1>Welcome back to <span>better care.</span></h1>
          <p>Sign in to manage your appointments and continue your healthcare journey with MedCare.</p>
          <div className="med-auth-points">
            <div><span>✓</span> Easy appointment management</div>
            <div><span>✓</span> Your healthcare in one place</div>
            <div><span>✓</span> Simple and secure access</div>
          </div>
        </section>

        <form className="med-auth-card" onSubmit={handleLogin}>
          <span className="med-auth-small">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="med-auth-subtitle">Enter your details below to continue.</p>

          <label htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" name="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange} autoComplete="email" required />

          <div className="med-auth-password-label">
            <label htmlFor="login-password">Password</label>
            <button type="button" onClick={() => navigate("/forgot-password")}>Forgot password?</button>
          </div>
          <input id="login-password" type="password" name="password" placeholder="Enter your password"
            value={form.password} onChange={handleChange} autoComplete="current-password" required />

          {error && <p className="med-auth-error">{error}</p>}

          <button className="med-auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"} <span>→</span>
          </button>

          <p className="med-auth-switch">Don't have an account? <Link to="/register">Create account</Link></p>
          <Link to="/" className="med-auth-home-link">← Back to home</Link>
        </form>
      </div>
      <p className="med-auth-footer">© {new Date().getFullYear()} MedCare · Your health matters.</p>
    </main>
  );
}

export default Login;
