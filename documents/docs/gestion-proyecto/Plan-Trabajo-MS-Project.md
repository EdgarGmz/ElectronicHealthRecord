# Plan de Trabajo - MS Project
## Sistema Electronic Health Record (EHR)

**Proyecto:** Electronic Health Record (EHR) System  
**Fecha de Inicio:** 20 de Enero de 2026  
**Fecha de Fin:** 10 de Abril de 2026  
**Cuatrimestre:** Enero - Abril 2026  
**Documento base:** Acta de Constitución del Proyecto (estimación, fases, hitos, stakeholders)

---

## 1. Estructura del Plan (Niveles WBS)

| Nivel | Descripción |
|-------|-------------|
| **Nivel 1** | Nombre del Proyecto: *Electronic Health Record (EHR) System* |
| **Nivel 2** | Fases del proyecto (Análisis, Diseño, Desarrollo, Testing y QA, Despliegue y Cierre) |
| **Nivel 3** | Actividades (duración máxima 1 semana / 5 días laborables para actualizar progreso los viernes) |

---

## 2. Fases y Fechas de Entrega (Alineadas con Stakeholders/Profesores)

Las fechas de entrega de cada sub-proyecto o producto han sido establecidas según el Acta de Constitución y deben revisarse con los Stakeholders/Profesores (Dirección Académica, Dept. Psicología, Dept. Enfermería, TI):

| Fase | Fecha Objetivo Entrega | Entregables Clave | Revisión con |
|------|------------------------|-------------------|--------------|
| Fase 1: Análisis | 10 Feb 2026 | Requisitos funcionales/no funcionales, riesgos, casos de uso | Profesores / Dept. Psicología y Enfermería |
| Fase 2: Diseño | 28 Feb 2026 | Diagrama ER, arquitectura, API REST, wireframes, mockups, design system | Profesores / Stakeholders |
| Prototipo MVP | 14 Mar 2026 | Auth, CRUD pacientes, citas básicas, expedientes básicos | Profesores |
| Backend Completo | 21 Mar 2026 | Todos los endpoints API, tests, documentación técnica | Tech Lead / Profesores |
| Frontend Completo | 28 Mar 2026 | Todas las UI, integración API, tests E2E, Electron | Profesores |
| Fase 4: Testing y QA | 3 Abr 2026 | Pruebas rendimiento, seguridad, usabilidad, bugs críticos resueltos | QA / Profesores |
| Fase 5: Despliegue y Cierre | 10 Abr 2026 | Sistema en producción, documentación usuario, capacitación, cierre | Sponsor / Profesores |

---

## 3. Recursos / Personas a Asignar (según Acta de Constitución)

| Recurso | Rol | Uso en el plan |
|---------|-----|----------------|
| Edgar Gómez | Project Manager & Tech Lead | Planificación, arquitectura, revisión, desarrollo crítico |
| Backend Developer 1 | Backend Developer | API, base de datos, seguridad |
| Backend Developer 2 | Backend Developer | API, integración, testing |
| Frontend Developer 1 | Frontend Developer | UI React, componentes, UX |
| Frontend Developer 2 | Frontend Developer | Electron, integración, testing |
| UI/UX Designer | UI/UX Designer | Wireframes, mockups, design system |
| QA Engineer | QA Engineer | Testing, QA, usabilidad |

*Nota: Donde figure [TBD] en el equipo, asignar en MS Project el rol genérico (ej. "Backend Developer") o el nombre cuando se confirme.*

---

## 4. Reglas Aplicadas en el Plan

- **Duración máxima por actividad:** 5 días laborables (1 semana), para permitir actualizar el % de avance cada viernes.
- **Columna % Completo:** Incluida en el CSV; actualizar semanalmente.
- **Vínculos:** Las actividades están ligadas por predecesoras (Finish-to-Start donde aplique).
- **Documentos de entrega:** Incluidos como actividades o parte de entregables (Acta, Req. Funcionales, Req. No Funcionales, Análisis Riesgos, API OpenAPI, Diagrama ER, Wireframes, Mockups, Design System, Esquema Web Services y Autenticación, Plan de Trabajo, Manual de usuario, etc.).

---

## 5. Actividades y Documentos de Entrega Incluidos en el Plan

Todas las actividades y documentos que forman parte de la entrega del proyecto están reflejados en el CSV (columnas *Task Name* y, donde aplica, como parte del entregable de la tarea):

| Fase | Actividades / Documentos de entrega |
|------|-------------------------------------|
| **Fase 1 Análisis** | Acta de constitución, Requisitos funcionales, Requisitos no funcionales, Análisis de riesgos y amenazas, Casos de uso e historias de usuario, Reglas de negocio, Diagrama de flujo de atención, Revisión con Profesores, Entrega Fase Análisis |
| **Fase 2 Diseño** | Documentación API REST (OpenAPI), Diagrama ER y esquema BD, Arquitectura del sistema, Wireframes (principales y restantes), Mockups alta fidelidad, Design system, Esquema Web Services y Autenticación, Plan de Trabajo (MS Project), Revisión con Profesores, Entrega Fase Diseño |
| **Fase 3 Desarrollo** | Backend (setup, auth JWT, endpoints por módulo, tests), Frontend (setup, componentes, módulos UI, Electron, tests E2E), Revisión MVP (14 Mar), Revisión Desarrollo completo (28 Mar) |
| **Fase 4 Testing** | Pruebas rendimiento/carga, Auditoría seguridad, Pruebas usabilidad, Corrección bugs críticos, Revisión con Profesores - QA |
| **Fase 5 Despliegue** | Configuración producción, Documentación de usuario y manual de administración, Capacitación, Transferencia de conocimiento, Entrega final (10 Abr) |

*El archivo `Plan-Trabajo-EHR.csv` contiene cada una de estas actividades como tarea con nivel de esquema (Outline Level), duración ≤ 5 días, fechas, predecesoras, recursos y columna **% Completo**.*

---

## 6. Cómo Importar el Plan en MS Project

1. Abrir Microsoft Project.
2. **Archivo → Abrir** y seleccionar `Plan-Trabajo-EHR.csv` (o **Archivo → Nuevo desde archivo** si su versión lo permite).
3. Si usa **Archivo → Importar**: elegir archivo de texto/CSV, delimitador coma, codificación UTF-8. Asignar columnas a los campos de MS Project:
   - `Task Name` → Nombre de tarea
   - `Duration` → Duración
   - `Start` → Inicio
   - `Finish` → Fin
   - `Predecessors` → Predecesoras (por ID)
   - `Resource Names` → Recursos
   - `Percent Complete` → % Completo
   - `Outline Level` → Nivel de esquema (1=Proyecto, 2=Fase, 3=Actividad)
4. Ajustar el **calendario del proyecto** (Inicio: 20/01/2026, Fin: 10/04/2026). Si su MS Project usa formato de fecha distinto (DD/MM/AAAA o MM/DD/AAAA), reasignar las columnas Start/Finish en el asistente de importación.
5. Revisar que las tareas de resumen (Fases) reflejen correctamente las fechas de sus subtareas.
6. Añadir o reemplazar recursos en la pestaña **Recursos** si desea asignar nombres concretos (sustituir "Backend Developer 1", etc., por los nombres reales del equipo).

---

## 7. Actualización Semanal del Progreso

- Cada **viernes** actualizar la columna **% Completo** de las actividades en curso.
- Las tareas de resumen (Fases) calcularán automáticamente su % en MS Project a partir de las subtareas.
- Revisar con los Profesores/Stakeholders las actividades marcadas como "Revisión con stakeholders" antes de dar por cerrada la fase correspondiente.

---

*Documento generado a partir del Acta de Constitución del Proyecto y entregables definidos en el repositorio EHR. Fechas del cuatrimestre: 20 Ene 2026 – 10 Abr 2026.*
