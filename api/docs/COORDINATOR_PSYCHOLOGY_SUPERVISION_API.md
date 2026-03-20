# API: Módulo Supervisión y Gestión de Personal (Coordinador-Psicología)

**Rol:** `coordinador_psicologia`  
**Documento de diseño completo:** [SUPERVISION-GESTION-PERSONAL.md](../../documents/docs/modules/SUPERVISION-GESTION-PERSONAL.md)

Todos los endpoints de este módulo requieren autenticación y `role === 'coordinador_psicologia'` (o admin si se desea).

---

## 1. Gestión de Psicólogos (CRUD)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users?role=psicologo` | Listar solo psicólogos. El coordinador debe recibir únicamente usuarios con rol `psicologo`. |
| POST | `/api/users` | Crear usuario con `role: 'psicologo'`. Ya permitido por `ROLES_CAN_CREATE_PSYCHOLOGY_USER`. |
| PATCH | `/api/users/:id` | Actualizar o desactivar (`isActive: false`). Backend debe validar que el usuario a editar sea `psicologo` y que el coordinador no pueda cambiar el rol. |

**Ajustes sugeridos en backend:** En `user.controller` / `user.service`, si el solicitante es `coordinador_psicologia`, restringir listado a `role=psicologo` y en PATCH permitir solo edición de usuarios con `role === 'psicologo'`.

---

## 2. Monitoreo de Progreso

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/coordinator-psychology` | Ya existe. Ampliar payload con bloque `staffProgress`: por cada psicólogo, `patientsAttended`, `recordsCount`, `sessionsCount`, `appointmentsCompleted`. |
| O bien | GET `/api/coordinator-psychology/staff-progress?period=month` | Nuevo endpoint que devuelva lista de psicólogos con métricas (pacientes atendidos, expedientes, sesiones, citas) en el periodo. |

---

## 3. Gestión de Itinerario (Calendario)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/appointments?start=...&end=...&department=psychology` | Listar citas en rango de fechas. Para coordinador, devolver todas las citas del departamento; opcional `professionalIds=id1,id2`. |
| POST | `/api/appointments` | Crear cita. Coordinador puede enviar `professionalId` de cualquier psicólogo. |
| PATCH | `/api/appointments/:id` | Editar o cancelar cita. Validar que la cita sea del departamento psychology. |

Reutilizar controlador y rutas de appointments existentes; asegurar que el coordinador pueda leer/crear/editar citas con cualquier `professionalId` con rol `psicologo`.

---

## 4. Asignación Académica (PsychologistCareer)

**Nuevos endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/coordinator-psychology/psychologist-careers` | Listar todas las carreras con el `psychologistId` asignado (si existe). Respuesta: `{ careerId, careerName, psychologistId?, psychologistName? }[]`. |
| PUT | `/api/coordinator-psychology/psychologist-careers` | Body: `{ careerId: string, psychologistId: string \| null }`. Crear/actualizar asignación; si `psychologistId` es null, eliminar. Validar que el usuario sea `psicologo` y esté activo. |

Modelo actual: `PsychologistCareer` con `careerId` unique, por tanto una carrera tiene un único psicólogo responsable.

---

## 5. Analytics

**Nuevos endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/coordinator-psychology/analytics/consultations-over-time?start=...&end=...&groupBy=day\|week\|month&psychologistId=optional` | Serie temporal. Respuesta: `{ date: string, count: number }[]`. |
| GET | `/api/coordinator-psychology/analytics/workload-distribution?start=...&end=...` | Distribución de carga. Respuesta: `{ psychologistId, psychologistName, patientsCount, sessionsCount, hours }[]` para gráficas Pie/Bar. |

---

## Implementación sugerida

1. **Router:** Crear `api/src/routes/coordinator-psychology.routes.ts` con middleware `authorizeRoles('coordinador_psicologia')` (y opcionalmente `admin`).
2. **Controladores/servicios:**  
   - Asignación: ampliar `psychologist-career.service.ts` con `getAssignmentsForCoordinator()` y `setAssignment(careerId, psychologistId)`.  
   - Analytics: nuevo `coordinator-psychology-analytics.service.ts` con consultas agregadas a citas/sesiones por rango y por profesional.
3. **Usuarios:** Ajustar `user.service` (list y update) para restricciones del coordinador según sección 1.

---

*Referencia: documento de diseño `documents/docs/modules/SUPERVISION-GESTION-PERSONAL.md`.*
