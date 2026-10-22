
const {
    createAppointment,
    checkDoctorAvailability,
    checkSlotAvailability,
    getAllAppointments,
    getPatientAppointments,
    getDoctorAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} = require("../models/appointmentModel");

const { sendAppointmentEmail } = require("../services/emailService");

// =======================================
// VALIDATION HELPERS
// =======================================

// Validate YYYY-MM-DD without timezone-dependent parsing.
const isValidDate = (dateString) => {
    if (
        typeof dateString !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
        return false;
    }

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    if (
        year < 1 ||
        month < 1 ||
        month > 12 ||
        day < 1
    ) {
        return false;
    }

    const isLeapYear =
        year % 400 === 0 ||
        (year % 4 === 0 && year % 100 !== 0);

    const daysInMonth = [
        31,
        isLeapYear ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    return day <= daysInMonth[month - 1];
};

const isValidTime = (timeString) => {
    return (
        typeof timeString === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(timeString)
    );
};

// Get today's date using the server's local calendar.
const getTodayString = () => {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
};

const isPastDate = (dateString) => {
    return dateString < getTodayString();
};

// =======================================
// BOOK APPOINTMENT
// Patient only
// =======================================

const bookAppointment = async (req, res) => {
    try {
        const {
            doctor_id,
            appointment_date,
            start_time,
            end_time,
            notes
        } = req.body;

        const patient_id = req.user.id;
        const doctorId = Number(doctor_id);

        // Validate required fields.
        if (
            doctor_id === undefined ||
            doctor_id === null ||
            doctor_id === "" ||
            !Number.isInteger(doctorId) ||
            doctorId <= 0 ||
            !appointment_date ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor, date, start time and end time are required."
            });
        }

        // Validate date.
        if (!isValidDate(appointment_date)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid appointment date. Please select a valid date in YYYY-MM-DD format."
            });
        }

        // Prevent booking in the past.
        if (isPastDate(appointment_date)) {
            return res.status(400).json({
                success: false,
                message: "Cannot book an appointment in the past."
            });
        }

        // Validate time format.
        if (
            !isValidTime(start_time) ||
            !isValidTime(end_time)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid time format. Use HH:MM."
            });
        }

        // Validate time order.
        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time."
            });
        }

        // Check doctor's working availability.
        const doctorAvailable =
            await checkDoctorAvailability(
                doctorId,
                appointment_date,
                start_time,
                end_time
            );

        if (!doctorAvailable) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor is not available during the selected date and time."
            });
        }

        // Check for overlapping appointments.
        const existing =
            await checkSlotAvailability(
                doctorId,
                appointment_date,
                start_time,
                end_time
            );

        if (existing) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor already has an appointment during this time slot."
            });
        }

        // Create appointment.
        const appointmentId =
            await createAppointment({
                patient_id,
                doctor_id: doctorId,
                appointment_date,
                start_time,
                end_time,
                status: "scheduled",
                notes: notes || null
            });

        // Send confirmation email.
        // Email failure must not undo a successful booking.
        try {
            if (req.user.email) {
                await sendAppointmentEmail({
                    to: req.user.email,
                    subject: "Appointment Booking Confirmation",
                    message:
                        `Hello ${req.user.name || "Patient"},\n\n` +
                        "Your appointment has been booked successfully.\n\n" +
                        `Appointment ID: ${appointmentId}\n` +
                        `Doctor ID: ${doctorId}\n` +
                        `Date: ${appointment_date}\n` +
                        `Time: ${start_time} - ${end_time}\n` +
                        "Status: scheduled\n\n" +
                        "Thank you for using our Appointment Management System."
                });
            } else {
                console.warn(
                    "Confirmation email skipped: patient email is unavailable."
                );
            }
        } catch (emailError) {
            console.error(
                "Appointment email failed:",
                emailError.message
            );
        }

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully.",
            appointmentId
        });
    } catch (err) {
        console.error("Book Appointment Error:", err);

        if (err.message && err.message.includes("Appointment overlaps an existing scheduled appointment")) {
            return res.status(409).json({
                success: false,
                message: "This doctor already has an appointment during that time. Please choose another slot."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// =======================================
// GET ALL APPOINTMENTS
// Admin only
// =======================================

const getAppointments = async (req, res) => {
    try {
        const appointments = await getAllAppointments();

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (err) {
        console.error("Get All Appointments Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// =======================================
// GET LOGGED-IN PATIENT'S APPOINTMENTS
// Patient only
// =======================================

const getMyAppointments = async (req, res) => {
    try {
        const patientId = req.user.id;

        const appointments =
            await getPatientAppointments(patientId);

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (err) {
        console.error("Get My Appointments Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// =======================================
// GET LOGGED-IN DOCTOR'S APPOINTMENTS
// Doctor only
// =======================================

const getMyDoctorAppointments = async (req, res) => {
    try {
        const doctorUserId = req.user.id;

        const appointments =
            await getDoctorAppointments(doctorUserId);

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (err) {
        console.error("Get Doctor Appointments Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// =======================================
// GET APPOINTMENT BY ID
// =======================================

const getAppointment = async (req, res) => {
    try {
        const appointmentId = Number(req.params.id);

        if (
            !Number.isInteger(appointmentId) ||
            appointmentId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID."
            });
        }

        const appointment =
            await getAppointmentById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        if (req.user.role === "admin") {
            return res.status(200).json({
                success: true,
                appointment
            });
        }

        if (req.user.role === "patient") {
            if (
                Number(appointment.patient_id) !==
                Number(req.user.id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to view this appointment."
                });
            }

            return res.status(200).json({
                success: true,
                appointment
            });
        }

        if (req.user.role === "doctor") {
            const doctorAppointments =
                await getDoctorAppointments(req.user.id);

            const ownsAppointment =
                doctorAppointments.some(
                    (item) =>
                        Number(item.id) === appointmentId
                );

            if (!ownsAppointment) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to view this appointment."
                });
            }

            return res.status(200).json({
                success: true,
                appointment
            });
        }

        return res.status(403).json({
            success: false,
            message:
                "You are not authorized to view this appointment."
        });
    } catch (err) {
        console.error("Get Appointment Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// =======================================
// UPDATE APPOINTMENT
// Patient / Doctor / Admin
// =======================================

const editAppointment = async (req, res) => {
    try {
        const appointmentId = Number(req.params.id);

        if (
            !Number.isInteger(appointmentId) ||
            appointmentId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID."
            });
        }

        const existingAppointment =
            await getAppointmentById(appointmentId);

        if (!existingAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        // Check patient ownership.
        if (req.user.role === "patient") {
            if (
                Number(existingAppointment.patient_id) !==
                Number(req.user.id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only update your own appointments."
                });
            }
        }

        // Check doctor ownership.
        if (req.user.role === "doctor") {
            const doctorAppointments =
                await getDoctorAppointments(req.user.id);

            const ownsAppointment =
                doctorAppointments.some(
                    (item) =>
                        Number(item.id) === appointmentId
                );

            if (!ownsAppointment) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only update your own appointments."
                });
            }
        }

        // Validate status.
        const allowedStatuses = [
            "scheduled",
            "completed",
            "cancelled"
        ];

        if (
            req.body.status !== undefined &&
            !allowedStatuses.includes(req.body.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment status."
            });
        }

        let appointmentData;

        // Doctors may update status only.
        if (req.user.role === "doctor") {
            appointmentData = {
                appointment_date:
                    existingAppointment.appointment_date,
                start_time:
                    existingAppointment.start_time,
                end_time:
                    existingAppointment.end_time,
                status:
                    req.body.status ||
                    existingAppointment.status,
                notes: existingAppointment.notes
            };
        } else {
            appointmentData = {
                appointment_date:
                    req.body.appointment_date ??
                    existingAppointment.appointment_date,
                start_time:
                    req.body.start_time ??
                    existingAppointment.start_time,
                end_time:
                    req.body.end_time ??
                    existingAppointment.end_time,
                status:
                    req.body.status ||
                    existingAppointment.status,
                notes:
                    req.body.notes ??
                    existingAppointment.notes
            };
        }

        // Validate the appointment date.
        if (
            !isValidDate(appointmentData.appointment_date)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date."
            });
        }

        if (
            !isValidTime(appointmentData.start_time) ||
            !isValidTime(appointmentData.end_time)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid time format. Use HH:MM."
            });
        }

        if (
            appointmentData.start_time >=
            appointmentData.end_time
        ) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time."
            });
        }

        const scheduleChanged =
            appointmentData.appointment_date !==
                existingAppointment.appointment_date ||
            appointmentData.start_time !==
                existingAppointment.start_time ||
            appointmentData.end_time !==
                existingAppointment.end_time;

        // Recheck availability when rescheduling.
        if (
            scheduleChanged &&
            appointmentData.status === "scheduled"
        ) {
            if (
                isPastDate(appointmentData.appointment_date)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Cannot schedule an appointment in the past."
                });
            }

            const doctorAvailable =
                await checkDoctorAvailability(
                    existingAppointment.doctor_id,
                    appointmentData.appointment_date,
                    appointmentData.start_time,
                    appointmentData.end_time
                );

            if (!doctorAvailable) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Doctor is not available during the selected date and time."
                });
            }

            const overlapping =
                await checkSlotAvailability(
                    existingAppointment.doctor_id,
                    appointmentData.appointment_date,
                    appointmentData.start_time,
                    appointmentData.end_time,
                    appointmentId
                );

            if (overlapping) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Doctor already has an appointment during this time slot."
                });
            }
        }

        const result = await updateAppointment(
            appointmentId,
            appointmentData
        );

        if (result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: "No changes were made."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment updated successfully."
        });
    } catch (err) {
        console.error("Update Appointment Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// =======================================
// DELETE / CANCEL APPOINTMENT
// =======================================

const removeAppointment = async (req, res) => {
    try {
        const appointmentId = Number(req.params.id);

        if (
            !Number.isInteger(appointmentId) ||
            appointmentId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID."
            });
        }

        const appointment =
            await getAppointmentById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        // Check patient ownership.
        if (req.user.role === "patient") {
            if (
                Number(appointment.patient_id) !==
                Number(req.user.id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only cancel your own appointments."
                });
            }
        }

        // Check doctor ownership.
        if (req.user.role === "doctor") {
            const doctorAppointments =
                await getDoctorAppointments(req.user.id);

            const ownsAppointment =
                doctorAppointments.some(
                    (item) =>
                        Number(item.id) === appointmentId
                );

            if (!ownsAppointment) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only cancel your own appointments."
                });
            }
        }

        const result =
            await deleteAppointment(appointmentId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment could not be deleted."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully."
        });
    } catch (err) {
        console.error("Delete Appointment Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// =======================================
// EXPORT CONTROLLERS
// =======================================

module.exports = {
    bookAppointment,
    getAppointments,
    getMyAppointments,
    getMyDoctorAppointments,
    getAppointment,
    editAppointment,
    removeAppointment
};