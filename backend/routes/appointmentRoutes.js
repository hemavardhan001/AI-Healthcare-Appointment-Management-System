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
    getMyDoctorAppointments,
    getAppointment,
    editAppointment,
    removeAppointment
} = require("../controllers/appointmentController");


// =======================================
// BOOK APPOINTMENT
// Patient only
// =======================================

router.post(
    "/",
    protect,
    authorize("patient"),
    appointmentValidation,
    bookAppointment
);


// =======================================
// PATIENT'S OWN APPOINTMENTS
// GET /api/appointments/my
// =======================================

router.get(
    "/my",
    protect,
    authorize("patient"),
    getMyAppointments
);


// =======================================
// DOCTOR'S OWN APPOINTMENTS
// GET /api/appointments/doctor
//
// IMPORTANT:
// This route must come before /:id
// =======================================

router.get(
    "/doctor",
    protect,
    authorize("doctor"),
    getMyDoctorAppointments
);


// =======================================
// ALL APPOINTMENTS
// Admin only
// GET /api/appointments
// =======================================

router.get(
    "/",
    protect,
    authorize("admin"),
    getAppointments
);


// =======================================
// GET APPOINTMENT BY ID
// Admin / Patient owner / Doctor owner
// GET /api/appointments/:id
// =======================================

router.get(
    "/:id",
    protect,
    authorize("patient", "doctor", "admin"),
    getAppointment
);


// =======================================
// UPDATE APPOINTMENT
// Patient / Doctor / Admin
// PUT /api/appointments/:id
// =======================================

router.put(
    "/:id",
    protect,
    authorize("patient", "doctor", "admin"),
    appointmentValidation,
    editAppointment
);


// =======================================
// DELETE / CANCEL APPOINTMENT
// Patient / Doctor / Admin
// DELETE /api/appointments/:id
// =======================================

router.delete(
    "/:id",
    protect,
    authorize("patient", "doctor", "admin"),
    removeAppointment
);


module.exports = router;