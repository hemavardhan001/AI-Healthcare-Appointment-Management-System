import "./PatientTheme.css";import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =======================================
  // Load Profile
  // =======================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // First use locally stored user
      const savedUser =
        localStorage.getItem("user");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error(
            "Invalid saved user:",
            error
          );
        }
      }

      // Try backend profile
      try {
        const res = await API.get(
          "/auth/profile"
        );

        if (res.data?.user) {
          const updatedUser =
            res.data.user;

          setUser(updatedUser);

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );

          if (updatedUser.id) {
            localStorage.setItem(
              "userId",
              String(updatedUser.id)
            );
          }

          if (updatedUser.name) {
            localStorage.setItem(
              "userName",
              updatedUser.name
            );
          }
        }
      } catch (profileError) {
        console.log(
          "Backend profile endpoint unavailable. Using saved profile."
        );
      }

    } catch (error) {
      console.error(
        "Profile Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  // =======================================
  // Logout
  // =======================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("user");

    navigate("/login");
  };


  // =======================================
  // Loading
  // =======================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={emptyStyle}>
          <h2>
            Loading profile...
          </h2>
        </div>
      </div>
    );
  }


  // =======================================
  // Profile Not Found
  // =======================================

  if (!user) {
    return (
      <div style={pageStyle}>

        <div style={emptyStyle}>

          <div
            style={{
              fontSize: "50px"
            }}
          >
            ðŸ‘¤
          </div>

          <h2>
            Profile not found
          </h2>

          <p
            style={{
              color: "#6b7280"
            }}
          >
            Please login again to
            continue.
          </p>

          <button
            onClick={() =>
              navigate("/login")
            }
            style={buttonStyle}
          >
            Login Again
          </button>

        </div>

      </div>
    );
  }


  return (
    <div style={pageStyle}>

      {/* ================================= */}
      {/* Header */}
      {/* ================================= */}

      <div style={headerStyle}>

        <div>
          <h1>
            My Profile
          </h1>

          <p
            style={{
              color: "#6b7280"
            }}
          >
            View your account information
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/patient")
          }
          style={buttonStyle}
        >
          â† Dashboard
        </button>

      </div>


      {/* ================================= */}
      {/* Profile Card */}
      {/* ================================= */}

      <div style={cardStyle}>

        {/* Avatar */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px"
          }}
        >

          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#eff6ff",
              margin:
                "0 auto 15px",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              fontSize: "45px"
            }}
          >
            ðŸ‘¤
          </div>

          <h2
            style={{
              marginBottom: "5px"
            }}
          >
            {user.name ||
              "Patient"}
          </h2>

          <p
            style={{
              color: "#2563eb",
              textTransform:
                "capitalize",
              marginTop: "5px"
            }}
          >
            {user.role ||
              "patient"}
          </p>

        </div>


        {/* ================================= */}
        {/* User Information */}
        {/* ================================= */}

        <div>

          <div style={infoRow}>
            <span style={labelStyle}>
              User ID
            </span>

            <span>
              {user.id ||
                "Not available"}
            </span>
          </div>


          <div style={infoRow}>
            <span style={labelStyle}>
              Full Name
            </span>

            <span>
              {user.name ||
                "Not provided"}
            </span>
          </div>


          <div style={infoRow}>
            <span style={labelStyle}>
              Email
            </span>

            <span>
              {user.email ||
                "Not provided"}
            </span>
          </div>


          <div style={infoRow}>
            <span style={labelStyle}>
              Phone
            </span>

            <span>
              {user.phone ||
                "Not provided"}
            </span>
          </div>


          <div style={infoRow}>
            <span style={labelStyle}>
              Role
            </span>

            <span
              style={{
                textTransform:
                  "capitalize"
              }}
            >
              {user.role ||
                "patient"}
            </span>
          </div>

        </div>


        {/* ================================= */}
        {/* Logout */}
        {/* ================================= */}

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            marginTop: "30px",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#ef4444",
            color: "white",
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>

      </div>

    </div>
  );
}


// =======================================
// Styles
// =======================================

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f7fb",
  padding: "30px"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px"
};

const buttonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer"
};

const cardStyle = {
  maxWidth: "700px",
  margin: "0 auto",
  background: "white",
  borderRadius: "14px",
  padding: "35px",
  boxShadow:
    "0 3px 12px rgba(0,0,0,0.07)"
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  padding: "16px 0",
  borderBottom:
    "1px solid #e5e7eb",
  color: "#374151"
};

const labelStyle = {
  fontWeight: "600",
  color: "#6b7280"
};

const emptyStyle = {
  background: "white",
  padding: "40px",
  textAlign: "center",
  borderRadius: "12px",
  maxWidth: "600px",
  margin: "80px auto"
};

export default Profile;
