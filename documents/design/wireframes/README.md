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

## W-15: Calendario de Citas (Vista Semanal)

### Descripción
Vista semanal del calendario con mayor detalle de horarios.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📅 Gestión de Citas                                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [◀] Semana del 10-16 Feb 2026 [▶]  Vista: [Mes] [Semana▼]│
│  │                                  [Día]      [+ Nueva Cita]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Filtro: [Todos ▼] [Psicología] [Enfermería]                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Hora │Lun 10│Mar 11│Mie 12│Jue 13│Vie 14│Sab 15│Dom 16│  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 08:00│      │      │      │      │      │      │      │  │
│  │ 09:00│ 🔵  │ 🔵  │ 🔵🔵│ 🔵  │ 🔵  │      │      │  │
│  │      │ Ana  │ Juan │ María│ Luis │ Sofia│      │      │  │
│  │ 10:00│ 🔵  │      │ 🔵  │ 🔵  │ 🔵  │      │      │  │
│  │      │ Pedro│      │ Carlos│ Rosa │ Diego│      │      │  │
│  │ 11:00│ 🟢  │ 🟢  │      │ 🟢  │      │      │      │  │
│  │      │ Enf. │ Enf. │      │ Enf. │      │      │      │  │
│  │ 12:00│      │      │      │      │      │      │      │  │
│  │ 13:00│ 🔵  │ 🔵  │ 🔵  │ 🔵  │      │      │      │  │
│  │      │ Laura│ Mario│ Ana  │ Pablo│      │      │      │  │
│  │ 14:00│      │ 🔵  │      │ 🔵  │ 🔵  │      │      │  │
│  │      │      │ Eva  │      │ Diana│ Bruno│      │      │  │
│  │ 15:00│ 🔵  │      │ 🔵  │      │      │      │      │  │
│  │      │ Sara │      │ Hugo │      │      │      │      │  │
│  │ 16:00│      │      │      │      │      │      │      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Citas del día seleccionado: Jueves 13 de Febrero      │  │
│  │                                                        │  │
│  │ Click en una cita para ver detalles                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes
1. **Selector de Semana**
   - Navegación semanal (◀ ▶)
   - Rango de fechas visible

2. **Filtros por Departamento**
   - Todos, Psicología, Enfermería

3. **Grid Semanal**
   - Columnas: Días de la semana
   - Filas: Horarios (intervalos de 1 hora)
   - Citas con código de color y nombre

4. **Panel de Información**
   - Detalles de día/cita seleccionada

### Interacciones
- Click en celda vacía → Agendar nueva cita (W-17)
- Click en cita → Ver/editar detalles (W-18)
- Hover en cita → Tooltip con info completa

---

## W-16: Calendario de Citas (Vista Diaria)

### Descripción
Vista detallada del día con toda la información de citas.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📅 Agenda del Día                                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [◀] Jueves, 13 de Febrero 2026 [▶]  Vista: [Mes] [Sem]│  │
│  │                                       [Día▼][+ Nueva Cita]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Profesional: [Todos ▼] [Dra. Méndez] [Enf. Torres]         │
│  Departamento: [Todos ▼] [Psicología] [Enfermería]           │
│                                                              │
│  ┌─────┬──────────────────────────────────────────────────┐  │
│  │Hora │ Cita                                             │  │
│  ├─────┼──────────────────────────────────────────────────┤  │
│  │08:00│ [Disponible] [+ Agendar]                        │  │
│  ├─────┼──────────────────────────────────────────────────┤  │
│  │09:00│ 🔵 García Luna Ana - Psicología                 │  │
│  │     │ 📋 Sesión de seguimiento (Sesión #5)            │  │
│  │     │ 👨‍⚕️ Dra. Ana Méndez                             │  │
│  │     │ Estado: ✅ Confirmada                            │  │
│  │     │ [Ver Expediente] [Iniciar] [Reprogramar] [⋮]    │  │
│  ├─────┼──────────────────────────────────────────────────┤  │
│  │10:00│ 🔵 López Pérez Juan - Psicología                │  │
│  │     │ 📋 Primera consulta                             │  │
│  │     │ 👨‍⚕️ Dra. Ana Méndez                             │  │
│  │     │ Estado: 🔔 Por confirmar                         │  │
│  │     │ [Ver Expediente] [Confirmar] [Reprogramar] [⋮]  │  │
│  ├─────┼──────────────────────────────────────────────────┤  │
│  │11:00│ 🟢 Martínez R. María - Enfermería               │  │
│  │     │ 🩹 Curación de herida                           │  │
│  │     │ 👨‍⚕️ Enf. Carlos Torres                          │  │
│  │     │ Estado: ⏰ En sala de espera                     │  │
│  │     │ [Ver Expediente] [Iniciar] [⋮]                  │  │
│  ├─────┼──────────────────────────────────────────────────┤  │
│  │12:00│ [Hora de comida - No disponible]                │  │
│  ├─────┼──────────────────────────────────────────────────┤  │
│  │13:00│ 🔵 Hernández S. Luis - Psicología               │  │
│  │     │ 📋 Sesión de seguimiento (Sesión #3)            │  │
│  │     │ 👨‍⚕️ Dra. Ana Méndez                             │  │
│  │     │ Estado: ✅ Confirmada                            │  │
│  │     │ [Ver Expediente] [Iniciar] [Reprogramar] [⋮]    │  │
│  ├─────┼──────────────────────────────────────────────────┤  │
│  │14:00│ [Disponible] [+ Agendar]                        │  │
│  ├─────┼──────────────────────────────────────────────────┤  │
│  │15:00│ [Disponible] [+ Agendar]                        │  │
│  │     │                                                  │  │
│  └─────┴──────────────────────────────────────────────────┘  │
│                                                              │
│  Resumen: 4 citas programadas | 3 confirmadas | 1 por confir│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes
1. **Selector de Fecha**
   - Navegación día a día
   - Fecha completa visible

2. **Filtros**
   - Por profesional
   - Por departamento

3. **Lista de Citas Detallada**
   - Intervalos de tiempo (generalmente cada hora)
   - Información completa de cada cita
   - Estados visuales claros
   - Botones de acción

4. **Resumen del Día**
   - Estadísticas rápidas

### Interacciones
- Click en [+ Agendar] → W-17
- Click en [Reprogramar] → W-18
- Click en [Iniciar] → Comienza la consulta
- Click en [Ver Expediente] → W-21

---

## W-17: Agendar Nueva Cita

### Descripción
Formulario para crear una nueva cita en el sistema.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver al Calendario]                                    │
│                                                              │
│  📅 Agendar Nueva Cita                                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 👥 Información del Paciente                            │  │
│  │                                                        │  │
│  │ * Buscar Paciente: [__________ 🔍]                    │  │
│  │                                                        │  │
│  │ Sugerencias:                                          │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ 📌 García Luna Ana - 2021001 - ISC                │ │  │
│  │ │ 📌 García Martínez Luis - 2020845 - IIA           │ │  │
│  │ │ 📌 García Pérez María - 2021234 - LAE             │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ [+ Registrar Nuevo Paciente]                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Paciente Seleccionado:                                 │  │
│  │ 👤 García Luna Ana (2021001) - 20 años - ISC           │  │
│  │ Última consulta: 10/02/2026                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Detalles de la Cita                                 │  │
│  │                                                        │  │
│  │ * Departamento: [○ Psicología ● Enfermería]           │  │
│  │                                                        │  │
│  │ * Profesional: [Enf. Carlos Torres ▼]                 │  │
│  │   └─ Disponibilidad: Lun-Vie 9:00-16:00              │  │
│  │                                                        │  │
│  │ * Tipo de Consulta: [Primera vez ▼]                   │  │
│  │   Opciones: Primera vez, Seguimiento, Urgente,        │  │
│  │            Reevaluación                               │  │
│  │                                                        │  │
│  │ * Duración Estimada: [15 minutos ▼]                   │  │
│  │   └─ Psicología: 50 min | Enfermería: 10-15 min      │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Fecha y Hora                                        │  │
│  │                                                        │  │
│  │ * Fecha: [20/02/2026 ▼] 📅                            │  │
│  │                                                        │  │
│  │ * Hora: [10:00 ▼]                                     │  │
│  │                                                        │  │
│  │ ✅ Horario disponible                                  │  │
│  │                                                        │  │
│  │ Horarios disponibles para este día:                   │  │
│  │ [09:00] [10:00] [11:00] [13:00] [14:00]              │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Notas Adicionales (opcional)                        │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Seguimiento de curación...                        │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔔 Recordatorios                                       │  │
│  │ [☑] Enviar recordatorio por correo (24 hrs antes)     │  │
│  │ [☑] Enviar recordatorio por SMS (2 hrs antes)         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar y Agendar]                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Búsqueda de Paciente**
   - Autocompletado con sugerencias
   - Opción para registrar nuevo paciente

2. **Información del Paciente Seleccionado**
   - Datos de identificación
   - Contexto (última consulta)

3. **Detalles de la Cita**
   - Departamento
   - Profesional con disponibilidad
   - Tipo de consulta
   - Duración estimada

4. **Fecha y Hora**
   - Selector de fecha con calendario
   - Horarios disponibles mostrados
   - Validación en tiempo real

5. **Notas y Recordatorios**
   - Campo opcional para notas
   - Opciones de notificación

### Validaciones
- Paciente debe existir o ser creado
- Horario debe estar disponible
- Duración según tipo de consulta
- No permitir citas en horarios ocupados

---

## W-18: Reprogramar Cita Existente

### Descripción
Interfaz para modificar o reprogramar una cita existente.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver al Calendario]                                    │
│                                                              │
│  ✏️ Reprogramar Cita #C-2026-0234                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Información Actual de la Cita                       │  │
│  │                                                        │  │
│  │ Paciente: García Luna Ana (2021001)                    │  │
│  │ Fecha Actual: Jueves, 13 de Febrero 2026 a las 10:00  │  │
│  │ Departamento: Psicología                               │  │
│  │ Profesional: Dra. Ana Méndez                           │  │
│  │ Tipo: Sesión de seguimiento                            │  │
│  │ Estado: Confirmada ✅                                   │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔄 Modificar Cita                                      │  │
│  │                                                        │  │
│  │ Acción: [○ Reprogramar ● Cancelar ○ Cambiar Detalles] │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Nueva Fecha y Hora                                  │  │
│  │                                                        │  │
│  │ Fecha: [20/02/2026 ▼] 📅                              │  │
│  │ Hora: [10:00 ▼]                                       │  │
│  │                                                        │  │
│  │ ✅ Horario disponible                                  │  │
│  │                                                        │  │
│  │ Profesional: [Dra. Ana Méndez ▼] (mismo profesional)  │  │
│  │                                                        │  │
│  │ Horarios disponibles para este día:                   │  │
│  │ [09:00] [10:00] [11:00] [13:00] [14:00]              │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Razón de la Reprogramación (obligatorio)            │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Solicitud del paciente por conflicto académico... │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔔 Notificar al Paciente                               │  │
│  │ [☑] Enviar notificación de reprogramación              │  │
│  │ [☑] Enviar nuevo recordatorio 24 hrs antes             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ⚠️ Historial de Cambios                                │  │
│  │                                                        │  │
│  │ • 01/02/2026: Creada por Recepción González            │  │
│  │ • 05/02/2026: Confirmada por paciente                  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar Cambios]                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Información Actual**
   - Datos completos de la cita existente
   - Estado actual

2. **Opciones de Modificación**
   - Reprogramar (cambiar fecha/hora)
   - Cancelar (anular la cita)
   - Cambiar detalles (modificar info)

3. **Nueva Programación**
   - Selector de nueva fecha/hora
   - Validación de disponibilidad
   - Opción de cambiar profesional

4. **Razón del Cambio**
   - Campo obligatorio para auditoría
   - Trazabilidad completa

5. **Notificaciones**
   - Opciones para notificar al paciente

6. **Historial de Cambios**
   - Registro de todas las modificaciones

---

## W-19: Lista de Espera

### Descripción
Gestión de pacientes en lista de espera para citas.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⏰ Lista de Espera                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Filtros: [Todos ▼] [Psicología] [Enfermería]          │  │
│  │ Prioridad: [Todas ▼] [Alta] [Media] [Baja]            │  │
│  │                                        [+ Agregar Paciente]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📊 Resumen: 15 pacientes en espera                     │  │
│  │ • Alta prioridad: 3   • Media: 8   • Baja: 4          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ # │Pac│Nombre       │Dep│Fech.Sol│Prioridad│Tiempo│[⋮] │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 1 │🔴│López Juan   │Psi│05/02/26│🔴 Alta  │8 días│[⋮] │  │
│  │   │  │Primera cons.│   │        │Urgente  │      │    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 2 │🔴│Martínez M.  │Enf│06/02/26│🔴 Alta  │7 días│[⋮] │  │
│  │   │  │Curaciones   │   │        │Follow-up│      │    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 3 │🔴│Hernández L. │Psi│07/02/26│🔴 Alta  │6 días│[⋮] │  │
│  │   │  │Reevaluación │   │        │Urgente  │      │    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 4 │🟡│García Ana   │Psi│08/02/26│🟡 Media │5 días│[⋮] │  │
│  │   │  │Seguimiento  │   │        │Regular  │      │    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 5 │🟡│Rodríguez S. │Psi│08/02/26│🟡 Media │5 días│[⋮] │  │
│  │   │  │Primera cons.│   │        │Regular  │      │    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 6 │🟢│Sánchez C.   │Enf│09/02/26│🟢 Baja  │4 días│[⋮] │  │
│  │   │  │Check-up     │   │        │Rutina   │      │    │  │
│  │   │                                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 1-6 de 15 pacientes                              │
│  [◀ Anterior] [1] [2] [3] [Siguiente ▶]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Filtros**
   - Por departamento
   - Por prioridad

2. **Resumen Estadístico**
   - Total en espera
   - Distribución por prioridad

3. **Tabla de Lista de Espera**
   - Orden por prioridad y antigüedad
   - Indicador visual de prioridad (🔴🟡🟢)
   - Tiempo de espera calculado
   - Menú de acciones

### Acciones por Paciente (⋮)
- Agendar cita → W-17
- Cambiar prioridad
- Contactar paciente
- Ver expediente → W-21
- Remover de lista

### Reglas de Prioridad
- **Alta (🔴)**: Urgente, follow-up crítico
- **Media (🟡)**: Seguimiento regular
- **Baja (🟢)**: Rutina, evaluaciones programadas

---

## W-20: Confirmación de Citas

### Descripción
Panel para confirmar citas programadas y gestionar confirmaciones.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Confirmación de Citas                                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Vista: [Por Confirmar ▼] [Confirmadas] [No Confirmadas]│  │
│  │ Período: [Próximos 7 días ▼]                           │  │
│  │                              [📞 Llamar a Todos] [📧 Email]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📊 Resumen de Confirmaciones                           │  │
│  │ Total de citas (próximos 7 días): 45                   │  │
│  │ ✅ Confirmadas: 32 (71%)                               │  │
│  │ 🔔 Por confirmar: 8 (18%)                              │  │
│  │ ❌ No confirmadas: 5 (11%)                             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔔 Citas Por Confirmar (8)                             │  │
│  │                                                        │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ 📅 Jueves 13/02/2026 - 10:00                       │ │  │
│  │ │ 👤 López Pérez Juan (2021015)                      │ │  │
│  │ │ 📞 Tel: 999-234-5678                               │ │  │
│  │ │ 📋 Psicología - Primera consulta                   │ │  │
│  │ │ 👨‍⚕️ Dra. Ana Méndez                                 │ │  │
│  │ │                                                    │ │  │
│  │ │ Último contacto: Ninguno                          │ │  │
│  │ │ Tiempo restante: ⏰ 2 horas                        │ │  │
│  │ │                                                    │ │  │
│  │ │ [✅ Confirmar] [❌ Cancelar] [📞 Llamar] [✏️ Editar]│ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ 📅 Viernes 14/02/2026 - 11:00                      │ │  │
│  │ │ 👤 Martínez Rodríguez María (2020892)              │ │  │
│  │ │ 📞 Tel: 999-345-6789                               │ │  │
│  │ │ 📋 Enfermería - Curación                           │ │  │
│  │ │ 👨‍⚕️ Enf. Carlos Torres                              │ │  │
│  │ │                                                    │ │  │
│  │ │ Último contacto: Email enviado hace 12 hrs        │ │  │
│  │ │ Tiempo restante: ⏰ 1 día 3 horas                  │ │  │
│  │ │                                                    │ │  │
│  │ │ [✅ Confirmar] [❌ Cancelar] [📞 Llamar] [✏️ Editar]│ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ 📅 Viernes 14/02/2026 - 13:00                      │ │  │
│  │ │ 👤 Hernández Sánchez Luis (2021034)                │ │  │
│  │ │ 📞 Tel: 999-456-7890                               │ │  │
│  │ │ 📋 Psicología - Sesión de seguimiento              │ │  │
│  │ │ 👨‍⚕️ Dra. Ana Méndez                                 │ │  │
│  │ │                                                    │ │  │
│  │ │ Último contacto: Llamada hace 2 días              │ │  │
│  │ │ Tiempo restante: ⏰ 1 día 5 horas                  │ │  │
│  │ │                                                    │ │  │
│  │ │ [✅ Confirmar] [❌ Cancelar] [📞 Llamar] [✏️ Editar]│ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 1-3 de 8 citas                                   │
│  [◀ Anterior] [Siguiente ▶]                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Filtros y Vista**
   - Por confirmar, confirmadas, no confirmadas
   - Período de tiempo

2. **Resumen Estadístico**
   - Total de citas
   - Estado de confirmaciones con porcentajes

3. **Lista de Citas**
   - Cards detalladas por cita
   - Información completa del paciente
   - Tiempo restante hasta la cita
   - Historial de contactos

4. **Botones de Acción por Cita**
   - Confirmar: Marca como confirmada
   - Cancelar: Cancela la cita
   - Llamar: Registra intento de contacto
   - Editar: Modifica la cita (W-18)

5. **Acciones Masivas**
   - Llamar a todos
   - Enviar emails masivos

### Estados de Confirmación
- **Por Confirmar (🔔)**: Esperando confirmación
- **Confirmada (✅)**: Paciente confirmó asistencia
- **No Confirmada (❌)**: No se pudo contactar o paciente canceló

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

## W-23: Registro de Procedimiento (Enfermería)

### Descripción
Formulario para documentar procedimientos de enfermería.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Expediente]                                     │
│                                                              │
│  💉 Nuevo Procedimiento - García Luna Ana (2021001)          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Información del Procedimiento                       │  │
│  │                                                        │  │
│  │ Fecha: [13/02/2026 ▼]    Hora: [11:00 ▼]             │  │
│  │                                                        │  │
│  │ * Tipo de Procedimiento:                              │  │
│  │ [Curación de herida ▼]                                │  │
│  │ Opciones: Curación, Inyección IM/IV, Toma de signos, │  │
│  │          Vendaje, Extracción de sangre, Otros        │  │
│  │                                                        │  │
│  │ Ubicación Anatómica: [Brazo derecho________]          │  │
│  │                                                        │  │
│  │ Duración: [15 min ▼]                                  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🩺 Signos Vitales (si aplica)                          │  │
│  │                                                        │  │
│  │ Presión Arterial: [120] / [80] mmHg                   │  │
│  │ Frecuencia Cardíaca: [72] lpm                         │  │
│  │ Temperatura: [36.5] °C                                │  │
│  │ Frecuencia Respiratoria: [18] rpm                     │  │
│  │ Saturación de O2: [98] %                              │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 💊 Materiales Utilizados                               │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ • Gasa estéril (4 unidades)                       │ │  │
│  │ │ • Solución salina (100 ml)                        │ │  │
│  │ │ • Apósito adhesivo                                │ │  │
│  │ │                                                    │ │  │
│  │ │ [+ Agregar Material]                              │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Descripción del Procedimiento                       │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Se realizó curación de herida superficial en      │ │  │
│  │ │ brazo derecho. Herida limpia, sin signos de...    │ │  │
│  │ │                                                    │ │  │
│  │ │ [Área de texto expandible]                        │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔍 Observaciones y Evaluación                          │  │
│  │                                                        │  │
│  │ Estado de la herida: [Mejorando ▼]                    │  │
│  │ Dolor reportado: [○ Ninguno ● Leve ○ Moderado ○ Severo]│
│  │                                                        │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Paciente tolera bien el procedimiento. Se        │ │  │
│  │ │ observa mejoría en proceso de cicatrización...    │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Recomendaciones e Indicaciones                      │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ • Mantener área limpia y seca                     │ │  │
│  │ │ • Cambio de apósito en 48 horas                   │ │  │
│  │ │ • Regresar si hay signos de infección            │ │  │
│  │ │                                                    │ │  │
│  │ │ [+ Agregar Recomendación]                         │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Seguimiento: [Programar Cita de Seguimiento]       │  │
│  │ Fecha Sugerida: [15/02/2026 ▼] [11:00 ▼]             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar Borrador]  [Guardar y Finalizar] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Secciones del Formulario
1. **Información del Procedimiento**
   - Fecha, hora, tipo
   - Ubicación anatómica
   - Duración

2. **Signos Vitales**
   - Presión arterial, frecuencia cardíaca
   - Temperatura, respiración, saturación

3. **Materiales Utilizados**
   - Lista de insumos
   - Cantidades

4. **Descripción**
   - Narrativa del procedimiento

5. **Observaciones y Evaluación**
   - Estado del paciente
   - Nivel de dolor
   - Notas adicionales

6. **Recomendaciones**
   - Indicaciones para el paciente
   - Cuidados posteriores

7. **Seguimiento**
   - Programar próxima visita si necesario

---

## W-24: Evaluaciones Psicométricas

### Descripción
Gestión y registro de evaluaciones psicológicas y pruebas psicométricas.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Expediente]                                     │
│                                                              │
│  📊 Evaluaciones Psicométricas - García Luna Ana (2021001)   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Historial de Evaluaciones] [+ Nueva Evaluación]      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📊 Historial de Evaluaciones                           │  │
│  │                                                        │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ 📍 27/01/2026 - Inventario de Ansiedad de Beck     │ │  │
│  │ │ Aplicada por: Dra. Ana Méndez                      │ │  │
│  │ │ ┌────────────────────────────────────────────────┐ │ │  │
│  │ │ │ Resultado: Ansiedad Moderada                   │ │ │  │
│  │ │ │ Puntuación: 22/63 puntos                       │ │ │  │
│  │ │ │                                                │ │ │  │
│  │ │ │ Interpretación: El paciente presenta niveles  │ │ │  │
│  │ │ │ moderados de ansiedad. Se recomienda          │ │ │  │
│  │ │ │ continuar con terapia...                      │ │ │  │
│  │ │ │                                                │ │ │  │
│  │ │ │ [Ver Detalles Completos] [Ver Gráfica]        │ │ │  │
│  │ │ │ [Exportar PDF]                                │ │ │  │
│  │ │ └────────────────────────────────────────────────┘ │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ 📍 15/01/2026 - Inventario de Depresión de Beck   │ │  │
│  │ │ Aplicada por: Dra. Ana Méndez                      │ │  │
│  │ │ ┌────────────────────────────────────────────────┐ │ │  │
│  │ │ │ Resultado: Depresión Leve                      │ │ │  │
│  │ │ │ Puntuación: 15/63 puntos                       │ │ │  │
│  │ │ │                                                │ │ │  │
│  │ │ │ Interpretación: Síntomas depresivos leves...  │ │ │  │
│  │ │ │                                                │ │ │  │
│  │ │ │ [Ver Detalles Completos] [Ver Gráfica]        │ │ │  │
│  │ │ │ [Exportar PDF]                                │ │ │  │
│  │ │ └────────────────────────────────────────────────┘ │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📈 Gráfica de Evolución                                │  │
│  │                                                        │  │
│  │     Puntuación Beck (Ansiedad)                        │  │
│  │  30│                                                   │  │
│  │  25│              ●                                    │  │
│  │  20│         ●           ●                             │  │
│  │  15│    ●                      ●                       │  │
│  │  10│                                                   │  │
│  │   5│                                                   │  │
│  │   0└───────────────────────────────────────────────    │  │
│  │     Ene   Feb   Mar   Abr   May                       │  │
│  │                                                        │  │
│  │  [Ansiedad] [Depresión] [Estrés] [Personalidad]      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes - Modo Historial
1. **Controles Superiores**
   - Ver historial
   - Botón nueva evaluación

2. **Lista de Evaluaciones**
   - Orden cronológico descendente
   - Cards expandibles con resultados
   - Interpretación
   - Opciones de exportación

3. **Gráfica de Evolución**
   - Visualización de progreso
   - Filtros por tipo de prueba

### Componentes - Nueva Evaluación
```
┌──────────────────────────────────────────────────────────────┐
│  📊 Nueva Evaluación Psicométrica                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Información de la Evaluación                        │  │
│  │                                                        │  │
│  │ * Tipo de Prueba: [Inventario de Ansiedad Beck ▼]     │  │
│  │   Opciones disponibles:                               │  │
│  │   - Inventario de Ansiedad de Beck (BAI)              │  │
│  │   - Inventario de Depresión de Beck (BDI-II)          │  │
│  │   - Escala de Estrés Percibido (PSS)                  │  │
│  │   - Test de Personalidad (MMPI, 16PF)                 │  │
│  │   - WAIS/WISC (Inteligencia)                          │  │
│  │   - Otras evaluaciones                                │  │
│  │                                                        │  │
│  │ Fecha de Aplicación: [13/02/2026 ▼]                   │  │
│  │                                                        │  │
│  │ Motivo de la Evaluación:                              │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Reevaluación de niveles de ansiedad tras 4       │ │  │
│  │ │ sesiones de terapia cognitivo-conductual...       │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📊 Resultados                                          │  │
│  │                                                        │  │
│  │ Puntuación Total: [____] / 63 puntos                  │  │
│  │                                                        │  │
│  │ Clasificación: [Calculada automáticamente]            │  │
│  │ ○ Mínima (0-7)   ○ Leve (8-15)                        │  │
│  │ ● Moderada (16-25)   ○ Severa (26-63)                 │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Interpretación y Análisis                           │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Los resultados indican una disminución en los     │ │  │
│  │ │ niveles de ansiedad comparado con la evaluación   │ │  │
│  │ │ inicial. El paciente muestra mejoría en...        │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 💡 Recomendaciones                                     │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ • Continuar con terapia semanal                   │ │  │
│  │ │ • Reevaluación en 3 meses                         │ │  │
│  │ │ • Mantener ejercicios de relajación               │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar y Generar Informe]                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## W-25: Diagnósticos y Tratamientos

### Descripción
Gestión de diagnósticos DSM-5/CIE-10 y planes de tratamiento.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Expediente]                                     │
│                                                              │
│  🩺 Diagnósticos y Tratamientos - García Luna Ana (2021001)  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Diagnósticos Actuales] [Histórico] [+ Nuevo Diagnóstico]│
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🩺 Diagnósticos Actuales                               │  │
│  │                                                        │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ 🔴 ACTIVO                                          │ │  │
│  │ │ F41.1 - Trastorno de Ansiedad Generalizada (DSM-5)│ │  │
│  │ │                                                    │ │  │
│  │ │ 📅 Fecha de Diagnóstico: 15/01/2026               │ │  │
│  │ │ 👨‍⚕️ Diagnosticado por: Dra. Ana Méndez             │ │  │
│  │ │ 🎯 Gravedad: Moderada                              │ │  │
│  │ │                                                    │ │  │
│  │ │ 📝 Descripción:                                    │ │  │
│  │ │ Ansiedad excesiva relacionada con carga académica │ │  │
│  │ │ y presión familiar. Síntomas presentes por más    │ │  │
│  │ │ de 6 meses con impacto en funcionamiento diario.  │ │  │
│  │ │                                                    │ │  │
│  │ │ 📋 Plan de Tratamiento:                            │ │  │
│  │ │ ┌──────────────────────────────────────────────┐  │ │  │
│  │ │ │ • Terapia Cognitivo-Conductual (TCC)        │  │ │  │
│  │ │ │   Frecuencia: Semanal (50 min)               │  │ │  │
│  │ │ │   Duración estimada: 12-16 sesiones          │  │ │  │
│  │ │ │                                              │  │ │  │
│  │ │ │ • Técnicas de relajación y mindfulness      │  │ │  │
│  │ │ │ • Reestructuración cognitiva                 │  │ │  │
│  │ │ │ • Exposición gradual a situaciones ansiosas  │  │ │  │
│  │ │ └──────────────────────────────────────────────┘  │ │  │
│  │ │                                                    │ │  │
│  │ │ 📊 Progreso:                                       │ │  │
│  │ │ Sesiones completadas: 5/16                        │ │  │
│  │ │ [▓▓▓▓░░░░░░] 31%                                  │ │  │
│  │ │                                                    │ │  │
│  │ │ Última evaluación: 27/01/2026 - Ansiedad Moderada│ │  │
│  │ │ Mejoría observada en capacidad de afrontamiento. │ │  │
│  │ │                                                    │ │  │
│  │ │ [✏️ Editar] [📋 Ver Detalles] [🔄 Actualizar]     │ │  │
│  │ │ [✅ Marcar como Resuelto]                          │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📚 Diagnósticos Históricos (Resueltos)                │  │
│  │                                                        │  │
│  │ • F32.0 - Episodio depresivo leve                     │  │
│  │   15/01/2026 - 10/02/2026 (Resuelto)                 │  │
│  │   [Ver Detalles]                                      │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Componentes - Nuevo Diagnóstico
```
┌──────────────────────────────────────────────────────────────┐
│  🩺 Nuevo Diagnóstico                                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Información del Diagnóstico                         │  │
│  │                                                        │  │
│  │ * Sistema de Clasificación: [○ DSM-5 ● CIE-10/11]     │  │
│  │                                                        │  │
│  │ * Buscar Diagnóstico: [F41.1______________ 🔍]        │  │
│  │   Sugerencias:                                        │  │
│  │   • F41.1 - Trastorno de ansiedad generalizada       │  │
│  │   • F41.0 - Trastorno de pánico                       │  │
│  │   • F41.2 - Trastorno mixto ansioso-depresivo        │  │
│  │                                                        │  │
│  │ Código: [F41.1]                                       │  │
│  │ Descripción: [Trastorno de Ansiedad Generalizada]    │  │
│  │                                                        │  │
│  │ * Fecha de Diagnóstico: [15/01/2026 ▼]                │  │
│  │                                                        │  │
│  │ Gravedad: [○ Leve ● Moderada ○ Grave]                 │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Descripción Clínica                                 │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Ansiedad excesiva y preocupación persistente      │ │  │
│  │ │ relacionada con carga académica y presión         │ │  │
│  │ │ familiar. Síntomas: tensión muscular, dificultad  │ │  │
│  │ │ para concentrarse, alteraciones del sueño...      │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🎯 Plan de Tratamiento                                 │  │
│  │                                                        │  │
│  │ Tipo de Terapia: [Cognitivo-Conductual ▼]             │  │
│  │ Frecuencia: [Semanal ▼]                               │  │
│  │ Duración de Sesión: [50 minutos ▼]                    │  │
│  │ Sesiones Estimadas: [12-16_______]                    │  │
│  │                                                        │  │
│  │ 📋 Objetivos Terapéuticos:                             │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ 1. Reducir nivel de ansiedad a leve               │ │  │
│  │ │ 2. Desarrollar técnicas de afrontamiento          │ │  │
│  │ │ 3. Mejorar calidad del sueño                      │ │  │
│  │ │ 4. Aumentar concentración académica               │ │  │
│  │ │                                                    │ │  │
│  │ │ [+ Agregar Objetivo]                              │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ 📋 Intervenciones:                                     │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ • Técnicas de relajación muscular progresiva     │ │  │
│  │ │ • Reestructuración cognitiva                      │ │  │
│  │ │ • Exposición gradual                              │ │  │
│  │ │ • Mindfulness y meditación                        │ │  │
│  │ │                                                    │ │  │
│  │ │ [+ Agregar Intervención]                          │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ 📅 Reevaluación programada: [15/04/2026 ▼]            │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar Diagnóstico]                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Vista de Diagnósticos Actuales**
   - Lista de diagnósticos activos
   - Código y descripción DSM-5/CIE-10
   - Gravedad
   - Plan de tratamiento
   - Barra de progreso
   - Opciones de gestión

2. **Histórico**
   - Diagnósticos resueltos
   - Fechas de inicio y resolución

3. **Nuevo Diagnóstico**
   - Búsqueda de códigos DSM-5/CIE-10
   - Descripción clínica
   - Plan de tratamiento detallado
   - Objetivos e intervenciones

---

## W-26: Notas de Evolución

### Descripción
Registro cronológico de notas y observaciones del progreso del paciente.

### Elementos Principales
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] EHR System        [🔍] Buscar...    [🔔] [👤] Usuario ▼  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [◀ Volver a Expediente]                                     │
│                                                              │
│  📝 Notas de Evolución - García Luna Ana (2021001)           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Filtros: [Todas ▼] [Psicología] [Enfermería]          │  │
│  │ Período: [Último mes ▼]                  [+ Nueva Nota]│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Línea de Tiempo de Evolución                        │  │
│  │                                                        │  │
│  │ ══════════════════════════════════════════════════════ │  │
│  │                                                        │  │
│  │ 📍 10/02/2026 - 10:00 AM                              │  │
│  │ 🧠 Sesión de Psicología #5 - Dra. Ana Méndez          │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ SUBJETIVO (S):                                     │ │  │
│  │ │ La paciente reporta sentirse "mucho mejor". Indica│ │  │
│  │ │ que ha logrado implementar las técnicas de        │ │  │
│  │ │ respiración y nota reducción en episodios de      │ │  │
│  │ │ ansiedad. Mejora en calidad de sueño.             │ │  │
│  │ │                                                    │ │  │
│  │ │ OBJETIVO (O):                                      │ │  │
│  │ │ Paciente colaboradora, buen contacto visual,      │ │  │
│  │ │ lenguaje fluido. Se observa expresión facial más  │ │  │
│  │ │ relajada comparado con sesiones previas.          │ │  │
│  │ │                                                    │ │  │
│  │ │ ANÁLISIS (A):                                      │ │  │
│  │ │ Mejoría significativa en sintomatología ansiosa.  │ │  │
│  │ │ Reducción de Beck de 22 a 18 puntos. El paciente │ │  │
│  │ │ demuestra comprensión y aplicación de técnicas.   │ │  │
│  │ │                                                    │ │  │
│  │ │ PLAN (P):                                          │ │  │
│  │ │ • Continuar con TCC semanal                       │ │  │
│  │ │ • Introducir técnicas de exposición gradual      │ │  │
│  │ │ • Reevaluación con Beck en 4 semanas             │ │  │
│  │ │ • Próxima sesión: 17/02/2026 a las 10:00         │ │  │
│  │ │                                                    │ │  │
│  │ │ [Editar] [Ver Completo] [Exportar]                │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ 📍 03/02/2026 - 10:00 AM                              │  │
│  │ 🧠 Sesión de Psicología #4 - Dra. Ana Méndez          │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ SUBJETIVO: Paciente refiere mejoría gradual...    │ │  │
│  │ │ [Ver Completo]                                     │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ 📍 27/01/2026 - 11:00 AM                              │  │
│  │ 📊 Reevaluación Beck - Dra. Ana Méndez                │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Evaluación: Ansiedad Moderada (22 puntos)         │ │  │
│  │ │ Nota: Comparado con evaluación inicial (28 pts)  │ │  │
│  │ │ se observa reducción de 6 puntos...              │ │  │
│  │ │ [Ver Completo]                                     │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ 📍 20/01/2026 - 10:00 AM                              │  │
│  │ 🧠 Sesión de Psicología #3 - Dra. Ana Méndez          │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ SOAP: Trabajo en identificación de pensamientos.. │ │  │
│  │ │ [Ver Completo]                                     │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 4 de 10 notas                                    │
│  [◀ Anteriores] [Siguiente ▶]                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Formato SOAP
Las notas siguen el formato SOAP estándar:
- **S (Subjetivo)**: Lo que el paciente reporta
- **O (Objetivo)**: Observaciones del profesional
- **A (Análisis)**: Evaluación y diagnóstico
- **P (Plan)**: Plan de acción y seguimiento

### Componentes - Nueva Nota
```
┌──────────────────────────────────────────────────────────────┐
│  📝 Nueva Nota de Evolución                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Información de la Nota                              │  │
│  │                                                        │  │
│  │ Fecha: [13/02/2026 ▼]    Hora: [15:00 ▼]             │  │
│  │ Tipo: [○ Sesión ● Nota de Evolución ○ Interconsulta] │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Formato SOAP                                        │  │
│  │                                                        │  │
│  │ S - SUBJETIVO (Reporte del Paciente):                 │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ [Área de texto]                                    │ │  │
│  │ │ ¿Qué reporta el paciente?                          │ │  │
│  │ │ ¿Cómo se siente?                                   │ │  │
│  │ │ ¿Qué ha notado desde la última sesión?             │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ O - OBJETIVO (Observaciones del Profesional):         │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ [Área de texto]                                    │ │  │
│  │ │ Apariencia física, comportamiento,                 │ │  │
│  │ │ estado de ánimo observado,                         │ │  │
│  │ │ nivel de cooperación, etc.                         │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ A - ANÁLISIS (Evaluación y Diagnóstico):              │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ [Área de texto]                                    │ │  │
│  │ │ Interpretación de síntomas,                        │ │  │
│  │ │ progreso del tratamiento,                          │ │  │
│  │ │ cambios en diagnóstico si aplica                   │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ P - PLAN (Acciones y Seguimiento):                    │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ [Área de texto]                                    │ │  │
│  │ │ Intervenciones a realizar,                         │ │  │
│  │ │ tareas para el paciente,                           │ │  │
│  │ │ próximos pasos, fecha siguiente sesión             │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔒 Confidencialidad                                    │  │
│  │ [☑] Esta nota contiene información sensible           │  │
│  │ [☑] Restringir acceso solo a profesionales autorizados│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│       [Cancelar]  [Guardar Borrador]  [Guardar Nota]         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
1. **Vista de Historial**
   - Línea de tiempo cronológica
   - Filtros por tipo y período
   - Notas en formato SOAP
   - Opciones de visualización/exportación

2. **Nueva Nota**
   - Campos estructurados SOAP
   - Fecha y hora
   - Tipo de nota
   - Configuraciones de confidencialidad

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
