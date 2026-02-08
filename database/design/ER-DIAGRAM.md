# Diagrama Entidad-Relación (ER) - Expediente Electrónico de Salud

## Descripción General

Este diagrama representa el modelo de datos para la plataforma de Expediente Electrónico de Salud que da soporte a los departamentos de Psicología y Enfermería.

## Entidades Principales

### 1. **users** (Usuarios del Sistema)
Almacena información de todos los usuarios del sistema (estudiantes, profesionales de salud, administradores).

**Atributos:**
- `id` (PK): UUID - Identificador único
- `enrollment_number`: VARCHAR(20) - Matrícula (única para estudiantes)
- `email`: VARCHAR(255) - Correo electrónico (único)
- `password_hash`: VARCHAR(255) - Contraseña encriptada
- `first_name`: VARCHAR(100) - Nombre(s)
- `last_name`: VARCHAR(100) - Apellido(s)
- `date_of_birth`: DATE - Fecha de nacimiento
- `phone`: VARCHAR(20) - Teléfono
- `role`: ENUM - Rol (student, psychologist, nurse, coordinator_psych, coordinator_nurse, admin)
- `is_active`: BOOLEAN - Estado activo
- `created_at`: TIMESTAMP - Fecha de creación
- `updated_at`: TIMESTAMP - Fecha de actualización

**Índices:**
- `idx_users_enrollment` en `enrollment_number`
- `idx_users_email` en `email`
- `idx_users_role` en `role`

---

### 2. **patients** (Perfil de Paciente)
Información detallada específica de pacientes.

**Atributos:**
- `id` (PK): UUID - Identificador único
- `user_id` (FK): UUID - Referencia a users
- `patient_type`: ENUM - Tipo de paciente (student, faculty, administrative)
- `marital_status`: VARCHAR(50) - Estado civil
- `guardian_name`: VARCHAR(200) - Nombre del tutor
- `guardian_phone`: VARCHAR(20) - Teléfono del tutor
- `career_id`: UUID - Referencia a careers
- `group`: VARCHAR(20) - Grupo
- `occupation`: VARCHAR(100) - Ocupación
- `trimester`: INTEGER - Trimestre actual
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `user_id` → `users.id` (ONE-TO-ONE)
- `career_id` → `careers.id` (MANY-TO-ONE)

---

### 3. **emergency_contacts** (Contactos de Emergencia)
Contactos adicionales de emergencia para pacientes.

**Atributos:**
- `id` (PK): UUID
- `patient_id` (FK): UUID - Referencia a patients
- `name`: VARCHAR(200) - Nombre completo
- `relationship`: VARCHAR(50) - Relación con el paciente
- `phone`: VARCHAR(20) - Teléfono
- `phone_secondary`: VARCHAR(20) - Teléfono alternativo
- `priority`: INTEGER - Prioridad de contacto (1 = primero)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `patient_id` → `patients.id` (MANY-TO-ONE)

---

### 4. **medical_records** (Expedientes Médicos)
Expediente general de cada paciente.

**Atributos:**
- `id` (PK): UUID
- `patient_id` (FK): UUID - Referencia a patients
- `blood_type`: VARCHAR(10) - Tipo de sangre
- `allergies`: TEXT - Alergias conocidas
- `chronic_conditions`: TEXT - Condiciones crónicas
- `current_medications`: TEXT - Medicamentos actuales
- `family_history`: TEXT - Historial familiar
- `notes`: TEXT - Notas generales
- `created_at`: TIMESTAMP
- `created_by` (FK): UUID - Referencia al profesional que lo creó
- `updated_at`: TIMESTAMP
- `updated_by` (FK): UUID - Referencia al último profesional que lo actualizó

**Relaciones:**
- `patient_id` → `patients.id` (ONE-TO-ONE)
- `created_by` → `users.id` (MANY-TO-ONE)
- `updated_by` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_medical_records_patient` en `patient_id`

---

### 5. **psychology_records** (Expediente Psicológico)
Información específica de psicología para cada paciente.

**Atributos:**
- `id` (PK): UUID
- `medical_record_id` (FK): UUID - Referencia a medical_records
- `initial_evaluation_date`: DATE - Fecha de evaluación inicial
- `chief_complaint`: TEXT - Motivo de consulta
- `psychological_history`: TEXT - Antecedentes psicológicos
- `psychiatric_history`: TEXT - Antecedentes psiquiátricos
- `substance_use`: TEXT - Uso de sustancias
- `suicide_risk_level`: VARCHAR(20) - Nivel de riesgo suicida (none, low, medium, high)
- `violence_risk_level`: VARCHAR(20) - Nivel de riesgo de violencia
- `current_diagnosis_dsm5`: VARCHAR(100) - Diagnóstico DSM-5
- `current_diagnosis_cie10`: VARCHAR(100) - Diagnóstico CIE-10/11
- `support_network`: TEXT - Red de apoyo
- `assigned_psychologist_id` (FK): UUID - Psicólogo asignado
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `medical_record_id` → `medical_records.id` (ONE-TO-ONE)
- `assigned_psychologist_id` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_psych_records_assigned` en `assigned_psychologist_id`

---

### 6. **psychometric_evaluations** (Evaluaciones Psicométricas)
Registro de evaluaciones psicológicas aplicadas.

**Atributos:**
- `id` (PK): UUID
- `psychology_record_id` (FK): UUID - Referencia a psychology_records
- `evaluation_type`: VARCHAR(100) - Tipo de evaluación (WISC, WAIS, Beck Depression, Beck Anxiety, etc.)
- `application_date`: DATE - Fecha de aplicación
- `raw_score`: DECIMAL(10,2) - Puntaje bruto
- `standard_score`: DECIMAL(10,2) - Puntaje estándar
- `percentile`: INTEGER - Percentil
- `interpretation`: TEXT - Interpretación de resultados
- `administered_by` (FK): UUID - Profesional que aplicó la evaluación
- `file_url`: VARCHAR(500) - URL del archivo de resultados (opcional)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `psychology_record_id` → `psychology_records.id` (MANY-TO-ONE)
- `administered_by` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_psychometric_psych_record` en `psychology_record_id`
- `idx_psychometric_date` en `application_date`

---

### 7. **therapy_sessions** (Sesiones Terapéuticas)
Registro de sesiones de terapia psicológica.

**Atributos:**
- `id` (PK): UUID
- `psychology_record_id` (FK): UUID - Referencia a psychology_records
- `session_number`: INTEGER - Número de sesión
- `session_date`: TIMESTAMP - Fecha y hora de la sesión
- `session_duration`: INTEGER - Duración en minutos (default 50)
- `mood`: VARCHAR(30) - Estado de animo del paciente
- `evolution_notes`: TEXT - Notas de evolución narrativas
- `patient_progress`: TEXT - Avances del paciente
- `assigned_tasks`: TEXT - Tareas asignadas
- `observations`: TEXT - Observaciones generales
- `next_session_plan`: TEXT - Plan para próxima sesión
- `therapist_id` (FK): UUID - Terapeuta que condujo la sesión
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `psychology_record_id` → `psychology_records.id` (MANY-TO-ONE)
- `therapist_id` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_therapy_sessions_psych` en `psychology_record_id`
- `idx_therapy_sessions_date` en `session_date`
- `idx_therapy_sessions_therapist` en `therapist_id`

---

### 8. **treatment_plans** (Planes de Tratamiento)
Planes de tratamiento terapéutico.

**Atributos:**
- `id` (PK): UUID
- `psychology_record_id` (FK): UUID - Referencia a psychology_records
- `start_date`: DATE - Fecha de inicio
- `end_date`: DATE - Fecha estimada de finalización
- `therapeutic_approach`: VARCHAR(100) - Enfoque terapéutico
- `goals`: TEXT - Objetivos terapéuticos
- `interventions`: TEXT - Intervenciones planificadas
- `status`: VARCHAR(20) - Estado (active, completed, discontinued)
- `created_by` (FK): UUID - Profesional que creó el plan
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `psychology_record_id` → `psychology_records.id` (MANY-TO-ONE)
- `created_by` → `users.id` (MANY-TO-ONE)

---

### 9. **nursing_consultations** (Consultas de Enfermería)
Registro de consultas de enfermería.

**Atributos:**
- `id` (PK): UUID
- `medical_record_id` (FK): UUID - Referencia a medical_records
- `consultation_date`: TIMESTAMP - Fecha y hora de consulta
- `chief_complaint`: TEXT - Motivo de consulta
- `vital_signs_temperature`: DECIMAL(4,2) - Temperatura (°C)
- `vital_signs_blood_pressure_sys`: INTEGER - Presión arterial sistólica
- `vital_signs_blood_pressure_dia`: INTEGER - Presión arterial diastólica
- `vital_signs_heart_rate`: INTEGER - Frecuencia cardíaca
- `vital_signs_respiratory_rate`: INTEGER - Frecuencia respiratoria
- `vital_signs_oxygen_saturation`: INTEGER - Saturación de oxígeno (%)
- `vital_signs_weight`: DECIMAL(5,2) - Peso (kg)
- `vital_signs_height`: DECIMAL(5,2) - Altura (cm)
- `physical_examination`: TEXT - Exploración física
- `diagnosis`: TEXT - Diagnóstico de enfermería
- `treatment_plan`: TEXT - Plan de cuidados
- `observations`: TEXT - Observaciones
- `nurse_id` (FK): UUID - Enfermera que atendió
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `medical_record_id` → `medical_records.id` (MANY-TO-ONE)
- `nurse_id` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_nursing_consultations_record` en `medical_record_id`
- `idx_nursing_consultations_date` en `consultation_date`
- `idx_nursing_consultations_nurse` en `nurse_id`

---

### 10. **nursing_procedures** (Procedimientos de Enfermería)
Registro de procedimientos realizados por enfermería.

**Atributos:**
- `id` (PK): UUID
- `nursing_consultation_id` (FK): UUID - Referencia a nursing_consultations
- `procedure_type`: VARCHAR(100) - Tipo de procedimiento (wound_care, injection, bandage, etc.)
- `procedure_date`: TIMESTAMP - Fecha y hora del procedimiento
- `description`: TEXT - Descripción detallada
- `materials_used`: TEXT - Materiales utilizados
- `observations`: TEXT - Observaciones
- `performed_by` (FK): UUID - Enfermera que realizó el procedimiento
- `created_at`: TIMESTAMP

**Relaciones:**
- `nursing_consultation_id` → `nursing_consultations.id` (MANY-TO-ONE)
- `performed_by` → `users.id` (MANY-TO-ONE)

---

### 11. **medications** (Catálogo de Medicamentos)
Catálogo de medicamentos disponibles.

**Atributos:**
- `id` (PK): UUID
- `name`: VARCHAR(200) - Nombre del medicamento
- `generic_name`: VARCHAR(200) - Nombre genérico
- `category`: VARCHAR(100) - Categoría
- `dosage_forms`: TEXT - Formas de dosificación disponibles
- `common_dosages`: TEXT - Dosis comunes
- `administration_routes`: TEXT - Vías de administración
- `contraindications`: TEXT - Contraindicaciones
- `side_effects`: TEXT - Efectos secundarios
- `is_active`: BOOLEAN - Medicamento activo en catálogo
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Índices:**
- `idx_medications_name` en `name`
- `idx_medications_active` en `is_active`

---

### 12. **medication_administrations** (Administración de Medicamentos)
Registro de medicamentos administrados.

**Atributos:**
- `id` (PK): UUID
- `nursing_consultation_id` (FK): UUID - Referencia a nursing_consultations
- `medication_id` (FK): UUID - Referencia a medications
- `dosage`: VARCHAR(100) - Dosis administrada
- `route`: VARCHAR(50) - Vía de administración (oral, IV, IM, SC, topical, etc.)
- `administration_date`: TIMESTAMP - Fecha y hora de administración
- `administered_by` (FK): UUID - Enfermera que administró
- `patient_verified`: BOOLEAN - Verificación del paciente correcto
- `medication_verified`: BOOLEAN - Verificación del medicamento correcto
- `dosage_verified`: BOOLEAN - Verificación de dosis correcta
- `route_verified`: BOOLEAN - Verificación de vía correcta
- `time_verified`: BOOLEAN - Verificación de hora correcta
- `adverse_reaction`: TEXT - Reacción adversa (si aplica)
- `observations`: TEXT - Observaciones
- `created_at`: TIMESTAMP

**Relaciones:**
- `nursing_consultation_id` → `nursing_consultations.id` (MANY-TO-ONE)
- `medication_id` → `medications.id` (MANY-TO-ONE)
- `administered_by` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_med_admin_consultation` en `nursing_consultation_id`
- `idx_med_admin_date` en `administration_date`

---

### 13. **appointments** (Citas)
Sistema de agendamiento de citas.

**Regla operativa**: Las citas se agendan solo para psicología. Enfermería atiende consultas ambulatorias en el momento (sin cita).

**Atributos:**
- `id` (PK): UUID
- `patient_id` (FK): UUID - Referencia a patients
- `professional_id` (FK): UUID - Profesional asignado (psicólogo o enfermera)
- `appointment_type`: VARCHAR(50) - Tipo de cita (psychology_initial, psychology_followup, nursing, emergency)
- `department`: VARCHAR(50) - Departamento (psychology, nursing)
- `scheduled_date`: TIMESTAMP - Fecha y hora programada
- `duration_minutes`: INTEGER - Duración en minutos (50 para psicología, 15 para enfermería)
- `status`: VARCHAR(20) - Estado (scheduled, confirmed, in_progress, completed, cancelled, no_show)
- `cancellation_reason`: TEXT - Razón de cancelación (si aplica)
- `notes`: TEXT - Notas de la cita
- `created_by` (FK): UUID - Usuario que creó la cita
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `patient_id` → `patients.id` (MANY-TO-ONE)
- `professional_id` → `users.id` (MANY-TO-ONE)
- `created_by` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_appointments_patient` en `patient_id`
- `idx_appointments_professional` en `professional_id`
- `idx_appointments_date` en `scheduled_date`
- `idx_appointments_status` en `status`
- `idx_appointments_department` en `department`

---

### 14. **appointment_reminders** (Recordatorios de Citas)
Sistema de recordatorios automáticos.

**Atributos:**
- `id` (PK): UUID
- `appointment_id` (FK): UUID - Referencia a appointments
- `reminder_type`: VARCHAR(20) - Tipo (email, sms, notification)
- `scheduled_for`: TIMESTAMP - Cuándo enviar el recordatorio
- `sent_at`: TIMESTAMP - Cuándo se envió (NULL si no enviado)
- `status`: VARCHAR(20) - Estado (pending, sent, failed)
- `created_at`: TIMESTAMP

**Relaciones:**
- `appointment_id` → `appointments.id` (MANY-TO-ONE, ON DELETE CASCADE)

---

### 15. **waiting_list** (Lista de Espera)
Lista de espera cuando no hay disponibilidad.

**Atributos:**
- `id` (PK): UUID
- `patient_id` (FK): UUID - Referencia a patients
- `department`: VARCHAR(50) - Departamento solicitado
- `preferred_professional_id` (FK): UUID - Profesional preferido (opcional)
- `requested_date`: DATE - Fecha solicitada
- `priority`: VARCHAR(20) - Prioridad (normal, urgent, emergency)
- `reason`: TEXT - Razón de la solicitud
- `status`: VARCHAR(20) - Estado (waiting, scheduled, cancelled)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `patient_id` → `patients.id` (MANY-TO-ONE)
- `preferred_professional_id` → `users.id` (MANY-TO-ONE)

---

### 16. **professional_schedules** (Horarios de Profesionales)
Disponibilidad de profesionales de salud.

**Atributos:**
- `id` (PK): UUID
- `professional_id` (FK): UUID - Referencia a users
- `day_of_week`: INTEGER - Día de la semana (0=Domingo, 6=Sábado)
- `start_time`: TIME - Hora de inicio
- `end_time`: TIME - Hora de fin
- `is_active`: BOOLEAN - Horario activo
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `professional_id` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_schedules_professional` en `professional_id`
- `idx_schedules_day` en `day_of_week`

---

### 17. **interconsultations** (Interconsultas)
Comunicación entre departamentos.

**Atributos:**
- `id` (PK): UUID
- `patient_id` (FK): UUID - Referencia a patients
- `from_department`: VARCHAR(50) - Departamento origen
- `to_department`: VARCHAR(50) - Departamento destino
- `from_professional_id` (FK): UUID - Profesional que envía
- `to_professional_id` (FK): UUID - Profesional receptor (opcional)
- `reason`: TEXT - Razón de la interconsulta
- `relevant_information`: TEXT - Información relevante
- `urgency`: VARCHAR(20) - Urgencia (routine, urgent, emergency)
- `status`: VARCHAR(20) - Estado (pending, in_review, completed, rejected)
- `response`: TEXT - Respuesta del departamento receptor
- `responded_by` (FK): UUID - Profesional que respondió
- `responded_at`: TIMESTAMP - Fecha de respuesta
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `patient_id` → `patients.id` (MANY-TO-ONE)
- `from_professional_id` → `users.id` (MANY-TO-ONE)
- `to_professional_id` → `users.id` (MANY-TO-ONE)
- `responded_by` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_interconsult_patient` en `patient_id`
- `idx_interconsult_from` en `from_professional_id`
- `idx_interconsult_to` en `to_professional_id`
- `idx_interconsult_status` en `status`

---

### 18. **audit_logs** (Logs de Auditoría)
Registro de accesos y modificaciones para cumplimiento normativo.

**Atributos:**
- `id` (PK): UUID
- `user_id` (FK): UUID - Usuario que realizó la acción
- `action`: VARCHAR(50) - Acción realizada (create, read, update, delete)
- `table_name`: VARCHAR(100) - Tabla afectada
- `record_id`: UUID - ID del registro afectado
- `old_values`: JSONB - Valores anteriores (para updates)
- `new_values`: JSONB - Valores nuevos (para creates/updates)
- `ip_address`: VARCHAR(45) - Dirección IP
- `user_agent`: TEXT - User agent del navegador
- `created_at`: TIMESTAMP - Timestamp de la acción

**Relaciones:**
- `user_id` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_audit_user` en `user_id`
- `idx_audit_table` en `table_name`
- `idx_audit_record` en `record_id`
- `idx_audit_created` en `created_at`

---

### 19. **reports** (Reportes Generados)
Almacena metadata de reportes generados.

**Atributos:**
- `id` (PK): UUID
- `report_type`: VARCHAR(100) - Tipo de reporte
- `department`: VARCHAR(50) - Departamento
- `period_start`: DATE - Inicio del período
- `period_end`: DATE - Fin del período
- `filters`: JSONB - Filtros aplicados
- `generated_by` (FK): UUID - Usuario que generó
- `file_url`: VARCHAR(500) - URL del archivo generado
- `created_at`: TIMESTAMP

**Relaciones:**
- `generated_by` → `users.id` (MANY-TO-ONE)

**Índices:**
- `idx_reports_type` en `report_type`
- `idx_reports_department` en `department`
- `idx_reports_created` en `created_at`

---

### 20. **system_settings** (Configuración del Sistema)
Configuraciones globales del sistema.

**Atributos:**
- `id` (PK): UUID
- `setting_key`: VARCHAR(100) - Clave de configuración (única)
- `setting_value`: TEXT - Valor
- `description`: TEXT - Descripción
- `updated_by` (FK): UUID - Último usuario que actualizó
- `updated_at`: TIMESTAMP

**Relaciones:**
- `updated_by` → `users.id` (MANY-TO-ONE)

---

### 21. **careers** (Carreras)
Catálogo de carreras institucionales.

**Atributos:**
- `id` (PK): UUID
- `name`: VARCHAR(150) - Nombre de la carrera (único)
- `code`: VARCHAR(30) - Código de la carrera (opcional, único)
- `is_active`: BOOLEAN - Estado activo
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Relaciones:**
- `careers.id` ← `patients.career_id` (ONE-TO-MANY)
- `careers.id` ← `psychologist_careers.career_id` (ONE-TO-ONE por asignación)

---

### 22. **psychologist_careers** (Carreras a Cargo)
Asignación de carreras a psicólogos.

**Atributos:**
- `id` (PK): UUID
- `psychologist_id` (FK): UUID - Psicólogo asignado
- `career_id` (FK): UUID - Carrera asignada (única por carrera)
- `assigned_at`: TIMESTAMP - Fecha de asignación

**Relaciones:**
- `psychologist_id` → `users.id` (MANY-TO-ONE)
- `career_id` → `careers.id` (ONE-TO-ONE por asignación)

---

## Diagrama Visual (Descripción)

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
┌──────────────────┐                    ┌──────────────────┐
│patients          │                    │professional_     │
└────────┬─────────┘                    │   schedules      │
         │                              └──────────────────┘
         ├──────────────┬──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌──────────┐  ┌────────────┐
│emergency_   │  │medical_  │  │appointments│
│ contacts    │  │ records  │  └────────────┘
└─────────────┘  └────┬─────┘
                      │
         ┌────────────┴──────────────┐
         ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│psychology_records│      │nursing_          │
└────────┬─────────┘      │consultations     │
         │                └────────┬─────────┘
         │                         │
         ├─────────┬──────┐        ├────────┐
         ▼         ▼      ▼        ▼        ▼
┌──────────┐ ┌────────┐ ┌────┐ ┌─────┐ ┌──────┐
│psycho-   │ │therapy_│ │treat│ │nurs-│ │medi- │
│metric_   │ │sessions│ │ment_│ │ing_ │ │cation│
│evaluations│ └────────┘ │plans│ │proc-│ │admin │
└──────────┘            └────┘ │edures│ └──────┘
                               └─────┘
```

## Cardinalidad de Relaciones

1. **users (1) → patients (1)**: Un paciente tiene un perfil
2. **patients (1) → emergency_contacts (N)**: Un paciente tiene varios contactos
3. **patients (1) → medical_records (1)**: Un paciente tiene un expediente médico
4. **medical_records (1) → psychology_records (1)**: Un expediente médico tiene un expediente psicológico
5. **psychology_records (1) → psychometric_evaluations (N)**: Un expediente psicológico tiene varias evaluaciones
6. **psychology_records (1) → therapy_sessions (N)**: Un expediente psicológico tiene varias sesiones
7. **psychology_records (1) → treatment_plans (N)**: Un expediente psicológico tiene varios planes de tratamiento
8. **medical_records (1) → nursing_consultations (N)**: Un expediente médico tiene varias consultas de enfermería
9. **nursing_consultations (1) → nursing_procedures (N)**: Una consulta puede tener varios procedimientos
10. **nursing_consultations (1) → medication_administrations (N)**: Una consulta puede tener varias administraciones de medicamentos
11. **medications (1) → medication_administrations (N)**: Un medicamento puede ser administrado varias veces
12. **patients (1) → appointments (N)**: Un paciente puede tener varias citas
13. **users (1 - professional) → appointments (N)**: Un profesional puede tener varias citas
14. **appointments (1) → appointment_reminders (N)**: Una cita puede tener varios recordatorios
15. **patients (1) → waiting_list (N)**: Un paciente puede estar en lista de espera varias veces
16. **users (1 - professional) → professional_schedules (N)**: Un profesional tiene varios horarios
17. **patients (1) → interconsultations (N)**: Un paciente puede tener varias interconsultas
18. **users (1) → audit_logs (N)**: Un usuario genera varios logs de auditoría
19. **users (1) → reports (N)**: Un usuario genera varios reportes
20. **careers (1) → patients (N)**: Una carrera puede tener múltiples pacientes
21. **users (1 - psychologist) → psychologist_careers (N)**: Un psicólogo puede tener varias carreras a cargo
22. **careers (1) → psychologist_careers (1)**: Una carrera tiene un psicólogo asignado

---

## Notas de Diseño

1. **Separación de Responsabilidades**: Se separan claramente los expedientes de psicología y enfermería, pero ambos se relacionan con el mismo expediente médico base.

2. **Integridad Referencial**: Todas las relaciones FK mantienen integridad referencial con políticas adecuadas de CASCADE o RESTRICT según el caso.

3. **Auditoría**: El diseño incluye campos `created_at`, `updated_at`, `created_by`, `updated_by` en tablas críticas, además de la tabla `audit_logs` para cumplimiento normativo.

4. **Flexibilidad**: El uso de campos TEXT y JSONB permite almacenar información variable sin sacrificar estructura.

5. **Seguridad**: Los datos sensibles se separan en tablas específicas con controles de acceso granulares.

6. **Rendimiento**: Los índices están diseñados para optimizar las consultas más frecuentes identificadas en los requisitos.

7. **Acceso y agenda**:
       - Todos los usuarios excepto estudiantes ingresan al sistema con usuario y contrasena.
       - Pacientes tipo estudiante solo pueden registrar citas con psicología y ser atendidos en enfermería sin cita.
8. **Acceso por carrera**:
       - Los psicólogos solo pueden ver expedientes de pacientes en carreras asignadas.
