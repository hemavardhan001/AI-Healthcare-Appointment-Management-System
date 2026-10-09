const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createAvailability,
    getAvailability,
    getDoctorAvailability,
    editAvailability,
    removeAvailability
} = require("../controllers/availabilityController");


// =====================================================
// PUBLIC ROUTES
// =====================================================

// Get all availability
router.get(
    "/",
    getAvailability
);

// Get availability for a specific doctor
router.get(
    "/doctor/:doctorId",
    getDoctorAvailability
);


// =====================================================
// PROTECTED ROUTES
// =====================================================

// Doctor/Admin can add availability
router.post(
    "/",
    protect,
    authorize("doctor", "admin"),
    createAvailability
);

// Doctor/Admin can update availability
router.put(
    "/:id",
    protect,
    authorize("doctor", "admin"),
    editAvailability
);

// Doctor/Admin can delete availability
router.delete(
    "/:id",
    protect,
    authorize("doctor", "admin"),
    removeAvailability
);


module.exports = router;