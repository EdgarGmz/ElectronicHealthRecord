# Gestionar el proyecto EHR con ProjectLibre

Este directorio contiene los archivos necesarios para **gestionar el desarrollo del proyecto Electronic Health Record (EHR)** con [ProjectLibre](https://www.projectlibre.com/).

## Archivo del proyecto

| Archivo | Uso |
|--------|-----|
| **`Plan-Trabajo-EHR.csv`** | Plan de trabajo con tareas, duraciones, fechas, predecesoras, recursos y % completo. **Este es el archivo principal para abrir en ProjectLibre.** |
| `Plan-Trabajo-MS-Project.md` | Descripción del plan, WBS, fases, recursos y reglas. |
| `Acta-Constitucion-Proyecto.md` | Acta de constitución del proyecto. |

## Cómo abrir el plan en ProjectLibre

### Opción 1: Importar el CSV (recomendado)

1. Abre **ProjectLibre**.
2. **Archivo → Abrir** (o **File → Open**).
3. Navega a esta carpeta y selecciona **`Plan-Trabajo-EHR.csv`**.
4. Si ProjectLibre muestra un asistente de importación:
   - **Tipo de archivo / Codificación:** texto o CSV, **UTF-8**.
   - **Delimitador:** coma (`,`).
   - Asigna las columnas a los campos de proyecto:
     - `ID` → ID
     - `Outline Level` → Nivel de esquema / Outline Level
     - `Task Name` → Nombre de tarea
     - `Duration` → Duración
     - `Start` → Inicio
     - `Finish` → Fin
     - `Predecessors` → Predecesoras (por ID; si usa punto y coma `;`, puede que haya que elegir “múltiples predecesoras” o ajustar el formato)
     - `Resource Names` → Recursos / Nombres de recursos
     - `Percent Complete` → % Completo
5. **Fecha de inicio del proyecto:** 20/01/2026. **Fecha de fin:** 10/04/2026. Ajusta el calendario del proyecto si ProjectLibre lo pide.
6. Guarda el proyecto en formato nativo de ProjectLibre (**.pod**) para seguir trabajando: **Archivo → Guardar como** → `Plan-Trabajo-EHR.pod` en esta misma carpeta (o donde prefieras).

### Opción 2: Crear proyecto nuevo y pegar datos

Si la importación directa no mapea bien:

1. **Archivo → Nuevo** y define las fechas del proyecto (20 Ene 2026 – 10 Abr 2026).
2. En la vista de **Gantt / tabla de tareas**, copia los datos desde el CSV (por ejemplo abriendo el CSV en Excel o LibreOffice Calc) y pégalos en la rejilla de ProjectLibre, ajustando columnas a: Nombre, Duración, Inicio, Fin, Predecesoras, Recursos, % Completo.

## Estructura del plan en ProjectLibre

- **Nivel 1:** Proyecto *Electronic Health Record (EHR) System*
- **Nivel 2:** Fases (Análisis, Diseño, Desarrollo, Testing y QA, Despliegue y Cierre)
- **Nivel 3:** Actividades (duración ≤ 5 días laborables)

Las **predecesoras** están por ID (p. ej. `3`, `4;5`). ProjectLibre debe interpretarlas para construir el diagrama de Gantt y la ruta crítica.

## Actualizar el progreso

- Actualiza la columna **% Completo** de las tareas (por ejemplo cada viernes).
- Las tareas de **resumen** (fases) suelen calcular su % a partir de las subtareas.
- Si quieres mantener el CSV en el repositorio actualizado: **Archivo → Exportar → CSV** y guarda sobre `Plan-Trabajo-EHR.csv` (o con otro nombre y luego renómbralo), respetando las columnas existentes para no romper la estructura.

## Exportar a otros formatos

En ProjectLibre puedes usar **Archivo → Exportar** para generar:

- **XML** (formato Microsoft Project), para intercambio con otras herramientas.
- **PDF**, para informes o entregas.

---

*Documento de apoyo al plan de trabajo EHR. Fechas del plan: 20 Ene 2026 – 10 Abr 2026.*
