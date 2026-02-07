# 📝 DESCRIPCIÓN
En este issue se investigan, definen y documentan los requisitos no funcionales que debe cumplir la plataforma de registro electrónico de salud para los departamentos de Psicología y Enfermería de la institución.  
Los requisitos no funcionales describen las características de calidad del sistema y permiten asegurar que la plataforma sea confiable, eficiente, segura, escalable y accesible para todos los usuarios (alumnos, psicólogos, enfermeras y personal administrativo).  
Estos requisitos son fundamentales para garantizar una experiencia adecuada que reemplace los procesos manuales actuales (Excel, papel, etc.) y para facilitar la evaluación del sistema durante las pruebas y después de su despliegue.

# 🎯 OBJETIVO
Establecer criterios claros y medibles que permitan evaluar la calidad de la plataforma de registro electrónico de salud en términos de rendimiento, seguridad, escalabilidad, compatibilidad y accesibilidad, alineados específicamente con las operaciones y flujos de trabajo identificados en los departamentos de Psicología y Enfermería.

# 📌 ALCANCE
Este issue cubre la definición de los siguientes requisitos no funcionales del sistema, contextualizados para la institución:

- ⚡ Rendimiento esperado  
- 🔒 Seguridad y privacidad de la información médica y psicológica  
- 📈 Escalabilidad  
- 🧩 Compatibilidad y accesibilidad  

---

## 1. ⚡ RENDIMIENTO ESPERADO
El sistema debe ofrecer una capacidad de respuesta adecuada bajo la carga de trabajo típica de los departamentos, considerando el uso diario y picos predecibles (ej. inicio de cuatrimestre, periodos de exámenes, campañas de salud).  
Debe ser capaz de manejar a todos los usuarios concurrentes sin degradar su desempeño, garantizando fluidez en las operaciones clínicas y administrativas.

**Requisitos específicos (Contextualizados):**
- El sistema debe soportar al menos **22 usuarios concurrentes** (2 administradores, 6 psicólogos, 2 enfermeras, personal de RH/administrativo y alumnos autogestionando citas) sin fallos ni caídas.
- El tiempo máximo de respuesta para las operaciones críticas será:
    - 📄 Registro/Consulta de expediente clínico (psicológico o de enfermería): **máximo 3 segundos**.
    - 📅 Agendamiento/Confirmación de una cita: **máximo 2 segundos**.
    - 💾 Guardado de nota de sesión terapéutica o evolución de enfermería: **máximo 2 segundos**.
    - 📊 Generación y visualización de reportes por cuatrimestre (gráficas): **máximo 5 segundos**.
    - ⏱️ En horarios de mayor tráfico (ej. 10 am - 2 pm y 4 pm - 7 pm), el rendimiento no debe degradarse más del **15%** respecto al tiempo promedio de respuesta.

**Ejemplo:**  
El sistema debe permitir que un psicólogo, durante una sesión, consulte el expediente de un alumno, registre la nota de la sesión y agende la próxima cita en un tiempo total no mayor a **8 segundos**, manteniendo esta fluidez incluso con otros 5 profesionales usando el sistema simultáneamente.

---

## 2. 🔒 SEGURIDAD Y PRIVACIDAD DE LA INFORMACIÓN MÉDICA Y PSICOLÓGICA
La plataforma debe garantizar la confidencialidad, integridad y disponibilidad de la información clínica sensible (historial psicológico, diagnósticos, redes de apoyo, procedimientos médicos), cumpliendo con la normativa local de protección de datos personales aplicable a la institución educativa.

**Requisitos específicos (Contextualizados):**
1. 🔐 Toda la información clínica sensible (notas de sesión, evaluaciones psicométricas, diagnósticos DSM-5/CIE, procedimientos) debe estar cifrada en reposo (en la base de datos).
2. 🌐 Las comunicaciones entre el cliente (navegador/app) y el servidor deben realizarse exclusivamente mediante el protocolo seguro **HTTPS/TLS**.
3. 👥 El acceso a la información debe estar controlado mediante un sistema de roles y permisos granulares (RBAC), definidos como:
     - 🎓 **Alumno/Paciente:** Solo puede agendar/ver sus citas, posiblemente recibir recordatorios.
     - 🧠 **Psicólogo:** Acceso completo y confidencial a los expedientes de sus alumnos asignados. Acceso restringido a otros expedientes salvo en casos de revisión autorizada por un superior.
     - 🩺 **Enfermero:** Acceso para registrar consultas, signos vitales, procedimientos y administración de medicamentos. Acceso a información médica relevante compartida por psicología (solo en casos específicos).
     - 🧑‍💼 **Coordinador-Supervisor de Psicología:** Acceso de supervisión a todos los expedientes del departamento para revisión de casos.
     - 🧑‍💼 **Coordinador-Supervisor de Enfermería:** Acceso solo a datos estadísticos agregados y reportes (sin información personal identificable) y al módulo de gestión de inventario de insumos.

**Auditoría:**  
🧾 Todas las acciones realizadas sobre datos sensibles (crear, leer, actualizar, eliminar) y movimientos de inventario deben registrarse en un log de auditoría que capture: usuario, fecha/hora, acción y registro afectado.

---

## 3. 📈 ESCALABILIDAD
El sistema debe estar preparado para crecer en número de usuarios (más alumnos, más psicólogos), servicios (nuevas áreas como nutrición o trabajo social) y volumen de datos (expedientes que se conservan por años) sin afectar su rendimiento ni requerir rediseños estructurales mayores.

**Requisitos específicos (Contextualizados):**
- 🧱 El sistema debe contar con una arquitectura modular por departamento/área (ej. Módulo de Psicología, Módulo de Enfermería, Módulo de Agenda/Calendario, Módulo de Reportes).
- ➕ Debe permitir la integración de nuevos servicios o departamentos mediante la adición de nuevos módulos, sin afectar significativamente la operación de los módulos existentes.
- ☁️ La solución debe estar basada en una plataforma en la nube (SaaS) que permita escalabilidad horizontal y/o vertical de manera transparente según las necesidades futuras de la institución.

**Ejemplo:**  
Si el próximo año la institución decide integrar el departamento de "Bienestar Estudiantil" que incluye un nutricionista, este nuevo servicio se podrá integrar como un módulo adicional dentro de la plataforma. El nutricionista tendrá su propio espacio para fichas clínicas, y el sistema podrá escalar para soportar el nuevo flujo de usuarios sin modificar el código central de los módulos de Psicología o Enfermería.

---

## 4. 🧩 COMPATIBILIDAD Y ACCESIBILIDAD
La plataforma debe garantizar una experiencia de uso consistente, eficiente y accesible desde los distintos dispositivos utilizados por el personal (computadoras, tablets, celulares) y por los alumnos, considerando la accesibilidad como un valor.

**Requisitos específicos (Contextualizados):**
- 💻 **Compatibilidad:** Debe ser completamente funcional en las versiones estables actuales de los navegadores web más comunes: Google Chrome, Mozilla Firefox y Microsoft Edge.
- 📱 **Diseño responsivo:** La interfaz debe adaptarse correctamente y ser totalmente utilizable en:
    1. 🖥️ Computadoras de escritorio/laptops (pantallas >= 13").
    2. 📟 Tabletas (pantallas entre 7" y 12", usadas por el personal para consultas rápidas).
    3. 📲 Teléfonos móviles (pantallas >= 5.5", usados por alumnos para agendar citas y por personal para recordatorios).
- ♿ **Accesibilidad:** La plataforma debe cumplir con los lineamientos básicos de accesibilidad web (WCAG 2.1 Nivel A) para facilitar su uso, incluyendo:
    1. ⌨️ Controles navegables mediante teclado (Tab, Enter).
    2. 🌓 Contrastes adecuados entre texto y fondo en todos los elementos de la interfaz.
    3. 🧷 Uso de etiquetas semánticas (HTML) y textos alternativos (alt text) para imágenes informativas.
    4. 🧱 Estructura de encabezados (h1, h2, h3) lógica y ordenada.

**Ejemplo:**  
Un alumno puede, desde su teléfono Android con Chrome, buscar un horario disponible con el psicólogo de su carrera, agendar una cita y recibir una confirmación, todo en menos de un minuto.  
Una enfermera puede, desde una tablet en la sala de curas, registrar rápidamente una curación básica.  
Un psicólogo con baja visión puede navegar el expediente de un alumno utilizando atajos de teclado y con un contraste visual adecuado.

---

# ✅ CRITERIOS DE ACEPTACIÓN
- ✅ Los requisitos no funcionales están claramente definidos y contextualizados para la operación de Psicología y Enfermería.
- 📏 Cada requisito incluye métricas medibles y realistas (tiempos en segundos, número de usuarios, porcentajes) que permiten su validación objetiva.
- 🧪 Se presentan ejemplos concretos basados en los escenarios descritos en las entrevistas (ej. psicólogo en sesión, agendamiento por celular) para facilitar su comprensión.
- 🔍 Los requisitos pueden ser evaluados mediante pruebas técnicas (pruebas de carga, análisis de seguridad, revisión de código, pruebas de compatibilidad) antes y después del despliegue del sistema.
