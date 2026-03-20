# Módulo: Supervisión y Gestión de Personal (Coordinador-Psicología)

**Rol:** `coordinador_psicologia`  
**Objetivo:** Permitir al coordinador del área de psicología gestionar el personal a su cargo, monitorear desempeño, administrar agendas y asignar responsabilidad académica, con visualización analítica.

---

## 1. Resumen de capacidades

| Capacidad | Descripción |
|-----------|-------------|
| **Gestión de Psicólogos** | CRUD completo del personal con rol `psicologo` bajo su supervisión. |
| **Monitoreo de Progreso** | Métricas de desempeño, número de pacientes atendidos y estados de expedientes por psicólogo. |
| **Gestión de Itinerario** | Calendario centralizado para ver y editar las agendas/citas de cada psicólogo. |
| **Asignación Académica** | Asignar psicólogos a carreras universitarias como responsables de esos alumnos. |
| **Analytics** | Gráficas: Line Chart (progresión de consultas en el tiempo), Pie/Bar (distribución de carga por psicólogo). |

---

## 2. Modelo de datos existente (resumen)

- **User**: `role` (`psicologo`, `coordinador_psicologia`, etc.), datos personales y de cuenta.
- **PsychologistCareer**: `psychologistId` (User), `careerId` (Career). En el esquema actual, `careerId` es `@unique`, por lo que **cada carrera tiene un único psicólogo responsable**. Un psicólogo puede tener varias carreras asignadas.
- **Appointment**: `professionalId`, `patientId`, `scheduledDate`, `status`, `department`.
- **ProfessionalSchedule**: horarios semanales por profesional.
- **Career**: catálogo de carreras (ya existe en API).

Los expedientes y sesiones se asocian a pacientes y a psicólogos a través de `PsychologyRecord.assignedPsychologistId`, `TherapySession.therapistId`, etc.

---

## 3. Gestión de Psicólogos (CRUD)

### 3.1 Comportamiento deseado

- El coordinador ve **solo usuarios con rol `psicologo`** (personal bajo su mando).
- Puede **crear** nuevos psicólogos (nombre, email, contraseña, datos básicos). El rol se fija en `psicologo`.
- Puede **editar** datos de cada psicólogo (nombre, email, teléfono, número de matrícula si aplica).
- Puede **activar/desactivar** (soft delete) psicólogos; los inactivos no aparecen en listas operativas ni en asignación académica.

### 3.2 API (existente / ajustes)

- **Listar:** `GET /api/users` con filtro `role=psicologo`. Solo coordinador_psicologia (y admin) puede usar este filtro; el backend ya restringe por rol. Ajustar si hace falta que el coordinador solo vea psicólogos (no otros roles).
- **Crear:** `POST /api/users` con `role: 'psicologo'`. Ya permitido para `ROLES_CAN_CREATE_PSYCHOLOGY_USER` (admin, coordinador_psicologia).
- **Actualizar:** `PATCH /api/users/:id`. Permitir que coordinador_psicologia edite solo usuarios con `role === 'psicologo'` (y que no pueda cambiar el rol a otro distinto).
- **Desactivar:** `PATCH /api/users/:id` con `isActive: false`. Misma regla: solo psicólogos bajo su supervisión.

**Frontend:** Página “Psicólogos” dentro del módulo: tabla (nombre, email, estado, carreras asignadas, acciones). Formularios crear/editar reutilizando lógica tipo UsersPage pero filtrada y con rol fijo.

---

## 4. Monitoreo de Progreso

### 4.1 Datos a mostrar

- Por cada psicólogo (o resumen global):
  - **Pacientes atendidos:** cantidad de pacientes distintos con al menos una cita o sesión en un periodo (ej. mes actual).
  - **Expedientes:** cantidad de expedientes psicológicos asignados; estados (ej. activo, en seguimiento, alta próxima) si se definen.
  - **Métricas de desempeño:** sesiones realizadas, citas cumplidas vs canceladas, etc.

### 4.2 API

- Opción A: Ampliar el payload de **dashboard coordinador** (`GET /api/dashboard/coordinator-psychology`) con un bloque `staffProgress` que incluya por cada psicólogo: `patientsAttended`, `recordsCount`, `sessionsCount`, `appointmentsCompleted`, etc.
- Opción B: Nuevo endpoint `GET /api/coordinator-psychology/staff-progress?period=month` que devuelva la lista de psicólogos con esas métricas.

**Frontend:** Sección “Progreso” o “Monitoreo”: tarjetas o tabla por psicólogo con las métricas; opcionalmente filtro por periodo.

---

## 5. Gestión de Itinerario (Calendario)

### 5.1 Comportamiento deseado

- **Vista de calendario** (semana o día) donde se ven las citas de **todos los psicólogos** (o un subconjunto seleccionable).
- Filtro por psicólogo(s).
- El coordinador puede **crear, editar y cancelar** citas en nombre de cualquier psicólogo de su área (department = psychology).

### 5.2 API

- **Listar citas en rango:** `GET /api/appointments?start=...&end=...&department=psychology` (y opcional `professionalIds=id1,id2`). El controlador de appointments ya filtra por rol; para coordinador_psicologia debe permitir ver todas las citas del departamento y devolver `professionalId` para agrupar en el calendario.
- **Crear/editar/cancelar:** Reutilizar `POST/PATCH` de appointments; el coordinador puede enviar `professionalId` de cualquier psicólogo (validar en backend que el profesional sea `role === 'psicologo'`).

**Frontend:** Vista “Itinerario” o “Calendario”: componente de calendario (día/semana), selector de psicólogos, lista de citas por slot; modales o página para crear/editar cita (paciente, profesional, fecha, tipo, duración).

---

## 6. Asignación Académica

### 6.1 Comportamiento deseado

- Listado de **carreras** de la universidad.
- Por cada carrera, **asignar un psicólogo responsable** (en el modelo actual: una carrera → un psicólogo). Si en el futuro se permite más de un psicólogo por carrera, se relajaría la restricción `careerId` unique en `PsychologistCareer`.
- El coordinador puede **asignar** o **cambiar** el psicólogo de una carrera; **quitar** asignación (dejar la carrera sin responsable).

### 6.2 API (nuevos endpoints)

- `GET /api/coordinator-psychology/psychologist-careers`  
  Devuelve todas las carreras con el `psychologistId` asignado (si existe). Solo coordinador_psicologia (y admin si se desea).

- `PUT /api/coordinator-psychology/psychologist-careers`  
  Body: `{ careerId, psychologistId | null }`. Crea o actualiza la asignación; si `psychologistId` es null, elimina la asignación. Validar que el usuario sea `psicologo` y esté activo.

**Servicio backend:** Ampliar `psychologist-career.service.ts` con:
- `getAssignmentsForCoordinator()`: listar todas las carreras con asignación actual.
- `setAssignment(careerId, psychologistId | null)`: crear/actualizar/eliminar `PsychologistCareer` (teniendo en cuenta el unique en `careerId`).

**Frontend:** Página “Asignación académica”: tabla o cards de carreras; por cada una, dropdown o selector de psicólogo (lista de psicólogos activos); botón guardar por carrera o global.

---

## 7. Analytics (Visualización de datos)

### 7.1 Gráficas requeridas

- **Line Chart:** Progresión de consultas (o sesiones/citas) en el tiempo. Eje X: fechas (día/semana/mes); Eje Y: cantidad. Permite ver tendencias por periodo. Filtro opcional por psicólogo.
- **Pie Chart o Bar Chart:** Distribución de carga de trabajo por psicólogo (pacientes atendidos, sesiones realizadas o horas) en un periodo. Objetivo: ver equilibrio de carga entre el equipo.

### 7.2 API

- `GET /api/coordinator-psychology/analytics/consultations-over-time?start=...&end=...&groupBy=day|week|month&psychologistId=optional`  
  Respuesta: serie temporal, ej. `[{ date: '2026-03-01', count: 12 }, ...]`.

- `GET /api/coordinator-psychology/analytics/workload-distribution?start=...&end=...`  
  Respuesta: `[{ psychologistId, psychologistName, patientsCount, sessionsCount, hours }]` para construir Pie o Bar.

**Frontend:** Página “Analytics”: dos bloques (o pestañas): (1) Line Chart con selector de rango y agrupación; (2) Pie o Bar con distribución por psicólogo. Librería de gráficas: Recharts, Chart.js o la que use el proyecto.

---

## 8. Estructura de navegación (Frontend)

- **Ruta base:** `/supervision` (solo visible para `coordinador_psicologia`).
- Subrutas sugeridas:
  - `/supervision` → redirigir a `/supervision/psychologists` o dashboard del módulo.
  - `/supervision/psychologists` → Gestión de Psicólogos (listado + CRUD).
  - `/supervision/progress` → Monitoreo de Progreso.
  - `/supervision/calendar` → Gestión de Itinerario (calendario).
  - `/supervision/assignments` → Asignación Académica.
  - `/supervision/analytics` → Analytics (gráficas).

**Menú lateral:** Un ítem “Supervisión” (o “Gestión de personal”) con icono (ej. UserCog o UsersRound), visible solo para `coordinador_psicologia`.

---

## 9. Permisos y seguridad (API)

- Todos los endpoints de este módulo deben validar `req.user.role === 'coordinador_psicologia'` (o admin si se desea que admin también tenga acceso).
- Al crear/editar usuarios, solo roles `psicologo`.
- Al asignar carreras, solo usuarios activos con rol `psicologo`.
- Al consultar citas o métricas, solo departamento `psychology` y profesionales psicólogos.

---

## 10. Checklist de implementación

- [ ] **API:** Ajustar listado/edición de usuarios para que coordinador solo gestione psicólogos.
- [ ] **API:** Endpoints asignación académica (listar, crear/actualizar/eliminar PsychologistCareer).
- [ ] **API:** Endpoint(s) monitoreo de progreso (staff-progress o ampliar dashboard).
- [ ] **API:** Endpoint citas en rango para calendario (o documentar uso de appointments existente).
- [ ] **API:** Endpoints analytics (consultations-over-time, workload-distribution).
- [ ] **Frontend:** Nav item y rutas `/supervision/*` con RoleGuard `coordinador_psicologia`.
- [ ] **Frontend:** Página Psicólogos (lista + formularios).
- [ ] **Frontend:** Página Progreso (métricas por psicólogo).
- [ ] **Frontend:** Página Calendario (vista agenda, CRUD citas).
- [ ] **Frontend:** Página Asignación académica (carreras + selector psicólogo).
- [ ] **Frontend:** Página Analytics (Line + Pie/Bar).
- [ ] **i18n:** Claves para títulos, etiquetas y mensajes del módulo.

---

*Documento de diseño para el módulo Supervisión y Gestión de Personal. Sistema EHR – Departamento de Psicología.*
