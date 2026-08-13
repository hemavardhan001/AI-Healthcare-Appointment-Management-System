import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "patient",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/auth/register", form);

            setSuccess(res.data.message);
            setError("");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setSuccess("");
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="register-container">
            <form className="register-card" onSubmit={handleRegister}>
                <h2>Create Account</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    onChange={handleChange}
                    required
                />

                <button type="submit">
                    Register
                </button>

                {success && (
                    <p style={{ color: "green" }}>{success}</p>
                )}

                {error && (
                    <p style={{ color: "red" }}>{error}</p>
                )}
            </form>
        </div>
    );
}

export default Register;