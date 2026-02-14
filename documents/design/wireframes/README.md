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

## W-02: Recuperación de Contraseña

### Descripción
Pantalla para que los usuarios puedan recuperar su contraseña olvidada.

### Elementos Principales
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [LOGO EHR SYSTEM]                  │
│                                                 │
│          Recuperación de Contraseña             │
│                                                 │
│  Ingresa tu matrícula o correo electrónico     │
│  para recuperar tu contraseña.                 │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 📧 Matrícula o Correo                     │ │
│  │ ___________________________________      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      [ Enviar Instrucciones ]           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│          ← Volver a Iniciar Sesión             │
│                                                 │
│  ─────────────────────────────────────────────  │
│  Se enviará un correo con instrucciones        │
│  para restablecer tu contraseña                │
└─────────────────────────────────────────────────┘
```

### Elementos
1. **Logo del sistema** - Identidad visual
2. **Título** - Recuperación de Contraseña
3. **Texto explicativo** - Instrucciones claras
4. **Campo de entrada** - Matrícula o correo
5. **Botón "Enviar Instrucciones"** - Acción principal
6. **Link "Volver"** - Regresa a W-01
7. **Nota informativa** - Explicación del proceso

### Flujo de Usuario
1. Usuario ingresa matrícula o correo
2. Sistema valida que el usuario existe
3. Si válido → Envía correo con link temporal
4. Muestra mensaje de confirmación
5. Usuario recibe correo con link a W-03

### Validaciones
- Campo no vacío
- Formato de correo válido (si se ingresa correo)
- Usuario debe existir en el sistema
- Límite de 3 solicitudes por hora

---

## W-03: Primer Login / Cambio de Contraseña

### Descripción
Pantalla para cambiar contraseña (primer login o recuperación).

### Elementos Principales
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [LOGO EHR SYSTEM]                  │
│                                                 │
│            Cambio de Contraseña                 │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 👤 Usuario: garcia.luna@institución.edu   │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 🔒 Contraseña Actual                      │ │
│  │ ___________________________________      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 🔒 Nueva Contraseña                       │ │
│  │ ___________________________________      │ │
│  │ Fortaleza: [▓▓▓░░░░░] Media              │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 🔒 Confirmar Nueva Contraseña             │ │
│  │ ___________________________________      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Requisitos de contraseña:                     │
│  ✓ Mínimo 8 caracteres                         │
│  ✓ Al menos 1 mayúscula                        │
│  ✓ Al menos 1 número                           │
│  ✓ Al menos 1 carácter especial                │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      [ Cambiar Contraseña ]             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Elementos
1. **Logo del sistema** - Identidad visual
2. **Usuario identificado** - Solo lectura
3. **Campo contraseña actual** - Verificación (opcional en primer login)
4. **Campo nueva contraseña** - Con indicador de fortaleza
5. **Campo confirmar contraseña** - Validación
6. **Lista de requisitos** - Checklist visual
7. **Botón "Cambiar Contraseña"** - Acción principal

### Flujo de Usuario
1. Usuario ingresa contraseña actual (si aplica)
2. Ingresa nueva contraseña
3. Sistema valida fortaleza en tiempo real
4. Confirma nueva contraseña
5. Si válido → Actualiza contraseña y redirige a dashboard
6. Si primer login → Redirige directamente sin contraseña actual

### Validaciones
- Contraseña actual correcta (si no es primer login)
- Nueva contraseña cumple requisitos
- Confirmación coincide con nueva contraseña
- Nueva contraseña diferente a las últimas 3 usadas

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

## W-05: Dashboard Psicólogo

### Descripción
Panel principal para psicólogos con información relevante de pacientes y sesiones.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Dr. Méndez▼│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Dashboard - Psicología                                   │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 👥 Pacientes │ │ 📅 Citas Hoy │ │ 📝 Sesiones  │        │
│  │   Activos    │ │              │ │   Mes Actual │        │
│  │      45      │ │      8       │ │      92      │        │
│  │  5 nuevos    │ │  2 pendientes│ │  8 programadas│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 📊 Evaluac.  │ │ ⏰ Lista Esp.│ │ 🔔 Alertas   │        │
│  │  Pendientes  │ │              │ │              │        │
│  │      3       │ │      2       │ │      1       │        │
│  │  2 atrasadas │ │  Para esta sem│ │  Reevaluación│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Agenda del Día - Jueves 13 de Febrero              │  │
│  │                                                        │  │
│  │  09:00 - 09:50 │ García Luna Ana (Sesión 5)          │  │
│  │                │ [Ver Expediente] [Iniciar Sesión]   │  │
│  │                                                        │  │
│  │  10:00 - 10:50 │ López Pérez Juan (Sesión 2)         │  │
│  │                │ [Ver Expediente] [Iniciar Sesión]   │  │
│  │                                                        │  │
│  │  11:00 - 11:50 │ [DISPONIBLE]                        │  │
│  │                │ [Agendar Cita]                       │  │
│  │                                                        │  │
│  │  13:00 - 13:50 │ Hernández S. Luis (Primera cita)    │  │
│  │                │ [Ver Expediente] [Iniciar Sesión]   │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────┐ ┌────────────────────────────────┐│
│  │ 📋 Tareas Pendientes │ │ ⚙️ Acciones Rápidas           ││
│  │                      │ │                               ││
│  │ • Evaluar Beck (3)   │ │ [+] Nueva Sesión              ││
│  │ • Informe mensual    │ │ [📅] Ver Calendario           ││
│  │ • Interconsulta #12  │ │ [👥] Mis Pacientes            ││
│  │                      │ │ [📊] Evaluaciones             ││
│  │                      │ │                               ││
│  └──────────────────────┘ └────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes
1. **Cards de Métricas** (6 total)
   - Pacientes activos
   - Citas del día
   - Sesiones del mes
   - Evaluaciones pendientes
   - Lista de espera
   - Alertas

2. **Agenda del Día**
   - Horarios de citas
   - Información del paciente
   - Accesos rápidos a expediente y sesión

3. **Tareas Pendientes**
   - Lista de actividades por completar

4. **Acciones Rápidas**
   - Navegación rápida a funciones comunes

---

## W-06: Dashboard Enfermero

### Descripción
Panel principal para personal de enfermería con enfoque en procedimientos y medicamentos.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Enf. Torres▼│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Dashboard - Enfermería                                   │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 👥 Pacientes │ │ 📅 Citas Hoy │ │ 💉 Procedim. │        │
│  │   Atendidos  │ │              │ │    Hoy       │        │
│  │      28      │ │      12      │ │      15      │        │
│  │  Este mes: 234│ │  3 pendientes│ │  8 completados│       │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 💊 Medicamen.│ │ 🩹 Curaciones│ │ ⚠️ Alertas   │        │
│  │  Administrados│ │   Pendientes │ │              │        │
│  │      42      │ │      3       │ │      2       │        │
│  │  Hoy: 8      │ │  1 urgente   │ │  Alergias nuevas│      │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Procedimientos del Día                              │  │
│  │                                                        │  │
│  │  ✅ 09:15 │ López Juan - Curación (Completado)        │  │
│  │  ✅ 09:30 │ Martínez María - Toma de signos (Compl.)  │  │
│  │  🔄 10:00 │ Rodríguez Sofia - Inyección IM (Pend.)   │  │
│  │  🔄 11:00 │ Hernández Luis - Curación (Pendiente)    │  │
│  │  ⏰ 12:00 │ García Ana - Evaluación inicial (Prog.)  │  │
│  │                                                        │  │
│  │  [+ Registrar Nuevo Procedimiento]                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────┐ ┌──────────────────────────────────┐│
│  │ 💊 Medicamentos    │ │ ⚙️ Acciones Rápidas             ││
│  │    Programados     │ │                                 ││
│  │                    │ │ [+] Nuevo Procedimiento         ││
│  │ 10:00 - Paraceta.  │ │ [💊] Administrar Medicamento    ││
│  │ 14:00 - Ibuprofeno │ │ [📋] Ver Calendario             ││
│  │ 16:00 - Amoxicilina│ │ [🩹] Curaciones Pendientes      ││
│  │                    │ │                                 ││
│  └────────────────────┘ └──────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes
1. **Cards de Métricas** (6 total)
   - Pacientes atendidos
   - Citas del día
   - Procedimientos del día
   - Medicamentos administrados
   - Curaciones pendientes
   - Alertas

2. **Procedimientos del Día**
   - Lista de procedimientos con estados
   - Acceso rápido a registrar

3. **Medicamentos Programados**
   - Horario de administración

4. **Acciones Rápidas**
   - Funciones más usadas

---

## W-07: Dashboard Recepcionista

### Descripción
Panel principal para recepcionistas enfocado en citas y atención al público.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Recepción▼ │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Dashboard - Recepción                                    │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 👥 Pacientes │ │ 📅 Citas Hoy │ │ ⏰ Sala Esp. │        │
│  │   Registrados│ │              │ │              │        │
│  │    1,234     │ │      45      │ │      7       │        │
│  │  +3 hoy      │ │  38 confirmadas│ │  Pacientes   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 📞 Llamadas  │ │ 📋 Lista Esp.│ │ ⚠️ Alertas   │        │
│  │              │ │              │ │              │        │
│  │      12      │ │      15      │ │      4       │        │
│  │  Hoy         │ │  Total       │ │  Atención    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Citas del Día - Jueves 13 de Febrero               │  │
│  │                                                        │  │
│  │ Hora  │ Paciente           │ Departamento │ Estado    │  │
│  ├───────┼────────────────────┼──────────────┼───────────┤  │
│  │ 09:00 │ García Luna Ana    │ Psicología   │ ✅ Llegó  │  │
│  │ 09:15 │ López Pérez Juan   │ Enfermería   │ ✅ En aten│  │
│  │ 10:00 │ Martínez R. María  │ Psicología   │ ⏰ Espera │  │
│  │ 10:30 │ Hernández S. Luis  │ Enfermería   │ 🔔 Confir │  │
│  │ 11:00 │ Rodríguez P. Sofia │ Psicología   │ 🔔 Confir │  │
│  │ 11:30 │ Sánchez M. Carlos  │ Enfermería   │ ⏰ Program│  │
│  │                                                        │  │
│  │  [Actualizar] [+ Nueva Cita] [Ver Calendario]         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────┐ ┌───────────────────────────────┐ │
│  │ 📋 Tareas Urgentes  │ │ ⚙️ Acciones Rápidas          │ │
│  │                     │ │                              │ │
│  │ • Confirmar 4 citas │ │ [+] Registrar Paciente       │ │
│  │ • Llamar lista esp. │ │ [📅] Agendar Cita            │ │
│  │ • Actualizar datos  │ │ [🔍] Buscar Paciente         │ │
│  │                     │ │ [📞] Lista de Espera         │ │
│  │                     │ │                              │ │
│  └─────────────────────┘ └───────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes
1. **Cards de Métricas** (6 total)
   - Pacientes registrados
   - Citas del día
   - Sala de espera
   - Llamadas
   - Lista de espera
   - Alertas

2. **Tabla de Citas del Día**
   - Hora, paciente, departamento, estado
   - Estados: Llegó, En atención, Esperando, Por confirmar, Programada
   - Botones de acción

3. **Tareas Urgentes**
   - Recordatorios de actividades

4. **Acciones Rápidas**
   - Funciones principales de recepción

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

## W-09: Búsqueda y Filtros de Pacientes

### Descripción
Panel avanzado de búsqueda y filtrado de pacientes.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Búsqueda Avanzada de Pacientes                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Criterios de Búsqueda                               │  │
│  │                                                        │  │
│  │ Matrícula: [___________]  Nombre: [_______________]   │  │
│  │                                                        │  │
│  │ Carrera: [Todas ▼]        Grupo: [Todos ▼]           │  │
│  │                                                        │  │
│  │ Estado: [☑] Activos [☑] Inactivos                     │  │
│  │                                                        │  │
│  │ Edad: De [__] a [__] años                             │  │
│  │                                                        │  │
│  │ Fecha de Registro:                                    │  │
│  │ Desde: [01/01/2024 ▼] Hasta: [13/02/2026 ▼]         │  │
│  │                                                        │  │
│  │ Departamento: [☑] Psicología [☑] Enfermería          │  │
│  │                                                        │  │
│  │ Diagnóstico: [____________________________]           │  │
│  │                                                        │  │
│  │ Tiene citas programadas: [Todos ▼]                    │  │
│  │                                                        │  │
│  │     [Limpiar Filtros]  [🔍 Buscar]                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📊 Resultados: 234 pacientes encontrados              │  │
│  │                                                        │  │
│  │ Ordenar por: [Nombre ▼]  Exportar: [CSV] [PDF] [Excel]│
│  │                                                        │  │
│  │ Matrícula │ Nombre          │ Edad│ Carrera │ Estado  │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 2021001   │ García Luna Ana │ 20  │ ISC     │ Activo [⋮]│ │
│  │ 2021015   │ López Pérez Juan│ 22  │ IIA     │ Activo [⋮]│ │
│  │ 2020892   │ Martínez R. María│ 19 │ LAE     │ Activo [⋮]│ │
│  │ ...                                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 1-20 de 234 pacientes                            │
│  [◀ Anterior] [1] [2] [3] ... [12] [Siguiente ▶]            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Panel de Criterios de Búsqueda**
   - Campos múltiples de filtrado
   - Checkboxes para estados
   - Rangos de fechas y edades

2. **Botones de Acción**
   - Limpiar filtros
   - Buscar

3. **Resultados**
   - Contador de resultados
   - Opciones de ordenamiento
   - Exportación en múltiples formatos

4. **Tabla de Resultados**
   - Similar a W-08 pero con datos filtrados

---

## W-10: Perfil de Paciente (Vista General)

### Descripción
Vista resumida del perfil de un paciente con información clave.

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
│  │ 20 años • Mujer • ISC 5°A • Activo                      │  │
│  │ [📝 Editar] [📅 Nueva Cita] [📋 Nueva Sesión] [🗑️ Desact]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────┐ ┌─────────────────────────┐   │
│  │ 📞 Información Contacto  │ │ 📋 Info. Académica      │   │
│  │                          │ │                         │   │
│  │ Teléfono: 999-123-4567   │ │ Carrera: ISC            │   │
│  │ Email: garcia@inst.edu   │ │ Grupo: 5°A              │   │
│  │                          │ │ Semestre: 5             │   │
│  │ 👨‍👩‍👦 Tutor/Emergencia:    │ │ Turno: Matutino         │   │
│  │ García S. Roberto        │ │                         │   │
│  │ Tel: 999-987-6543        │ │                         │   │
│  │ Relación: Padre          │ │                         │   │
│  └──────────────────────────┘ └─────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────┐ ┌─────────────────────────┐   │
│  │ 🏥 Información Médica    │ │ 📊 Estado del Paciente  │   │
│  │                          │ │                         │   │
│  │ Tipo de Sangre: O+       │ │ Última Consulta:        │   │
│  │ Alergias: Ninguna        │ │ 10/02/2026              │   │
│  │                          │ │                         │   │
│  │ Condiciones:             │ │ Próxima Cita:           │   │
│  │ • Ansiedad               │ │ 20/02/2026 10:00        │   │
│  │                          │ │                         │   │
│  │ Departamento:            │ │ Sesiones Totales: 5     │   │
│  │ Psicología               │ │ Activo desde: Ene 2026  │   │
│  └──────────────────────────┘ └─────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Resumen de Actividad Reciente                       │  │
│  │                                                        │  │
│  │ 10/02/2026 - Sesión de Psicología (Dra. Méndez)       │  │
│  │ 03/02/2026 - Sesión de Psicología (Dra. Méndez)       │  │
│  │ 27/01/2026 - Evaluación Beck (Resultado: Moderado)    │  │
│  │ 20/01/2026 - Sesión de Psicología (Dra. Méndez)       │  │
│  │                                                        │  │
│  │ [Ver Expediente Completo →]                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Encabezado del Paciente**
   - Información básica
   - Botones de acción rápida

2. **Cards de Información** (4 secciones)
   - Información de contacto
   - Información académica
   - Información médica
   - Estado del paciente

3. **Resumen de Actividad Reciente**
   - Últimas actividades
   - Link a expediente completo

---

## W-11: Registro de Nuevo Paciente

### Descripción
Formulario completo para registrar un nuevo paciente en el sistema.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Pacientes]                                      │
│                                                              │
│  📝 Registro de Nuevo Paciente                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [1. Datos Personales] → 2. Contacto → 3. Médico       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 👤 Información Personal Básica                         │  │
│  │                                                        │  │
│  │ * Matrícula: [___________]                            │  │
│  │                                                        │  │
│  │ * Nombre: [_______________]                           │  │
│  │ * Apellido Paterno: [_______________]                 │  │
│  │ * Apellido Materno: [_______________]                 │  │
│  │                                                        │  │
│  │ * Fecha de Nacimiento: [DD/MM/AAAA ▼]                 │  │
│  │   Edad: [20 años] (calculada automáticamente)         │  │
│  │                                                        │  │
│  │ * Sexo Biológico: [○ Masculino ● Femenino ○ Otro]    │  │
│  │ * Género: [Femenino ▼]                                │  │
│  │                                                        │  │
│  │ * Estado Civil: [Soltera ▼]                           │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🎓 Información Académica/Laboral                       │  │
│  │                                                        │  │
│  │ Tipo: [○ Estudiante ● Empleado ○ Visitante]          │  │
│  │                                                        │  │
│  │ * Carrera: [ISC - Ing. en Sistemas Computacionales ▼] │  │
│  │ * Grupo: [5°A ▼]                                      │  │
│  │ * Turno: [○ Matutino ● Vespertino]                    │  │
│  │                                                        │  │
│  │ Ocupación: [_______________] (opcional)               │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📞 Información de Contacto                             │  │
│  │                                                        │  │
│  │ * Teléfono Personal: [(___) ___-____]                 │  │
│  │ * Correo Electrónico: [________@institucional.edu]    │  │
│  │                                                        │  │
│  │ Dirección: [_______________________________]          │  │
│  │ Ciudad: [_______________] CP: [_____]                 │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar Borrador]  [Siguiente Paso →]    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Indicador de Progreso**
   - Paso 1: Datos Personales
   - Paso 2: Contacto de Emergencia
   - Paso 3: Información Médica

2. **Sección Información Personal**
   - Campos obligatorios (*)
   - Validación en tiempo real
   - Cálculo automático de edad

3. **Sección Académica/Laboral**
   - Tipo de afiliación
   - Datos según el tipo

4. **Sección de Contacto**
   - Teléfono con máscara
   - Email institucional

5. **Botones de Navegación**
   - Cancelar, Guardar borrador, Siguiente

---

## W-12: Edición de Datos del Paciente

### Descripción
Formulario para editar información existente de un paciente.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Perfil]                                         │
│                                                              │
│  ✏️ Editar Paciente - García Luna Ana (2021001)             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Tabs: [Datos Personales] [Contacto] [Médico] [Académico]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 👤 Datos Personales                                    │  │
│  │                                                        │  │
│  │ Matrícula: [2021001] (no editable)                    │  │
│  │                                                        │  │
│  │ Nombre: [Ana_______________]                          │  │
│  │ Apellido Paterno: [García_____________]               │  │
│  │ Apellido Materno: [Luna_______________]               │  │
│  │                                                        │  │
│  │ Fecha de Nacimiento: [15/03/2004 ▼]                   │  │
│  │ Edad: [20 años] (auto)                                │  │
│  │                                                        │  │
│  │ Sexo Biológico: [○ Masculino ● Femenino ○ Otro]      │  │
│  │ Género: [Femenino ▼]                                  │  │
│  │                                                        │  │
│  │ Estado Civil: [Soltera ▼]                             │  │
│  │                                                        │  │
│  │ Estado del Paciente: [○ Activo ● Inactivo]            │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Registro de Cambios                                 │  │
│  │                                                        │  │
│  │ Última modificación: 10/02/2026 por Dr. Méndez        │  │
│  │ Creado: 15/01/2026 por Recepcionista González         │  │
│  │                                                        │  │
│  │ [Ver Historial Completo de Cambios]                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ⚠️ Razón del Cambio (obligatoria para auditoría)      │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Actualización de estado civil por solicitud...    │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar Cambios]                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Tabs de Navegación**
   - Datos Personales
   - Contacto
   - Médico
   - Académico

2. **Formulario Editable**
   - Campos modificables
   - Algunos campos protegidos (matrícula)

3. **Registro de Cambios**
   - Auditoría automática
   - Historial de modificaciones

4. **Campo de Razón del Cambio**
   - Obligatorio para cumplimiento
   - Trazabilidad completa

---

## W-13: Historial Médico Completo

### Descripción
Vista cronológica del historial médico completo del paciente.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Expediente]                                     │
│                                                              │
│  📋 Historial Médico - García Luna Ana (2021001)             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Filtros: [Todos los tipos ▼] [Todos los dept ▼]       │  │
│  │ Rango: [01/01/2026 ▼] a [13/02/2026 ▼] [Aplicar]     │  │
│  │                                            [Exportar PDF]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Línea de Tiempo (orden cronológico descendente)    │  │
│  │                                                        │  │
│  │ ══════════════════════════════════════════════════════ │  │
│  │                                                        │  │
│  │ 📍 10/02/2026 - 10:00 AM                              │  │
│  │ 🧠 Sesión de Psicología #5                            │  │
│  │ Profesional: Dra. Ana Méndez                          │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Tipo: Individual - Duración: 50 min               │ │  │
│  │ │ Notas: La paciente reporta mejoría...             │ │  │
│  │ │ [Ver Detalles Completos]                          │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ 📍 03/02/2026 - 10:00 AM                              │  │
│  │ 🧠 Sesión de Psicología #4                            │  │
│  │ Profesional: Dra. Ana Méndez                          │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Tipo: Individual - Duración: 50 min               │ │  │
│  │ │ Notas: Trabajo en técnicas de relajación...       │ │  │
│  │ │ [Ver Detalles Completos]                          │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ 📍 27/01/2026 - 11:00 AM                              │  │
│  │ 📊 Evaluación Psicométrica - Inventario Beck          │  │
│  │ Profesional: Dra. Ana Méndez                          │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Resultado: Ansiedad Moderada (Puntuación: 22)     │ │  │
│  │ │ [Ver Informe Completo]                            │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ 📍 20/01/2026 - 10:00 AM                              │  │
│  │ 🧠 Sesión de Psicología #3                            │  │
│  │ ...                                                    │  │
│  │                                                        │  │
│  │ 📍 15/01/2026 - 14:00 PM                              │  │
│  │ 🆕 Primera Consulta - Evaluación Inicial              │  │
│  │ Profesional: Dra. Ana Méndez                          │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Motivo: Ansiedad relacionada con carga académica  │ │  │
│  │ │ Diagnóstico Inicial: F41.1 - Trastorno de ansiedad│ │  │
│  │ │ [Ver Evaluación Completa]                         │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 5 de 15 registros                                │
│  [◀ Anteriores] [Siguiente ▶]                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Filtros y Controles**
   - Tipo de registro
   - Departamento
   - Rango de fechas
   - Exportar PDF

2. **Línea de Tiempo**
   - Orden cronológico descendente
   - Iconos por tipo de evento
   - Cards expandibles/colapsables

3. **Información por Registro**
   - Fecha y hora
   - Tipo de evento
   - Profesional responsable
   - Resumen
   - Link a detalles completos

4. **Paginación**
   - Navegación por registros

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
