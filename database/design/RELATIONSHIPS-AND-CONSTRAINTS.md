# Justificación de Relaciones y Restricciones - Base de Datos EHR

## Tabla de Contenidos
1. [Relaciones entre Entidades](#relaciones-entre-entidades)
2. [Restricciones de Integridad Referencial](#restricciones-de-integridad-referencial)
3. [Reglas de Eliminación y Actualización](#reglas-de-eliminación-y-actualización)
4. [Restricciones de Validación](#restricciones-de-validación)
5. [Decisiones de Diseño Críticas](#decisiones-de-diseño-críticas)

---

## Relaciones entre Entidades

### 1. users ↔ student_profiles (1:1)

**Relación**: Un usuario con rol 'student' tiene exactamente un perfil de estudiante.

**Justificación**:
- Separación de responsabilidades: La tabla `users` maneja autenticación y datos básicos de TODOS los usuarios
- La tabla `student_profiles` contiene información específica solo de estudiantes (carrera, matrícula, tutor)
- Permite tener usuarios de diferentes roles sin campos innecesarios
- Facilita consultas de autenticación sin cargar datos médicos

**Implementación**:
```sql
student_profiles.user_id → users.id
UNIQUE constraint en student_profiles.user_id
```

---

### 2. student_profiles ↔ emergency_contacts (1:N)

**Relación**: Un estudiante puede tener múltiples contactos de emergencia.

**Justificación**:
- Los requisitos funcionales especifican "contactos adicionales, especialmente de emergencia"
- Un estudiante puede tener padre, madre, tutor, hermano, etc.
- El campo `priority` permite ordenar a quién contactar primero
- Flexibilidad para agregar/eliminar contactos sin afectar otras tablas

**Regla de Eliminación**:
```sql
ON DELETE CASCADE
```
Si se elimina un estudiante, sus contactos de emergencia ya no tienen sentido y deben eliminarse.

---

### 3. student_profiles ↔ medical_records (1:1)

**Relación**: Cada estudiante tiene exactamente un expediente médico.

**Justificación**:
- Requisito funcional: "Registro exhaustivo de información del paciente"
- El expediente médico es la base compartida entre psicología y enfermería
- Centraliza información médica general (alergias, tipo de sangre, condiciones crónicas)
- `created_by` y `updated_by` permiten auditar quién maneja el expediente

**Implementación**:
```sql
medical_records.student_profile_id → student_profiles.id (UNIQUE)
medical_records.created_by → users.id
medical_records.updated_by → users.id
```

**Regla de Eliminación**:
```sql
student_profile_id: ON DELETE CASCADE
created_by/updated_by: ON DELETE RESTRICT
```

**Justificación de reglas**:
- Si se elimina el estudiante, su expediente debe eliminarse (CASCADE)
- No se puede eliminar un profesional que creó/actualizó expedientes (RESTRICT) - mantiene integridad histórica

---

### 4. medical_records ↔ psychology_records (1:1)

**Relación**: Cada expediente médico puede tener un expediente psicológico.

**Justificación**:
- Separación de información sensible según departamento
- Cumplimiento de privacidad: Solo psicólogos autorizados acceden a `psychology_records`
- Permite diagnósticos DSM-5 y CIE-10 con acceso restringido (requisito funcional)
- `assigned_psychologist_id` facilita asignación de casos

**Implementación**:
```sql
psychology_records.medical_record_id → medical_records.id (UNIQUE)
psychology_records.assigned_psychologist_id → users.id
```

**Regla de Eliminación**:
```sql
medical_record_id: ON DELETE CASCADE
assigned_psychologist_id: ON DELETE SET NULL
```

**Justificación**:
- Expediente psicológico no existe sin expediente médico (CASCADE)
- Si el psicólogo asignado se elimina, el expediente persiste pero queda sin asignar (SET NULL)

---

### 5. psychology_records ↔ psychometric_evaluations (1:N)

**Relación**: Un expediente psicológico puede tener múltiples evaluaciones psicométricas.

**Justificación**:
- Requisito funcional: "Registro de evaluaciones psicométricas (Wizz, Wazz, escalas de Beck)"
- "Acceso rápido al historial de evaluaciones para seguimiento"
- Un paciente puede ser evaluado múltiples veces con diferentes pruebas
- Permite comparar evolución a través del tiempo

**Campos clave**:
- `evaluation_type`: Tipo de prueba (WISC, WAIS, Beck, etc.)
- `application_date`: Para tracking temporal
- `administered_by`: Auditoría de quién aplicó la prueba
- `file_url`: Permite adjuntar resultados digitalizados

**Regla de Eliminación**:
```sql
psychology_record_id: ON DELETE CASCADE
administered_by: ON DELETE RESTRICT
```

---

### 6. psychology_records ↔ therapy_sessions (1:N)

**Relación**: Un expediente psicológico tiene múltiples sesiones terapéuticas.

**Justificación**:
- Requisito funcional: "Registro y seguimiento de sesiones terapéuticas"
- "Documentación detallada de cada sesión con notas de evolución narrativas"
- Cada sesión es un registro independiente con su propio contexto
- `session_number` permite secuencia lógica de tratamiento
- Facilita generar reportes de evolución del paciente

**Campos clave**:
- `session_number`: Secuencia ordenada (1, 2, 3...)
- `therapy_type`: individual, group, family, couple
- `session_duration`: Default 50 minutos (requisito funcional)
- `evolution_notes`, `patient_progress`, `assigned_tasks`: Requisitos específicos documentados

**Restricciones**:
```sql
UNIQUE (psychology_record_id, session_number)
```
No puede haber dos sesiones con el mismo número para un paciente.

**Regla de Eliminación**:
```sql
psychology_record_id: ON DELETE CASCADE
therapist_id: ON DELETE RESTRICT
```

---

### 7. psychology_records ↔ treatment_plans (1:N)

**Relación**: Un expediente psicológico puede tener múltiples planes de tratamiento a lo largo del tiempo.

**Justificación**:
- Requisito funcional: "Seguimiento de planes de tratamiento y objetivos terapéuticos"
- Un paciente puede tener diferentes planes (inicial, modificado, renovado)
- `status` permite gestionar planes activos vs completados
- `therapeutic_approach` documenta el enfoque utilizado (CBT, psicodinámico, etc.)

**Ciclo de vida**:
1. Plan creado: `status = 'active'`
2. Plan finalizado exitosamente: `status = 'completed'`
3. Plan interrumpido: `status = 'discontinued'`

---

### 8. medical_records ↔ nursing_consultations (1:N)

**Relación**: Un expediente médico tiene múltiples consultas de enfermería.

**Justificación**:
- Requisito funcional: "Gestión de medicamentos y procedimientos"
- Cada visita a enfermería es una consulta independiente
- Captura signos vitales en cada consulta (temperatura, presión arterial, etc.)
- Duración típica 10-15 minutos (requisito funcional)

**Signos Vitales Incluidos**:
- Temperatura
- Presión arterial (sistólica/diastólica)
- Frecuencia cardíaca
- Frecuencia respiratoria
- Saturación de oxígeno
- Peso y altura

**Restricciones de Validación**:
Todos los signos vitales tienen CHECK constraints para rangos fisiológicos válidos.

---

### 9. nursing_consultations ↔ nursing_procedures (1:N)

**Relación**: Una consulta de enfermería puede incluir múltiples procedimientos.

**Justificación**:
- Requisito funcional: "Registro de procedimientos de enfermería (curaciones, inyecciones, vendajes)"
- Una consulta puede involucrar varios procedimientos (ej: curación + vendaje + inyección de antibiótico)
- `procedure_type` categoriza el tipo de procedimiento
- `materials_used` documenta insumos (importante para inventario)

**Tipos de Procedimientos**:
- Curación de heridas (wound_care)
- Inyecciones (injection)
- Vendajes (bandage)
- Suturas (suture)
- Terapia IV (IV_therapy)
- Cateterización (catheterization)
- Otros (other)

---

### 10. nursing_consultations ↔ medication_administrations (1:N)

**Relación**: Una consulta de enfermería puede incluir administración de varios medicamentos.

**Justificación**:
- Requisito funcional: "Verificación automática de las 5 normas correctas"
- Las 5 normas son: paciente correcto, medicamento correcto, dosis correcta, vía correcta, hora correcta
- Cada administración se registra independientemente con sus verificaciones
- `adverse_reaction` permite documentar reacciones adversas (requisito funcional)

**Campos de Verificación (5 normas)**:
1. `patient_verified`: ✓ Paciente correcto
2. `medication_verified`: ✓ Medicamento correcto
3. `dosage_verified`: ✓ Dosis correcta
4. `route_verified`: ✓ Vía correcta
5. `time_verified`: ✓ Hora correcta

**Restricción Propuesta**:
```sql
CHECK (
  patient_verified = TRUE AND
  medication_verified = TRUE AND
  dosage_verified = TRUE AND
  route_verified = TRUE AND
  time_verified = TRUE
)
```
Solo se permite INSERT si todas las verificaciones son TRUE.

---

### 11. medications (catálogo) ↔ medication_administrations (N)

**Relación**: Un medicamento del catálogo puede ser administrado múltiples veces.

**Justificación**:
- Normalización: Información del medicamento se almacena una vez
- Consistencia: Todos usan la misma información (contraindicaciones, efectos secundarios)
- Facilita actualizaciones: Cambios en catálogo se reflejan en futuras administraciones
- `is_active`: Permite descontinuar medicamentos sin eliminar historial

**Regla de Eliminación**:
```sql
medication_id: ON DELETE RESTRICT
```
No se puede eliminar un medicamento que ha sido administrado (integridad histórica).

---

### 12. student_profiles ↔ appointments (1:N)

**Relación**: Un estudiante puede tener múltiples citas.

**Justificación**:
- Requisito funcional: "Gestión de citas y agendamiento"
- "Pacientes nuevos y de seguimiento"
- `appointment_type`: Diferencia inicial vs seguimiento
- `department`: Psicología o enfermería
- `status`: Maneja ciclo de vida de la cita

**Estados de Cita**:
1. `scheduled`: Cita programada
2. `confirmed`: Paciente confirmó asistencia
3. `in_progress`: Consulta en curso
4. `completed`: Consulta finalizada
5. `cancelled`: Cita cancelada
6. `no_show`: Paciente no se presentó

**Duración por Tipo**:
- Psicología: 50 minutos (requisito funcional)
- Enfermería: 10-15 minutos (requisito funcional)

---

### 13. users (profesionales) ↔ appointments (1:N)

**Relación**: Un profesional puede tener múltiples citas asignadas.

**Justificación**:
- Cada cita tiene un profesional responsable
- Permite consultar agenda de un profesional específico
- `professional_id` vincula con `users` donde `role` IN ('psychologist', 'nurse')

**Regla de Eliminación**:
```sql
professional_id: ON DELETE RESTRICT
```
No se puede eliminar un profesional con citas históricas.

---

### 14. appointments ↔ appointment_reminders (1:N)

**Relación**: Una cita puede tener múltiples recordatorios.

**Justificación**:
- Requisito funcional: "Recordatorios automáticos para pacientes y profesionales"
- Múltiples recordatorios: 24 horas antes, 2 horas antes, etc.
- `reminder_type`: email, SMS, notificación push
- `scheduled_for`: Cuándo enviar
- `sent_at`: Auditoría de envío

**Regla de Eliminación**:
```sql
appointment_id: ON DELETE CASCADE
```
Si la cita se elimina, sus recordatorios ya no son relevantes.

---

### 15. student_profiles ↔ waiting_list (1:N)

**Relación**: Un estudiante puede estar en lista de espera múltiples veces.

**Justificación**:
- Requisito funcional: "Lista de espera cuando no haya disponibilidad"
- Un estudiante puede solicitar diferentes departamentos o fechas
- `priority`: normal, urgent, emergency (para ordenar lista)
- `status`: waiting, scheduled (cuando se agenda), cancelled

**Ciclo de Vida**:
1. Estudiante solicita cita pero no hay disponibilidad → `status = 'waiting'`
2. Se libera espacio → `status = 'scheduled'` + se crea appointment
3. Estudiante cancela solicitud → `status = 'cancelled'`

---

### 16. users (profesionales) ↔ professional_schedules (1:N)

**Relación**: Un profesional tiene múltiples horarios de disponibilidad.

**Justificación**:
- Requisito funcional: "Horarios de disponibilidad configurables por profesionales"
- Cada día de la semana puede tener diferentes horarios
- Un mismo día puede tener múltiples bloques (ej: 9-12 y 14-17)
- `is_active`: Permite deshabilitar horarios temporalmente sin eliminar

**Implementación**:
- `day_of_week`: 0 (Domingo) a 6 (Sábado)
- `start_time` y `end_time`: Bloque horario

**Validación**:
```sql
CHECK (end_time > start_time)
```

---

### 17. student_profiles ↔ interconsultations (1:N)

**Relación**: Un estudiante puede ser sujeto de múltiples interconsultas.

**Justificación**:
- Requisito funcional: "Módulo de interconsultas entre psicología, enfermería y administrativos"
- "Acceso a informes relevantes sin registros manuales duplicados"
- Facilita comunicación entre departamentos
- `from_department` y `to_department`: Origen y destino
- `urgency`: routine, urgent, emergency
- `status`: pending, in_review, completed, rejected

**Flujo de Interconsulta**:
1. Psicólogo crea interconsulta → `status = 'pending'`
2. Enfermera revisa caso → `status = 'in_review'`
3. Enfermera responde → `status = 'completed'`, `responded_by` se llena

**Relaciones FK**:
- `from_professional_id`: Quién envía (RESTRICT)
- `to_professional_id`: Receptor opcional (SET NULL si se elimina)
- `responded_by`: Quién respondió (SET NULL si se elimina)

---

### 18. users ↔ audit_logs (1:N)

**Relación**: Un usuario genera múltiples logs de auditoría.

**Justificación**:
- Requisito funcional: "Registro en log de auditoría de accesos y modificaciones"
- Requisito de seguridad: Cumplimiento normativo de privacidad
- Cada acción (create, read, update, delete) se registra
- `old_values` y `new_values` (JSONB): Permiten ver qué cambió
- `ip_address` y `user_agent`: Contexto de seguridad

**Tablas Auditadas** (prioritarias):
- medical_records
- psychology_records
- nursing_consultations
- therapy_sessions
- medication_administrations
- psychometric_evaluations

**Regla de Eliminación**:
```sql
user_id: ON DELETE RESTRICT
```
No se puede eliminar un usuario con actividad auditada (integridad histórica).

---

### 19. users ↔ reports (1:N)

**Relación**: Un usuario puede generar múltiples reportes.

**Justificación**:
- Requisito funcional: "Reportes mensuales y anuales por departamento"
- "Número de consultas, diagnósticos frecuentes, tipos de terapia"
- `report_type`: monthly_statistics, annual_summary, diagnoses_frequency, etc.
- `filters` (JSONB): Permite almacenar filtros complejos aplicados
- `file_url`: Link al PDF o Excel generado

**Regla de Eliminación**:
```sql
generated_by: ON DELETE RESTRICT
```
Mantiene registro de quién generó cada reporte.

---

## Restricciones de Integridad Referencial

### Estrategia General

Se utilizan tres estrategias principales para ON DELETE:

#### 1. CASCADE
**Cuándo**: Cuando el registro hijo no tiene sentido sin el padre.

**Ejemplos**:
- `student_profiles → emergency_contacts`
- `medical_records → psychology_records`
- `appointments → appointment_reminders`
- `nursing_consultations → medication_administrations`

**Justificación**: Si se elimina el estudiante/expediente/cita, los registros dependientes deben eliminarse para mantener consistencia.

#### 2. RESTRICT
**Cuándo**: Cuando se debe preservar integridad histórica o prevenir eliminaciones accidentales.

**Ejemplos**:
- `medications → medication_administrations`
- `users (profesionales) → therapy_sessions`
- `users → audit_logs`

**Justificación**: No se puede eliminar un medicamento que ha sido administrado, ni un profesional que tiene historial de sesiones.

#### 3. SET NULL
**Cuándo**: Cuando la relación es opcional o el registro padre puede cambiar.

**Ejemplos**:
- `psychology_records.assigned_psychologist_id`
- `waiting_list.preferred_professional_id`
- `interconsultations.to_professional_id`

**Justificación**: Si el psicólogo se elimina, el expediente persiste pero queda sin asignar.

---

## Restricciones de Validación

### 1. CHECK Constraints para Rangos Válidos

#### Signos Vitales
```sql
CHECK (vital_signs_temperature >= 35 AND vital_signs_temperature <= 45)
CHECK (vital_signs_blood_pressure_sys >= 50 AND vital_signs_blood_pressure_sys <= 250)
CHECK (vital_signs_heart_rate >= 30 AND vital_signs_heart_rate <= 220)
CHECK (vital_signs_oxygen_saturation >= 70 AND vital_signs_oxygen_saturation <= 100)
```

**Justificación**: Previene errores de captura. Valores fuera de estos rangos son fisiológicamente imposibles o indican error de entrada.

#### Percentiles
```sql
CHECK (percentile >= 0 AND percentile <= 100)
```

**Justificación**: Los percentiles están definidos entre 0 y 100 por definición estadística.

#### Fechas
```sql
CHECK (end_date IS NULL OR end_date >= start_date)
CHECK (application_date <= CURRENT_DATE)
```

**Justificación**: Previene inconsistencias lógicas (fin antes de inicio, evaluaciones en el futuro).

---

### 2. UNIQUE Constraints

#### Matrícula
```sql
UNIQUE (enrollment_number) WHERE enrollment_number IS NOT NULL
```

**Justificación**: La matrícula identifica únicamente a un estudiante. No puede haber duplicados.

#### Email
```sql
UNIQUE (email)
```

**Justificación**: El email es el identificador de autenticación. Debe ser único en el sistema.

#### Número de Sesión
```sql
UNIQUE (psychology_record_id, session_number)
```

**Justificación**: No puede haber dos "sesión #5" para el mismo paciente. Garantiza secuencia lógica.

#### Clave de Configuración
```sql
UNIQUE (setting_key)
```

**Justificación**: Cada configuración del sistema debe tener una clave única.

---

### 3. NOT NULL Constraints

**Criterio**: Un campo es NOT NULL si:
1. Es crítico para el funcionamiento del sistema
2. Su ausencia causaría inconsistencias lógicas
3. Es requerido por requisitos funcionales

**Ejemplos con Justificación**:

```sql
users.email NOT NULL           -- Requerido para autenticación
users.role NOT NULL            -- El sistema necesita saber el rol para permisos
appointments.scheduled_date NOT NULL  -- Una cita sin fecha no tiene sentido
medications.name NOT NULL      -- Un medicamento debe tener nombre identificable
```

**Campos NULL permitido** (son opcionales por naturaleza):
```sql
student_profiles.guardian_name NULL  -- No todos los estudiantes requieren tutor
medical_records.allergies NULL       -- No todos tienen alergias conocidas
therapy_sessions.assigned_tasks NULL -- No todas las sesiones tienen tareas
```

---

## Decisiones de Diseño Críticas

### 1. Separación de Expedientes Médicos

**Decisión**: Tres niveles de expedientes:
- `medical_records` (general)
- `psychology_records` (específico psicología)
- `nursing_consultations` (específico enfermería)

**Alternativa Rechazada**: Un solo expediente con todos los campos.

**Justificación**:
1. **Seguridad**: Requisito funcional de "acceso restringido por permisos" a diagnósticos DSM-5
2. **Privacidad**: Enfermeras no necesitan ver notas psicológicas detalladas
3. **Escalabilidad**: Facilita agregar nuevos departamentos (nutrición, trabajo social)
4. **Normalización**: Evita campos vacíos (un paciente puede solo ir a enfermería)

---

### 2. UUID vs INTEGER para Claves Primarias

**Decisión**: Usar UUID para todas las claves primarias.

**Alternativa Rechazada**: SERIAL/BIGSERIAL (auto-incrementales).

**Justificación**:
1. **Seguridad**: UUIDs no son predecibles (no se puede adivinar siguiente ID)
2. **Distribución**: Facilita futura migración a arquitectura distribuida
3. **Merge**: No hay conflictos al fusionar datos de diferentes instancias
4. **APIs**: Los UUIDs en URLs no revelan información (ej: cuántos pacientes hay)

**Desventaja Aceptada**: UUIDs ocupan más espacio (16 bytes vs 4-8 bytes), pero el beneficio de seguridad supera este costo.

---

### 3. JSONB para Campos Flexibles

**Decisión**: Usar JSONB para:
- `audit_logs.old_values` / `audit_logs.new_values`
- `reports.filters`

**Alternativa Rechazada**: Crear columnas específicas para cada posible valor.

**Justificación**:
1. **Flexibilidad**: Los filtros de reportes pueden variar dinámicamente
2. **Auditoría Completa**: `old_values`/`new_values` necesitan almacenar cualquier estructura
3. **Rendimiento**: JSONB en PostgreSQL es indexable y eficiente
4. **Mantenibilidad**: No requiere ALTER TABLE para agregar nuevos filtros

---

### 4. Soft Delete vs Hard Delete

**Decisión**: NO usar soft delete (is_deleted flag).

**Alternativa Rechazada**: Agregar `is_deleted` y `deleted_at` a todas las tablas.

**Justificación**:
1. **Auditoría Explícita**: La tabla `audit_logs` ya registra todas las eliminaciones
2. **Simplicidad**: Queries más simples sin `WHERE is_deleted = FALSE` en todas partes
3. **GDPR/Privacidad**: Requisitos de "derecho al olvido" requieren eliminación real de datos
4. **Restricciones FK**: CASCADE/RESTRICT funcionan mejor sin soft delete

**Excepciones**: 
- `users.is_active`: Desactivar usuarios sin eliminarlos (necesario para login)
- `medications.is_active`: Descontinuar medicamentos sin perder historial
- `professional_schedules.is_active`: Deshabilitar horarios temporalmente

---

### 5. Normalización vs Desnormalización

**Decisión**: Priorizar normalización (3NF) con desnormalización selectiva.

**Áreas Normalizadas**:
- Catálogo de medicamentos (tabla separada)
- Usuarios y perfiles (tablas separadas por rol)
- Signos vitales como columnas (no tabla separada)

**Desnormalización Aceptada**:
- Signos vitales en `nursing_consultations` (en lugar de tabla separada)
- `created_by`/`updated_by` duplicados en varias tablas

**Justificación**:
- **Rendimiento**: Signos vitales siempre se consultan juntos
- **Auditoría**: `created_by` facilita queries sin JOIN complejo
- **Requisitos**: "Tiempo máximo de respuesta para consulta: 3 segundos" (req. no funcional)

---

### 6. Timestamps con Zona Horaria

**Decisión**: Usar TIMESTAMP (sin zona horaria) y manejar zonas en capa de aplicación.

**Alternativa Rechazada**: TIMESTAMPTZ (con zona horaria).

**Justificación**:
1. **Contexto Único**: Sistema usado en una sola institución en una zona horaria
2. **Simplicidad**: Evita confusiones de conversión automática
3. **Consistencia**: Todos los timestamps en hora local institucional
4. **Requisito**: No se menciona operación multi-zona horaria

**Nota**: Si el sistema se expande a múltiples ubicaciones, migrar a TIMESTAMPTZ.

---

### 7. Verificación de las 5 Normas de Medicamentos

**Decisión**: 5 campos booleanos separados en lugar de un solo flag.

**Alternativa Rechazada**: Un solo `verified BOOLEAN`.

**Justificación**:
1. **Requisito Explícito**: "Verificación automática de las 5 normas correctas"
2. **Auditoría Granular**: Saber exactamente qué se verificó
3. **Seguridad Médica**: Fuerza verificación paso a paso
4. **Cumplimiento**: Estándar de la industria de salud

**Implementación**:
```sql
CHECK (
  patient_verified = TRUE AND
  medication_verified = TRUE AND
  dosage_verified = TRUE AND
  route_verified = TRUE AND
  time_verified = TRUE
)
```

---

### 8. Estrategia de Indexación

**Decisión**: Indexar basado en patrones de consulta identificados en requisitos.

**Índices Críticos Creados**:

#### Búsqueda de Pacientes
```sql
CREATE INDEX idx_users_enrollment ON users(enrollment_number);
CREATE INDEX idx_users_email ON users(email);
```
**Justificación**: Requisito funcional "Búsqueda rápida por nombre, matrícula"

#### Agendamiento
```sql
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_status ON appointments(status);
```
**Justificación**: Consultas frecuentes: "¿Qué citas tiene el Dr. X hoy?" "¿Qué citas están pendientes?"

#### Auditoría
```sql
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
```
**Justificación**: Requisito de seguridad, consultas como "¿Quién accedió al expediente X?"

#### Historial Clínico
```sql
CREATE INDEX idx_therapy_sessions_date ON therapy_sessions(session_date);
CREATE INDEX idx_nursing_consultations_date ON nursing_consultations(consultation_date);
```
**Justificación**: "Acceso rápido al historial de evaluaciones para seguimiento"

---

## Matriz de Restricciones por Tabla

| Tabla | PK | FKs | UNIQUE | NOT NULL | CHECK | Índices |
|-------|----|----|--------|----------|-------|---------|
| users | id | 0 | email, enrollment_number | 8 | 1 | 3 |
| student_profiles | id | 1 | user_id | 4 | 1 | 1 |
| emergency_contacts | id | 1 | 0 | 4 | 1 | 2 |
| medical_records | id | 3 | student_profile_id | 4 | 0 | 1 |
| psychology_records | id | 2 | medical_record_id | 2 | 2 | 2 |
| psychometric_evaluations | id | 2 | 0 | 4 | 2 | 3 |
| therapy_sessions | id | 2 | (psych_id, session_num) | 6 | 3 | 4 |
| treatment_plans | id | 2 | 0 | 5 | 2 | 2 |
| nursing_consultations | id | 2 | 0 | 3 | 8 | 3 |
| nursing_procedures | id | 2 | 0 | 4 | 0 | 3 |
| medications | id | 0 | (name, generic_name) | 3 | 0 | 3 |
| medication_administrations | id | 3 | 0 | 9 | 6 | 3 |
| appointments | id | 3 | 0 | 7 | 3 | 5 |
| appointment_reminders | id | 1 | 0 | 4 | 2 | 3 |
| waiting_list | id | 2 | 0 | 5 | 3 | 4 |
| professional_schedules | id | 1 | 0 | 5 | 2 | 2 |
| interconsultations | id | 4 | 0 | 6 | 4 | 5 |
| audit_logs | id | 1 | 0 | 5 | 1 | 5 |
| reports | id | 1 | 0 | 5 | 2 | 4 |
| system_settings | id | 1 | setting_key | 3 | 0 | 1 |

**Total**: 20 tablas, 33 relaciones FK, múltiples restricciones de integridad

---

## Conclusiones

Este diseño de base de datos:

1. ✅ **Cumple todos los requisitos funcionales** especificados en el documento de requisitos
2. ✅ **Garantiza integridad de datos** mediante FK, UNIQUE, NOT NULL y CHECK constraints
3. ✅ **Facilita auditoría y seguridad** con tabla de logs y separación de datos sensibles
4. ✅ **Optimiza rendimiento** con índices estratégicos basados en patrones de uso
5. ✅ **Permite escalabilidad** con arquitectura modular por departamento
6. ✅ **Mantiene privacidad** con separación de expedientes y control de acceso granular
7. ✅ **Soporta cumplimiento normativo** con auditoría completa y restricciones estrictas

**Próximos Pasos**:
1. Crear scripts SQL de implementación
2. Definir stored procedures para operaciones críticas
3. Implementar triggers para auditoría automática
4. Crear vistas para reportes frecuentes
5. Desarrollar plan de backup y recuperación
