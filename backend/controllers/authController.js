const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile,
    updateUserPassword
} = require("../models/userModel");
// ===============================
// Register
// ===============================
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    const token = generateToken(userId, role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// Login
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(
      user.id,
      user.role
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// Get Profile
// ===============================
const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// Update Profile
// ===============================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      phone,
    } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check whether another user already uses this email
    const existingUser =
      await findUserByEmail(email);

    if (
      existingUser &&
      existingUser.id !== userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    await updateUserProfile(userId, {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
    });

    const updatedUser =
      await findUserById(userId);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error(
      "Update profile error:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await updateUserPassword(
            user.id,
            hashedPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reset password"
        });
    }
};
module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    forgotPassword
};