import { useEffect, useState } from "react";
import API from "../../services/api";
import "./DoctorProfile.css";
function DoctorProfile() {
    const [doctor, setDoctor] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: ""
    });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await API.get("/auth/me");

            const user = res.data.user;

            setDoctor(user);

            setForm({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                specialization:
                    user.specialization || ""
            });

        } catch (err) {
            console.error(
                "Profile loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = () => {
        setMessage("");
        setError("");
        setEditing(true);
    };

    const handleCancel = () => {
        setForm({
            name: doctor.name || "",
            email: doctor.email || "",
            phone: doctor.phone || "",
            specialization:
                doctor.specialization || ""
        });

        setMessage("");
        setError("");
        setEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!form.name.trim()) {
            setError("Name is required.");
            return;
        }

        try {
            setSaving(true);

            /*
             * Update the logged-in user's profile.
             *
             * If your backend uses a different route,
             * we will adjust this after testing.
             */
            const res = await API.put(
                "/auth/profile",
                {
                    name: form.name,
                    email: form.email,
                    phone: form.phone
                }
            );

            const updatedUser =
                res.data.user || {
                    ...doctor,
                    ...form
                };

            setDoctor(updatedUser);

            setForm({
                name: updatedUser.name || "",
                email: updatedUser.email || "",
                phone: updatedUser.phone || "",
                specialization:
                    updatedUser.specialization || ""
            });

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setMessage(
                "Profile updated successfully!"
            );

            setEditing(false);

        } catch (err) {
            console.error(
                "Profile update error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <h2>Doctor Profile</h2>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="profile-page">
                <h2>Doctor Profile</h2>

                <div className="error-message">
                    {error || "Profile not found."}
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">

            <div className="profile-header">
                <div>
                    <h1>👨‍⚕️ Doctor Profile</h1>

                    <p>
                        View and manage your professional
                        information
                    </p>
                </div>

                {!editing && (
                    <button
                        className="edit-profile-btn"
                        onClick={handleEdit}
                    >
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="profile-card">

                <div className="profile-avatar">
                    👨‍⚕️
                </div>

                {!editing ? (

                    <>
                        <h2>{doctor.name}</h2>

                        <span className="doctor-role">
                            Doctor
                        </span>

                        <div className="profile-details">

                            <div className="profile-detail">
                                <span>📧</span>
                                <div>
                                    <small>Email</small>
                                    <strong>
                                        {doctor.email ||
                                            "Not provided"}
                                    </strong>
                                </div>
                            </div>

                            <div className="profile-detail">
                                <span>📞</span>
                                <div>
                                    <small>Phone</small>
                                    <strong>
                                        {doctor.phone ||
                                            "Not provided"}
                                    </strong>
                                </div>
                            </div>

                            <div className="profile-detail">
                                <span>🩺</span>
                                <div>
                                    <small>
                                        Specialization
                                    </small>
                                    <strong>
                                        {doctor.specialization ||
                                            "Not provided"}
                                    </strong>
                                </div>
                            </div>

                            <div className="profile-detail">
                                <span>👤</span>
                                <div>
                                    <small>Role</small>
                                    <strong>
                                        {doctor.role}
                                    </strong>
                                </div>
                            </div>

                        </div>
                    </>

                ) : (

                    <form
                        className="profile-form"
                        onSubmit={handleSave}
                    >

                        <div className="form-group">
                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Specialization
                            </label>

                            <input
                                type="text"
                                value={
                                    doctor.specialization ||
                                    ""
                                }
                                disabled
                            />

                            <small>
                                Specialization can be managed
                                by the administrator.
                            </small>
                        </div>

                        <div className="profile-form-actions">

                            <button
                                type="submit"
                                className="save-profile-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "💾 Save Changes"}
                            </button>

                            <button
                                type="button"
                                className="cancel-profile-btn"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                )}

            </div>

        </div>
    );
}

export default DoctorProfile;