# FMEA / AMEF - Gestión de Riesgos del Proyecto

**Proyecto:** Electronic Health Record (EHR) System  
**Documento solicitado:** FMEA – Nombre de tu proyecto.xlsx  
**Nombre del archivo a entregar:** `FMEA – Electronic Health Record.xlsx`

---

## Archivo generado

| Archivo | Descripción |
|---------|-------------|
| **FMEA – Electronic Health Record.xlsx** | Libro Excel con Portada y Tablas FMEA. Listo para que **todos los integrantes del equipo** lo suban. |

---

## Contenido del documento

### Hoja 1: Portada
- **Nombre del proyecto:** Electronic Health Record (EHR) System
- **Integrantes del proyecto:** Lista con PM/Tech Lead y plazas para [Integrante 2] a [Integrante 7]. *Deben sustituirse por los nombres reales del equipo.*
- **Definición de Probabilidad (Ocurrencia):** Escala 1-10 (Remoto a Casi seguro)
- **Definición de Impacto (Severidad):** Escala 1-10 (Insignificante a Catastrófico)
- **Definición de Detectabilidad:** Escala 1-10 (Muy alta detección a No detectable)
- **Índice RPN:** RPN = Severidad × Ocurrencia × Detectabilidad  
- **Nota:** Los valores pueden ser modificados por el equipo según criterio acordado.

### Hoja 2: Tablas FMEA
Para cada riesgo se incluye:
- **Proceso/Función:** Análisis, Diseño, Codificación, Pruebas, Implementación, Documentación, Administración de proyectos
- **Modo de Falla Potencial (Riesgo)**
- **Análisis cualitativo y cuantitativo:**
  - Efecto(s) Potencial(es) de la Falla
  - Severidad (Impacto) 1-10
  - Causa Potencial de Falla
  - Ocurrencia (Probabilidad) 1-10
- **Procesos de control actuales**
- **Detectabilidad** 1-10
- **RPN** (Severidad × Ocurrencia × Detectabilidad)
- **Plan de respuesta a los riesgos:**
  - Acciones recomendadas
  - Responsable

Los riesgos incluidos están alineados con el documento *Análisis de Riesgos y Amenazas* del proyecto y cubren los siete procesos indicados.

---

## Regenerar el archivo (opcional)

Si se editan los datos en el script y se desea volver a generar el .xlsx:

```bash
cd /home/edgar/Documentos/GitHub/ElectronicHealthRecord
node documents/docs/riesgos/generate-fmea.js
```

Requisito: tener instalado el paquete `xlsx` (`npm install xlsx`).

---

**Entrega:** Todos los integrantes del equipo deben subir el archivo **FMEA – Electronic Health Record.xlsx** según indique la materia.
