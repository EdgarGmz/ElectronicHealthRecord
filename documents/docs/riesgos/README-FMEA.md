# FMEA / AMEF - Gestión de Riesgos del Proyecto

**Proyecto:** Electronic Health Record (EHR) System  
**Documento solicitado:** FMEA – Nombre de tu proyecto.xlsx  
**Nombre del archivo a entregar:** `FMEA – Electronic Health Record.xlsx`

---

## Archivo generado

| Archivo | Descripción |
|---------|-------------|
| **FMEA – Electronic Health Record.xlsx** | Libro Excel con Portada, Tablas, Ayuda y matriz FMEA (según AMEF-FMEA.xlsx). Listo para que **todos los integrantes del equipo** lo suban. |

---

## Contenido del documento

El formato sigue el documento de referencia **AMEF-FMEA.xlsx** (hojas Tablas, Ayuda y estructura de la matriz FMEA).

### Hoja 1: Portada
- **Nombre del proyecto:** Electronic Health Record (EHR) System
- **Integrantes del proyecto:** Lista con PM/Tech Lead y plazas para [Integrante 2] a [Integrante 7]. *Deben sustituirse por los nombres reales del equipo.*
- Referencia a las hojas "Tablas" y "Ayuda".

### Hoja 2: Tablas
- **Severidad/Impacto:** Alta (9), Media (5), Baja (1) con definiciones (calificación, retraso, costos).
- **Ocurrencia/Probabilidad:** Alta (9), Media (5), Baja (1) con definiciones.
- **Detectabilidad:** Alta (1), Media (5), Baja (9) con definiciones.
- *Los valores pueden modificarse por el equipo según criterio acordado.*

### Hoja 3: Ayuda
- Definiciones de cada columna del FMEA: Proceso/Función, Modo de Falla Potencial, Severidad, Efectos, Ocurrencia, Controles, Detectabilidad, RPN, Acciones recomendadas, Responsable, Resultados de las acciones.

### Hoja 4: FMEA
Matriz con encabezados según AMEF-FMEA.xlsx y columna **Resultados de las Acciones Tomadas** (fecha, Sev, Occ, Det, RPN tras aplicar acciones). Para cada riesgo:
- **Proceso/Función:** Análisis, Diseño, Codificación, Pruebas, Implementación, Documentación, Administración de proyectos
- **Modo de Falla Potencial** (Riesgo)
- **Efecto(s) Potencial(es) de la Falla**, **Sev**, **Causa Potencial / Mecanismo de Falla**, **Occ**, **Proceso(s) de control actual(es)**, **Det**, **RPN**
- **Acciones Recomendadas**, **Responsable**
- Columnas en blanco para registrar resultados de las acciones y RPN posterior

Los riesgos incluidos están alineados con el documento *Análisis de Riesgos y Amenazas* del proyecto y cubren los siete procesos indicados.

---

## Regenerar el archivo (opcional)

Si se editan los datos en el script y se desea volver a generar el .xlsx:

```bash
cd ut-care
node ../documents/docs/riesgos/generate-fmea.js
```

Requisito: el paquete `xlsx` está en `ut-care/package.json`.

---

**Entrega:** Todos los integrantes del equipo deben subir el archivo **FMEA – Electronic Health Record.xlsx** según indique la materia.
