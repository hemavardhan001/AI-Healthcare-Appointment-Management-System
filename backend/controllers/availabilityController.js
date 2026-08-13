const {
    addAvailability,
    getAllAvailability,
    getAvailabilityByDoctor,
    updateAvailability,
    deleteAvailability
} = require('../models/availabilityModel');

// Add Availability
const createAvailability = async (req, res) => {
    try {

        const {
            doctor_id,
            day_of_week,
            start_time,
            end_time
        } = req.body;

        const availabilityId = await addAvailability({
            doctor_id,
            day_of_week,
            start_time,
            end_time
        });

        res.status(201).json({
            success: true,
            message: "Availability added successfully",
            availabilityId
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// Get All Availability
const getAvailability = async (req, res) => {
    try {

        const availability = await getAllAvailability();

        res.json({
            success: true,
            count: availability.length,
            availability
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// Get Availability by Doctor
const getDoctorAvailability = async (req, res) => {
    try {

        const availability = await getAvailabilityByDoctor(req.params.doctorId);

        res.json({
            success: true,
            count: availability.length,
            availability
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// Update Availability
const editAvailability = async (req, res) => {
    try {

        await updateAvailability(req.params.id, req.body);

        res.json({
            success: true,
            message: "Availability updated successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// Delete Availability
const removeAvailability = async (req, res) => {
    try {

        await deleteAvailability(req.params.id);

        res.json({
            success: true,
            message: "Availability deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

module.exports = {
    createAvailability,
    getAvailability,
    getDoctorAvailability,
    editAvailability,
    removeAvailability
};