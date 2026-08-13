const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const { doctorValidation } = require("../validators/doctorValidator");

const {
    addDoctor,
    getDoctors,
    getDoctor,
    editDoctor,
    removeDoctor
} = require("../controllers/doctorController");

// =====================================
// Public Routes
// =====================================

// Get all doctors
router.get("/", getDoctors);

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