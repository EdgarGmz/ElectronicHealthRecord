# Checklist — Rúbricas de evaluación del plan de trabajo (EHR)

Usa este listado para **autoevaluación** o **revisión** del plan en **Microsoft Project**, **ProjectLibre** o el **CSV** del repositorio.  
Detalle y contexto: [Plan-Trabajo-MS-Project.md](Plan-Trabajo-MS-Project.md) (secciones 1–6).

**Archivos del repo para MS Project (recomendado):** `Plan-Trabajo-EHR.xml` (MSPDI, UTF-8 sin BOM), generado con `python3 build_plan_mspdi.py` o [`exportar-a-ms-project.sh`](exportar-a-ms-project.sh). Alternativa: importar `Plan-Trabajo-EHR.csv` mapeando columnas según la sección 6 del documento enlazado.

---

## Rúbrica — qué debe cumplir el plan

### Estructura WBS

- [ ] **Nivel 1:** Existe una tarea resumen con el **nombre del proyecto** (*Electronic Health Record (EHR) System* o equivalente acordado).
- [ ] **Nivel 2:** Están definidas las **fases** del proyecto (p. ej. Análisis, Diseño, Desarrollo, Testing y QA, Despliegue y Cierre).
- [ ] **Nivel 3:** Bajo cada fase hay **actividades** concretas (no solo fases vacías).

### Dependencias y calendario

- [ ] Las actividades que deben ir en secuencia tienen **predecesoras** (o vínculos equivalentes) donde aplica.
- [ ] **Todas** las actividades tienen **fecha de inicio y fin** dentro del **cuatrimestre** del proyecto (plan base: 20 ene – 10 abr 2026, salvo replanificación acordada).
- [ ] Las **fechas de entrega** por fase o sub-producto están **alineadas** con lo acordado en el Acta y, donde corresponde, **revisadas con Profesores/Stakeholders**.

### Personas y seguimiento

- [ ] **Cada actividad de nivel 3** tiene asignada al menos **una persona** (recurso / responsable en el plan).
- [ ] Hay tareas explícitas de **revisión con Stakeholders/Profesores** (o equivalente) por fase o hito crítico, con **quién** revisa documentado (p. ej. columna *Stakeholder* en el CSV o **Notas** en el XML importado).

### Duración y progreso

- [ ] Cada actividad de nivel 3 tiene **duración máxima de una semana** (p. ej. ≤ 5 días laborables), para poder actualizar el avance **cada viernes** (o ritmo semanal acordado).
- [ ] Está definida y en uso la columna **% de completo** (o campo equivalente) y se **actualiza semanalmente** en las tareas en curso.

### Entregables

- [ ] El plan incluye **todas las actividades y documentos** que forman parte de la **entrega del proyecto** (requisitos, diseño, implementación, pruebas, despliegue, manuales, capacitación, cierre, etc.), reflejados como tareas o entregables nombrados en el WBS.

---

## Cómo comprobarlo en Microsoft Project

Tras abrir **`Plan-Trabajo-EHR.xml`** (recomendado) o importar el CSV:

- [ ] **Proyecto → Información del proyecto** (o **Propiedades del proyecto**): fechas de **inicio** y **fin** del proyecto acotan el cuatrimestre (20-ene / 10-abr-2026 o las acordadas).
- [ ] **Vista Hoja de tareas / Gantt:** columnas **Duración**, **Comienzo**, **Fin**, **Predecesoras** visibles y coherentes con la rúbrica.
- [ ] **Nivel de esquema** (o estructura de resumen): se distingue **proyecto (1) → fases (2) → actividades (3)**; si no ves la columna, **Formato → columnas** y añade *Nivel de esquema* / *Esquema*.
- [ ] **Nombres de recursos** (o **Asignación de recursos**): cada tarea de detalle tiene recurso asignado; en importación desde XML, revisa también **Notas** si los nombres van allí según la versión.
- [ ] **% completado:** columna visible y rellenada en tareas en curso (actualización semanal).
- [ ] **Notas** (doble clic en tarea → *Notas*): revisión con stakeholders y texto de *Stakeholder* del CSV suelen aparecer aquí en el XML generado.
- [ ] **Vista Recurso** (o **Hoja de recursos**): opcional, para listar personas únicas del equipo si el archivo las crea como recursos al importar.

---

## Criterio rápido de “listo para entregar evaluación”

- [ ] El plan en **MS Project** refleja el estado actual (**fechas**, **% completado**, **recursos**).
- [ ] El repositorio tiene **`Plan-Trabajo-EHR.csv`** y, si entregas intercambio estándar, **`Plan-Trabajo-EHR.xml`** regenerado y coherente con el `.mpp` o archivo que entregues.
- [ ] Puedes **justificar** en una página o acta qué tareas o vistas del MPP cubren cada ítem de la rúbrica (evidencia breve).

---

## ProjectLibre (referencia breve)

- [ ] Misma lógica de rúbrica; los **nombres** suelen verse en **Notas** por tarea si importas el XML generado. Vista de **Recursos** puede variar según importación.

---

*Última alineación con el plan base del repositorio EHR. Ajusta fechas o ítems si tu institución publica una rúbrica oficial distinta.*
