# 📐 Wireframes - Sistema EHR

## 📋 Descripción

Este documento contiene los wireframes de baja fidelidad para todas las pantallas principales del Sistema de Registro de Salud Electrónico. Los wireframes se enfocan en la estructura, flujo y jerarquía de información sin incluir elementos visuales finales.

## 🎯 Objetivo

Definir la arquitectura de información y los flujos de usuario antes de diseñar mockups de alta fidelidad, permitiendo:
- Validación temprana de flujos de usuario
- Identificación de problemas de UX
- Iteración rápida sin inversión en diseño visual
- Comunicación clara con stakeholders

## 🗺️ Mapa de Pantallas

### 1. Autenticación
- **W-01**: Pantalla de Login
- **W-02**: Recuperación de contraseña
- **W-03**: Primer login / Cambio de contraseña

### 2. Dashboard Principal
- **W-04**: Dashboard Administrador
- **W-05**: Dashboard Psicólogo
- **W-06**: Dashboard Enfermero
- **W-07**: Dashboard Recepcionista

### 3. Gestión de Pacientes
- **W-08**: Lista de pacientes
- **W-09**: Búsqueda y filtros de pacientes
- **W-10**: Perfil de paciente (vista general)
- **W-11**: Registro de nuevo paciente
- **W-12**: Edición de datos del paciente
- **W-13**: Historial médico completo

### 4. Gestión de Citas
- **W-14**: Calendario de citas (vista mensual)
- **W-15**: Calendario de citas (vista semanal)
- **W-16**: Calendario de citas (vista diaria)
- **W-17**: Agendar nueva cita
- **W-18**: Reprogramar cita existente
- **W-19**: Lista de espera
- **W-20**: Confirmación de citas

### 5. Expediente Médico
- **W-21**: Vista de expediente completo
- **W-22**: Registro de nueva sesión (Psicología)
- **W-23**: Registro de procedimiento (Enfermería)
- **W-24**: Evaluaciones psicométricas
- **W-25**: Diagnósticos y tratamientos
- **W-26**: Notas de evolución

### 6. Gestión de Medicamentos
- **W-27**: Lista de medicamentos
- **W-28**: Registro de administración
- **W-29**: Historial de medicamentos por paciente
- **W-30**: Alertas y recordatorios

### 7. Interconsultas
- **W-31**: Lista de interconsultas
- **W-32**: Crear nueva interconsulta
- **W-33**: Detalle de interconsulta
- **W-34**: Responder interconsulta

### 8. Reportes
- **W-35**: Generación de reportes
- **W-36**: Vista previa de reporte
- **W-37**: Estadísticas generales
- **W-38**: Exportación de datos

### 9. Administración
- **W-39**: Gestión de usuarios
- **W-40**: Roles y permisos
- **W-41**: Configuración del sistema
- **W-42**: Logs de auditoría

### 10. Notificaciones
- **W-43**: Centro de notificaciones
- **W-44**: Configuración de notificaciones

---

## W-01: Pantalla de Login

### Descripción
Pantalla de inicio de sesión para acceder al sistema EHR.

### Elementos Principales
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [LOGO EHR SYSTEM]                  │
│                                                 │
│     Sistema de Registro de Salud Electrónico   │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 👤 Matrícula o Usuario                    │ │
│  │ ___________________________________      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 🔒 Contraseña                             │ │
│  │ ___________________________________      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [☐] Recordar mi sesión                        │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      [ Iniciar Sesión ]                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│          ¿Olvidaste tu contraseña?             │
│                                                 │
│  ─────────────────────────────────────────────  │
│  Sistema cumple con estándares HIPAA           │
└─────────────────────────────────────────────────┘
```

### Elementos
1. **Logo del sistema** - Identidad visual
2. **Campo de usuario** - Matrícula o nombre de usuario
3. **Campo de contraseña** - Entrada segura
4. **Checkbox "Recordar"** - Mantener sesión
5. **Botón "Iniciar Sesión"** - Acción principal
6. **Link "Olvidaste contraseña"** - Recuperación
7. **Aviso HIPAA** - Cumplimiento legal

### Flujo de Usuario
1. Usuario ingresa credenciales
2. Sistema valida datos
3. Si válido → Redirige a Dashboard
4. Si inválido → Muestra error
5. Si primer login → W-03 (Cambio de contraseña)

### Validaciones
- Campos requeridos no vacíos
- Formato de matrícula válido
- Contraseña mínimo 8 caracteres
- Máximo 3 intentos fallidos → Bloqueo temporal

---

## W-04: Dashboard Administrador

### Descripción
Panel principal para el rol de Administrador con vista general del sistema.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Admin ▼    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Dashboard - Administrador                                │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 👥 Pacientes │ │ 📅 Citas Hoy │ │ 👨‍⚕️ Usuarios │        │
│  │              │ │              │ │              │        │
│  │    1,234     │ │      45      │ │      28      │        │
│  │  +12 este mes│ │  3 pendientes│ │  3 en línea  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 💊 Medicamen.│ │ 🔄 Interconsul│ │ ⚠️ Alertas   │        │
│  │              │ │              │ │              │        │
│  │     156      │ │      8       │ │      3       │        │
│  │  23 por caducar│ │  2 urgentes  │ │  Requieren acción│   │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📈 Estadísticas del Sistema                          │   │
│  │                                                      │   │
│  │  [Gráfica de Citas - Últimos 7 días]                │   │
│  │  ████████████                                        │   │
│  │  ████████████████                                    │   │
│  │  Mon Tue Wed Thu Fri Sat Sun                         │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────┐ ┌────────────────────────────────┐  │
│  │ 📋 Actividad Reciente│ │ ⚙️ Acciones Rápidas          │  │
│  │                    │ │                              │  │
│  │ • Usuario creado   │ │ [+] Crear Usuario            │  │
│  │ • Cita agendada    │ │ [📊] Ver Reportes            │  │
│  │ • Paciente nuevo   │ │ [⚙️] Configuración           │  │
│  │ • Backup realizado │ │ [🔒] Logs de Auditoría       │  │
│  │                    │ │                              │  │
│  └────────────────────┘ └────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes
1. **Barra de Navegación Superior**
   - Menú hamburguesa
   - Búsqueda global
   - Notificaciones
   - Perfil de usuario

2. **Cards de Métricas** (6 total)
   - Pacientes totales
   - Citas del día
   - Usuarios activos
   - Medicamentos
   - Interconsultas
   - Alertas

3. **Gráfica de Estadísticas**
   - Visualización de citas por día
   - Filtros de fecha

4. **Actividad Reciente**
   - Lista de últimas acciones en el sistema

5. **Acciones Rápidas**
   - Botones de acceso rápido a funciones comunes

---

## W-08: Lista de Pacientes

### Descripción
Pantalla para visualizar, buscar y filtrar todos los pacientes del sistema.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  👥 Gestión de Pacientes                                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar: _________________________    [+ Nuevo Paciente]│
│  │                                                          │
│  │ Filtros: [Todos ▼] [Carrera ▼] [Estado ▼] [Más ▼]      │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Matrícula │ Nombre          │ Edad│ Carrera │ Estado   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 2021001   │ García Luna Ana │ 20  │ ISC     │ Activo [⋮]│ │
│  │ 2021015   │ López Pérez Juan│ 22  │ IIA     │ Activo [⋮]│ │
│  │ 2020892   │ Martínez R. María│ 19 │ LAE     │ Activo [⋮]│ │
│  │ 2021034   │ Hernández S. Luis│ 21 │ ISC     │ Inactivo[⋮]│ │
│  │ 2020765   │ Rodríguez P. Sofia│ 23│ IIA     │ Activo [⋮]│ │
│  │           │                 │     │         │          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 1-5 de 1,234 pacientes                           │
│  [◀ Anterior] [1] [2] [3] ... [247] [Siguiente ▶]           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes
1. **Barra de Búsqueda**
   - Campo de texto para búsqueda en tiempo real
   - Busca por: matrícula, nombre, carrera

2. **Botón "Nuevo Paciente"**
   - Acceso rápido a W-11

3. **Filtros**
   - Estado (Activo/Inactivo)
   - Carrera
   - Rango de edad
   - Fecha de registro

4. **Tabla de Pacientes**
   - Columnas: Matrícula, Nombre, Edad, Carrera, Estado
   - Ordenable por columnas
   - Menú de acciones por fila (⋮)

5. **Paginación**
   - Navegación entre páginas
   - Selector de items por página

### Acciones por Fila (⋮)
- Ver perfil completo → W-10
- Editar información → W-12
- Agendar cita → W-17
- Ver historial → W-13
- Desactivar/Activar paciente

---

## W-14: Calendario de Citas (Vista Mensual)

### Descripción
Vista de calendario para gestionar todas las citas del departamento.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📅 Gestión de Citas                                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [◀] Febrero 2026 [▶]     Vista: [Mes▼] [Semana] [Día] │  │
│  │                                                [+ Nueva Cita]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Dom │ Lun │ Mar │ Mie │ Jue │ Vie │ Sab │              │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │              │  │
│  │     │ 🔵🔵│ 🔵  │ 🔵🔵│ 🔵🔵│ 🔵  │     │              │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  8  │  9  │ 10  │ 11  │ 12  │ 13  │ 14  │              │  │
│  │     │ 🔵  │ 🔵🔵│ 🔵🔵│ 🔵🔵│ 🔵  │     │              │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 15  │ 16  │ 17  │ 18  │ 19  │ 20  │ 21  │              │  │
│  │     │ 🔵🔵│ 🔵🔵│ 🔵🔵│ 🔵  │ 🔵  │     │              │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 22  │ 23  │ 24  │ 25  │ 26  │ 27  │ 28  │              │  │
│  │     │ 🔵🔵│ 🔵  │ 🔵🔵│ 🔵🔵│ 🔵  │     │              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Leyenda: 🔵 Psicología  🟢 Enfermería  🔴 Urgente      │  │
│  │         ⚪ Disponible  ⚫ Ocupado                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Citas del día seleccionado: 23 de Febrero             │  │
│  │                                                        │  │
│  │ 09:00 - García Luna Ana - Psicología - Dra. Méndez    │  │
│  │ 10:00 - López Pérez Juan - Psicología - Dra. Méndez   │  │
│  │ 11:00 - Martínez R. María - Enfermería - Enf. Torres  │  │
│  │ 12:00 - [Disponible]                                  │  │
│  │ 13:00 - Hernández S. Luis - Psicología - Dra. Méndez  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes
1. **Selector de Fecha**
   - Navegación mensual (◀ ▶)
   - Selector de mes/año

2. **Selector de Vista**
   - Mes (W-14)
   - Semana (W-15)
   - Día (W-16)

3. **Botón "Nueva Cita"**
   - Acceso rápido a W-17

4. **Calendario Visual**
   - Grid de 7x5 (semanas x días)
   - Indicadores de citas por día
   - Código de colores por tipo

5. **Lista de Citas del Día**
   - Horario
   - Paciente
   - Tipo de consulta
   - Profesional asignado

6. **Leyenda**
   - Código de colores explicado

### Interacciones
- Click en día → Muestra citas del día
- Click en cita → Ver detalles → W-18
- Drag & drop para mover citas (opcional)

---

## W-21: Vista de Expediente Completo

### Descripción
Visualización completa del expediente médico de un paciente.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Pacientes]                                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 👤 García Luna Ana                  Matrícula: 2021001  │  │
│  │ 20 años • ISC • Activo                                  │  │
│  │ [📝 Editar] [📅 Nueva Cita] [📋 Nueva Sesión]          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────┬──────────────────────────────────────────────────┐  │
│  │Info │ 📋 Datos Generales                               │  │
│  │Hist │ ┌──────────────────────────────────────────────┐ │  │
│  │Cita │ │ Nombre: García Luna Ana                      │ │  │
│  │Eval │ │ Fecha de Nacimiento: 15/03/2004             │ │  │
│  │Diag │ │ Estado Civil: Soltera                       │ │  │
│  │Meds │ │ Teléfono: 999-123-4567                      │ │  │
│  │Docs │ │ Tutor: García Sánchez Roberto               │ │  │
│  │     │ │ Tel. Tutor: 999-987-6543                    │ │  │
│  │     │ │ Carrera: Ingeniería en Sistemas             │ │  │
│  │     │ │ Grupo: 5°A                                  │ │  │
│  │     │ └──────────────────────────────────────────────┘ │  │
│  │     │                                                  │  │
│  │     │ 📋 Motivo de Consulta Inicial                   │  │
│  │     │ ┌──────────────────────────────────────────────┐ │  │
│  │     │ │ Ansiedad relacionada con carga académica...  │ │  │
│  │     │ └──────────────────────────────────────────────┘ │  │
│  │     │                                                  │  │
│  │     │ 📋 Antecedentes                                 │  │
│  │     │ ┌──────────────────────────────────────────────┐ │  │
│  │     │ │ • Familiares: Trastorno de ansiedad (madre) │ │  │
│  │     │ │ • Personales: Ninguno reportado             │ │  │
│  │     │ │ • Alergias: Ninguna                         │ │  │
│  │     │ └──────────────────────────────────────────────┘ │  │
│  └─────┴──────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Navegación por Pestañas (Lateral)
1. **Info**: Datos generales del paciente
2. **Historial**: Sesiones y notas de evolución → W-26
3. **Citas**: Historial de citas pasadas y futuras
4. **Evaluaciones**: Pruebas psicométricas → W-24
5. **Diagnósticos**: Diagnósticos DSM-5/CIE-10 → W-25
6. **Medicamentos**: Historial de medicación → W-29
7. **Documentos**: Archivos adjuntos y reportes

### Acciones Rápidas
- **Editar**: Modificar datos del paciente → W-12
- **Nueva Cita**: Agendar cita → W-17
- **Nueva Sesión**: Registrar sesión → W-22

---

## W-22: Registro de Nueva Sesión (Psicología)

### Descripción
Formulario para documentar una sesión terapéutica.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Expediente]                                     │
│                                                              │
│  📝 Nueva Sesión - García Luna Ana (2021001)                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Información de la Sesión                            │  │
│  │                                                        │  │
│  │ Fecha: [13/02/2026 ▼]    Hora: [10:00 ▼]             │  │
│  │                                                        │  │
│  │ Tipo de Sesión:                                       │  │
│  │ [☑] Individual  [ ] Grupal  [ ] Familiar  [ ] Pareja  │  │
│  │                                                        │  │
│  │ Duración: [50 min ▼]                                  │  │
│  │                                                        │  │
│  │ Número de Sesión: [5]    Estado: [Completada ▼]      │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Notas de Evolución                                  │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ La paciente reporta mejoría en su nivel de        │ │  │
│  │ │ ansiedad. Se observa mayor capacidad para...      │ │  │
│  │ │                                                    │ │  │
│  │ │ [Área de texto expandible]                        │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📊 Avances y Objetivos                                 │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ • Objetivo 1: Reducir ansiedad [▓▓▓▓▓▓░░░░] 60%   │ │  │
│  │ │ • Objetivo 2: Mejorar sueño    [▓▓▓▓▓▓▓▓░░] 80%   │ │  │
│  │ │                                                    │ │  │
│  │ │ [+ Agregar Objetivo]                              │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✅ Tareas Asignadas                                    │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ • Registro diario de emociones                    │ │  │
│  │ │ • Ejercicios de respiración 2x día               │ │  │
│  │ │                                                    │ │  │
│  │ │ [+ Agregar Tarea]                                 │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🗒️ Observaciones Generales                             │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ [Área de texto para observaciones adicionales]    │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Próxima Sesión Sugerida: [20/02/2026 ▼] [10:00 ▼] │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar Borrador]  [Guardar y Finalizar]│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Secciones del Formulario
1. **Información de la Sesión**
   - Fecha y hora
   - Tipo (Individual/Grupal/Familiar/Pareja)
   - Duración
   - Número de sesión
   - Estado

2. **Notas de Evolución**
   - Editor de texto enriquecido
   - Descripción narrativa de la sesión

3. **Avances y Objetivos**
   - Lista de objetivos terapéuticos
   - Barras de progreso
   - Agregar/editar objetivos

4. **Tareas Asignadas**
   - Lista de tareas para el paciente
   - Agregar/editar tareas

5. **Observaciones Generales**
   - Notas adicionales

6. **Próxima Sesión**
   - Sugerencia de fecha/hora
   - Opcional

### Botones de Acción
- **Cancelar**: Descarta cambios
- **Guardar Borrador**: Guarda sin completar
- **Guardar y Finalizar**: Guarda y marca como completada

---

## 📝 Notas de Implementación

### Convenciones de Wireframes
- **[Texto]**: Botones y elementos interactivos
- **___**: Campos de entrada de texto
- **[▼]**: Dropdowns/selects
- **[☑]**: Checkboxes seleccionados
- **[ ]**: Checkboxes no seleccionados
- **🔵🟢🔴**: Indicadores visuales con color
- **⋮**: Menú de acciones

### Prioridades de Diseño
1. **Alta Prioridad**: W-01, W-04-07, W-08, W-14, W-21, W-22
2. **Media Prioridad**: W-10-13, W-17-20, W-23-26, W-31-34
3. **Baja Prioridad**: W-35-44

### Próximos Pasos
1. Validar wireframes con stakeholders
2. Realizar pruebas de usabilidad con wireframes
3. Iterar basado en feedback
4. Proceder a mockups de alta fidelidad

---

## 🔗 Referencias

- [Material Design Layout Guidelines](https://material.io/design/layout)
- [Healthcare UI Patterns](https://ui-patterns.com/patterns/healthcare)
- [Form Design Best Practices](https://www.nngroup.com/articles/web-form-design/)
- [Dashboard Design Patterns](https://uxplanet.org/dashboard-design-patterns-402d6ecb79f0)

## ✅ Estado de Wireframes

- [x] W-01: Login - Completo
- [x] W-04: Dashboard Administrador - Completo
- [x] W-08: Lista de Pacientes - Completo
- [x] W-14: Calendario Mensual - Completo
- [x] W-21: Expediente Completo - Completo
- [x] W-22: Registro Sesión - Completo
- [ ] W-05-07: Otros Dashboards
- [ ] W-09-13: Resto de Gestión de Pacientes
- [ ] W-15-20: Resto de Gestión de Citas
- [ ] W-23-30: Medicamentos y Procedimientos
- [ ] W-31-34: Interconsultas
- [ ] W-35-44: Reportes y Administración

**Progreso Total**: 6/44 wireframes (13.6%)

---

**Última actualización**: 2026-02-13
**Versión**: 1.0.0
