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

## 3. Recursos / Personas (plan base en `Plan-Trabajo-EHR.csv`)

| Persona | Rol en el proyecto | Uso en el plan |
|---------|-------------------|----------------|
| Edgar Tiburcio Gomez Moran | PM, desarrollador backend, analista | Planificación, requisitos, arquitectura, API, seguridad, revisiones con stakeholders |
| Juan Enrique Castillo Ontiveros | Desarrollador frontend | UI React, wireframes/mockups/design system (con Orlando), documentación de usuario |
| Orlando de Jesús Casas Dávila | Desarrollador frontend | UI, Electron, wireframes/mockups/design system (con Juan) |
| Daniela Mayte Guevara Castillo | Tester / QA | Pruebas de carga, E2E (con Carlos), usabilidad, fase Testing |
| Carlos Alexis Rodriguez Garcia | Tester / QA | Tests backend (con Edgar y Daniela), E2E, auditoría de seguridad (con Edgar), usabilidad, corrección de bugs |

---

## 4. Reglas Aplicadas en el Plan (rúbrica académica)

- **Nivel 1 — Nombre del proyecto:** Una tarea resumen con el nombre *Electronic Health Record (EHR) System*; fechas globales del cuatrimestre (20 ene – 10 abr 2026).
- **Nivel 2 — Fases:** Cinco fases (Análisis, Diseño, Desarrollo, Testing y QA, Despliegue y Cierre), alineadas con el Acta de Constitución y los hitos de entrega.
- **Nivel 3 — Actividades:** Tareas ejecutables bajo cada fase; duración **máxima 5 días laborables (1 semana)** para poder registrar avance cada viernes.
- **Predecesoras:** Actividades ligadas con **Predecessors** (ID de tarea) donde aplica una secuencia lógica; en MS Project se interpretan como fin-inicio salvo que se cambie el tipo de vínculo.
- **Ventana del cuatrimestre:** Todas las actividades tienen **Inicio** y **Fin** dentro del periodo del proyecto (20-ene a 10-abr-2026); las fechas del CSV son plan base y pueden re-planificarse en MS Project manteniendo los hitos acordados con Profesores/Stakeholders.
- **Revisión con Stakeholders/Profesores:** Hay tareas explícitas de revisión por fase (y columna **Stakeholder** en el CSV) para documentar con quién validar entregables; conviene concertar fechas reales en cada revisión.
- **Recursos:** Cada actividad de nivel 3 tiene asignado al menos un **Resource Names** (rol o persona según el Acta).
- **% Completo:** Columna **Percent Complete** en el CSV; actualizar **cada semana** (p. ej. los viernes) el avance de las tareas en curso.
- **Entregables y documentos:** Incluidos como tareas o dentro del nombre del entregable (Acta, Matriz RACI, requisitos, riesgos, casos de uso, OpenAPI, ER, arquitectura, wireframes, mockups, design system, plan de trabajo, desarrollo, pruebas, manuales, capacitación, cierre).

---

## 5. Actividades y Documentos de Entrega Incluidos en el Plan

Todas las actividades y documentos que forman parte de la entrega del proyecto están reflejados en el CSV (columnas *Task Name* y, donde aplica, como parte del entregable de la tarea):

| Fase | Actividades / Documentos de entrega |
|------|-------------------------------------|
| **Fase 1 Análisis** | Acta de constitución, **Matriz RACI**, Requisitos funcionales, Requisitos no funcionales, Análisis de riesgos y amenazas, Casos de uso e historias de usuario, Reglas de negocio, Diagrama de flujo de atención, Revisión con Profesores, Entrega Fase Análisis |
| **Fase 2 Diseño** | Documentación API REST (OpenAPI), Diagrama ER y esquema BD, Arquitectura del sistema, Wireframes (principales y restantes), Mockups alta fidelidad, Design system, Esquema Web Services y Autenticación, Plan de Trabajo (MS Project), Revisión con Profesores, Entrega Fase Diseño |
| **Fase 3 Desarrollo** | Backend (setup, auth JWT, endpoints por módulo, tests), Frontend (setup, componentes, módulos UI, Electron, tests E2E), Revisión MVP (plan base tras citas y expedientes; alinear con hito del Acta), Revisión desarrollo completo antes de Testing |
| **Fase 4 Testing** | Pruebas rendimiento/carga, Auditoría seguridad, Pruebas usabilidad, Corrección bugs críticos, Revisión con Profesores - QA |
| **Fase 5 Despliegue** | Configuración producción, Documentación de usuario y manual de administración, Capacitación, Transferencia de conocimiento, Entrega final (10 Abr) |

*El archivo `Plan-Trabajo-EHR.csv` contiene cada una de estas actividades como tarea con nivel de esquema (Outline Level), duración ≤ 5 días, fechas, predecesoras, recursos, columna **Stakeholder** (revisión con Profesores/áreas) y columna **% Completo**.*

---

## 6. Cómo Importar el Plan en MS Project

**Recomendado:** abrir **`Plan-Trabajo-EHR.xml`** (MSPDI, UTF-8 sin BOM), generado con `python3 build_plan_mspdi.py` o con `./exportar-a-ms-project.sh`. Así se conservan notas (recursos + stakeholder), niveles de esquema y predecesoras sin un asistente de importación de CSV.

**Alternativa CSV:**

1. Abrir Microsoft Project.
2. **Archivo → Abrir** / **Importar** el archivo `Plan-Trabajo-EHR.csv`, delimitador coma, codificación UTF-8.
3. Asignar columnas a los campos de MS Project:
   - `Task Name` → Nombre de tarea
   - `Duration` → Duración
   - `Start` → Inicio
   - `Finish` → Fin
   - `Predecessors` → Predecesoras (por ID)
   - `Resource Names` → Recursos
   - `Percent Complete` → % Completo
   - `Outline Level` → Nivel de esquema (1=Proyecto, 2=Fase, 3=Actividad)
   - `Stakeholder` → copiar a **Notas** de la tarea si su asistente no tiene campo dedicado (en el XML ya va en Notas vía el generador).
4. Ajustar el **calendario del proyecto** (Inicio: 20/01/2026, Fin: 10/04/2026). Si las fechas se muestran en otro formato regional, revisar el mapeo de columnas Start/Finish.
5. Revisar que las tareas de resumen (Fases) reflejen correctamente las fechas de sus subtareas.
6. Sustituir en **Recursos** los roles genéricos por nombres reales del equipo cuando estén confirmados.

---

## 7. Actualización Semanal del Progreso

- Cada **viernes** actualizar la columna **% Completo** de las actividades en curso.
- Las tareas de resumen (Fases) calcularán automáticamente su % en MS Project a partir de las subtareas.
- Revisar con los Profesores/Stakeholders las actividades marcadas como "Revisión con stakeholders" antes de dar por cerrada la fase correspondiente.

---

*Documento generado a partir del Acta de Constitución del Proyecto y entregables definidos en el repositorio EHR. Fechas del cuatrimestre: 20 Ene 2026 – 10 Abr 2026.*
