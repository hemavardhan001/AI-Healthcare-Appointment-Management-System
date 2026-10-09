const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    register,
    login,
    getProfile,
    updateProfile,
    forgotPassword
} = require("../controllers/authController");

// Register
router.post(
    "/register",
    register
);

// Login
router.post(
    "/login",
    login
);

// Get logged-in user profile
router.get(
    "/me",
    protect,
    getProfile
);

// Update logged-in user profile
router.put(
    "/profile",
    protect,
    updateProfile
);

// Forgot Password
router.post(
    "/forgot-password",
    forgotPassword
);

module.exports = router;