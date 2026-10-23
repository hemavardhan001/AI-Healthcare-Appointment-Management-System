
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL
    CHECK (role IN ('patient', 'doctor', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE,
  specialization TEXT,
  bio TEXT,
  experience_years INTEGER,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  appointment_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  reminder_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id)
    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)
    REFERENCES doctors(id) ON DELETE CASCADE
);

-- Availability Table
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL
    CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  FOREIGN KEY (doctor_id)
    REFERENCES doctors(id) ON DELETE CASCADE
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL,
  reminder_type TEXT NOT NULL
    CHECK (reminder_type IN ('email', 'sms')),
  scheduled_time TIMESTAMP NOT NULL,
  sent INTEGER DEFAULT 0,
  sent_at TIMESTAMP,
  FOREIGN KEY (appointment_id)
    REFERENCES appointments(id) ON DELETE CASCADE
);
