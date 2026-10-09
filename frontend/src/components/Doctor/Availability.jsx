import { useEffect, useState } from "react";
import API from "../../services/api";
import "./Availability.css";

function Availability() {
  const [availability, setAvailability] = useState([]);
  const [doctorId, setDoctorId] = useState(null);

  const [form, setForm] = useState({
    day_of_week: "1",
    start_time: "",
    end_time: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const days = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  // =====================================
  // Get logged-in doctor's ID
  // =====================================
  const loadDoctor = async () => {
    try {
      setError("");

      console.log("Getting logged-in doctor...");

      const res = await API.get("/doctors/me");

      console.log("My doctor response:", res.data);

      if (!res.data.doctor) {
        setError("Doctor profile not found.");
        setLoading(false);
        return;
      }

      const id = res.data.doctor.doctor_id;

      console.log("Logged-in Doctor ID:", id);

      if (!id) {
        setError("Doctor ID not found.");
        setLoading(false);
        return;
      }

      setDoctorId(Number(id));

    } catch (err) {
      console.error("Load doctor error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load doctor information."
      );

      setLoading(false);
    }
  };

  // =====================================
  // Load doctor's availability
  // =====================================
  const loadAvailability = async (id) => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Loading availability for doctor:",
        id
      );

      const res = await API.get(
        `/availability/doctor/${id}`
      );

      console.log(
        "Availability response:",
        res.data
      );

      setAvailability(
        res.data.availability || []
      );

    } catch (err) {
      console.error(
        "Load availability error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load availability."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Initial doctor loading
  // =====================================
  useEffect(() => {
    loadDoctor();
  }, []);

  // =====================================
  // Load availability after doctor ID found
  // =====================================
  useEffect(() => {
    if (doctorId) {
      loadAvailability(doctorId);
    }
  }, [doctorId]);

  // =====================================
  // Handle form changes
  // =====================================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // Add / Update Availability
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!doctorId) {
      setError(
        "Doctor information is not loaded yet."
      );
      return;
    }

    if (!form.start_time || !form.end_time) {
      setError(
        "Please select both start and end time."
      );
      return;
    }

    if (form.start_time >= form.end_time) {
      setError(
        "End time must be later than start time."
      );
      return;
    }

    try {
      setSaving(true);

      const data = {
        day_of_week: Number(
          form.day_of_week
        ),
        start_time: form.start_time,
        end_time: form.end_time,
      };

      console.log(
        "Saving availability:",
        data
      );

      // Update existing availability
      if (editingId) {
        await API.put(
          `/availability/${editingId}`,
          data
        );

        setMessage(
          "Availability updated successfully."
        );

      } else {
        // Add new availability
        await API.post(
          "/availability",
          data
        );

        setMessage(
          "Availability added successfully."
        );
      }

      // Reset form
      setForm({
        day_of_week: "1",
        start_time: "",
        end_time: "",
      });

      setEditingId(null);

      // Reload list
      await loadAvailability(doctorId);

    } catch (err) {
      console.error(
        "Save availability error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save availability."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // Edit Availability
  // =====================================
  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      day_of_week: String(
        item.day_of_week
      ),
      start_time: item.start_time,
      end_time: item.end_time,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================
  // Cancel Edit
  // =====================================
  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      day_of_week: "1",
      start_time: "",
      end_time: "",
    });

    setMessage("");
    setError("");
  };

  // =====================================
  // Delete Availability
  // =====================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this availability?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await API.delete(
        `/availability/${id}`
      );

      setMessage(
        "Availability deleted successfully."
      );

      await loadAvailability(doctorId);

    } catch (err) {
      console.error(
        "Delete availability error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete availability."
      );
    }
  };

  // =====================================
  // Convert number to day name
  // =====================================
  const getDayName = (day) => {
    const found = days.find(
      (item) =>
        Number(item.value) === Number(day)
    );

    return found
      ? found.label
      : "Unknown";
  };

  return (
    <div className="availability-page">

      {/* =====================================
          Header
      ===================================== */}
      <div className="availability-header">

        <h2>Doctor Availability</h2>

        <p>
          Set the days and time slots when you
          are available for appointments.
        </p>

      </div>

      {/* =====================================
          Success Message
      ===================================== */}
      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* =====================================
          Error Message
      ===================================== */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =====================================
          Add / Edit Form
      ===================================== */}
      <div className="availability-form-card">

        <h3>
          {editingId
            ? "Edit Availability"
            : "Add Availability"}
        </h3>

        <form onSubmit={handleSubmit}>

          {/* Day */}
          <div className="form-group">

            <label>
              Day
            </label>

            <select
              name="day_of_week"
              value={form.day_of_week}
              onChange={handleChange}
              required
            >

              {days.map((day) => (
                <option
                  key={day.value}
                  value={day.value}
                >
                  {day.label}
                </option>
              ))}

            </select>

          </div>

          {/* Start Time */}
          <div className="form-group">

            <label>
              Start Time
            </label>

            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
            />

          </div>

          {/* End Time */}
          <div className="form-group">

            <label>
              End Time
            </label>

            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
            />

          </div>

          {/* Buttons */}
          <div className="form-buttons">

            <button
              type="submit"
              className="save-btn"
              disabled={
                saving || !doctorId
              }
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Availability"
                : "Add Availability"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={
                  handleCancelEdit
                }
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* =====================================
          Existing Availability
      ===================================== */}
      <div className="availability-list-card">

        <div className="availability-list-header">

          <div>

            <h3>
              My Availability
            </h3>

            <p className="availability-info">
              Patients can book appointments
              during these time periods.
            </p>

          </div>

          <span className="availability-count">

            {availability.length} slot
            {availability.length !== 1
              ? "s"
              : ""}

          </span>

        </div>

        {/* Loading */}
        {loading ? (

          <p className="loading-text">
            Loading availability...
          </p>

        ) : availability.length === 0 ? (

          /* Empty */
          <div className="empty-state">

            <p>
              No availability added yet.
            </p>

            <p>
              Add your working days and
              appointment hours above.
            </p>

          </div>

        ) : (

          /* Availability List */
          <div className="availability-list">

            {availability.map((item) => (

              <div
                className="availability-item"
                key={item.id}
              >

                <div className="availability-details">

                  <strong>
                    {getDayName(
                      item.day_of_week
                    )}
                  </strong>

                  <span>
                    {item.start_time} -{" "}
                    {item.end_time}
                  </span>

                </div>

                <div className="availability-actions">

                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() =>
                      handleEdit(item)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(
                        item.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Availability;