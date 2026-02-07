# Diccionario de Datos - Expediente Electrónico de Salud

## Tabla de Contenidos
1. [users](#1-users)
2. [student_profiles](#2-student_profiles)
3. [emergency_contacts](#3-emergency_contacts)
4. [medical_records](#4-medical_records)
5. [psychology_records](#5-psychology_records)
6. [psychometric_evaluations](#6-psychometric_evaluations)
7. [therapy_sessions](#7-therapy_sessions)
8. [treatment_plans](#8-treatment_plans)
9. [nursing_consultations](#9-nursing_consultations)
10. [nursing_procedures](#10-nursing_procedures)
11. [medications](#11-medications)
12. [medication_administrations](#12-medication_administrations)
13. [appointments](#13-appointments)
14. [appointment_reminders](#14-appointment_reminders)
15. [waiting_list](#15-waiting_list)
16. [professional_schedules](#16-professional_schedules)
17. [interconsultations](#17-interconsultations)
18. [audit_logs](#18-audit_logs)
19. [reports](#19-reports)
20. [system_settings](#20-system_settings)

---

## 1. users

**Descripción**: Almacena la información de todos los usuarios del sistema (estudiantes, profesionales de salud, coordinadores y administradores).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del usuario |
| enrollment_number | VARCHAR(20) | UNIQUE, NULL permitido | Matrícula del estudiante (solo para rol student) |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Correo electrónico del usuario |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña encriptada con bcrypt |
| first_name | VARCHAR(100) | NOT NULL | Nombre(s) del usuario |
| last_name | VARCHAR(100) | NOT NULL | Apellido(s) del usuario |
| date_of_birth | DATE | NOT NULL | Fecha de nacimiento |
| phone | VARCHAR(20) | NULL | Número de teléfono |
| role | ENUM | NOT NULL | Rol: 'student', 'psychologist', 'nurse', 'coordinator_psych', 'coordinator_nurse', 'admin' |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Indica si el usuario está activo |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha y hora de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha y hora de última actualización |

**Índices:**
- `idx_users_enrollment` en `enrollment_number`
- `idx_users_email` en `email`
- `idx_users_role` en `role`

**Restricciones:**
- UNIQUE `enrollment_number` (cuando no es NULL)
- UNIQUE `email`
- CHECK: `role` debe ser uno de los valores del ENUM
- CHECK: `date_of_birth` debe ser anterior a la fecha actual

---

## 2. student_profiles

**Descripción**: Información detallada específica de estudiantes que complementa la tabla users.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del perfil |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL | Referencia al usuario |
| marital_status | VARCHAR(50) | NULL | Estado civil (single, married, divorced, widowed, other) |
| guardian_name | VARCHAR(200) | NULL | Nombre completo del tutor (si aplica) |
| guardian_phone | VARCHAR(20) | NULL | Teléfono del tutor |
| career | VARCHAR(100) | NOT NULL | Carrera que estudia |
| group | VARCHAR(20) | NULL | Grupo académico |
| occupation | VARCHAR(100) | NULL | Ocupación adicional (si trabaja) |
| semester | INTEGER | NULL, CHECK > 0 | Semestre actual |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_student_profiles_user` en `user_id`

**Relaciones:**
- `user_id` → `users.id` ON DELETE CASCADE

**Restricciones:**
- UNIQUE `user_id` (relación 1:1 con users)
- CHECK: `semester` > 0

---

## 3. emergency_contacts

**Descripción**: Contactos de emergencia asociados a cada estudiante.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del contacto |
| student_profile_id | UUID | FK → student_profiles.id, NOT NULL | Referencia al perfil del estudiante |
| name | VARCHAR(200) | NOT NULL | Nombre completo del contacto |
| relationship | VARCHAR(50) | NOT NULL | Relación con el estudiante (parent, sibling, spouse, friend, other) |
| phone | VARCHAR(20) | NOT NULL | Teléfono principal |
| phone_secondary | VARCHAR(20) | NULL | Teléfono alternativo |
| priority | INTEGER | NOT NULL, DEFAULT 1 | Orden de prioridad (1 = contactar primero) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_emergency_contacts_student` en `student_profile_id`
- `idx_emergency_contacts_priority` en `student_profile_id, priority`

**Relaciones:**
- `student_profile_id` → `student_profiles.id` ON DELETE CASCADE

**Restricciones:**
- CHECK: `priority` > 0

---

## 4. medical_records

**Descripción**: Expediente médico general de cada estudiante. Contiene información médica base compartida entre departamentos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del expediente |
| student_profile_id | UUID | FK → student_profiles.id, UNIQUE, NOT NULL | Referencia al perfil del estudiante |
| blood_type | VARCHAR(10) | NULL | Tipo de sangre (A+, A-, B+, B-, AB+, AB-, O+, O-) |
| allergies | TEXT | NULL | Alergias conocidas (medicamentos, alimentos, etc.) |
| chronic_conditions | TEXT | NULL | Condiciones crónicas o enfermedades preexistentes |
| current_medications | TEXT | NULL | Medicamentos que toma actualmente |
| family_history | TEXT | NULL | Historial familiar médico relevante |
| notes | TEXT | NULL | Notas generales del expediente |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación del expediente |
| created_by | UUID | FK → users.id, NOT NULL | Profesional que creó el expediente |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Última actualización |
| updated_by | UUID | FK → users.id, NOT NULL | Último profesional que actualizó |

**Índices:**
- `idx_medical_records_student` en `student_profile_id`

**Relaciones:**
- `student_profile_id` → `student_profiles.id` ON DELETE CASCADE
- `created_by` → `users.id` ON DELETE RESTRICT
- `updated_by` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- UNIQUE `student_profile_id` (relación 1:1 con student_profiles)

---

## 5. psychology_records

**Descripción**: Expediente psicológico específico. Contiene información confidencial de psicología.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del expediente psicológico |
| medical_record_id | UUID | FK → medical_records.id, UNIQUE, NOT NULL | Referencia al expediente médico |
| initial_evaluation_date | DATE | NULL | Fecha de la evaluación inicial |
| chief_complaint | TEXT | NULL | Motivo principal de consulta |
| psychological_history | TEXT | NULL | Antecedentes psicológicos personales |
| psychiatric_history | TEXT | NULL | Antecedentes psiquiátricos (diagnósticos previos, hospitalizaciones) |
| substance_use | TEXT | NULL | Uso de sustancias (alcohol, tabaco, drogas) |
| suicide_risk_level | VARCHAR(20) | DEFAULT 'none' | Nivel de riesgo suicida: 'none', 'low', 'medium', 'high' |
| violence_risk_level | VARCHAR(20) | DEFAULT 'none' | Nivel de riesgo de violencia: 'none', 'low', 'medium', 'high' |
| current_diagnosis_dsm5 | VARCHAR(100) | NULL | Diagnóstico según DSM-5 |
| current_diagnosis_cie10 | VARCHAR(100) | NULL | Diagnóstico según CIE-10/11 |
| support_network | TEXT | NULL | Red de apoyo del paciente (familia, amigos, grupos) |
| assigned_psychologist_id | UUID | FK → users.id, NULL | Psicólogo asignado actualmente |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_psych_records_medical` en `medical_record_id`
- `idx_psych_records_assigned` en `assigned_psychologist_id`

**Relaciones:**
- `medical_record_id` → `medical_records.id` ON DELETE CASCADE
- `assigned_psychologist_id` → `users.id` ON DELETE SET NULL

**Restricciones:**
- UNIQUE `medical_record_id` (relación 1:1 con medical_records)
- CHECK: `suicide_risk_level` IN ('none', 'low', 'medium', 'high')
- CHECK: `violence_risk_level` IN ('none', 'low', 'medium', 'high')

---

## 6. psychometric_evaluations

**Descripción**: Registro de evaluaciones psicométricas aplicadas a los estudiantes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único de la evaluación |
| psychology_record_id | UUID | FK → psychology_records.id, NOT NULL | Referencia al expediente psicológico |
| evaluation_type | VARCHAR(100) | NOT NULL | Tipo de evaluación (WISC, WAIS, Beck Depression Inventory, Beck Anxiety Inventory, etc.) |
| application_date | DATE | NOT NULL | Fecha de aplicación de la prueba |
| raw_score | DECIMAL(10,2) | NULL | Puntaje bruto obtenido |
| standard_score | DECIMAL(10,2) | NULL | Puntaje estándar o T-score |
| percentile | INTEGER | NULL, CHECK >= 0 AND <= 100 | Percentil obtenido |
| interpretation | TEXT | NULL | Interpretación clínica de los resultados |
| administered_by | UUID | FK → users.id, NOT NULL | Profesional que aplicó la evaluación |
| file_url | VARCHAR(500) | NULL | URL del archivo con resultados detallados |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de registro |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_psychometric_psych_record` en `psychology_record_id`
- `idx_psychometric_date` en `application_date`
- `idx_psychometric_type` en `evaluation_type`

**Relaciones:**
- `psychology_record_id` → `psychology_records.id` ON DELETE CASCADE
- `administered_by` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- CHECK: `percentile` BETWEEN 0 AND 100
- CHECK: `application_date` <= CURRENT_DATE

---

## 7. therapy_sessions

**Descripción**: Registro detallado de cada sesión terapéutica realizada.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único de la sesión |
| psychology_record_id | UUID | FK → psychology_records.id, NOT NULL | Referencia al expediente psicológico |
| session_number | INTEGER | NOT NULL, CHECK > 0 | Número consecutivo de sesión |
| session_date | TIMESTAMP | NOT NULL | Fecha y hora de la sesión |
| therapy_type | VARCHAR(50) | NOT NULL | Tipo: 'individual', 'group', 'family', 'couple' |
| session_duration | INTEGER | DEFAULT 50 | Duración en minutos |
| evolution_notes | TEXT | NULL | Notas narrativas de evolución |
| patient_progress | TEXT | NULL | Descripción de avances del paciente |
| assigned_tasks | TEXT | NULL | Tareas o actividades asignadas para casa |
| observations | TEXT | NULL | Observaciones generales del terapeuta |
| next_session_plan | TEXT | NULL | Planificación para la próxima sesión |
| therapist_id | UUID | FK → users.id, NOT NULL | Terapeuta que condujo la sesión |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación del registro |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_therapy_sessions_psych` en `psychology_record_id`
- `idx_therapy_sessions_date` en `session_date`
- `idx_therapy_sessions_therapist` en `therapist_id`
- `idx_therapy_sessions_number` en `psychology_record_id, session_number`

**Relaciones:**
- `psychology_record_id` → `psychology_records.id` ON DELETE CASCADE
- `therapist_id` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- CHECK: `session_number` > 0
- CHECK: `session_duration` > 0
- CHECK: `therapy_type` IN ('individual', 'group', 'family', 'couple')
- UNIQUE `(psychology_record_id, session_number)`

---

## 8. treatment_plans

**Descripción**: Planes de tratamiento psicológico con objetivos y estrategias terapéuticas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del plan |
| psychology_record_id | UUID | FK → psychology_records.id, NOT NULL | Referencia al expediente psicológico |
| start_date | DATE | NOT NULL | Fecha de inicio del plan |
| end_date | DATE | NULL | Fecha estimada de finalización |
| therapeutic_approach | VARCHAR(100) | NULL | Enfoque terapéutico (CBT, psychodynamic, humanistic, etc.) |
| goals | TEXT | NOT NULL | Objetivos terapéuticos específicos |
| interventions | TEXT | NULL | Intervenciones planificadas |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | Estado: 'active', 'completed', 'discontinued' |
| created_by | UUID | FK → users.id, NOT NULL | Profesional que creó el plan |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_treatment_plans_psych` en `psychology_record_id`
- `idx_treatment_plans_status` en `status`

**Relaciones:**
- `psychology_record_id` → `psychology_records.id` ON DELETE CASCADE
- `created_by` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- CHECK: `status` IN ('active', 'completed', 'discontinued')
- CHECK: `end_date` IS NULL OR `end_date` >= `start_date`

---

## 9. nursing_consultations

**Descripción**: Registro de consultas de enfermería con signos vitales y diagnóstico.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único de la consulta |
| medical_record_id | UUID | FK → medical_records.id, NOT NULL | Referencia al expediente médico |
| consultation_date | TIMESTAMP | NOT NULL | Fecha y hora de la consulta |
| chief_complaint | TEXT | NULL | Motivo de consulta |
| vital_signs_temperature | DECIMAL(4,2) | NULL, CHECK >= 35 AND <= 45 | Temperatura en °C |
| vital_signs_blood_pressure_sys | INTEGER | NULL, CHECK >= 50 AND <= 250 | Presión arterial sistólica (mmHg) |
| vital_signs_blood_pressure_dia | INTEGER | NULL, CHECK >= 30 AND <= 150 | Presión arterial diastólica (mmHg) |
| vital_signs_heart_rate | INTEGER | NULL, CHECK >= 30 AND <= 220 | Frecuencia cardíaca (latidos/min) |
| vital_signs_respiratory_rate | INTEGER | NULL, CHECK >= 8 AND <= 60 | Frecuencia respiratoria (respiraciones/min) |
| vital_signs_oxygen_saturation | INTEGER | NULL, CHECK >= 70 AND <= 100 | Saturación de oxígeno (%) |
| vital_signs_weight | DECIMAL(5,2) | NULL, CHECK > 0 | Peso en kg |
| vital_signs_height | DECIMAL(5,2) | NULL, CHECK > 0 | Altura en cm |
| physical_examination | TEXT | NULL | Hallazgos de exploración física |
| diagnosis | TEXT | NULL | Diagnóstico de enfermería |
| treatment_plan | TEXT | NULL | Plan de cuidados |
| observations | TEXT | NULL | Observaciones adicionales |
| nurse_id | UUID | FK → users.id, NOT NULL | Enfermera que atendió |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_nursing_consultations_record` en `medical_record_id`
- `idx_nursing_consultations_date` en `consultation_date`
- `idx_nursing_consultations_nurse` en `nurse_id`

**Relaciones:**
- `medical_record_id` → `medical_records.id` ON DELETE CASCADE
- `nurse_id` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- Múltiples CHECK constraints para validar rangos de signos vitales

---

## 10. nursing_procedures

**Descripción**: Registro de procedimientos específicos realizados por enfermería.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del procedimiento |
| nursing_consultation_id | UUID | FK → nursing_consultations.id, NOT NULL | Referencia a la consulta |
| procedure_type | VARCHAR(100) | NOT NULL | Tipo: 'wound_care', 'injection', 'bandage', 'suture', 'IV_therapy', 'catheterization', 'other' |
| procedure_date | TIMESTAMP | NOT NULL | Fecha y hora del procedimiento |
| description | TEXT | NOT NULL | Descripción detallada del procedimiento |
| materials_used | TEXT | NULL | Materiales e insumos utilizados |
| observations | TEXT | NULL | Observaciones del procedimiento |
| performed_by | UUID | FK → users.id, NOT NULL | Enfermera que realizó el procedimiento |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de registro |

**Índices:**
- `idx_nursing_procedures_consultation` en `nursing_consultation_id`
- `idx_nursing_procedures_type` en `procedure_type`
- `idx_nursing_procedures_date` en `procedure_date`

**Relaciones:**
- `nursing_consultation_id` → `nursing_consultations.id` ON DELETE CASCADE
- `performed_by` → `users.id` ON DELETE RESTRICT

---

## 11. medications

**Descripción**: Catálogo de medicamentos disponibles en la institución.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del medicamento |
| name | VARCHAR(200) | NOT NULL | Nombre comercial del medicamento |
| generic_name | VARCHAR(200) | NOT NULL | Nombre genérico (DCI) |
| category | VARCHAR(100) | NULL | Categoría farmacológica (analgesic, antibiotic, etc.) |
| dosage_forms | TEXT | NULL | Formas de dosificación (tablet, capsule, liquid, etc.) |
| common_dosages | TEXT | NULL | Dosis comunes utilizadas |
| administration_routes | TEXT | NULL | Vías de administración posibles |
| contraindications | TEXT | NULL | Contraindicaciones principales |
| side_effects | TEXT | NULL | Efectos secundarios comunes |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Medicamento activo en catálogo |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_medications_name` en `name`
- `idx_medications_generic` en `generic_name`
- `idx_medications_active` en `is_active`

**Restricciones:**
- UNIQUE `(name, generic_name)` para evitar duplicados

---

## 12. medication_administrations

**Descripción**: Registro de administración de medicamentos con verificación de las 5 normas correctas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único de la administración |
| nursing_consultation_id | UUID | FK → nursing_consultations.id, NOT NULL | Referencia a la consulta |
| medication_id | UUID | FK → medications.id, NOT NULL | Medicamento administrado |
| dosage | VARCHAR(100) | NOT NULL | Dosis administrada (ej: "500mg", "2 tablets") |
| route | VARCHAR(50) | NOT NULL | Vía: 'oral', 'IV', 'IM', 'SC', 'topical', 'inhalation', 'rectal', 'other' |
| administration_date | TIMESTAMP | NOT NULL | Fecha y hora exacta de administración |
| administered_by | UUID | FK → users.id, NOT NULL | Enfermera que administró |
| patient_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Verificación: paciente correcto |
| medication_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Verificación: medicamento correcto |
| dosage_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Verificación: dosis correcta |
| route_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Verificación: vía correcta |
| time_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Verificación: hora correcta |
| adverse_reaction | TEXT | NULL | Descripción de reacción adversa (si ocurre) |
| observations | TEXT | NULL | Observaciones adicionales |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de registro |

**Índices:**
- `idx_med_admin_consultation` en `nursing_consultation_id`
- `idx_med_admin_medication` en `medication_id`
- `idx_med_admin_date` en `administration_date`

**Relaciones:**
- `nursing_consultation_id` → `nursing_consultations.id` ON DELETE CASCADE
- `medication_id` → `medications.id` ON DELETE RESTRICT
- `administered_by` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- CHECK: `route` IN ('oral', 'IV', 'IM', 'SC', 'topical', 'inhalation', 'rectal', 'other')
- CHECK: Al menos las 5 verificaciones deben ser TRUE antes de administrar

---

## 13. appointments

**Descripción**: Sistema de agendamiento de citas para psicología y enfermería.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único de la cita |
| student_profile_id | UUID | FK → student_profiles.id, NOT NULL | Estudiante que tiene la cita |
| professional_id | UUID | FK → users.id, NOT NULL | Profesional asignado |
| appointment_type | VARCHAR(50) | NOT NULL | Tipo: 'psychology_initial', 'psychology_followup', 'nursing', 'emergency' |
| department | VARCHAR(50) | NOT NULL | Departamento: 'psychology', 'nursing' |
| scheduled_date | TIMESTAMP | NOT NULL | Fecha y hora programada |
| duration_minutes | INTEGER | NOT NULL | Duración (50 para psicología, 15 para enfermería) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'scheduled' | Estado: 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show' |
| cancellation_reason | TEXT | NULL | Razón de cancelación (si aplica) |
| notes | TEXT | NULL | Notas adicionales de la cita |
| created_by | UUID | FK → users.id, NOT NULL | Usuario que creó la cita |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_appointments_student` en `student_profile_id`
- `idx_appointments_professional` en `professional_id`
- `idx_appointments_date` en `scheduled_date`
- `idx_appointments_status` en `status`
- `idx_appointments_department` en `department`

**Relaciones:**
- `student_profile_id` → `student_profiles.id` ON DELETE CASCADE
- `professional_id` → `users.id` ON DELETE RESTRICT
- `created_by` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- CHECK: `appointment_type` IN ('psychology_initial', 'psychology_followup', 'nursing', 'emergency')
- CHECK: `department` IN ('psychology', 'nursing')
- CHECK: `status` IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
- CHECK: `duration_minutes` > 0

---

## 14. appointment_reminders

**Descripción**: Sistema de recordatorios automáticos para citas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del recordatorio |
| appointment_id | UUID | FK → appointments.id, NOT NULL | Referencia a la cita |
| reminder_type | VARCHAR(20) | NOT NULL | Tipo: 'email', 'sms', 'notification' |
| scheduled_for | TIMESTAMP | NOT NULL | Cuándo enviar el recordatorio |
| sent_at | TIMESTAMP | NULL | Cuándo se envió (NULL si no enviado) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Estado: 'pending', 'sent', 'failed' |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |

**Índices:**
- `idx_reminders_appointment` en `appointment_id`
- `idx_reminders_scheduled` en `scheduled_for`
- `idx_reminders_status` en `status`

**Relaciones:**
- `appointment_id` → `appointments.id` ON DELETE CASCADE

**Restricciones:**
- CHECK: `reminder_type` IN ('email', 'sms', 'notification')
- CHECK: `status` IN ('pending', 'sent', 'failed')

---

## 15. waiting_list

**Descripción**: Lista de espera cuando no hay disponibilidad de citas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único |
| student_profile_id | UUID | FK → student_profiles.id, NOT NULL | Estudiante en espera |
| department | VARCHAR(50) | NOT NULL | Departamento solicitado |
| preferred_professional_id | UUID | FK → users.id, NULL | Profesional preferido (opcional) |
| requested_date | DATE | NULL | Fecha solicitada |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'normal' | Prioridad: 'normal', 'urgent', 'emergency' |
| reason | TEXT | NULL | Razón de la solicitud |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'waiting' | Estado: 'waiting', 'scheduled', 'cancelled' |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_waiting_list_student` en `student_profile_id`
- `idx_waiting_list_department` en `department`
- `idx_waiting_list_priority` en `priority`
- `idx_waiting_list_status` en `status`

**Relaciones:**
- `student_profile_id` → `student_profiles.id` ON DELETE CASCADE
- `preferred_professional_id` → `users.id` ON DELETE SET NULL

**Restricciones:**
- CHECK: `department` IN ('psychology', 'nursing')
- CHECK: `priority` IN ('normal', 'urgent', 'emergency')
- CHECK: `status` IN ('waiting', 'scheduled', 'cancelled')

---

## 16. professional_schedules

**Descripción**: Horarios de disponibilidad de profesionales de salud.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único |
| professional_id | UUID | FK → users.id, NOT NULL | Profesional |
| day_of_week | INTEGER | NOT NULL, CHECK >= 0 AND <= 6 | Día (0=Domingo, 6=Sábado) |
| start_time | TIME | NOT NULL | Hora de inicio |
| end_time | TIME | NOT NULL | Hora de fin |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Horario activo |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_schedules_professional` en `professional_id`
- `idx_schedules_day` en `day_of_week`

**Relaciones:**
- `professional_id` → `users.id` ON DELETE CASCADE

**Restricciones:**
- CHECK: `day_of_week` BETWEEN 0 AND 6
- CHECK: `end_time` > `start_time`

---

## 17. interconsultations

**Descripción**: Interconsultas entre departamentos para compartir información.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único |
| student_profile_id | UUID | FK → student_profiles.id, NOT NULL | Estudiante referenciado |
| from_department | VARCHAR(50) | NOT NULL | Departamento origen |
| to_department | VARCHAR(50) | NOT NULL | Departamento destino |
| from_professional_id | UUID | FK → users.id, NOT NULL | Profesional que envía |
| to_professional_id | UUID | FK → users.id, NULL | Profesional receptor (opcional) |
| reason | TEXT | NOT NULL | Razón de la interconsulta |
| relevant_information | TEXT | NULL | Información relevante compartida |
| urgency | VARCHAR(20) | NOT NULL, DEFAULT 'routine' | Urgencia: 'routine', 'urgent', 'emergency' |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Estado: 'pending', 'in_review', 'completed', 'rejected' |
| response | TEXT | NULL | Respuesta del departamento receptor |
| responded_by | UUID | FK → users.id, NULL | Profesional que respondió |
| responded_at | TIMESTAMP | NULL | Fecha de respuesta |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_interconsult_student` en `student_profile_id`
- `idx_interconsult_from` en `from_professional_id`
- `idx_interconsult_to` en `to_professional_id`
- `idx_interconsult_status` en `status`
- `idx_interconsult_urgency` en `urgency`

**Relaciones:**
- `student_profile_id` → `student_profiles.id` ON DELETE CASCADE
- `from_professional_id` → `users.id` ON DELETE RESTRICT
- `to_professional_id` → `users.id` ON DELETE SET NULL
- `responded_by` → `users.id` ON DELETE SET NULL

**Restricciones:**
- CHECK: `from_department` IN ('psychology', 'nursing', 'administrative')
- CHECK: `to_department` IN ('psychology', 'nursing', 'administrative')
- CHECK: `urgency` IN ('routine', 'urgent', 'emergency')
- CHECK: `status` IN ('pending', 'in_review', 'completed', 'rejected')

---

## 18. audit_logs

**Descripción**: Registro de auditoría de todas las acciones sobre datos sensibles para cumplimiento normativo.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del log |
| user_id | UUID | FK → users.id, NOT NULL | Usuario que realizó la acción |
| action | VARCHAR(50) | NOT NULL | Acción: 'create', 'read', 'update', 'delete' |
| table_name | VARCHAR(100) | NOT NULL | Tabla afectada |
| record_id | UUID | NOT NULL | ID del registro afectado |
| old_values | JSONB | NULL | Valores anteriores (para updates/deletes) |
| new_values | JSONB | NULL | Valores nuevos (para creates/updates) |
| ip_address | VARCHAR(45) | NULL | Dirección IP del usuario |
| user_agent | TEXT | NULL | User agent del navegador |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de la acción |

**Índices:**
- `idx_audit_user` en `user_id`
- `idx_audit_table` en `table_name`
- `idx_audit_record` en `record_id`
- `idx_audit_created` en `created_at`
- `idx_audit_action` en `action`

**Relaciones:**
- `user_id` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- CHECK: `action` IN ('create', 'read', 'update', 'delete')

---

## 19. reports

**Descripción**: Metadata de reportes generados por el sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único del reporte |
| report_type | VARCHAR(100) | NOT NULL | Tipo de reporte (monthly_statistics, annual_summary, etc.) |
| department | VARCHAR(50) | NOT NULL | Departamento: 'psychology', 'nursing', 'general' |
| period_start | DATE | NOT NULL | Inicio del período reportado |
| period_end | DATE | NOT NULL | Fin del período reportado |
| filters | JSONB | NULL | Filtros aplicados al reporte |
| generated_by | UUID | FK → users.id, NOT NULL | Usuario que generó el reporte |
| file_url | VARCHAR(500) | NULL | URL del archivo generado (PDF, Excel, etc.) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de generación |

**Índices:**
- `idx_reports_type` en `report_type`
- `idx_reports_department` en `department`
- `idx_reports_created` en `created_at`
- `idx_reports_generated_by` en `generated_by`

**Relaciones:**
- `generated_by` → `users.id` ON DELETE RESTRICT

**Restricciones:**
- CHECK: `department` IN ('psychology', 'nursing', 'general')
- CHECK: `period_end` >= `period_start`

---

## 20. system_settings

**Descripción**: Configuraciones globales del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, NOT NULL | Identificador único |
| setting_key | VARCHAR(100) | UNIQUE, NOT NULL | Clave de configuración |
| setting_value | TEXT | NOT NULL | Valor de la configuración |
| description | TEXT | NULL | Descripción de la configuración |
| updated_by | UUID | FK → users.id, NULL | Último usuario que actualizó |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de actualización |

**Índices:**
- `idx_settings_key` en `setting_key`

**Relaciones:**
- `updated_by` → `users.id` ON DELETE SET NULL

**Restricciones:**
- UNIQUE `setting_key`

---

## Convenciones de Nomenclatura

1. **Tablas**: Nombres en plural, minúsculas, con guiones bajos (`users`, `therapy_sessions`)
2. **Claves Primarias**: Siempre `id` de tipo UUID
3. **Claves Foráneas**: `[tabla_relacionada]_id` (ej: `user_id`, `student_profile_id`)
4. **Timestamps**: Siempre incluir `created_at`, y `updated_at` cuando sea relevante
5. **Booleanos**: Prefijo `is_` o `has_` (ej: `is_active`, `has_consent`)
6. **Enums**: Valores en minúsculas con guiones bajos (ej: `psychology_initial`)

## Tipos de Datos PostgreSQL Utilizados

- **UUID**: Identificadores únicos universales
- **VARCHAR(n)**: Cadenas de texto con longitud máxima
- **TEXT**: Texto sin límite de longitud
- **INTEGER**: Números enteros
- **DECIMAL(p,s)**: Números decimales con precisión definida
- **BOOLEAN**: Valores verdadero/falso
- **DATE**: Fechas (sin hora)
- **TIME**: Horas (sin fecha)
- **TIMESTAMP**: Fecha y hora
- **JSONB**: Datos JSON binarios (más eficiente que JSON)
- **ENUM**: Conjunto de valores predefinidos

## Notas Generales

1. **Campos obligatorios vs opcionales**: Los campos críticos para el funcionamiento son NOT NULL, mientras que campos complementarios permiten NULL
2. **Valores por defecto**: Se usan DEFAULT para facilitar inserciones y mantener consistencia
3. **Cifrado**: Los campos sensibles como `password_hash` se almacenan cifrados
4. **Privacidad**: Datos sensibles (diagnósticos, notas de sesión) están en tablas separadas con control de acceso
5. **Auditoría**: Todos los cambios en datos sensibles se registran en `audit_logs`
