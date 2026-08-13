import { useEffect, useState } from "react";
import API from "../../services/api";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <h3>Loading Profile...</h3>;
  }

  return (
    <div>
      <h2>👤 My Profile</h2>

      <div className="profile-card">
        <div className="profile-avatar">👤</div>

        <h3>{user.name}</h3>

        <p>
          <strong>Email:</strong><br />
          {user.email}
        </p>

        <p>
          <strong>Phone:</strong><br />
          {user.phone}
        </p>

        <p>
          <strong>Role:</strong><br />
          {user.role}
        </p>

        <button>Edit Profile</button>
      </div>
    </div>
  );
}

export default Profile;