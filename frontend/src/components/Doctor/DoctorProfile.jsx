import { useEffect, useState } from "react";
import API from "../../services/api";

function DoctorProfile() {

  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await API.get("/auth/me");
      setDoctor(res.data.user);
    } catch (err) {
      console.log(err);
    }
  };

  if (!doctor) return <h3>Loading...</h3>;

  return (
    <div className="profile-card">

      <div className="profile-avatar">
        👨‍⚕️
      </div>

      <h2>{doctor.name}</h2>

      <p><strong>Email:</strong> {doctor.email}</p>

      <p><strong>Phone:</strong> {doctor.phone}</p>

      <p><strong>Role:</strong> {doctor.role}</p>

    </div>
  );
}

export default DoctorProfile;