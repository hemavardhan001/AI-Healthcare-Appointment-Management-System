const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const {
    createAvailability,
    getAvailability,
    getDoctorAvailability,
    editAvailability,
    removeAvailability
} = require('../controllers/availabilityController');

// Public
router.get('/', getAvailability);
router.get('/doctor/:doctorId', getDoctorAvailability);

// Doctor/Admin
router.post('/', protect, authorize('doctor', 'admin'), createAvailability);
router.put('/:id', protect, authorize('doctor', 'admin'), editAvailability);
router.delete('/:id', protect, authorize('doctor', 'admin'), removeAvailability);

module.exports = router;