const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initDB } = require('./config/database');

// Routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// API Routes
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);

// ===============================
// Home Route
// ===============================
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Appointment Management API is running successfully!'
    });
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {

        await initDB();

        app.listen(PORT, () => {
            console.log('===================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 http://localhost:${PORT}`);
            console.log('===================================');
        });

    } catch (err) {

        console.error('❌ Failed to start server');
        console.error(err);

    }
};

startServer();