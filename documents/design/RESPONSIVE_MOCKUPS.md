# 🎨 Mockups Responsivos - Sistema EHR

## 📋 Descripción

Este documento contiene las especificaciones visuales detalladas de los mockups de alta fidelidad adaptados para cada breakpoint del Sistema de Registro de Salud Electrónico (EHR).

## 🎯 Objetivo

Proporcionar una referencia visual completa de cómo cada pantalla debe adaptarse a diferentes tamaños de dispositivo, facilitando la implementación frontend y asegurando consistencia en la experiencia de usuario.

---

## 📱 M-01: Login - Responsive

### Desktop (1280px+)

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                         [GRADIENT BG]                         │
│                                                               │
│              ┌──────────────────────────┐                    │
│              │                          │                    │
│              │      [LOGO 80x80]        │                    │
│              │                          │                    │
│              │   Iniciar Sesión         │ ← H2 36px         │
│              │   ──────────────         │                    │
│              │                          │                    │
│              │   [Email Icon] Email     │ ← Input 48px      │
│              │   ──────────────────     │                    │
│              │                          │                    │
│              │   [Lock Icon] Password   │ ← Input 48px      │
│              │   ──────────────────     │                    │
│              │                          │                    │
│              │   ☑ Recordarme           │                    │
│              │                          │                    │
│              │   [INICIAR SESIÓN]       │ ← Button 48px     │
│              │                          │                    │
│              │   ¿Olvidaste contraseña? │ ← Link 14px       │
│              │                          │                    │
│              └──────────────────────────┘                    │
│                   Card 400px width                            │
│                   Centrado vertical                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Especificaciones:**
- Container: 400px max-width, centrado
- Card: padding 32px, shadow-xl, radius-xl
- Inputs: height 48px, gap 16px
- Button: width 100%, height 48px
- Font: H2 (36px), Body (16px), Small (14px)

---

### Tablet (768px - 1023px)

```
┌─────────────────────────────────────────┐
│                                         │
│          [GRADIENT BG]                  │
│                                         │
│      ┌────────────────────┐            │
│      │                    │            │
│      │  [LOGO 72x72]      │            │
│      │                    │            │
│      │  Iniciar Sesión    │ ← H2 30px │
│      │  ─────────────     │            │
│      │                    │            │
│      │  Email             │ ← 44px    │
│      │  ───────────────   │            │
│      │                    │            │
│      │  Contraseña        │ ← 44px    │
│      │  ───────────────   │            │
│      │                    │            │
│      │  ☑ Recordarme      │            │
│      │                    │            │
│      │  [INICIAR SESIÓN]  │ ← 44px    │
│      │                    │            │
│      │  ¿Olvidaste...?    │            │
│      │                    │            │
│      └────────────────────┘            │
│         350px width                     │
│                                         │
└─────────────────────────────────────────┘
```

**Especificaciones:**
- Container: 350px max-width
- Card: padding 28px
- Inputs: height 44px (touch-optimized)
- Font: H2 (30px), Body (16px)

---

### Mobile (320px - 767px)

```
┌───────────────────────┐
│                       │
│   [GRADIENT BG]       │
│                       │
│  ┌─────────────────┐  │
│  │                 │  │
│  │  [LOGO 64x64]   │  │
│  │                 │  │
│  │  Iniciar        │  │ ← H2 24px
│  │  Sesión         │  │
│  │  ────────       │  │
│  │                 │  │
│  │  Email          │  │ ← 48px
│  │  ────────────   │  │
│  │                 │  │
│  │  Contraseña     │  │ ← 48px
│  │  ────────────   │  │
│  │                 │  │
│  │  ☑ Recordarme   │  │
│  │                 │  │
│  │  [INICIAR]      │  │ ← 48px
│  │                 │  │
│  │  ¿Olvidaste?    │  │
│  │                 │  │
│  └─────────────────┘  │
│   Padding 16px        │
│                       │
└───────────────────────┘
```

**Especificaciones:**
- Container: 100% width, padding 16px
- Card: padding 24px, full-width
- Inputs: height 48px, font-size 16px (prevenir zoom iOS)
- Button: width 100%, height 48px
- Font: H2 (24px), Body (14px)

---

## 📊 M-04: Dashboard Administrador - Responsive

### Desktop (1280px+)

```
┌────────────────────────────────────────────────────────────────────┐
│ Sidebar │ ┌────────────────────────────────────────────────────┐ │
│ 240px   │ │ Top Bar [Search...] [Notifications] [User]         │ │
│         │ └────────────────────────────────────────────────────┘ │
│ [Home]  │                                                          │
│ [Users] │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│ [Citas] │ │ 156 │ │ 89  │ │ 23  │ │ 12  │  ← Metric Cards       │
│ [Files] │ │Paci.│ │Citas│ │Pend.│ │User │                        │
│ [Stats] │ └─────┘ └─────┘ └─────┘ └─────┘                       │
│ [Setup] │                                                          │
│         │ ┌───────────────────────┐ ┌─────────────────────┐     │
│ [User]  │ │   Chart: Citas/Mes    │ │  Actividad Reciente │     │
│ ▼       │ │                       │ │                     │     │
│         │ │   [Line Chart]        │ │  • Item 1           │     │
│         │ │                       │ │  • Item 2           │     │
│         │ └───────────────────────┘ │  • Item 3           │     │
│         │                            └─────────────────────┘     │
│         │                                                          │
└────────────────────────────────────────────────────────────────────┘
```

**Layout:**
- Sidebar: 240px fixed, dark background
- Main: flex-1, padding 32px
- Metrics: grid 4 columnas, gap 24px
- Charts: grid 2 columnas, gap 24px

---

### Tablet Landscape (1024px - 1279px)

```
┌──────────────────────────────────────────────────────────┐
│ Side│ ┌────────────────────────────────────────────┐    │
│ 72px│ │ Top Bar [Search] [Bell] [User]             │    │
│     │ └────────────────────────────────────────────┘    │
│ [H] │                                                    │
│ [U] │ ┌────┐ ┌────┐ ┌────┐                             │
│ [C] │ │156 │ │89  │ │23  │  ← 3 Metrics visible        │
│ [F] │ │Pac │ │Cit │ │Pen │                             │
│ [S] │ └────┘ └────┘ └────┘                             │
│ [C] │                                                    │
│     │ ┌──────────────────────┐                         │
│ [U] │ │  Chart: Citas/Mes    │  ← Full width           │
│ ▼   │ │                      │                          │
│     │ │  [Line Chart]        │                          │
│     │ └──────────────────────┘                         │
│     │                                                    │
└──────────────────────────────────────────────────────────┘
```

**Layout:**
- Sidebar: 72px compacto (solo iconos)
- Main: margin-left 72px, padding 24px
- Metrics: grid 3 columnas
- Charts: single column full-width

---

### Tablet Portrait (768px - 1023px)

```
┌────────────────────────────────────────┐
│ S │ ┌────────────────────────────────┐ │
│ i │ │ [≡] Dashboard    [🔔] [👤]     │ │
│ d │ └────────────────────────────────┘ │
│ e │                                    │
│ 7 │ ┌────────┐ ┌────────┐             │
│ 2 │ │  156   │ │   89   │             │
│   │ │Pacient.│ │ Citas  │             │
│ [ │ └────────┘ └────────┘             │
│ H │                                    │
│ ] │ ┌────────┐ ┌────────┐             │
│   │ │   23   │ │   12   │             │
│ [ │ │Pendien.│ │Usuarios│             │
│ U │ └────────┘ └────────┘             │
│ ] │                                    │
│   │ ┌────────────────────────────┐    │
│ [ │ │    Chart: Citas/Mes        │    │
│ C │ │                            │    │
│ ] │ │    [Compact Chart]         │    │
│   │ └────────────────────────────┘    │
│   │                                    │
└────────────────────────────────────────┘
```

**Layout:**
- Sidebar: 72px colapsado
- Metrics: grid 2x2
- Charts: single column
- Touch-optimized buttons (44px min)

---

### Mobile (320px - 767px)

```
┌─────────────────────┐
│ [≡] Dashboard [🔔]  │ ← Top bar 56px
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │       156       │ │
│ │    Pacientes    │ │
│ │   (+12 hoy)     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │        89       │ │
│ │      Citas      │ │
│ │   (23 hoy)      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │        23       │ │
│ │   Pendientes    │ │
│ └─────────────────┘ │
│                     │
│ Actividad Reciente  │
│ • Cita confirmada   │
│ • Nuevo paciente    │
│ • Sesión terminada  │
│                     │
├─────────────────────┤
│[🏠] [👥] [📅] [📁] │ ← Bottom nav 64px
└─────────────────────┘
```

**Layout:**
- Top bar: 56px sticky
- Metrics: single column, full-width cards
- Bottom navigation: 64px fixed
- Content: padding 16px
- No sidebar (drawer on demand)

---

## 👥 M-08: Lista de Pacientes - Responsive

### Desktop (1280px+)

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar │ Top Bar: Pacientes                                    │
│ 240px   │ ─────────────────────────────────────────────────     │
│         │                                                         │
│ [Nav]   │ ┌─────────────────────────────────────────────────┐   │
│ Items   │ │ [🔍 Buscar...] [Filtros▼] [Estado▼] [+Nuevo]   │   │
│         │ └─────────────────────────────────────────────────┘   │
│         │                                                         │
│         │ ┌───────────────────────────────────────────────────┐ │
│         │ │ ID  │ Nombre    │ Edad │ Teléfono  │ Estado │ ⚙ │ │
│         │ ├───────────────────────────────────────────────────┤ │
│         │ │ 001 │ Juan P.   │ 35   │ 555-0100  │ Activo │ • │ │
│         │ │ 002 │ María G.  │ 28   │ 555-0101  │ Activo │ • │ │
│         │ │ 003 │ Pedro L.  │ 42   │ 555-0102  │ Inact. │ • │ │
│         │ │ ... │ ...       │ ...  │ ...       │ ...    │ • │ │
│         │ └───────────────────────────────────────────────────┘ │
│         │                                                         │
│         │ Mostrando 1-10 de 156         [<] [1][2][3] [>]       │
│         │                                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Especificaciones:**
- Table: full-width, todas las columnas visibles
- Row height: 56px
- Pagination: bottom-right
- Actions: dropdown menu (3 dots)

---

### Tablet (768px - 1023px)

```
┌────────────────────────────────────────────────┐
│ S │ Pacientes                                  │
│ i │ ──────────                                 │
│ d │                                            │
│ e │ ┌──────────────────────────────────────┐  │
│   │ │ [🔍 Buscar...] [Filtros] [+]        │  │
│ 7 │ └──────────────────────────────────────┘  │
│ 2 │                                            │
│   │ ┌────────────────────────────────────────┐│
│   │ │← → scroll horizontal                   ││
│ [ │ │ ID │Nombre │Edad│Tel.  │Estado│Acción ││
│ N │ ├────────────────────────────────────────┤│
│ a │ │001 │Juan P.│35  │555..│ 🟢  │ •••   ││
│ v │ │002 │María  │28  │555..│ 🟢  │ •••   ││
│ ] │ │003 │Pedro  │42  │555..│ ⚫  │ •••   ││
│   │ └────────────────────────────────────────┘│
│   │                                            │
│   │ 1-10 de 156          [<][1][2][3][>]      │
│   │                                            │
└────────────────────────────────────────────────┘
```

**Especificaciones:**
- Table: scroll horizontal habilitado
- Primera columna: sticky left
- Columnas condensadas
- Touch-friendly row height (60px)

---

### Mobile (320px - 767px)

```
┌─────────────────────┐
│ [≡] Pacientes  [+]  │
├─────────────────────┤
│                     │
│ [🔍 Buscar...]      │
│                     │
│ ┌─────────────────┐ │
│ │ Juan Pérez   🟢 │ │
│ │ ID: 001          │ │
│ │ 35 años          │ │
│ │ ☎ 555-0100      │ │
│ │ [Ver] [Editar]  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ María G.     🟢 │ │
│ │ ID: 002          │ │
│ │ 28 años          │ │
│ │ ☎ 555-0101      │ │
│ │ [Ver] [Editar]  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Pedro L.     ⚫ │ │
│ │ ID: 003          │ │
│ │ 42 años          │ │
│ │ ☎ 555-0102      │ │
│ │ [Ver] [Editar]  │ │
│ └─────────────────┘ │
│                     │
│ [Cargar más...]     │
│                     │
├─────────────────────┤
│[🏠] [👥] [📅] [📁] │
└─────────────────────┘
```

**Especificaciones:**
- Tabla → Cards verticales
- Infinite scroll o "Cargar más"
- Información esencial visible
- Acciones en cada card
- Búsqueda sticky en top

---

## 📅 M-14: Calendario de Citas - Responsive

### Desktop (1280px+)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Side│ ┌──────────────────────────────────────────────────────────┐  │
│ bar │ │ [<] Febrero 2026 [>]    [Hoy] [Día|Semana|Mes] [+Cita] │  │
│ 240 │ └──────────────────────────────────────────────────────────┘  │
│     │                                                                │
│ [N] │ Lun  Mar  Mié  Jue  Vie  Sáb  Dom                            │
│ [a] │ ───────────────────────────────────────────────────────       │
│ [v] │  1    2    3    4    5    6    7                             │
│ [I] │ ••   •••  ••   •••  ••   ─    ─                              │
│ [t] │                                                                │
│ [e] │  8    9   10   11   12   13   14                             │
│ [m] │ •••  ••   •••  ••   ••   ─    ─                              │
│ [s] │                                                                │
│     │ 15   16   17   18   19   20   21                             │
│     │ ••   •••  ••   •••  TODAY ─   ─                              │
│     │           ░░   •••  ░░░                                       │
│     │                                                                │
│     │ 22   23   24   25   26   27   28                             │
│     │ •••  ••   •••  ••   ••   ─    ─                              │
│     │                                                                │
│     │ • = Cita Psicología  • = Cita Enfermería  • = Urgente        │
│     │                                                                │
└──────────────────────────────────────────────────────────────────────┘
```

**Especificaciones:**
- Vista: Mensual (7x5 grid)
- Cell size: 120px x 100px
- Dots representan citas (max 3 visible)
- Click en día: modal con detalles
- Color coding por departamento

---

### Tablet Landscape (1024px - 1279px)

```
┌───────────────────────────────────────────────────────────┐
│ S│ [<] Febrero 2026 [>]   [Semana▼] [+]                  │
│ i│ ─────────────────────────────────────────              │
│ d│                                                         │
│ e│ Lun   Mar   Mié   Jue   Vie   Sáb   Dom               │
│  │ ───────────────────────────────────────────            │
│ 7│ 15    16    17    18    19    20    21                │
│ 2│                         TODAY                          │
│  │ 9:00  9:00  9:00  9:00  9:00   ─     ─                │
│  │ Juan  María Pedro Ana   Luis                          │
│ [│ ───   ───   ───   ───   ───                           │
│ N│ 10:30 10:30 10:30 11:00 10:30                         │
│ a│ Carlos Sofía Jorge Elena Pablo                        │
│ v│ ───   ───   ───   ───   ───                           │
│ ]│ 12:00 12:00 13:00 13:00 12:00                         │
│  │ Diego Laura ...   ...   ...                            │
│  │                                                         │
│  │ [Ver más...]                                           │
│  │                                                         │
└───────────────────────────────────────────────────────────┘
```

**Especificaciones:**
- Vista: Semanal
- Time slots visibles
- Nombres de pacientes
- Scroll vertical para más slots
- Touch-friendly cells (60px height)

---

### Tablet Portrait (768px - 1023px)

```
┌──────────────────────────────────┐
│ S│ [<] Feb 2026 [>]    [+]       │
│ i│ ──────────────────────         │
│ d│                                │
│ e│ ┌────────────────────────────┐ │
│  │ │ Semana del 19-25 Feb       │ │
│ 7│ └────────────────────────────┘ │
│ 2│                                │
│  │ Miércoles 19 - HOY             │
│ [│ ┌────────────────────────────┐ │
│ N│ │ 9:00 - Juan Pérez         │ │
│ a│ │ Psicología - Consulta     │ │
│ v│ │ [Ver] [Editar] [Cancelar] │ │
│ ]│ └────────────────────────────┘ │
│  │                                │
│  │ ┌────────────────────────────┐ │
│  │ │ 10:30 - María González    │ │
│  │ │ Enfermería - Procedimiento│ │
│  │ │ [Ver] [Editar] [Cancelar] │ │
│  │ └────────────────────────────┘ │
│  │                                │
│  │ Jueves 20                      │
│  │ ┌────────────────────────────┐ │
│  │ │ 9:00 - Pedro López        │ │
│  │ │ Psicología - Evaluación   │ │
│  │ └────────────────────────────┘ │
│  │                                │
└──────────────────────────────────┘
```

**Especificaciones:**
- Vista: Agenda/Lista
- Agrupado por día
- Cards expandibles
- Acciones inline
- Scroll vertical

---

### Mobile (320px - 767px)

```
┌─────────────────────┐
│ [≡] Citas      [+]  │
├─────────────────────┤
│                     │
│ [<] 19 Feb [>]      │ ← Date picker
│ ───────────────     │
│                     │
│ HOY - Miércoles     │
│                     │
│ ┌─────────────────┐ │
│ │ 9:00 AM        │ │
│ │ Juan Pérez     │ │
│ │ 👨 Psicología   │ │
│ │ [Ver detalles] │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 10:30 AM       │ │
│ │ María González │ │
│ │ 💉 Enfermería  │ │
│ │ [Ver detalles] │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 12:00 PM       │ │
│ │ Pedro López    │ │
│ │ 👨 Psicología   │ │
│ │ 🔴 URGENTE     │ │
│ │ [Ver detalles] │ │
│ └─────────────────┘ │
│                     │
│ [Ver todas...]      │
│                     │
├─────────────────────┤
│[🏠] [👥] [📅] [📁] │
└─────────────────────┘
```

**Especificaciones:**
- Vista: Agenda diaria
- Date picker en top
- Cards por cita
- Indicadores visuales (iconos, colores)
- Tap para expandir detalles
- Swipe para acciones rápidas

---

## 📋 M-21: Expediente Médico - Responsive

### Desktop (1280px+)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Side│ ┌─────────────────────────────────────────────────────────┐  │
│ bar │ │ [<] Juan Pérez Martínez - 35 años - ID: 001            │  │
│ 240 │ │ ☎ 555-0100 │ 📧 juan@email.com                         │  │
│     │ └─────────────────────────────────────────────────────────┘  │
│ [N] │                                                                │
│ [a] │ [Resumen] [Sesiones] [Procedimientos] [Medicamentos] [Lab]   │
│ [v] │ ──────────────────────────────────────────────────────────    │
│ [I] │                                                                │
│ [t] │ ┌─────────────────────────┐ ┌──────────────────────────┐    │
│ [e] │ │ Información General     │ │ Signos Vitales          │    │
│ [m] │ │ ─────────────────       │ │ ──────────────          │    │
│ [s] │ │ Género: Masculino       │ │ Presión: 120/80         │    │
│     │ │ Sangre: O+              │ │ Temperatura: 36.5°C     │    │
│     │ │ Alergias: Ninguna       │ │ Peso: 75 kg             │    │
│     │ │ ...                     │ │ Altura: 1.75 m          │    │
│     │ └─────────────────────────┘ └──────────────────────────┘    │
│     │                                                                │
│     │ ┌──────────────────────────────────────────────────────────┐ │
│     │ │ Últimas Sesiones                                         │ │
│     │ │ ────────────────                                         │ │
│     │ │ Fecha     │ Tipo        │ Psicólogo    │ Estado         │ │
│     │ │ ──────────────────────────────────────────────────────   │ │
│     │ │ 2026-02-10│ Terapia     │ Dr. García   │ Completada     │ │
│     │ │ 2026-02-03│ Evaluación  │ Dr. García   │ Completada     │ │
│     │ │ 2026-01-27│ Seguimiento │ Dr. García   │ Completada     │ │
│     │ └──────────────────────────────────────────────────────────┘ │
│     │                                                                │
│     │ [Ver Expediente Completo] [Nueva Sesión] [Imprimir]          │
│     │                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Layout:**
- Header: Patient info, full-width
- Tabs: Horizontal navigation
- Content: 2-column grid
- Table: Full-width, all columns
- Actions: Bottom-right

---

### Tablet (768px - 1023px)

```
┌───────────────────────────────────────────────────┐
│ S│ [<] Juan Pérez - 35 años                      │
│ i│ ──────────────────────────                     │
│ d│                                                │
│ e│ [Resumen][Sesiones][Proc.][Med.][Lab] →       │
│  │ ───────────────────────────────────            │
│ 7│                                                │
│ 2│ ┌──────────────────────────────────────────┐  │
│  │ │ Información General                      │  │
│ [│ │ ────────────                             │  │
│ N│ │ Género: Masculino                        │  │
│ a│ │ Sangre: O+                               │  │
│ v│ │ Alergias: Ninguna                        │  │
│ ]│ └──────────────────────────────────────────┘  │
│  │                                                │
│  │ ┌──────────────────────────────────────────┐  │
│  │ │ Signos Vitales                           │  │
│  │ │ ──────────                               │  │
│  │ │ Presión: 120/80                          │  │
│  │ │ Temperatura: 36.5°C                      │  │
│  │ │ Peso: 75 kg                              │  │
│  │ └──────────────────────────────────────────┘  │
│  │                                                │
│  │ Últimas Sesiones                               │
│  │ ┌──────────────────────────────────────────┐  │
│  │ │← → scroll                                 │  │
│  │ │Fecha │Tipo  │Dr.    │Estado               │  │
│  │ ├──────────────────────────────────────────┤  │
│  │ │02/10 │Ter.  │García │✓                    │  │
│  │ │02/03 │Eval. │García │✓                    │  │
│  │ └──────────────────────────────────────────┘  │
│  │                                                │
│  │ [Nueva Sesión] [Ver Todo]                     │
│  │                                                │
└───────────────────────────────────────────────────┘
```

**Layout:**
- Header: Condensed patient info
- Tabs: Horizontal scroll
- Content: Single column
- Cards: Stacked vertically
- Table: Horizontal scroll

---

### Mobile (320px - 767px)

```
┌─────────────────────┐
│ [<] Juan Pérez      │
├─────────────────────┤
│                     │
│ [Avatar] JP         │
│ Juan Pérez Martínez │
│ 35 años - O+ - ID001│
│ ☎ 555-0100          │
│                     │
│ [Resumen▼]          │ ← Accordion
│ ─────────           │
│                     │
│ ┌─────────────────┐ │
│ │ Info General    │ │
│ │ ─────────       │ │
│ │ Género: M       │ │
│ │ Sangre: O+      │ │
│ │ Alergias: No    │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Vitales         │ │
│ │ ──────          │ │
│ │ PA: 120/80      │ │
│ │ Temp: 36.5°C    │ │
│ │ Peso: 75kg      │ │
│ └─────────────────┘ │
│                     │
│ [Sesiones▼]         │
│ ─────────           │
│                     │
│ ┌─────────────────┐ │
│ │ 10 Feb 2026     │ │
│ │ Terapia         │ │
│ │ Dr. García      │ │
│ │ ✓ Completada    │ │
│ │ [Ver]           │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 3 Feb 2026      │ │
│ │ Evaluación      │ │
│ │ Dr. García      │ │
│ │ ✓ Completada    │ │
│ │ [Ver]           │ │
│ └─────────────────┘ │
│                     │
│ [Nueva Sesión]      │
│                     │
├─────────────────────┤
│[🏠] [👥] [📅] [📁] │
└─────────────────────┘
```

**Layout:**
- Header: Patient summary
- Navigation: Accordion sections
- Content: Vertical cards
- Actions: Floating action button
- Sections: Expandible/collapsible

---

## 📊 Métricas de Cards Responsivas

### Desktop

```
┌────────────────────────┐
│ [Icon 48x48]           │
│                        │
│ 156                    │ ← 2rem (32px) bold
│ Pacientes Activos      │ ← 0.875rem (14px)
│                        │
│ ↑ 12% vs mes anterior  │ ← 0.75rem (12px)
└────────────────────────┘
Dimensiones: ~260px x 140px
Padding: 24px
```

### Tablet

```
┌──────────────────────┐
│ [Icon 40x40]         │
│                      │
│ 156                  │ ← 1.75rem (28px)
│ Pacientes Activos    │ ← 0.875rem (14px)
│                      │
│ ↑ 12%                │ ← 0.75rem (12px)
└──────────────────────┘
Dimensiones: ~220px x 120px
Padding: 20px
```

### Mobile

```
┌─────────────────────┐
│ [Icon 36x36] 156    │ ← Inline
│ Pacientes Activos   │
│ ↑ 12% este mes      │
└─────────────────────┘
Dimensiones: 100% width x 100px
Padding: 16px
Layout: Horizontal
```

---

## 🔧 Componentes Complejos Adaptados

### Search Bar Responsive

```scss
// Desktop
.search-bar-desktop {
  width: 400px;
  height: 40px;
  border-radius: 9999px;
}

// Tablet
.search-bar-tablet {
  width: 280px;
  height: 40px;
  border-radius: 24px;
}

// Mobile
.search-bar-mobile {
  width: 100%;
  height: 48px;
  border-radius: 12px;
}
```

### Dropdown/Select Responsive

```scss
// Desktop: Traditional dropdown
.dropdown-desktop {
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
}

// Mobile: Full-screen modal
.dropdown-mobile {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
}
```

### Modal/Dialog Responsive

```scss
// Desktop: Centered modal
.modal-desktop {
  width: 600px;
  max-height: 80vh;
  border-radius: 16px;
}

// Tablet: 90% width
.modal-tablet {
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  border-radius: 12px;
}

// Mobile: Full screen
.modal-mobile {
  width: 100%;
  height: 100%;
  border-radius: 0;
}
```

---

## ✅ Checklist de Mockups Responsivos

### Pantallas Principales

- [x] M-01: Login (Mobile, Tablet, Desktop)
- [x] M-04: Dashboard Admin (Mobile, Tablet, Desktop)
- [x] M-08: Lista Pacientes (Mobile, Tablet, Desktop)
- [x] M-14: Calendario (Mobile, Tablet, Desktop)
- [x] M-21: Expediente (Mobile, Tablet, Desktop)
- [ ] M-22: Registro de Sesión (Mobile, Tablet, Desktop)
- [ ] M-XX: Formularios complejos
- [ ] M-XX: Reportes y estadísticas

### Componentes

- [x] Sidebar/Navigation
- [x] Top Bar
- [x] Bottom Navigation (Mobile)
- [x] Metric Cards
- [x] Data Tables
- [x] Forms
- [x] Modals
- [x] Search Bar
- [x] Dropdowns
- [ ] Date Pickers
- [ ] File Upload
- [ ] Charts/Graphs

### Estados

- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Success states
- [ ] Skeleton screens

---

## 📏 Guía de Medidas Responsive

### Espaciado

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Container padding | 16px | 24px | 32-40px |
| Card padding | 16px | 20px | 24px |
| Gap between cards | 12px | 16px | 20-24px |
| Section spacing | 24px | 32px | 40-48px |

### Tipografía

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| H1 | 24px | 30px | 36px |
| H2 | 20px | 24px | 30px |
| H3 | 18px | 20px | 24px |
| Body | 14px | 15px | 16px |
| Small | 12px | 13px | 14px |

### Componentes

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Button height | 48px | 44px | 40px |
| Input height | 48px | 44px | 40px |
| Icon size | 20-24px | 20-24px | 20-28px |
| Avatar | 40px | 48px | 56px |
| Card min-height | 100px | 120px | 140px |

---

## 🎨 Herramientas para Visualización

### Figma
- Usar Frames con dimensiones exactas
- Crear componentes con variantes por breakpoint
- Auto-layout para responsive behavior

### Sketch
- Artboards por cada breakpoint
- Symbols con overrides
- Responsive constraints

### Adobe XD
- Responsive resize habilitado
- Component states
- Auto-animate para transiciones

---

## 📱 Prototipos Interactivos

### Flujos por Dispositivo

**Mobile:**
1. Login → Dashboard → Bottom Nav → Lista
2. Drawer navigation
3. Pull to refresh
4. Swipe actions

**Tablet:**
1. Login → Dashboard → Sidebar compacto
2. Touch gestures
3. Split view (landscape)

**Desktop:**
1. Login → Dashboard → Sidebar completo
2. Hover states
3. Keyboard shortcuts
4. Multi-window support

---

**Última actualización**: 2026-02-14
**Versión**: 1.0.0
**Estado**: ✅ Especificaciones Visuales Completas
