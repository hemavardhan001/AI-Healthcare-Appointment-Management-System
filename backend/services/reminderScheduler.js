const cron = require("node-cron");
const { getDB } = require("../config/database");
const { createNotification } = require("../models/notificationModel");
const { sendAppointmentEmail } = require("./emailService");

let running = false;

async function checkReminders() {
  if (running) return;
  running = true;

  try {
    const db = getDB();
    const appointments = await db.all(`
      SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date,
             a.start_time, a.status, a.reminder_sent,
             p.email AS patient_email, du.name AS doctor_name
      FROM appointments a
      JOIN users p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users du ON du.id = d.user_id
      WHERE a.status = 'scheduled'
    `);

    const now = Date.now();
    const start = now + 23 * 60 * 60 * 1000 + 55 * 60 * 1000;
    const end = now + 24 * 60 * 60 * 1000 + 5 * 60 * 1000;

    for (const a of appointments) {
      const appointmentTime = new Date(
        `${a.appointment_date}T${a.start_time}`
      ).getTime();

      if (!Number.isFinite(appointmentTime) ||
          appointmentTime < start || appointmentTime > end) continue;

      const message = `Reminder: your appointment is scheduled for ${a.appointment_date} at ${a.start_time}. Doctor: ${a.doctor_name || "your doctor"}.`;

      // In-app notification is created once, even if email is not configured.
      const existingNotification = await db.get(
        `SELECT id FROM notifications
         WHERE user_id = ? AND appointment_id = ? AND type = 'reminder'
           AND title = 'Appointment reminder'
         LIMIT 1`,
        [a.patient_id, a.id]
      );

      if (!existingNotification) {
        await createNotification({
          user_id: a.patient_id,
          appointment_id: a.id,
          title: "Appointment reminder",
          message,
          type: "reminder"
        });
        console.log(`In-app reminder created for appointment ${a.id}`);
      }

      // Email is optional and tracked separately from the in-app notification.
      if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD || !a.patient_email) {
        continue;
      }

      const sentEmail = await db.get(
        `SELECT id FROM reminders
         WHERE appointment_id = ? AND reminder_type = 'email' AND sent = 1
         LIMIT 1`,
        [a.id]
      );
      if (sentEmail) continue;

      try {
        await sendAppointmentEmail({
          to: a.patient_email,
          subject: "Appointment reminder — 24 hours to go",
          message
        });

        const pending = await db.get(
          `SELECT id FROM reminders
           WHERE appointment_id = ? AND reminder_type = 'email' AND sent = 0
           ORDER BY id DESC LIMIT 1`,
          [a.id]
        );

        if (pending) {
          await db.run(
            `UPDATE reminders SET sent = 1, sent_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [pending.id]
          );
        } else {
          await db.run(
            `INSERT INTO reminders
             (appointment_id, reminder_type, scheduled_time, sent, sent_at)
             VALUES (?, 'email', ?, 1, CURRENT_TIMESTAMP)`,
            [a.id, new Date(appointmentTime - 86400000).toISOString()]
          );
        }

        await db.run(
          "UPDATE appointments SET reminder_sent = 1 WHERE id = ?",
          [a.id]
        );
        console.log(`Email reminder sent for appointment ${a.id}`);
      } catch (emailError) {
        console.error(`Email reminder failed for appointment ${a.id}:`, emailError.message);
      }
    }
  } catch (error) {
    console.error("Reminder scheduler error:", error.message);
  } finally {
    running = false;
  }
}

function startReminderScheduler() {
  checkReminders().catch(error => console.error("Initial reminder check failed:", error.message));
  cron.schedule("*/5 * * * *", checkReminders);
  console.log("Appointment reminder scheduler active (every 5 minutes).");
}

module.exports = { startReminderScheduler, checkReminders };