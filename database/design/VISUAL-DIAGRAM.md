# Diagrama Visual Simplificado - Relaciones Principales

```
                                    ┌──────────────────┐
                                    │      USERS       │
                                    │  (Todos los      │
                                    │   usuarios)      │
                                    └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    │ (1:1)                  │                        │
                    ▼                        │                        ▼
         ┌──────────────────┐                │              ┌──────────────────┐
         │ STUDENT_PROFILES │                │              │  PROFESSIONAL_   │
         │  (Estudiantes/   │                │              │    SCHEDULES     │
         │   Pacientes)     │                │              │  (Disponibilidad)│
         └────────┬─────────┘                │              └──────────────────┘
                  │                          │
        ┌─────────┼─────────┐                │
        │         │         │                │
    (1:N)     (1:1)     (1:N)                │
        ▼         ▼         ▼                │
   ┌────────┐ ┌──────┐ ┌──────────┐          │
   │EMERGENCY│ │MEDICAL│ │APPOINT- │          │
   │CONTACTS │ │RECORDS│ │ MENTS   │◄─────────┘
   └────────┘ └───┬───┘ └──────────┘       (N:1)
                  │
         ┌────────┴────────┐
         │                 │
     (1:1)             (1:N)
         ▼                 ▼
┌──────────────┐    ┌──────────────┐
│ PSYCHOLOGY_  │    │   NURSING_   │
│  RECORDS     │    │CONSULTATIONS │
└──────┬───────┘    └──────┬───────┘
       │                   │
       │                   ├──────────────┐
       │                   │              │
   (1:N)              (1:N)           (1:N)
       │                   │              │
       ├─────────┬─────────▼──────┐       ▼
       │         │     ┌──────────┐  ┌─────────┐
       │         │     │ NURSING_ │  │MEDICA-  │
       │         │     │PROCEDURES│  │TION_    │
       │         │     └──────────┘  │ADMINS   │
       │         │                   └────┬────┘
       ▼         ▼                        │
┌────────────┐ ┌──────────┐              │ (N:1)
│PSYCHO-     │ │THERAPY_  │              ▼
│METRIC_     │ │SESSIONS  │        ┌──────────┐
│EVALUATIONS │ └──────────┘        │MEDICA-   │
└────────────┘                     │TIONS     │
                                   │(Catálogo)│
                                   └──────────┘
```

## Leyenda

- **Rectángulos**: Entidades (tablas)
- **Flechas**: Relaciones (Foreign Keys)
- **(1:1)**: Relación uno a uno
- **(1:N)**: Relación uno a muchos
- **(N:1)**: Relación muchos a uno

## Flujos Principales

### 1. Flujo de Registro de Estudiante
```
Usuario (student) → Student Profile → Medical Record → 
  → Psychology Record (si psicología)
  → Nursing Consultations (si enfermería)
```

### 2. Flujo de Cita
```
Student Profile + Professional (User) → Appointment → 
  → Reminder (automático)
  → Therapy Session (si completada - psicología)
  → Nursing Consultation (si completada - enfermería)
```

### 3. Flujo de Sesión Terapéutica
```
Appointment (psicología) → Therapy Session → 
  → Actualización de Psychology Record → 
  → Treatment Plan (si necesario)
```

### 4. Flujo de Consulta de Enfermería
```
Appointment (enfermería) → Nursing Consultation →
  → Nursing Procedures (si aplica)
  → Medication Administration (si aplica)
```

### 5. Flujo de Interconsulta
```
Profesional (Dept A) → Interconsultation → 
  → Profesional (Dept B) → Response → 
  → Consulta/Sesión en nuevo departamento
```

## Módulos del Sistema

### 🧑‍⚕️ Módulo de Usuarios
- **users**: Base de todos los usuarios
- **student_profiles**: Información académica
- **emergency_contacts**: Contactos de emergencia
- **professional_schedules**: Disponibilidad de profesionales

### 📋 Módulo de Expedientes
- **medical_records**: Expediente general
- **psychology_records**: Expediente psicológico
- **nursing_consultations**: Consultas de enfermería

### 🧠 Módulo de Psicología
- **psychometric_evaluations**: Pruebas psicológicas
- **therapy_sessions**: Sesiones terapéuticas
- **treatment_plans**: Planes de tratamiento

### 💉 Módulo de Enfermería
- **nursing_procedures**: Procedimientos realizados
- **medications**: Catálogo de medicamentos
- **medication_administrations**: Registro de administración

### 📅 Módulo de Citas
- **appointments**: Citas agendadas
- **appointment_reminders**: Recordatorios
- **waiting_list**: Lista de espera

### 🔄 Módulo de Comunicación
- **interconsultations**: Comunicación entre departamentos

### 🔐 Módulo de Auditoría
- **audit_logs**: Registro de todas las acciones
- **reports**: Reportes generados
- **system_settings**: Configuración

## Puntos Clave del Diseño

### 1. Separación de Datos Sensibles
```
medical_records (datos generales)
    ├── psychology_records (solo psicólogos)
    └── nursing_consultations (solo enfermeras)
```

### 2. Verificación de Medicamentos (5 Normas)
```
medication_administrations
    ├── patient_verified ✓
    ├── medication_verified ✓
    ├── dosage_verified ✓
    ├── route_verified ✓
    └── time_verified ✓
```

### 3. Sistema de Auditoría
```
Cualquier acción en datos sensibles → audit_logs
    ├── user_id (quién)
    ├── action (qué: create/read/update/delete)
    ├── table_name (dónde)
    ├── record_id (cuál registro)
    ├── old_values (valor anterior)
    └── new_values (valor nuevo)
```

### 4. Control de Acceso (RBAC)
```
users.role
    ├── student → Ver solo sus propios datos
    ├── psychologist → Expedientes psicológicos asignados
    ├── nurse → Datos médicos y de enfermería
    ├── coordinator_psych → Todos expedientes psicología
    ├── coordinator_nurse → Reportes y estadísticas
    └── admin → Configuración del sistema
```

## Indicadores de Rendimiento

### Índices Críticos

**Búsqueda de Pacientes**:
```
users.email (UNIQUE)
users.enrollment_number (UNIQUE)
users(first_name, last_name)
```

**Agenda de Citas**:
```
appointments(professional_id, scheduled_date)
appointments(student_profile_id, status)
```

**Historial Clínico**:
```
therapy_sessions(psychology_record_id, session_date)
nursing_consultations(medical_record_id, consultation_date)
```

**Auditoría**:
```
audit_logs(user_id, created_at)
audit_logs(table_name, record_id)
```

### Tiempos Esperados

| Operación | Tiempo Objetivo | Implementación |
|-----------|----------------|----------------|
| Login | < 0.5s | Índice UNIQUE en email |
| Buscar paciente | < 1s | Índice en enrollment_number |
| Consultar expediente | < 3s | FKs indexados + JOINs optimizados |
| Agendar cita | < 2s | Índices en appointments |
| Guardar sesión | < 2s | Índices optimizados |
| Generar reporte | < 5s | Vistas materializadas (futuro) |

---

**Total de Entidades en el Sistema**: 20 tablas
**Total de Relaciones**: 33 Foreign Keys
**Nivel de Normalización**: 3NF (Tercera Forma Normal)

Este diseño garantiza:
✅ Integridad de datos
✅ Rendimiento óptimo
✅ Seguridad y privacidad
✅ Escalabilidad
✅ Mantenibilidad
