-- =============================================
-- Electronic Health Record (EHR) Database Schema
-- PostgreSQL 14+
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search optimization

-- =============================================
-- 1. USERS AND PROFILES
-- =============================================

-- Main users table (students, professionals, administrators)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_number VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'psychologist', 'nurse', 'coordinator_psych', 'coordinator_nurse', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_date_of_birth CHECK (date_of_birth < CURRENT_DATE)
);

-- Student-specific profile information
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  marital_status VARCHAR(50),
  guardian_name VARCHAR(200),
  guardian_phone VARCHAR(20),
  career VARCHAR(100) NOT NULL,
  "group" VARCHAR(20),
  occupation VARCHAR(100),
  semester INTEGER CHECK (semester > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Emergency contacts for students
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. MEDICAL RECORDS
-- =============================================

-- General medical record (shared between departments)
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_profile_id UUID NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
  blood_type VARCHAR(10),
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  family_history TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

-- =============================================
-- 3. PSYCHOLOGY MODULE
-- =============================================

-- Psychology-specific records
CREATE TABLE psychology_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL UNIQUE REFERENCES medical_records(id) ON DELETE CASCADE,
  initial_evaluation_date DATE,
  chief_complaint TEXT,
  psychological_history TEXT,
  psychiatric_history TEXT,
  substance_use TEXT,
  suicide_risk_level VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (suicide_risk_level IN ('none', 'low', 'medium', 'high')),
  violence_risk_level VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (violence_risk_level IN ('none', 'low', 'medium', 'high')),
  current_diagnosis_dsm5 VARCHAR(100),
  current_diagnosis_cie10 VARCHAR(100),
  support_network TEXT,
  assigned_psychologist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Psychometric evaluations (WISC, WAIS, Beck, etc.)
CREATE TABLE psychometric_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychology_record_id UUID NOT NULL REFERENCES psychology_records(id) ON DELETE CASCADE,
  evaluation_type VARCHAR(100) NOT NULL,
  application_date DATE NOT NULL CHECK (application_date <= CURRENT_DATE),
  raw_score DECIMAL(10,2),
  standard_score DECIMAL(10,2),
  percentile INTEGER CHECK (percentile >= 0 AND percentile <= 100),
  interpretation TEXT,
  administered_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  file_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Therapy sessions
CREATE TABLE therapy_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychology_record_id UUID NOT NULL REFERENCES psychology_records(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL CHECK (session_number > 0),
  session_date TIMESTAMP NOT NULL,
  therapy_type VARCHAR(50) NOT NULL CHECK (therapy_type IN ('individual', 'group', 'family', 'couple')),
  session_duration INTEGER NOT NULL DEFAULT 50 CHECK (session_duration > 0),
  evolution_notes TEXT,
  patient_progress TEXT,
  assigned_tasks TEXT,
  observations TEXT,
  next_session_plan TEXT,
  therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_session_number UNIQUE (psychology_record_id, session_number)
);

-- Treatment plans
CREATE TABLE treatment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  psychology_record_id UUID NOT NULL REFERENCES psychology_records(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  therapeutic_approach VARCHAR(100),
  goals TEXT NOT NULL,
  interventions TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_end_date CHECK (end_date IS NULL OR end_date >= start_date)
);

-- =============================================
-- 4. NURSING MODULE
-- =============================================

-- Nursing consultations
CREATE TABLE nursing_consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  consultation_date TIMESTAMP NOT NULL,
  chief_complaint TEXT,
  vital_signs_temperature DECIMAL(4,2) CHECK (vital_signs_temperature IS NULL OR (vital_signs_temperature >= 35 AND vital_signs_temperature <= 45)),
  vital_signs_blood_pressure_sys INTEGER CHECK (vital_signs_blood_pressure_sys IS NULL OR (vital_signs_blood_pressure_sys >= 50 AND vital_signs_blood_pressure_sys <= 250)),
  vital_signs_blood_pressure_dia INTEGER CHECK (vital_signs_blood_pressure_dia IS NULL OR (vital_signs_blood_pressure_dia >= 30 AND vital_signs_blood_pressure_dia <= 150)),
  vital_signs_heart_rate INTEGER CHECK (vital_signs_heart_rate IS NULL OR (vital_signs_heart_rate >= 30 AND vital_signs_heart_rate <= 220)),
  vital_signs_respiratory_rate INTEGER CHECK (vital_signs_respiratory_rate IS NULL OR (vital_signs_respiratory_rate >= 8 AND vital_signs_respiratory_rate <= 60)),
  vital_signs_oxygen_saturation INTEGER CHECK (vital_signs_oxygen_saturation IS NULL OR (vital_signs_oxygen_saturation >= 70 AND vital_signs_oxygen_saturation <= 100)),
  vital_signs_weight DECIMAL(5,2) CHECK (vital_signs_weight IS NULL OR vital_signs_weight > 0),
  vital_signs_height DECIMAL(5,2) CHECK (vital_signs_height IS NULL OR vital_signs_height > 0),
  physical_examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  observations TEXT,
  nurse_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Nursing procedures
CREATE TABLE nursing_procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nursing_consultation_id UUID NOT NULL REFERENCES nursing_consultations(id) ON DELETE CASCADE,
  procedure_type VARCHAR(100) NOT NULL,
  procedure_date TIMESTAMP NOT NULL,
  description TEXT NOT NULL,
  materials_used TEXT,
  observations TEXT,
  performed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- 5. MEDICATIONS
-- =============================================

-- Medication catalog
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  generic_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  dosage_forms TEXT,
  common_dosages TEXT,
  administration_routes TEXT,
  contraindications TEXT,
  side_effects TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_medication UNIQUE (name, generic_name)
);

-- Medication administrations (with 5 rights verification)
CREATE TABLE medication_administrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nursing_consultation_id UUID NOT NULL REFERENCES nursing_consultations(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE RESTRICT,
  dosage VARCHAR(100) NOT NULL,
  route VARCHAR(50) NOT NULL CHECK (route IN ('oral', 'IV', 'IM', 'SC', 'topical', 'inhalation', 'rectal', 'other')),
  administration_date TIMESTAMP NOT NULL,
  administered_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  patient_verified BOOLEAN NOT NULL DEFAULT FALSE,
  medication_verified BOOLEAN NOT NULL DEFAULT FALSE,
  dosage_verified BOOLEAN NOT NULL DEFAULT FALSE,
  route_verified BOOLEAN NOT NULL DEFAULT FALSE,
  time_verified BOOLEAN NOT NULL DEFAULT FALSE,
  adverse_reaction TEXT,
  observations TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_5_rights CHECK (
    patient_verified = TRUE AND
    medication_verified = TRUE AND
    dosage_verified = TRUE AND
    route_verified = TRUE AND
    time_verified = TRUE
  )
);

-- =============================================
-- 6. APPOINTMENTS AND SCHEDULING
-- =============================================

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  appointment_type VARCHAR(50) NOT NULL CHECK (appointment_type IN ('psychology_initial', 'psychology_followup', 'nursing', 'emergency')),
  department VARCHAR(50) NOT NULL CHECK (department IN ('psychology', 'nursing')),
  scheduled_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  cancellation_reason TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Appointment reminders
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('email', 'sms', 'notification')),
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Waiting list
CREATE TABLE waiting_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  department VARCHAR(50) NOT NULL CHECK (department IN ('psychology', 'nursing')),
  preferred_professional_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requested_date DATE,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'emergency')),
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'scheduled', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Professional schedules
CREATE TABLE professional_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_time_range CHECK (end_time > start_time)
);

-- =============================================
-- 7. INTERCONSULTATIONS
-- =============================================

-- Interconsultations between departments
CREATE TABLE interconsultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  from_department VARCHAR(50) NOT NULL CHECK (from_department IN ('psychology', 'nursing', 'administrative')),
  to_department VARCHAR(50) NOT NULL CHECK (to_department IN ('psychology', 'nursing', 'administrative')),
  from_professional_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  to_professional_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  relevant_information TEXT,
  urgency VARCHAR(20) NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'rejected')),
  response TEXT,
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- 8. AUDIT AND REPORTS
-- =============================================

-- Audit logs for compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete')),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reports metadata
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL CHECK (department IN ('psychology', 'nursing', 'general')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  filters JSONB,
  generated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  file_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT check_period CHECK (period_end >= period_start)
);

-- System settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Users indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_enrollment ON users(enrollment_number) WHERE enrollment_number IS NOT NULL;
CREATE INDEX idx_users_name ON users(first_name, last_name);
CREATE INDEX idx_users_role_active ON users(role, is_active);

-- Student profiles indexes
CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);

-- Emergency contacts indexes
CREATE INDEX idx_emergency_contacts_student ON emergency_contacts(student_profile_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(student_profile_id, priority);

-- Medical records indexes
CREATE INDEX idx_medical_records_student ON medical_records(student_profile_id);

-- Psychology records indexes
CREATE INDEX idx_psych_records_medical ON psychology_records(medical_record_id);
CREATE INDEX idx_psych_records_assigned ON psychology_records(assigned_psychologist_id);

-- Psychometric evaluations indexes
CREATE INDEX idx_psychometric_psych_record ON psychometric_evaluations(psychology_record_id);
CREATE INDEX idx_psychometric_date ON psychometric_evaluations(application_date);
CREATE INDEX idx_psychometric_type ON psychometric_evaluations(evaluation_type);

-- Therapy sessions indexes
CREATE INDEX idx_therapy_sessions_psych ON therapy_sessions(psychology_record_id);
CREATE INDEX idx_therapy_sessions_date ON therapy_sessions(session_date DESC);
CREATE INDEX idx_therapy_sessions_therapist ON therapy_sessions(therapist_id);

-- Treatment plans indexes
CREATE INDEX idx_treatment_plans_psych ON treatment_plans(psychology_record_id);
CREATE INDEX idx_treatment_plans_status ON treatment_plans(status);

-- Nursing consultations indexes
CREATE INDEX idx_nursing_consultations_record ON nursing_consultations(medical_record_id);
CREATE INDEX idx_nursing_consultations_date ON nursing_consultations(consultation_date DESC);
CREATE INDEX idx_nursing_consultations_nurse ON nursing_consultations(nurse_id);

-- Nursing procedures indexes
CREATE INDEX idx_nursing_procedures_consultation ON nursing_procedures(nursing_consultation_id);
CREATE INDEX idx_nursing_procedures_type ON nursing_procedures(procedure_type);
CREATE INDEX idx_nursing_procedures_date ON nursing_procedures(procedure_date);

-- Medications indexes
CREATE INDEX idx_medications_name ON medications(name);
CREATE INDEX idx_medications_generic ON medications(generic_name);
CREATE INDEX idx_medications_active ON medications(is_active);

-- Medication administrations indexes
CREATE INDEX idx_med_admin_consultation ON medication_administrations(nursing_consultation_id);
CREATE INDEX idx_med_admin_medication ON medication_administrations(medication_id);
CREATE INDEX idx_med_admin_date ON medication_administrations(administration_date);

-- Appointments indexes
CREATE INDEX idx_appointments_student ON appointments(student_profile_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_department ON appointments(department);
CREATE INDEX idx_appointments_prof_date ON appointments(professional_id, scheduled_date);

-- Appointment reminders indexes
CREATE INDEX idx_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX idx_reminders_scheduled ON appointment_reminders(scheduled_for);
CREATE INDEX idx_reminders_status ON appointment_reminders(status);

-- Waiting list indexes
CREATE INDEX idx_waiting_list_student ON waiting_list(student_profile_id);
CREATE INDEX idx_waiting_list_department ON waiting_list(department);
CREATE INDEX idx_waiting_list_priority ON waiting_list(priority);
CREATE INDEX idx_waiting_list_status ON waiting_list(status);

-- Professional schedules indexes
CREATE INDEX idx_schedules_professional ON professional_schedules(professional_id);
CREATE INDEX idx_schedules_day ON professional_schedules(day_of_week);

-- Interconsultations indexes
CREATE INDEX idx_interconsult_student ON interconsultations(student_profile_id);
CREATE INDEX idx_interconsult_from ON interconsultations(from_professional_id);
CREATE INDEX idx_interconsult_to ON interconsultations(to_professional_id);
CREATE INDEX idx_interconsult_status ON interconsultations(status);

-- Audit logs indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_record ON audit_logs(record_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Reports indexes
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_department ON reports(department);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);

-- System settings indexes
CREATE INDEX idx_settings_key ON system_settings(setting_key);

-- =============================================
-- COMMENTS ON TABLES (Documentation)
-- =============================================

COMMENT ON TABLE users IS 'All system users (students, professionals, administrators)';
COMMENT ON TABLE student_profiles IS 'Detailed student information';
COMMENT ON TABLE emergency_contacts IS 'Emergency contacts for students';
COMMENT ON TABLE medical_records IS 'General medical records shared between departments';
COMMENT ON TABLE psychology_records IS 'Psychology-specific records with restricted access';
COMMENT ON TABLE psychometric_evaluations IS 'Psychometric test results (WISC, WAIS, Beck, etc.)';
COMMENT ON TABLE therapy_sessions IS 'Individual therapy session records';
COMMENT ON TABLE treatment_plans IS 'Treatment plans with goals and interventions';
COMMENT ON TABLE nursing_consultations IS 'Nursing consultations with vital signs';
COMMENT ON TABLE nursing_procedures IS 'Nursing procedures performed';
COMMENT ON TABLE medications IS 'Medication catalog';
COMMENT ON TABLE medication_administrations IS 'Medication administration records with 5 rights verification';
COMMENT ON TABLE appointments IS 'Appointment scheduling for psychology and nursing';
COMMENT ON TABLE appointment_reminders IS 'Automatic reminders for appointments';
COMMENT ON TABLE waiting_list IS 'Waiting list when no availability';
COMMENT ON TABLE professional_schedules IS 'Professional availability schedules';
COMMENT ON TABLE interconsultations IS 'Inter-department consultations';
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and security';
COMMENT ON TABLE reports IS 'Generated reports metadata';
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';

-- =============================================
-- END OF SCHEMA
-- =============================================
