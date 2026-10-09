const {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require('../models/doctorModel');

const {
    getDoctorByUserId
} = require('../models/availabilityModel');

// Add Doctor
const addDoctor = async (req, res) => {
    try {

        const {
            user_id,
            specialization,
            bio,
            experience_years,
            is_active
        } = req.body;

        const doctorId = await createDoctor({
            user_id,
            specialization,
            bio,
            experience_years,
            is_active
        });

        res.status(201).json({
            success: true,
            message: "Doctor added successfully",
            doctorId
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};


// Get All Doctors
const getDoctors = async (req, res) => {

    try {

        const doctors = await getAllDoctors();

        res.json({
            success: true,
            count: doctors.length,
            doctors
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// Get Doctor By ID
const getDoctor = async (req, res) => {

    try {

        const doctor = await getDoctorById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.json({
            success: true,
            doctor
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// Get Logged-in Doctor
const getMyDoctor = async (req, res) => {

    try {

        const doctor = await getDoctorByUserId(req.user.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        res.json({
            success: true,
            doctor
        });

    } catch (err) {

        console.error("Get my doctor error:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// Update Doctor
const editDoctor = async (req, res) => {

    try {

        await updateDoctor(req.params.id, req.body);

        res.json({
            success: true,
            message: "Doctor updated successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// Delete Doctor
const removeDoctor = async (req, res) => {

    try {

        await deleteDoctor(req.params.id);

        res.json({
            success: true,
            message: "Doctor deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


module.exports = {
    addDoctor,
    getDoctors,
    getDoctor,
    getMyDoctor,
    editDoctor,
    removeDoctor
};