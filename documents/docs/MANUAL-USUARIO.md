# Manual de usuario — UT-Care (Sistema EHR)

**Universidad Tecnológica Santa Catarina (UTSC)**  
**Versión del documento:** 1.3 · **Producto:** Sistema de Registro de Salud Electrónico — áreas de Enfermería y Psicología

> **Mantenimiento:** Revise el manual cuando cambien pantallas o permisos. Las capturas van identificadas como **Captura 1**, **Captura 2**, etc.; el detalle está en el **Catálogo de capturas** (antes del Anexo A).

---

## 1. Introducción y requisitos del sistema

### 1.1 Propósito del software

Este manual describe **UT-Care**, la aplicación web de la **Universidad Tecnológica Santa Catarina (UTSC)** para el **Sistema de Registro de Salud Electrónico** de los servicios de **enfermería** y **psicología** de la institución.

**UT-Care** centraliza la información clínica y administrativa de la comunidad universitaria atendida: pacientes (estudiantes, docentes, administrativos), citas, sesiones de terapia, expediente clínico, procedimientos, medicamentos, interconsultas entre profesionales, evaluaciones psicométricas, reportes, notificaciones y —según rol— supervisión de personal, calendario, usuarios y auditoría.

Resuelve la necesidad de **registrar, consultar y coordinar** la atención en la UTSC de forma ordenada, con acceso según el rol del profesional o del administrador.

### 1.2 Requisitos técnicos

| Ámbito | Recomendación |
|--------|----------------|
| **Tipo de acceso** | Navegador web (aplicación web; no requiere instalación en el PC del usuario final si la institución ya publica la URL). |
| **Sistema operativo** | Cualquier SO con navegador actualizado (Windows, macOS, Linux, tablet con navegador). |
| **Navegadores** | Últimas versiones estables de **Chrome**, **Edge**, **Firefox** o **Safari**. Evitar navegadores muy antiguos. |
| **Red** | Conexión a la red de la UTSC o VPN, según política de la Universidad Tecnológica Santa Catarina. |
| **Resolución** | Mínimo ~1280×720 recomendado; en móvil/tablet el menú lateral se muestra como panel deslizable. |
| **Backend (solo TI)** | Servidor API + base de datos PostgreSQL operativos; el usuario final solo necesita la URL del front y credenciales. |

**Para quien despliega o desarrolla en local (referencia):** Node.js 18+, API en ejecución (p. ej. `http://localhost:5000`), front con Vite (p. ej. `http://localhost:5173`). Detalle en `ut-care/README.md` y `api/README.md`.

### 1.3 Glosario

| Término | Significado |
|---------|-------------|
| **UTSC** | Universidad Tecnológica Santa Catarina; institución para la que está destinado UT-Care. |
| **EHR / Expediente electrónico** | Historia clínica digital del paciente en el sistema. |
| **Expediente (módulo en UT-Care)** | Vista detallada del historial clínico; acceso restringido a **psicólogo** y **enfermero** (no todo el personal ve el mismo nivel de detalle). |
| **Interconsulta** | Solicitud de opinión o seguimiento entre profesionales o áreas (origen/destino, urgencia, respuesta). |
| **Sesión de terapia** | Registro vinculado al seguimiento psicológico (notas de evolución, estado de ánimo, plan, etc.). |
| **Procedimiento (enfermería)** | Acto o procedimiento de enfermería registrado (tipo, materiales, observaciones). |
| **Rol** | Perfil del usuario (administrador, coordinador, psicólogo, enfermero) que determina qué menús y acciones puede usar. |
| **JWT / Sesión** | Mecanismo técnico de inicio de sesión seguro; si la sesión expira, debe volver a iniciar sesión. |
| **404** | Página o recurso no encontrado en el servidor (URL incorrecta o recurso eliminado). |
| **Validación** | El sistema rechaza datos incompletos o en formato incorrecto antes de guardar. |

---

## 2. Guía de instalación y configuración inicial

### 2.1 Instalación (personal de sistemas / TI)

La **mayoría de usuarios no instalan** el programa: acceden por URL. La instalación aplica al **servidor** o al **entorno de desarrollo**:

1. **Base de datos:** PostgreSQL (p. ej. vía Docker según `api/README.md`).
2. **API:** dependencias, archivo `.env`, migraciones Prisma, seed si aplica.
3. **Frontend (UT-Care):** `npm install`, `.env` con `VITE_API_URL` apuntando a la API.
4. **Producción:** build del front y publicación detrás de HTTPS; API con CORS y URL correctas.

<span style="color:#facc15; font-weight:bold;">[Captura 1]</span> *(insertar aquí; ver catálogo)*

### 2.2 Configuración de cuenta

1. **Usuario y contraseña** los asigna la UTSC (alta en el sistema por el administrador correspondiente).
2. Abra la **URL** del sistema en el navegador.
3. En **Iniciar sesión**, ingrese **correo** y **contraseña**.
4. Opción **Mantener sesión** (si está disponible): reduce cierres de sesión en el mismo equipo; use con precaución en equipos compartidos.
5. **¿Olvidó su contraseña?** En la aplicación se indica contactar al **administrador del sistema** o al **coordinador de departamento** (no hay auto-registro público típico).

### 2.3 Primeros pasos (Quick Start — menos de 5 minutos)

**Objetivo:** entrar, orientarse y abrir un módulo que su rol permita.

1. Inicie sesión con sus credenciales.
2. Verá el **panel de inicio** y la **barra lateral** con los módulos disponibles **para su rol**.
3. Cambie **idioma** o **tema** (claro/oscuro/automático) desde **Ajustes** (icono de engranaje / menú de configuración) si lo necesita.
4. Elija un módulo acorde a su trabajo:
   - **Psicólogo:** p. ej. **Pacientes** → buscar paciente → **Citas** o **Sesiones**.
   - **Enfermero / coord. enfermería:** **Procedimientos**, **Atención de enfermería**, **Medicamentos**, **Pacientes**.
   - **Coordinador psicología:** **Supervisión**, **Pacientes**, **Reportes**, etc.
5. Use **Ayuda** en el menú para recordar el mapa de módulos.

Si no ve un ítem del menú, **no es un error de pantalla**: su **rol** no incluye ese módulo. Consulte la **§ 4** del manual según su rol (administrador, coordinador de psicología/enfermería, psicólogo o enfermero).

---

## 3. Interfaz y navegación

### 3.1 Mapa de la interfaz

| Zona | Función |
|------|---------|
| **Barra lateral (izquierda)** | Navegación principal: inicio, módulos clínicos, reportes, notificaciones, etc. En pantallas pequeñas se abre con el botón de menú (**hamburguesa**). |
| **Cabecera / área superior** | Título de la página, a veces acciones; en móvil, botón para abrir/cerrar el menú lateral. |
| **Área central** | Contenido: listas, formularios, detalles, tablas. |
| **Pie o bloques inferiores** | Paginación, botones **Guardar** / **Cancelar**, enlaces secundarios. |
| **Ajustes / Perfil / Ayuda / Cerrar sesión** | Suele estar al final de la barra lateral o en zona de usuario. |

<span style="color:#facc15; font-weight:bold;">[Captura 2]</span> *(insertar aquí; ver catálogo)*

### 3.2 Iconos principales del menú lateral

Los iconos siguen la convención habitual de la aplicación (Lucide). Referencia rápida:

| Icono / ítem | Significado aproximado |
|--------------|-------------------------|
| **Cuadro/tablero** | **Inicio / Panel** |
| **Estetoscopio** | **Procedimientos** y **Atención de enfermería** |
| **Calendario (días)** | **Calendario** (vista semanal del psicólogo) |
| **Persona + engranaje** | **Supervisión** (coordinación psicología) |
| **Personas** | **Pacientes** |
| **Calendario simple** | **Citas** |
| **Documento** | **Sesiones** de terapia |
| **Lista / portapapeles** | **Evaluaciones** psicométricas |
| **Pastilla** | **Medicamentos** |
| **Bocadillo** | **Interconsultas** |
| **Barras** | **Reportes** |
| **Campana** | **Notificaciones** |
| **Usuarios / ajustes finos** | **Usuarios** (solo administrador) |
| **Portapapeles con check** | **Registros de auditoría** (solo administrador) |
| **Engranaje simple** | **Ajustes** (tema, idioma) |
| **Usuario** | **Mi perfil** |
| **Signo de interrogación** | **Ayuda** |
| **Salida** | **Cerrar sesión** (puede pedir confirmación) |

**Colapsar menú (escritorio):** botón para **contraer** la barra y mostrar solo iconos (más espacio de trabajo).

---

## 4. Guías de tareas **según el rol**

Cada perfil ve **solo los módulos que le corresponden**. Si no aparece una opción en su menú, no podrá seguir esos pasos: es **normal** para su rol.

---

### 4.0 Pasos comunes a **todos los roles**

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Abrir la URL del sistema en el navegador. | Pantalla de inicio de sesión. |
| 2 | Escribir **correo** y **contraseña** → **Iniciar sesión**. | Panel de inicio y menú lateral acorde a su rol. |
| 3 | (Opcional) **Ajustes** → elegir **tema** e **idioma** → guardar si aplica. | Interfaz en el idioma y apariencia elegidos. |
| 4 | (Opcional) **Mi perfil** → editar datos permitidos → **Guardar**. | Perfil actualizado. |
| 5 | Al terminar la jornada: **Cerrar sesión** en el menú lateral. | Vuelta a la pantalla de login. |

---

### 4.1 Rol: **Administrador** (`admin`)

**Enfoque:** cuentas del personal, auditoría y consultas transversales — **no** opera el expediente clínico ni pacientes/citas desde este mismo menú.

#### Menú que verá (referencia)

Inicio, **Interconsultas**, **Reportes**, **Notificaciones**, **Usuarios**, **Registros de auditoría**, **Ajustes**, **Mi perfil**, **Ayuda**, **Cerrar sesión**.

**No verá** (por diseño): Pacientes, Citas, Sesiones, Calendario, Supervisión, Evaluaciones, Procedimientos, Atención de enfermería, Medicamentos.

#### Tareas paso a paso

**Dar de alta o gestionar usuarios del personal**

1. Menú lateral → **Usuarios**.
2. Use las acciones de la pantalla (alta, edición, según lo que ofrezca el formulario).
3. Confirme con **Guardar** o equivalente.
4. **Entrada:** datos que pida el formulario (correo, rol, nombre, etc.). **Salida:** usuario creado o actualizado en el listado.

**Revisar qué acciones se registraron en el sistema**

1. Menú lateral → **Registros de auditoría**.
2. Aplique filtros o paginación si existen.
3. Abra un registro para ver detalle.
4. **Salida:** trazabilidad de operaciones para supervisión institucional.

**Consultar reportes institucionales**

1. **Reportes**.
2. Indique **fecha inicio**, **fecha fin** y **departamento** (si aplica).
3. Pulse **Generar**.
4. **Salida:** estadísticas y tablas; si no hay datos en el período, mensaje informativo.

**Gestionar interconsultas o notificaciones**

1. **Interconsultas** o **Notificaciones** → listar / crear / responder según la pantalla.
2. Complete los campos obligatorios y guarde.

---

### 4.2 Rol: **Coordinador de psicología** (`coordinador_psicologia`)

**Enfoque:** altas de pacientes, supervisión del área de psicología, reportes e interconsultas. **No** tiene módulos de citas, sesiones ni calendario operativo (eso es del psicólogo).

#### Menú que verá (referencia)

Inicio, **Pacientes**, **Supervisión**, **Interconsultas**, **Reportes**, **Notificaciones**, **Ajustes**, **Mi perfil**, **Ayuda**, **Cerrar sesión**.

**No verá:** Citas, Sesiones, Calendario (propio del psicólogo), Evaluaciones, Procedimientos, Atención de enfermería, Medicamentos, Usuarios, Auditoría.

#### Tareas paso a paso

**Registrar un paciente nuevo**

1. **Pacientes** → **Nuevo paciente**.
2. Complete tipo (estudiante/docente/administrativo), carrera, matrícula, correo, datos personales según el formulario.
3. **Guardar**.
4. **Salida:** paciente en el listado; puede buscarlo después por nombre, correo o matrícula.

**Buscar o revisar ficha de paciente**

1. **Pacientes** → escriba en el buscador (nombre, correo, matrícula).
2. Pulse en el paciente para abrir la ficha.
3. **Nota:** el **expediente clínico completo** no está disponible para este rol; la vista es la que el sistema muestra para coordinación (historial acotado).

**Editar datos de un paciente**

1. **Pacientes** → abrir paciente → **Editar** (si está visible).
2. Ajuste campos → **Guardar**.

**Desactivar paciente (si su flujo lo permite)**

1. Solo coordinadores pueden eliminar/desactivar según reglas del sistema.
2. Desde la ficha o listado, use la acción indicada y confirme.

**Supervisar al personal de psicología**

1. **Supervisión**.
2. Navegue por las subsecciones (p. ej. psicólogos, progreso, calendario de supervisión, analíticas).
3. **Salida:** información agregada para coordinación del área.

**Interconsultas**

1. **Interconsultas** → **Nueva interconsulta**.
2. Paciente, departamento origen/destino, motivo, urgencia, información relevante.
3. **Guardar**. Para responder una recibida: abra el detalle → **Añadir respuesta**.

**Reportes**

1. **Reportes** → rango de fechas y departamento → **Generar**.

---

### 4.3 Rol: **Coordinador de enfermería** (`coordinador_enfermeria`)

**Enfoque:** altas de pacientes, procedimientos, atención de enfermería, medicamentos, reportes e interconsultas. **No** opera citas, sesiones ni evaluaciones psicométricas.

#### Menú que verá (referencia)

Inicio, **Procedimientos**, **Atención de enfermería**, **Pacientes**, **Medicamentos**, **Interconsultas**, **Reportes**, **Notificaciones**, **Ajustes**, **Mi perfil**, **Ayuda**, **Cerrar sesión**.

**No verá:** Citas, Sesiones, Calendario, Supervisión, Evaluaciones, Usuarios, Auditoría.

#### Tareas paso a paso

**Registrar un paciente nuevo**

1. **Pacientes** → **Nuevo paciente** → complete el formulario → **Guardar**.

**Buscar paciente y editar datos**

1. **Pacientes** → buscar → abrir ficha → **Editar** → **Guardar**.

**Registrar un procedimiento de enfermería**

1. **Procedimientos** → **Nuevo procedimiento** (o equivalente).
2. Seleccione paciente, tipo, fecha, materiales, observaciones según pantalla.
3. **Guardar**.
4. **Salida:** procedimiento en listado y en detalle.

**Atender en consulta de enfermería**

1. **Atención de enfermería**.
2. Siga el flujo de la pantalla (selección de paciente, notas de consulta, etc.).
3. **Guardar** al finalizar cada bloque que el sistema pida.

**Gestionar medicamentos (catálogo / registros)**

1. **Medicamentos** → listar, **Nuevo medicamento** o abrir detalle según necesidad.
2. Complete nombre, vías, dosis, etc., según formulario → **Guardar**.

**Interconsultas y reportes**

1. Igual que en coordinador de psicología (secciones **Interconsultas** y **Reportes**).

---

### 4.4 Rol: **Psicólogo** (`psicologo`)

**Enfoque:** pacientes, **citas**, **sesiones de terapia**, **calendario semanal**, **evaluaciones psicométricas**, **expediente clínico** del paciente. **No** da de alta pacientes nuevos ni accede a supervisión ni a módulos de enfermería (procedimientos, medicamentos, atención enfermería).

#### Menú que verá (referencia)

Inicio, **Pacientes**, **Citas**, **Sesiones**, **Calendario**, **Evaluaciones**, **Interconsultas**, **Reportes**, **Notificaciones**, **Ajustes**, **Mi perfil**, **Ayuda**, **Cerrar sesión**.

#### Tareas paso a paso

**Buscar paciente y abrir expediente**

1. **Pacientes** → buscar por nombre, correo o matrícula.
2. Abrir la ficha del paciente.
3. Entrar a **Expediente** (historial clínico completo según permisos de psicología).
4. **Salida:** consulta/registro según las pestañas del expediente.

**Editar datos básicos del paciente (si aplica)**

1. Desde la ficha → **Editar** → ajuste → **Guardar**.  
2. **No** podrá usar **Nuevo paciente** (solo coordinadores).

**Crear y gestionar citas**

1. **Citas** → **Nueva cita**.
2. Elija paciente, fecha y hora, tipo, departamento, duración, notas si aplica.
3. **Guardar**.
4. En **Citas** → abrir una cita → cambiar **estado** (programada, confirmada, completada, cancelada, no asistió) o añadir notas / motivo de cancelación.

**Registrar sesión de terapia**

1. **Sesiones** → **Nueva sesión**.
2. Paciente, fecha, duración, estado de ánimo, notas de evolución, progreso, tareas asignadas, observaciones, plan para próxima sesión.
3. **Guardar**.
4. **Sesiones** → listado → abrir sesión para consultar o completar datos.

**Organizar la semana en calendario**

1. **Calendario** → revise la vista semanal de sus citas/sesiones según lo muestre el sistema.
2. Use la navegación entre semanas si existe.

**Registrar evaluación psicométrica**

1. **Evaluaciones** → **Nueva evaluación**.
2. Tipo de evaluación, fecha, puntuaciones, percentil, interpretación, ID o enlace al expediente de psicología del paciente, archivo si aplica.
3. **Guardar**.
4. Listado → detalle; eliminar solo si el sistema lo permite y con confirmación.

**Interconsultas y reportes**

1. **Interconsultas** / **Reportes** como en los apartados anteriores.

---

### 4.5 Rol: **Enfermero** (`enfermero`)

**Enfoque:** pacientes (consulta y edición, **sin** alta de nuevos), **expediente** para atención de enfermería, **procedimientos**, **atención de enfermería**, **medicamentos**. **No** citas, sesiones, calendario ni evaluaciones psicométricas.

#### Menú que verá (referencia)

Inicio, **Procedimientos**, **Atención de enfermería**, **Pacientes**, **Medicamentos**, **Interconsultas**, **Reportes**, **Notificaciones**, **Ajustes**, **Mi perfil**, **Ayuda**, **Cerrar sesión**.

#### Tareas paso a paso

**Buscar paciente y abrir expediente**

1. **Pacientes** → buscar.
2. Abrir ficha → **Expediente** para registrar o consultar atención de enfermería vinculada al historial.

**Actualizar datos del paciente**

1. Ficha → **Editar** → **Guardar**.  
2. **No** verá **Nuevo paciente**.

**Procedimientos, atención y medicamentos**

1. Mismos flujos que en **coordinador de enfermería** (apartado 4.3), salvo que el coordinador es quien suele dar el alta masiva de pacientes; el enfermero se centra en atención diaria.

**Interconsultas y reportes**

1. Igual que en otros roles con acceso a esos menús.

---

### 4.6 Tabla resumen: quién puede hacer qué

| Acción | Admin | Coord. psicología | Coord. enfermería | Psicólogo | Enfermero |
|--------|:-----:|:-----------------:|:-----------------:|:---------:|:---------:|
| Usuarios / auditoría | ✓ | — | — | — | — |
| Supervisión (psicología) | — | ✓ | — | — | — |
| Nuevo paciente | — | ✓ | ✓ | — | — |
| Editar paciente | — | ✓ | ✓ | ✓ | ✓ |
| Expediente clínico completo | — | — | — | ✓ | ✓ |
| Citas (incl. nueva cita) | — | — | — | ✓ | — |
| Sesiones / Calendario semanal | — | — | — | ✓ | — |
| Evaluaciones psicométricas | — | — | — | ✓ | — |
| Procedimientos / Atención enf. / Medicamentos | — | — | ✓ | — | ✓ |
| Interconsultas / Reportes / Notificaciones | ✓ | ✓ | ✓ | ✓ | ✓ |
| Panel inicio (resúmenes) | ✓ | ✓ | ✓ | ✓ | ✓ |

*(✓ = tiene acceso al módulo o acción según la configuración actual del sistema.)*

---

## 5. Resolución de problemas (Troubleshooting)

### 5.1 Mensajes y situaciones frecuentes

| Situación | Qué significa | Qué hacer |
|-----------|----------------|-----------|
| **Credenciales inválidas** | Correo o contraseña incorrectos, o usuario desactivado. | Verificar mayúsculas; usar “¿Olvidaste contraseña?” / contactar administrador. |
| **Acceso no autorizado** | Intentó abrir una URL o módulo no permitido para su rol. | Use solo los ítems del menú lateral; si cree que debería tener acceso, contacte a su coordinador. |
| **Página en blanco o no carga** | Fallo de red, API caída o error del navegador. | Recargar; probar otro navegador; comprobar VPN/red; avisar a sistemas. |
| **404** | Enlace antiguo o URL mal escrita. | Entrar por la URL oficial del sistema y navegar desde el menú. |
| **Error al guardar / validación** | Faltan campos obligatorios o formato inválido (fechas, correos, etc.). | Lea los mensajes junto a los campos; complete lo solicitado. |
| **Sesión cerrada sola** | Tiempo de expiración o cierre en otro dispositivo. | Vuelva a **Iniciar sesión**. |
| **Cargando… indefinido** | La API no responde o es lenta. | Esperar; si persiste, reportar a soporte con hora y pantalla. |

### 5.2 Preguntas frecuentes (FAQ)

**P: ¿Por qué no veo “Citas” o “Sesiones”?**  
R: Esos módulos están pensados principalmente para **psicólogo**. Coordinadores de enfermería y otros roles tienen otros menús.

**P: ¿Por qué no puedo crear un paciente?**  
R: Solo **coordinadores** de psicología o enfermería pueden dar de alta pacientes nuevos.

**P: ¿Dónde está el expediente completo?**  
R: En la ficha del paciente, ruta de **expediente**; solo **psicólogo** y **enfermero** acceden al expediente clínico completo.

**P: ¿Puedo usar el sistema en el móvil?**  
R: Sí, es web responsive; el menú se abre como panel lateral.

**P: ¿Cambió el idioma y sigo viendo algo en otro idioma?**  
R: Parte del contenido puede venir de datos guardados en base de datos (no traducidos automáticamente). La interfaz sigue el idioma seleccionado en Ajustes.

### 5.3 Canales de soporte

1. **Coordinación de Psicología o Enfermería de la UTSC**: permisos, flujos clínicos y dudas de uso.  
2. **Administrador del sistema / TI de la Universidad Tecnológica Santa Catarina**: cuentas, contraseñas, errores técnicos, disponibilidad del servicio.  
3. **Documentación técnica** (equipo de desarrollo o sistemas): `api/README.md`, `ut-care/README.md`, Swagger/OpenAPI si está expuesto.

---

## Catálogo de capturas

Use este listado para nombrar archivos, versionar y saber **dónde va cada imagen** en el manual o en anexos PDF.

| Nº | Ubicación en el manual | Qué debe mostrar la imagen | Nombre de archivo sugerido |
|----|-------------------------|----------------------------|----------------------------|
| <span style="color:#facc15; font-weight:bold;">[Captura 1]</span> | § 2.1 (después del párrafo de instalación/TI) | Pantalla de **inicio de sesión** en el entorno real (producción o staging), idealmente con anotación breve si hace falta. | `UT-CARE-cap-01-login.png` |
| <span style="color:#facc15; font-weight:bold;">[Captura 2]</span> | § 3.1 (después de la tabla del mapa de interfaz) | **Vista completa** de la app ya autenticada: barra lateral, cabecera, área central; flechas o leyendas señalando cada zona. | `UT-CARE-cap-02-layout-interfaz.png` |
| <span style="color:#facc15; font-weight:bold;">[Captura 3]</span> | *(opcional — § 4.1)* | Panel de **administrador**: menú lateral visible (usuarios, auditoría, sin módulos clínicos). | `UT-CARE-cap-03-rol-admin.png` |
| <span style="color:#facc15; font-weight:bold;">[Captura 4]</span> | *(opcional — § 4.2)* | **Coordinador psicología**: pantalla **Supervisión** o listado **Pacientes** con botón Nuevo paciente. | `UT-CARE-cap-04-rol-coord-psicologia.png` |
| <span style="color:#facc15; font-weight:bold;">[Captura 5]</span> | *(opcional — § 4.3)* | **Coordinador enfermería**: **Atención de enfermería** o **Procedimientos** (flujo típico). | `UT-CARE-cap-05-rol-coord-enfermeria.png` |
| <span style="color:#facc15; font-weight:bold;">[Captura 6]</span> | *(opcional — § 4.4)* | **Psicólogo**: **Nueva cita** o **Calendario** semanal. | `UT-CARE-cap-06-rol-psicologo.png` |
| <span style="color:#facc15; font-weight:bold;">[Captura 7]</span> | *(opcional — § 4.5)* | **Enfermero**: **Expediente** de paciente desde enfermería (vista permitida). | `UT-CARE-cap-07-rol-enfermero.png` |
| <span style="color:#facc15; font-weight:bold;">[Captura 8]</span> | *(opcional — § 5)* | Mensaje de **acceso no autorizado** o error de validación (para troubleshooting). | `UT-CARE-cap-08-acceso-error.png` |

**Convención:** mantenga el prefijo `UT-CARE-cap-NN-` y añada versión si publica varias (`UT-CARE-cap-02-v2-layout.png`). Las capturas **3–8** son recomendadas: puede insertarlas en las secciones indicadas y añadir en el texto una línea **→ Captura N** igual que en § 2.1 y § 3.1.

---

## Anexo A — Índice por rol

| Rol (código) | Guía paso a paso en el manual |
|--------------|-------------------------------|
| **admin** | § 4.1 Administrador |
| **coordinador_psicologia** | § 4.2 Coordinador de psicología |
| **coordinador_enfermeria** | § 4.3 Coordinador de enfermería |
| **psicologo** | § 4.4 Psicólogo |
| **enfermero** | § 4.5 Enfermero |

**Pasos comunes (login, perfil, ajustes):** § 4.0. **Matriz de permisos:** § 4.6.

*Si cambia el código de roles o el menú, actualice las secciones 4 y 4.6 junto con `ut-care/src/constants/roles.ts`.*

---

## Anexo B — Checklist para actualizar el manual

- [ ] Revisar **Catálogo de capturas** (1–8): actualizar imágenes si cambió la UI; renumerar el catálogo si se añaden capturas nuevas.  
- [ ] Revisar permisos por rol si se modificó `roles.ts` o reglas de negocio.  
- [ ] Añadir nuevas pantallas (rutas en `App.tsx`).  
- [ ] Actualizar FAQ con dudas reales del periodo de prueba o mesa de ayuda.  
- [ ] Incrementar versión y fecha al pie de este documento.

---

*Fin del manual de usuario — UT-Care (EHR) · Universidad Tecnológica Santa Catarina.*
