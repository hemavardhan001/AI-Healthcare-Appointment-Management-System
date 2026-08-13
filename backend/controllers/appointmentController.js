const {
    createAppointment,
    checkSlotAvailability,
    getAllAppointments,
    getPatientAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} = require("../models/appointmentModel");

// =======================================
// Book Appointment
// =======================================
const bookAppointment = async (req, res) => {
    try {

        const {
            patient_id,
            doctor_id,
            appointment_date,
            start_time,
            end_time,
            notes
        } = req.body;

        // Validate Date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingDate = new Date(appointment_date);

        if (bookingDate < today) {
            return res.status(400).json({
                success: false,
                message: "Cannot book an appointment in the past."
            });
        }

        // Validate Time
        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time."
            });
        }

        // Check Slot
        const existing = await checkSlotAvailability(
            doctor_id,
            appointment_date,
            start_time,
            end_time
        );

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Doctor already has an appointment during this time slot."
            });
        }

        const appointmentId = await createAppointment({
            patient_id,
            doctor_id,
            appointment_date,
            start_time,
            end_time,
            status: "scheduled",
            notes
        });

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully.",
            appointmentId
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

// =======================================
// Admin/Doctor - View All Appointments
// =======================================
const getAppointments = async (req, res) => {

    try {

        const appointments = await getAllAppointments();

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =======================================
// Patient - View My Appointments
// =======================================
const getMyAppointments = async (req, res) => {

    try {

        const appointments = await getPatientAppointments(req.user.id);

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =======================================
// Get Appointment By ID
// =======================================
const getAppointment = async (req, res) => {

    try {

        const appointment = await getAppointmentById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.json({
            success: true,
            appointment
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =======================================
// Update Appointment
// =======================================
const editAppointment = async (req, res) => {

    try {

        await updateAppointment(req.params.id, req.body);

        res.json({
            success: true,
            message: "Appointment updated successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// =======================================
// Delete Appointment
// =======================================
const removeAppointment = async (req, res) => {

    try {

        await deleteAppointment(req.params.id);

        res.json({
            success: true,
            message: "Appointment deleted successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    bookAppointment,
    getAppointments,
    getMyAppointments,
    getAppointment,
    editAppointment,
    removeAppointment
};