# Estrategia de Índices y Optimización - Base de Datos EHR

## Tabla de Contenidos
1. [Análisis de Patrones de Consulta](#análisis-de-patrones-de-consulta)
2. [Índices Propuestos](#índices-propuestos)
3. [Estrategias de Normalización](#estrategias-de-normalización)
4. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
5. [Cuellos de Botella Identificados](#cuellos-de-botella-identificados)
6. [Plan de Monitoreo](#plan-de-monitoreo)

---

## Análisis de Patrones de Consulta

### Requisitos No Funcionales de Rendimiento

Según el documento de requisitos no funcionales:

1. **Usuarios concurrentes**: 22 usuarios (2 admin, 6 psicólogos, 2 enfermeras, personal RH, estudiantes)
2. **Tiempos máximos de respuesta**:
   - Consulta de expediente: **3 segundos**
   - Agendamiento de cita: **2 segundos**
   - Guardado de sesión terapéutica: **2 segundos**
   - Generación de reportes: **5 segundos**
3. **Horarios pico**: 10am-2pm y 4pm-7pm
4. **Degradación máxima permitida**: 15% en horarios pico

---

### Consultas Frecuentes Identificadas

#### 1. Autenticación y Búsqueda de Usuario
```sql
-- Login (varias veces por día por usuario)
SELECT * FROM users WHERE email = ?;

-- Búsqueda de estudiante por matrícula (muy frecuente)
SELECT u.*, sp.* 
FROM users u 
JOIN student_profiles sp ON sp.user_id = u.id 
WHERE u.enrollment_number = ?;

-- Búsqueda por nombre (frecuente)
SELECT * FROM users 
WHERE first_name ILIKE ? OR last_name ILIKE ?;
```

**Frecuencia estimada**: 100-200 veces/día

**Índices necesarios**:
- `idx_users_email` (UNIQUE index)
- `idx_users_enrollment` (UNIQUE index)
- `idx_users_name` (composite index en first_name, last_name)

---

#### 2. Consulta de Expediente Completo
```sql
-- Obtener expediente completo de un estudiante
SELECT 
  u.*,
  sp.*,
  mr.*,
  pr.*
FROM users u
JOIN student_profiles sp ON sp.user_id = u.id
JOIN medical_records mr ON mr.student_profile_id = sp.id
LEFT JOIN psychology_records pr ON pr.medical_record_id = mr.id
WHERE u.enrollment_number = ?;
```

**Frecuencia estimada**: 50-100 veces/día (cada consulta médica)

**Optimización**:
- FK indexes automáticos en `student_profiles.user_id`, `medical_records.student_profile_id`
- Considerar vista materializada para expedientes completos si degradación >15%

---

#### 3. Historial de Sesiones Terapéuticas
```sql
-- Listar sesiones de un paciente (ordenadas por fecha)
SELECT * FROM therapy_sessions
WHERE psychology_record_id = ?
ORDER BY session_date DESC;

-- Buscar sesiones en rango de fechas
SELECT * FROM therapy_sessions
WHERE psychology_record_id = ?
  AND session_date BETWEEN ? AND ?
ORDER BY session_date;
```

**Frecuencia estimada**: 30-60 veces/día

**Índices necesarios**:
- `idx_therapy_sessions_psych_date` (composite: psychology_record_id, session_date)

---

#### 4. Agenda de Citas
```sql
-- Citas de un profesional en un día específico
SELECT a.*, u.first_name, u.last_name
FROM appointments a
JOIN student_profiles sp ON a.student_profile_id = sp.id
JOIN users u ON sp.user_id = u.id
WHERE a.professional_id = ?
  AND DATE(a.scheduled_date) = ?
ORDER BY a.scheduled_date;

-- Citas pendientes de un estudiante
SELECT * FROM appointments
WHERE student_profile_id = ?
  AND status IN ('scheduled', 'confirmed')
ORDER BY scheduled_date;
```

**Frecuencia estimada**: 100-150 veces/día (cada profesional consulta su agenda varias veces)

**Índices necesarios**:
- `idx_appointments_professional_date` (composite: professional_id, scheduled_date)
- `idx_appointments_student_status` (composite: student_profile_id, status)

---

#### 5. Consultas de Enfermería con Signos Vitales
```sql
-- Historial de consultas de enfermería
SELECT * FROM nursing_consultations
WHERE medical_record_id = ?
ORDER BY consultation_date DESC
LIMIT 10;

-- Medicamentos administrados en una consulta
SELECT 
  ma.*,
  m.name,
  m.generic_name
FROM medication_administrations ma
JOIN medications m ON ma.medication_id = m.id
WHERE ma.nursing_consultation_id = ?;
```

**Frecuencia estimada**: 40-80 veces/día

**Índices necesarios**:
- `idx_nursing_consultations_record_date` (composite: medical_record_id, consultation_date)
- `idx_med_admin_consultation` (medication_administrations.nursing_consultation_id)

---

#### 6. Evaluaciones Psicométricas
```sql
-- Historial de evaluaciones de un paciente
SELECT * FROM psychometric_evaluations
WHERE psychology_record_id = ?
ORDER BY application_date DESC;

-- Buscar evaluaciones por tipo en rango de fechas
SELECT * FROM psychometric_evaluations
WHERE evaluation_type = ?
  AND application_date BETWEEN ? AND ?;
```

**Frecuencia estimada**: 20-40 veces/día

**Índices necesarios**:
- `idx_psychometric_psych_date` (composite: psychology_record_id, application_date)
- `idx_psychometric_type_date` (composite: evaluation_type, application_date)

---

#### 7. Reportes y Estadísticas
```sql
-- Contar citas por departamento y mes
SELECT 
  department,
  DATE_TRUNC('month', scheduled_date) as month,
  COUNT(*) as total
FROM appointments
WHERE scheduled_date BETWEEN ? AND ?
GROUP BY department, month;

-- Diagnósticos más frecuentes
SELECT 
  current_diagnosis_dsm5,
  COUNT(*) as frequency
FROM psychology_records
WHERE current_diagnosis_dsm5 IS NOT NULL
GROUP BY current_diagnosis_dsm5
ORDER BY frequency DESC;

-- Medicamentos más administrados
SELECT 
  m.name,
  COUNT(*) as administrations
FROM medication_administrations ma
JOIN medications m ON ma.medication_id = m.id
WHERE ma.administration_date BETWEEN ? AND ?
GROUP BY m.id, m.name
ORDER BY administrations DESC;
```

**Frecuencia estimada**: 10-20 veces/día (generación de reportes)

**Índices necesarios**:
- `idx_appointments_department_date` (composite: department, scheduled_date)
- `idx_med_admin_date_medication` (composite: administration_date, medication_id)

---

#### 8. Auditoría y Seguridad
```sql
-- Accesos a un expediente específico
SELECT * FROM audit_logs
WHERE table_name = 'psychology_records'
  AND record_id = ?
ORDER BY created_at DESC;

-- Actividad de un usuario
SELECT * FROM audit_logs
WHERE user_id = ?
  AND created_at BETWEEN ? AND ?
ORDER BY created_at DESC;
```

**Frecuencia estimada**: 5-15 veces/día (auditorías de seguridad)

**Índices necesarios**:
- `idx_audit_table_record` (composite: table_name, record_id)
- `idx_audit_user_created` (composite: user_id, created_at)

---

## Índices Propuestos

### Índices de Alta Prioridad (CRÍTICOS)

Estos índices son esenciales para cumplir con los requisitos de rendimiento.

#### 1. Tabla: users
```sql
-- Autenticación (UNIQUE)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Búsqueda por matrícula (UNIQUE)
CREATE UNIQUE INDEX idx_users_enrollment ON users(enrollment_number) 
WHERE enrollment_number IS NOT NULL;

-- Búsqueda por nombre (para autocompletado)
CREATE INDEX idx_users_name ON users(first_name, last_name);

-- Filtrado por rol
CREATE INDEX idx_users_role_active ON users(role, is_active);
```

**Justificación**:
- Email: Login ~200 veces/día
- Enrollment: Búsqueda de paciente ~100 veces/día
- Name: Autocompletado en formularios
- Role: Permisos y filtrado de profesionales

**Tamaño estimado**: ~50KB para 1000 usuarios

---

#### 2. Tabla: appointments
```sql
-- Agenda de profesional por fecha
CREATE INDEX idx_appointments_prof_date ON appointments(professional_id, scheduled_date);

-- Citas de estudiante por estado
CREATE INDEX idx_appointments_student_status ON appointments(student_profile_id, status, scheduled_date);

-- Búsqueda por departamento y fecha (para reportes)
CREATE INDEX idx_appointments_dept_date ON appointments(department, scheduled_date);

-- Filtrado por estado
CREATE INDEX idx_appointments_status ON appointments(status) 
WHERE status IN ('scheduled', 'confirmed');
```

**Justificación**:
- Prof + Date: Consulta de agenda ~150 veces/día
- Student + Status: "Mis citas" ~80 veces/día
- Dept + Date: Reportes estadísticos
- Status: Partial index para citas activas (más eficiente)

**Tamaño estimado**: ~200KB para 10,000 citas

---

#### 3. Tabla: therapy_sessions
```sql
-- Historial de sesiones por paciente
CREATE INDEX idx_therapy_sessions_psych_date ON therapy_sessions(psychology_record_id, session_date DESC);

-- Sesiones por terapeuta y fecha
CREATE INDEX idx_therapy_sessions_therapist_date ON therapy_sessions(therapist_id, session_date DESC);

-- Índice para unicidad de número de sesión
CREATE UNIQUE INDEX idx_therapy_sessions_unique_number ON therapy_sessions(psychology_record_id, session_number);
```

**Justificación**:
- Psych + Date: Historial clínico ~50 veces/día
- Therapist + Date: "Mis sesiones" para terapeutas
- Unique number: Integridad de datos

**Tamaño estimado**: ~150KB para 5,000 sesiones

---

#### 4. Tabla: nursing_consultations
```sql
-- Historial de consultas por paciente
CREATE INDEX idx_nursing_cons_record_date ON nursing_consultations(medical_record_id, consultation_date DESC);

-- Consultas por enfermera
CREATE INDEX idx_nursing_cons_nurse_date ON nursing_consultations(nurse_id, consultation_date DESC);
```

**Justificación**:
- Record + Date: Historial médico ~60 veces/día
- Nurse + Date: Workload de enfermeras

**Tamaño estimado**: ~100KB para 3,000 consultas

---

#### 5. Tabla: medication_administrations
```sql
-- Medicamentos por consulta
CREATE INDEX idx_med_admin_consultation ON medication_administrations(nursing_consultation_id);

-- Historial de medicamento específico
CREATE INDEX idx_med_admin_medication_date ON medication_administrations(medication_id, administration_date DESC);

-- Búsqueda por fecha (para reportes)
CREATE INDEX idx_med_admin_date ON medication_administrations(administration_date);
```

**Justificación**:
- Consultation: "Qué medicamentos se dieron" ~40 veces/día
- Medication + Date: Tracking de uso de medicamentos
- Date: Reportes mensuales/anuales

**Tamaño estimado**: ~80KB para 2,000 administraciones

---

### Índices de Prioridad Media

Mejoran rendimiento pero no son críticos para requisitos mínimos.

#### 6. Tabla: psychometric_evaluations
```sql
CREATE INDEX idx_psychometric_psych_date ON psychometric_evaluations(psychology_record_id, application_date DESC);
CREATE INDEX idx_psychometric_type_date ON psychometric_evaluations(evaluation_type, application_date);
```

#### 7. Tabla: audit_logs
```sql
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

#### 8. Tabla: interconsultations
```sql
CREATE INDEX idx_interconsult_student_status ON interconsultations(student_profile_id, status);
CREATE INDEX idx_interconsult_to_prof_status ON interconsultations(to_professional_id, status) 
WHERE to_professional_id IS NOT NULL;
```

---

### Índices de Baja Prioridad

Implementar solo si análisis de rendimiento lo justifica.

#### 9. Tabla: emergency_contacts
```sql
CREATE INDEX idx_emergency_student_priority ON emergency_contacts(student_profile_id, priority);
```

#### 10. Tabla: professional_schedules
```sql
CREATE INDEX idx_schedules_prof_day ON professional_schedules(professional_id, day_of_week) 
WHERE is_active = TRUE;
```

#### 11. Tabla: waiting_list
```sql
CREATE INDEX idx_waiting_dept_priority ON waiting_list(department, priority, created_at) 
WHERE status = 'waiting';
```

---

## Estrategias de Normalización

### Estado Actual: Tercera Forma Normal (3NF)

El diseño actual está en 3NF:
- ✅ Todas las columnas dependen de la clave primaria
- ✅ No hay dependencias transitivas
- ✅ No hay grupos repetitivos
- ✅ Datos atómicos

**Ejemplo de Normalización**:

**❌ Diseño Desnormalizado (rechazado)**:
```sql
CREATE TABLE consultations (
  id UUID,
  student_name VARCHAR,
  student_email VARCHAR,
  student_career VARCHAR,
  -- Datos duplicados en cada consulta
);
```

**✅ Diseño Normalizado (implementado)**:
```sql
CREATE TABLE nursing_consultations (
  id UUID,
  medical_record_id UUID,  -- FK, datos del estudiante en otra tabla
  -- Solo datos específicos de la consulta
);
```

**Beneficio**: Actualizar carrera del estudiante solo requiere 1 UPDATE en `student_profiles`, no N UPDATEs en todas sus consultas.

---

### Desnormalización Controlada

Casos donde se acepta desnormalización para rendimiento:

#### 1. Signos Vitales en nursing_consultations

**Decisión**: Campos individuales en lugar de tabla separada.

```sql
-- ✅ Implementado
CREATE TABLE nursing_consultations (
  ...
  vital_signs_temperature DECIMAL(4,2),
  vital_signs_blood_pressure_sys INTEGER,
  vital_signs_blood_pressure_dia INTEGER,
  ...
);

-- ❌ Alternativa rechazada
CREATE TABLE vital_signs (
  id UUID,
  consultation_id UUID,
  measurement_type VARCHAR,
  value DECIMAL
);
```

**Justificación**:
- Signos vitales siempre se consultan juntos (100% de los casos)
- Evita JOINs adicionales en consultas frecuentes
- Reducción de ~40% en tiempo de consulta (estimado)

**Trade-off aceptado**: Campos NULL si no se toman todos los signos vitales.

---

#### 2. Campos created_by / updated_by

**Decisión**: Duplicar en múltiples tablas en lugar de solo audit_logs.

```sql
CREATE TABLE medical_records (
  ...
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Justificación**:
- Consulta "¿Quién creó este expediente?" es frecuente
- Evita JOIN con audit_logs en cada consulta
- Espacio adicional mínimo (~16 bytes por registro)

---

#### 3. Datos de Usuario en Vistas Materializadas (Propuesta Futura)

Si el rendimiento lo requiere, crear vistas materializadas:

```sql
CREATE MATERIALIZED VIEW mv_student_summary AS
SELECT 
  sp.id,
  u.first_name,
  u.last_name,
  u.enrollment_number,
  sp.career,
  mr.blood_type,
  pr.current_diagnosis_dsm5,
  (SELECT COUNT(*) FROM appointments WHERE student_profile_id = sp.id) as appointment_count
FROM student_profiles sp
JOIN users u ON sp.user_id = u.id
JOIN medical_records mr ON mr.student_profile_id = sp.id
LEFT JOIN psychology_records pr ON pr.medical_record_id = mr.id;

-- Refresh periódico (ej: cada hora)
REFRESH MATERIALIZED VIEW mv_student_summary;
```

**Cuándo implementar**: Solo si consultas de resumen >3 segundos en producción.

---

## Optimizaciones de Rendimiento

### 1. Particionamiento de Tablas Grandes

**Candidatos para particionamiento**:

#### audit_logs (crecimiento continuo)

```sql
-- Particionar por rango de fechas (mensual)
CREATE TABLE audit_logs (
  id UUID,
  ...
  created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- etc.
```

**Beneficios**:
- Consultas de auditoría recientes más rápidas
- Archivado fácil de logs antiguos (DROP partition)
- Mantenimiento de índices más eficiente

**Cuándo implementar**: Cuando audit_logs >500,000 registros

---

#### appointments (si >100,000 citas)

```sql
-- Particionar por año
CREATE TABLE appointments (
  ...
  scheduled_date TIMESTAMP
) PARTITION BY RANGE (EXTRACT(YEAR FROM scheduled_date));
```

**Cuándo implementar**: Solo si degradación >15% en consultas de agenda.

---

### 2. Índices Parciales (Partial Indexes)

Índices que solo incluyen registros relevantes:

```sql
-- Solo citas activas (scheduled, confirmed)
CREATE INDEX idx_appointments_active ON appointments(professional_id, scheduled_date)
WHERE status IN ('scheduled', 'confirmed');

-- Solo horarios activos
CREATE INDEX idx_schedules_active ON professional_schedules(professional_id, day_of_week)
WHERE is_active = TRUE;

-- Solo medicamentos activos
CREATE INDEX idx_medications_active ON medications(name)
WHERE is_active = TRUE;

-- Solo lista de espera activa
CREATE INDEX idx_waiting_active ON waiting_list(department, priority, created_at)
WHERE status = 'waiting';
```

**Beneficio**: Índices más pequeños y eficientes (20-50% reducción de tamaño).

---

### 3. Covering Indexes

Índices que incluyen todas las columnas necesarias para una consulta:

```sql
-- Para query: "Nombre y carrera de estudiantes"
CREATE INDEX idx_users_covering_student ON users(enrollment_number)
INCLUDE (first_name, last_name, email);

-- Para agenda: "Citas con nombre de paciente"
CREATE INDEX idx_appointments_covering ON appointments(professional_id, scheduled_date)
INCLUDE (student_profile_id, status, appointment_type);
```

**Beneficio**: Evita acceso a la tabla (index-only scan), ~30% más rápido.

**Cuándo usar**: Para queries muy frecuentes que siempre consultan las mismas columnas.

---

### 4. Índices de Texto Completo (Full-Text Search)

Para búsquedas en campos de texto largo:

```sql
-- Búsqueda en notas de sesiones terapéuticas
CREATE INDEX idx_therapy_sessions_notes_fts 
ON therapy_sessions 
USING GIN (to_tsvector('spanish', evolution_notes));

-- Búsqueda en motivo de consulta
CREATE INDEX idx_psych_records_complaint_fts
ON psychology_records
USING GIN (to_tsvector('spanish', chief_complaint));
```

**Cuándo implementar**: Si se requiere búsqueda por palabras clave en notas clínicas.

---

### 5. Índices en Columnas JSONB

Para filtros en campos JSONB:

```sql
-- Índice GIN en filtros de reportes
CREATE INDEX idx_reports_filters ON reports USING GIN (filters);

-- Índice en valores específicos de audit_logs
CREATE INDEX idx_audit_new_values ON audit_logs USING GIN (new_values);
```

**Query optimizado**:
```sql
-- Buscar reportes que filtraron por departamento específico
SELECT * FROM reports
WHERE filters @> '{"department": "psychology"}';
```

---

### 6. Conexión Pooling y Caché

**Configuración de PostgreSQL**:

```ini
# postgresql.conf
max_connections = 50
shared_buffers = 256MB        # 25% de RAM
effective_cache_size = 1GB    # 75% de RAM
work_mem = 16MB
maintenance_work_mem = 128MB
```

**Connection Pooling (Node.js)**:
```javascript
// pg pool configuration
const pool = new Pool({
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000,
});
```

---

### 7. Query Optimization

**Usar EXPLAIN ANALYZE** para identificar cuellos de botella:

```sql
EXPLAIN ANALYZE
SELECT a.*, u.first_name, u.last_name
FROM appointments a
JOIN student_profiles sp ON a.student_profile_id = sp.id
JOIN users u ON sp.user_id = u.id
WHERE a.professional_id = 'some-uuid'
  AND DATE(a.scheduled_date) = '2026-02-07';
```

**Buscar**:
- Seq Scan (debe ser Index Scan)
- Rows estimados vs actual (estadísticas desactualizadas)
- Tiempo de ejecución >100ms

---

## Cuellos de Botella Identificados

### 1. Generación de Reportes Complejos

**Problema**: Reportes con múltiples JOINs y agregaciones pueden exceder 5 segundos.

**Ejemplo de query problemático**:
```sql
SELECT 
  u.first_name,
  u.last_name,
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT ts.id) as total_sessions,
  AVG(ts.session_duration) as avg_session_duration
FROM users u
JOIN student_profiles sp ON sp.user_id = u.id
JOIN appointments a ON a.student_profile_id = sp.id
JOIN medical_records mr ON mr.student_profile_id = sp.id
JOIN psychology_records pr ON pr.medical_record_id = mr.id
JOIN therapy_sessions ts ON ts.psychology_record_id = pr.id
WHERE a.scheduled_date BETWEEN ? AND ?
GROUP BY u.id;
```

**Soluciones propuestas**:

1. **Vistas Materializadas** para reportes frecuentes:
```sql
CREATE MATERIALIZED VIEW mv_monthly_stats AS
SELECT ...
-- Refresh diario a las 2am
```

2. **Tablas de agregación** actualizadas con triggers:
```sql
CREATE TABLE student_statistics (
  student_profile_id UUID PRIMARY KEY,
  total_appointments INTEGER,
  total_sessions INTEGER,
  last_appointment_date DATE,
  updated_at TIMESTAMP
);

-- Trigger para actualizar automáticamente
```

3. **Paginación** en reportes grandes:
```sql
SELECT ... LIMIT 100 OFFSET 0;
```

---

### 2. Búsqueda por Nombre con LIKE/ILIKE

**Problema**: `ILIKE '%name%'` no usa índices eficientemente.

**Query problemático**:
```sql
SELECT * FROM users WHERE first_name ILIKE '%juan%';
```

**Soluciones**:

1. **Índice Trigram** para búsqueda parcial:
```sql
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_users_first_name_trgm ON users USING GIN (first_name gin_trgm_ops);
CREATE INDEX idx_users_last_name_trgm ON users USING GIN (last_name gin_trgm_ops);
```

2. **Búsqueda de texto completo**:
```sql
CREATE INDEX idx_users_fulltext ON users USING GIN (
  to_tsvector('spanish', first_name || ' ' || last_name)
);

-- Query optimizado
SELECT * FROM users
WHERE to_tsvector('spanish', first_name || ' ' || last_name) @@ to_tsquery('spanish', 'juan');
```

---

### 3. Auditoría de Accesos

**Problema**: INSERT en audit_logs en cada operación puede ralentizar transacciones.

**Soluciones**:

1. **Tabla no loggeada** (perder logs recientes en crash es aceptable):
```sql
CREATE UNLOGGED TABLE audit_logs (...);
```

2. **Bulk insert asíncrono**: Acumular logs en memoria y escribir en batch.

3. **Particionamiento** por fecha para mejorar writes.

---

### 4. Eliminación en Cascada

**Problema**: `ON DELETE CASCADE` puede eliminar miles de registros, bloqueando la tabla.

**Ejemplo**: Eliminar un estudiante con 100 citas, 50 sesiones, 200 logs, etc.

**Soluciones**:

1. **Soft delete** en lugar de hard delete:
```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;
```

2. **Eliminación en lote por transacciones**:
```sql
DELETE FROM appointments WHERE student_profile_id = ? LIMIT 100;
-- Repetir hasta afectar 0 rows
```

3. **Background jobs** para eliminaciones grandes.

---

## Plan de Monitoreo

### 1. Métricas Clave a Monitorear

#### Métricas de Query
```sql
-- Habilitar pg_stat_statements
CREATE EXTENSION pg_stat_statements;

-- Top 10 queries más lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### Métricas de Índices
```sql
-- Índices no utilizados (candidatos para eliminación)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pk_%';

-- Tamaño de índices
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### Métricas de Cache
```sql
-- Cache hit ratio (debe ser >95%)
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;
```

---

### 2. Alertas Recomendadas

1. **Query lenta**: Alerta si query >3 segundos
2. **Cache hit ratio**: Alerta si <90%
3. **Conexiones**: Alerta si >80% de max_connections
4. **Tamaño de tabla**: Alerta si audit_logs >1GB (tiempo de particionar)
5. **Locks**: Alerta si transacción bloqueada >30 segundos

---

### 3. Mantenimiento Regular

#### Diario
```sql
-- Actualizar estadísticas de tablas más activas
ANALYZE appointments;
ANALYZE therapy_sessions;
ANALYZE nursing_consultations;
```

#### Semanal
```sql
-- Vacuum para reclamar espacio
VACUUM ANALYZE;
```

#### Mensual
```sql
-- Reindex para optimizar índices fragmentados
REINDEX TABLE appointments;
REINDEX TABLE therapy_sessions;

-- Archivar logs antiguos (>6 meses)
CREATE TABLE audit_logs_archive AS
SELECT * FROM audit_logs WHERE created_at < NOW() - INTERVAL '6 months';

DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '6 months';
```

---

## Benchmarks Esperados

Con los índices propuestos, tiempos esperados:

| Operación | Sin Índices | Con Índices | Mejora |
|-----------|-------------|-------------|--------|
| Login por email | 50ms | 5ms | 90% |
| Búsqueda por matrícula | 100ms | 8ms | 92% |
| Consultar expediente | 500ms | 50ms | 90% |
| Agenda del día (profesional) | 300ms | 20ms | 93% |
| Historial de sesiones | 200ms | 15ms | 92% |
| Reporte mensual simple | 2000ms | 300ms | 85% |
| Reporte anual complejo | 8000ms | 800ms | 90% |

**Nota**: Benchmarks basados en 1,000 estudiantes, 10,000 citas, 5,000 sesiones.

---

## Resumen de Recomendaciones

### Implementar AHORA (Fase 1)
1. ✅ Todos los índices de alta prioridad
2. ✅ Partial indexes para tablas grandes
3. ✅ Connection pooling
4. ✅ Configuración de PostgreSQL optimizada

### Implementar en FASE 2 (después de 3 meses)
1. ⏳ Índices de texto completo (si se requiere búsqueda)
2. ⏳ Vistas materializadas (si reportes >5s)
3. ⏳ Particionamiento de audit_logs (si >500k registros)

### Implementar SOLO SI NECESARIO (monitorear primero)
1. ⚠️ Covering indexes (si query específico es cuello de botella)
2. ⚠️ Desnormalización adicional
3. ⚠️ Réplicas de lectura

**Prioridad**: Empezar con lo mínimo necesario, monitorear, optimizar basado en datos reales.
