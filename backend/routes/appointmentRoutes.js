const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    appointmentValidation
} = require("../validators/appointmentValidator");

const {
    bookAppointment,
    getAppointments,
    getMyAppointments,
    getAppointment,
    editAppointment,
    removeAppointment
} = require("../controllers/appointmentController");

// =======================================
// Book Appointment (Patient)
// =======================================
router.post(
    "/",
    protect,
    authorize("patient"),
    appointmentValidation,
    bookAppointment
);

// =======================================
// Patient - My Appointments
// =======================================
router.get(
    "/my",
    protect,
    authorize("patient"),
    getMyAppointments
);

// =======================================
// Admin & Doctor - All Appointments
// =======================================
router.get(
    "/",
    protect,
    authorize("admin", "doctor"),
    getAppointments
);

// =======================================
// Get Appointment By ID
// =======================================
router.get(
    "/:id",
    protect,
    getAppointment
);

// =======================================
// Update Appointment
// =======================================
router.put(
    "/:id",
    protect,
    authorize("patient", "admin"),
    appointmentValidation,
    editAppointment
);

// =======================================
// Delete Appointment
// =======================================
router.delete(
    "/:id",
    protect,
    authorize("patient", "admin"),
    removeAppointment
);

module.exports = router;