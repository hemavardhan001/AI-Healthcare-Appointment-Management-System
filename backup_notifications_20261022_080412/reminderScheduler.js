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
             p.name AS patient_name, p.email AS patient_email,
             du.name AS doctor_name
      FROM appointments a
      JOIN users p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users du ON du.id = d.user_id
      WHERE a.status = 'scheduled'
        AND COALESCE(a.reminder_sent, 0) = 0
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

      const message =
        `Reminder: your appointment is scheduled for ${a.appointment_date} ` +
        `at ${a.start_time}. Doctor: ${a.doctor_name || "your doctor"}.`;

      // A transaction claims the reminder before sending, preventing
      // repeated processing by this scheduler.
      let claimed = false;

      try {
        await db.exec("BEGIN IMMEDIATE");

        const existing = await db.get(
          `SELECT id FROM reminders
           WHERE appointment_id = ? AND reminder_type = 'email' AND sent = 1`,
          [a.id]
        );

        if (!existing) {
          const pending = await db.get(
            `SELECT id FROM reminders
             WHERE appointment_id = ? AND reminder_type = 'email' AND sent = 0
             ORDER BY id DESC LIMIT 1`,
            [a.id]
          );

          if (pending) {
            claimed = true;
          } else {
            await db.run(
              `INSERT INTO reminders
               (appointment_id, reminder_type, scheduled_time, sent)
               VALUES (?, 'email', ?, 0)`,
              [a.id, new Date(appointmentTime - 86400000).toISOString()]
            );
            claimed = true;
          }
        }

        await db.exec("COMMIT");

        if (!claimed || existing) continue;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
          console.warn("Email credentials missing; reminder not marked sent.");
          continue;
        }

        if (!a.patient_email) {
          console.warn(`Patient email missing for appointment ${a.id}.`);
          continue;
        }

        await sendAppointmentEmail({
          to: a.patient_email,
          subject: "Appointment reminder — 24 hours to go",
          message
        });

        await db.run(
          `UPDATE reminders SET sent = 1, sent_at = CURRENT_TIMESTAMP
           WHERE appointment_id = ? AND reminder_type = 'email' AND sent = 0`,
          [a.id]
        );

        await db.run(
          "UPDATE appointments SET reminder_sent = 1 WHERE id = ?",
          [a.id]
        );

        await createNotification({
          user_id: a.patient_id,
          appointment_id: a.id,
          title: "Appointment reminder",
          message,
          type: "reminder"
        });

        console.log(`Reminder sent for appointment ${a.id}`);
      } catch (error) {
        try { await db.exec("ROLLBACK"); } catch (_) {}
        console.error(`Reminder error for appointment ${a.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Reminder scheduler error:", error.message);
  } finally {
    running = false;
  }
}

function startReminderScheduler() {
  checkReminders();
  cron.schedule("*/5 * * * *", checkReminders);
  console.log("Appointment reminder scheduler active (every 5 minutes).");
}

module.exports = { startReminderScheduler };
