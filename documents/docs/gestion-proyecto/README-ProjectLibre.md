# Gestionar el proyecto EHR con ProjectLibre

Este directorio contiene los archivos necesarios para **gestionar el desarrollo del proyecto Electronic Health Record (EHR)** con [ProjectLibre](https://www.projectlibre.com/).

## Por qué el CSV “no muestra nada” al abrirlo

En ProjectLibre, los archivos que **no** son `.pod` se cargan con el importador tipo Microsoft Project (MPXJ `UniversalProjectReader`). Ese lector reconoce formatos como **XML de Microsoft Project (MSPDI)**, MPP, MPX, XER, etc., pero **no** trata un `.csv` genérico como proyecto: no coincide con ninguna huella de formato y la carga no produce tareas.

Por eso hace falta el **XML generado** (`Plan-Trabajo-EHR.xml`) para abrir el plan completo en ProjectLibre. El **CSV** sigue siendo la fuente cómoda para editar en el repositorio; el script `build_plan_mspdi.py` vuelca el CSV al XML.

## 53 tareas en MPXJ vs 52 en ProjectLibre (no es un error)

En el archivo MPX/XML, MPXJ cuenta **53** tareas porque incluye la **fila raíz resumen** (id 0, «Electronic Health Record (EHR) System»). Tras **`MspImporter.importProject`**, el `Project` interno suele exponer **`getTasks().size() == 52`**: es el mismo plan; el modelo interno no lista la raíz igual. Si ves **unas 52 filas** en la tabla de tareas, la importación **sí** funcionó.

## Archivos

| Archivo | Uso |
|--------|-----|
| **`Plan-Trabajo-EHR.mpx`** | Formato **MPX** (Microsoft Project Exchange): suele abrir mejor en ProjectLibre que el XML si tu versión trae MPXJ antiguo. |
| **`Plan-Trabajo-EHR.xml`** | MS Project XML (MSPDI), **UTF-8 sin BOM** (un BOM delante de `<?xml` rompe el lector MSPDI/JAXB de ProjectLibre). |
| **`Plan-Trabajo-EHR.pod`** | **Copia del mismo MSPDI** que el `.xml`: no es el binario serializado de ProjectLibre, pero al abrirlo el importador `.pod` intenta leer objetos Java, falla y **recupera por XML**; sirve si el sistema asocia `.pod` a ProjectLibre o quieres “proyecto nativo” en el nombre de archivo. |
| **`Plan-Trabajo-EHR.csv`** | Fuente en tabla para el repo; edítalo y regenera XML/MPX con el script. |
| **`build_plan_mspdi.py`** | Genera `Plan-Trabajo-EHR.xml` y **`Plan-Trabajo-EHR.pod`** (copia). Genera **`Plan-Trabajo-EHR.mpx`** si tienes `mpxj` y `jpype1` (ver abajo). |
| **`abrir-en-projectlibre.sh`** | Ejecuta `projectlibre --fileNames <ruta>` (recomendado si **Archivo → Abrir** te deja el proyecto vacío). |
| **`verificar_plan_leible_mpxj.py`** | Sin abrir la GUI: comprueba UPR, `MSPDIReader`, **`ImprovedMSPDIReader`** (el que usa `MspImporter` con XML) y ausencia de BOM (`pip install jpype1`). |
| **`verificar_mspimporter_projectlibre.py`** | Ejecuta el **mismo `MspImporter.importProject`** que la aplicación y cuenta `Project.getTasks()` → debe dar **52** con MPXJ **53** (`pip install jpype1`). |
| **`diagnostico-plan-projectlibre.sh`** | Ejecuta el verificador, copia el MPX a `/tmp` y recuerda zoom en **2026** + cómo activar log de importación. Si tu `python3` no tiene jpype: `VERIFIER_PY=/ruta/venv/bin/python3 ./diagnostico-plan-projectlibre.sh`. |
| `Plan-Trabajo-MS-Project.md` | Descripción del plan, WBS, fases, recursos y reglas. |
| `Acta-Constitucion-Proyecto.md` | Acta de constitución del proyecto. |

## Abrir el plan en ProjectLibre (recomendado)

### Comprobación técnica (misma pila que ProjectLibre)

Con el **`projectlibre.jar` del snap 1.9.8**, la clase `net.sf.mpxj.reader.UniversalProjectReader` lee **`Plan-Trabajo-EHR.mpx`** y **`Plan-Trabajo-EHR.xml`** y obtiene **53 tareas** en ambos casos. Es decir, los archivos del repo son válidos para el importador “Microsoft Project” de ProjectLibre.

Si en la interfaz sigues viendo el proyecto vacío, suele ser el **diálogo Archivo → Abrir** (filtro de tipo, o no se dispara bien el importador). En ese caso usa **una de estas dos formas**:

### Opción A — Lanzador (más fiable)

Desde esta carpeta:

```bash
./abrir-en-projectlibre.sh
```

Eso ejecuta `projectlibre` pasando la ruta del **`.mpx`** (o del `.xml` si no hay MPX).

### Opción B — Terminal (bandera explícita)

```bash
projectlibre --fileNames /ruta/completa/a/Plan-Trabajo-EHR.mpx
```

La aplicación interpreta los argumentos como pares `--opción valor` (`ApplicationStartupFactory.extractOpts`). Con **`--fileNames`** y la ruta en el siguiente token se rellena `projectUrls` y se llama a `loadLocalDocument` al arrancar.

### Verificación sin interfaz gráfica

Si dudas del archivo o del snap:

```bash
pip install jpype1   # una vez
python3 verificar_plan_leible_mpxj.py
```

Si no usas el snap, define el JAR: `PROJECTLIBRE_JAR=/ruta/projectlibre.jar python3 verificar_plan_leible_mpxj.py`

Debe indicar **53 tareas** en `.mpx` y `.xml`. Si aquí falla, el problema es el archivo o la ruta al JAR; si aquí pasa y la GUI sigue vacía, suele ser caché de ventana, vista equivocada o datos bajo `~/.projectlibre` / `~/snap/projectlibre/`.

### Si el `.xml` no carga pero el `.mpx` sí

Si el XML se guardó **con BOM UTF-8** (común al exportar desde Excel o algunos editores), el lector MSPDI de Java falla con error de prólogo y el proyecto puede quedar vacío. El repo genera el XML **sin BOM** (`python3 build_plan_mspdi.py`). No vuelvas a añadir BOM.

### Gantt “vacío” pero con filas en la tabla (muy frecuente)

Las tareas están entre **20-ene-2026** y **10-abr-2026**. La vista Gantt a veces abre centrada en otra fecha: parece que no hay barras. **Desplázate en la línea de tiempo** o cambia el **zoom** hasta ver enero–abril **2026**.

### Si la GUI sigue vacía pese a la verificación

Ejecuta **`./diagnostico-plan-projectlibre.sh`** (copia el MPX a `/tmp` y revisa el mensaje del verificador).

1. En la tabla de tareas, clic derecho en cabeceras → **Personalizar columnas** y asegúrate de que **Nombre** esté visible.
2. Menú **Proyecto** / vista **Gantt**: comprobar que no estés solo en **Recursos** u otra vista sin tareas.
3. Cierra ProjectLibre y prueba tras renombrar la carpeta de preferencias (solo si aceptas perder ajustes):  
   `mv ~/.projectlibre ~/.projectlibre.bak` o, con snap, revisa `~/snap/projectlibre/common/.projectlibre`.

### Antes de abrir

1. Si cambiaste el **CSV**, ejecuta: `python3 build_plan_mspdi.py`  
   Para regenerar también el **MPX**: `pip install mpxj jpype1` y vuelve a ejecutar el script.
2. En ProjectLibre, sitúate en la vista **Gantt** o **Tareas** y, si hace falta, **expande** las filas de la jerarquía (tareas resumen).

3. **Archivo → Abrir** (alternativa al lanzador): filtro **Todos los archivos** → prueba **`Plan-Trabajo-EHR.mpx`** y luego **`Plan-Trabajo-EHR.xml`**.

4. Guarda en **`.pod`**: **Archivo → Guardar como** → `Plan-Trabajo-EHR.pod` (u otro nombre).

## Si prefieres no usar el XML

1. **Archivo → Nuevo** y define las fechas del proyecto (20 Ene 2026 – 10 Abr 2026).
2. Abre el CSV en **Calc/Excel**, copia columnas (nombre, duración, inicio, fin, predecesoras, % completo, etc.) y **pégalas** en la rejilla de tareas de ProjectLibre.

## Estructura del plan

- **Nivel 1:** Proyecto *Electronic Health Record (EHR) System*
- **Nivel 2:** Fases (Análisis, Diseño, Desarrollo, Testing y QA, Despliegue y Cierre)
- **Nivel 3:** Actividades (duración ≤ 5 días laborables)

Las **predecesoras** en el CSV van por ID, varias separadas por **coma** (p. ej. `7,8`). En el XML se traducen a enlaces predecesor.

En el XML, los **recursos** del CSV se reflejan en el campo **notas** de cada tarea (`Recursos: …`) para no depender de una tabla de recursos completa; puedes asignar recursos a mano en ProjectLibre si lo necesitas.

## Actualizar el progreso

- Opción A: edita **`% Completo`** (y fechas si aplica) en el **CSV**, ejecuta `build_plan_mspdi.py` y vuelve a abrir o actualiza el `.pod` según tu flujo.
- Opción B: trabaja solo en el **`.pod`** y, si quieres devolver cambios al repo, exporta a XML/CSV desde ProjectLibre y sustituye archivos con cuidado de no romper el formato esperado por el script.

## Exportar a otros formatos

En ProjectLibre: **Archivo → Exportar** → **XML** (Microsoft Project), **PDF**, etc.

---

*Documento de apoyo al plan de trabajo EHR. Fechas del plan: 20 Ene 2026 – 10 Abr 2026.*
