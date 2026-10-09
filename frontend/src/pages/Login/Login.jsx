import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);

      console.log("Login Response:", res.data);

      const user = res.data.user;
      const token = res.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("user", JSON.stringify(user));

      switch (user.role) {
        case "patient":
          navigate("/patient");
          break;

        case "doctor":
          navigate("/doctor");
          break;

        case "admin":
          navigate("/admin");
          break;

        default:
          navigate("/");
      }

    } catch (err) {
      console.error(
        "Login Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <form
        className="login-card"
        onSubmit={handleLogin}
      >

        <h2>Login</h2>

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {/* Forgot Password */}
        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#007bff",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Error */}
        {error && (
          <p className="error">
            {error}
          </p>
        )}

      </form>

    </div>
  );
}

export default Login;