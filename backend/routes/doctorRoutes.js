const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const { doctorValidation } = require("../validators/doctorValidator");

const {
    addDoctor,
    getDoctors,
    getDoctor,
    getMyDoctor,
    editDoctor,
    removeDoctor
} = require("../controllers/doctorController");


// =====================================
// Public Routes
// =====================================

// Get all doctors
router.get("/", getDoctors);


// =====================================
// Logged-in Doctor Route
// IMPORTANT: Must come before /:id
// =====================================

router.get(
    "/me",
    protect,
    authorize("doctor"),
    getMyDoctor
);


// Get doctor by ID
router.get("/:id", getDoctor);


// =====================================
// Admin Routes
// =====================================

// Add doctor
router.post(
    "/",
    protect,
    authorize("admin"),
    doctorValidation,
    addDoctor
);

// Update doctor
router.put(
    "/:id",
    protect,
    authorize("admin"),
    doctorValidation,
    editDoctor
);

// Delete doctor
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    removeDoctor
);


module.exports = router;