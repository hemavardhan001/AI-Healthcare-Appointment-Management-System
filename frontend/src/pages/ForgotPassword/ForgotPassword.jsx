import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const res = await API.post("/auth/forgot-password", {
                email,
                newPassword
            });

            setMessage(
                res.data.message || "Password reset successfully."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to reset password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">

            <form
                className="login-card"
                onSubmit={handleSubmit}
            >

                <h2>Forgot Password</h2>

                <p>
                    Enter your registered email and create a new password.
                </p>

                <input
                    type="email"
                    placeholder="Registered Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) =>
                        setConfirmPassword(e.target.value)
                    }
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

                {message && (
                    <p style={{ color: "green" }}>
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    style={{
                        marginTop: "10px",
                        background: "none",
                        border: "none",
                        color: "#0e9f91",
                        cursor: "pointer"
                    }}
                >
                    ← Back to Login
                </button>

            </form>

        </div>
    );
}

export default ForgotPassword;
