
const nodemailer = require("nodemailer");

const sendAppointmentEmail = async ({ to, subject, message }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.warn("Email not configured; notification skipped.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `"Appointment Management System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: message
    });
};

module.exports = { sendAppointmentEmail };