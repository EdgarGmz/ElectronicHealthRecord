# 📱 Diseño Responsive - Sistema EHR

## 📋 Descripción General

Este documento define la estrategia completa de diseño responsive para el Sistema de Registro de Salud Electrónico (EHR), asegurando una experiencia óptima en todos los dispositivos: computadoras de escritorio, tabletas y dispositivos móviles.

## 🎯 Objetivos del Diseño Responsive

1. **Accesibilidad Universal**: Garantizar acceso desde cualquier dispositivo
2. **Usabilidad Consistente**: Mantener facilidad de uso en todas las pantallas
3. **Legibilidad Óptima**: Asegurar que el contenido médico sea legible
4. **Rendimiento**: Optimizar carga y rendimiento en dispositivos móviles
5. **Experiencia Médica**: Priorizar flujos de trabajo clínicos en cada contexto

## 🎯 Estrategia de Diseño

### Enfoque: Desktop First con Responsive Adaptation

**Justificación:**
- Uso principal en estaciones de trabajo médicas (escritorio)
- Consultorios con computadoras de escritorio
- Funcionalidad completa requiere pantallas amplias
- Tablets para uso en campo (secundario)
- Móvil para consulta rápida (solo lectura)

### Prioridades por Dispositivo

1. **Desktop (Principal)**: 
   - Funcionalidad completa
   - Multi-ventana
   - Edición de expedientes
   - Todos los módulos activos

2. **Tablet (Secundario)**:
   - Funcionalidad de lectura/escritura
   - Navegación optimizada para touch
   - Visualización de expedientes
   - Consultas en campo

3. **Mobile (Terciario)**:
   - Consulta de información
   - Visualización de citas
   - Notificaciones
   - Acceso de emergencia

---

## 📐 1. Breakpoints del Sistema

### 1.1 Breakpoints Principales

Basados en TailwindCSS con ajustes para necesidades médicas:

```scss
// Mobile Small
$breakpoint-xs: 320px;    // Smartphones pequeños (mínimo soportado)

// Mobile
$breakpoint-sm: 640px;    // Smartphones grandes / phablets

// Tablet Portrait
$breakpoint-md: 768px;    // Tablets en vertical

// Tablet Landscape / Laptop Small
$breakpoint-lg: 1024px;   // Tablets horizontal / laptops pequeñas

// Desktop
$breakpoint-xl: 1280px;   // Monitores estándar

// Large Desktop
$breakpoint-2xl: 1536px;  // Monitores grandes / workstations médicas

// Extra Large (Opcional)
$breakpoint-3xl: 1920px;  // Monitores Full HD / 2K
```

### 1.2 Media Queries

```scss
// Mobile First Approach
@media (min-width: 320px) { /* Mobile Small */ }
@media (min-width: 640px) { /* Mobile Large */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Laptop */ }
@media (min-width: 1280px) { /* Desktop */ }
@media (min-width: 1536px) { /* Large Desktop */ }
@media (min-width: 1920px) { /* Extra Large */ }
```

```scss
// Desktop First (cuando sea necesario)
@media (max-width: 1535px) { /* < Large Desktop */ }
@media (max-width: 1279px) { /* < Desktop */ }
@media (max-width: 1023px) { /* < Laptop */ }
@media (max-width: 767px) { /* < Tablet */ }
@media (max-width: 639px) { /* < Mobile Large */ }
@media (max-width: 319px) { /* < Mobile Small (no soportado) */ }
```

### 1.3 Rangos de Dispositivos

| Categoría | Rango | Uso Principal | Funcionalidad |
|-----------|-------|---------------|---------------|
| **Mobile Small** | 320px - 639px | Smartphones | Solo lectura, consulta rápida |
| **Mobile Large** | 640px - 767px | Phablets | Lectura + acciones básicas |
| **Tablet Portrait** | 768px - 1023px | Tablets vertical | Lectura/escritura limitada |
| **Tablet Landscape** | 1024px - 1279px | Tablets horizontal | Funcionalidad media |
| **Desktop** | 1280px - 1535px | Monitores estándar | Funcionalidad completa |
| **Large Desktop** | 1536px+ | Workstations | Funcionalidad completa + multi-panel |

---

## 📱 2. Especificaciones por Breakpoint

### 2.1 Mobile Small (320px - 639px)

#### Características
- **Layout**: Single column, stack vertical
- **Navegación**: Bottom navigation bar o hamburger menu
- **Sidebar**: Hidden (drawer on demand)
- **Contenido**: 100% width, padding mínimo
- **Fuente base**: 14px (ajustada para legibilidad)

#### Especificaciones de Layout

```scss
.container-mobile {
  width: 100%;
  padding: 16px;
  max-width: 100%;
}

.layout-mobile {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

// Header móvil
.mobile-header {
  height: 56px;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}

// Navegación inferior
.mobile-bottom-nav {
  height: 64px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  border-top: 1px solid var(--gray-200);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-around;
  padding: 8px;
  z-index: 50;
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  min-width: 44px;
  min-height: 44px;
}
```

#### Componentes Adaptados

**Cards:**
```scss
.card-mobile {
  width: 100%;
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
}
```

**Tablas → Cards Verticales:**
```scss
.table-mobile {
  display: none;
}

.table-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.table-card-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--gray-100);
}

.table-card-row:last-child {
  border-bottom: none;
}
```

**Formularios:**
```scss
.form-mobile .form-group {
  margin-bottom: 16px;
}

.form-mobile .form-input {
  width: 100%;
  height: 48px; // Mayor para touch
  font-size: 16px; // Prevenir zoom en iOS
}

.form-mobile .form-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-mobile .btn {
  width: 100%;
  min-height: 48px;
}
```

**Modales:**
```scss
.modal-mobile {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0;
  max-width: 100%;
  max-height: 100%;
}

.modal-mobile .modal-header {
  position: sticky;
  top: 0;
  background: var(--white);
  z-index: 10;
}
```

#### Tipografía Móvil

```scss
// Ajustes para legibilidad móvil
.text-h1-mobile { font-size: 1.75rem; }  // 28px
.text-h2-mobile { font-size: 1.5rem; }   // 24px
.text-h3-mobile { font-size: 1.25rem; }  // 20px
.text-h4-mobile { font-size: 1.125rem; } // 18px
.text-body-mobile { font-size: 0.875rem; } // 14px
```

---

### 2.2 Mobile Large (640px - 767px)

#### Características
- **Layout**: Single column con más espacio
- **Navegación**: Side drawer + top bar
- **Grid**: 1 columna principal, 2 columnas para cards pequeñas
- **Fuente base**: 15px

#### Especificaciones

```scss
.container-mobile-lg {
  width: 100%;
  padding: 20px;
  max-width: 640px;
  margin: 0 auto;
}

// Grid de 2 columnas para cards
.grid-mobile-lg {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

// Sidebar drawer
.sidebar-mobile-lg {
  position: fixed;
  left: -280px;
  top: 0;
  width: 280px;
  height: 100vh;
  background: var(--gray-900);
  transition: left 0.3s ease;
  z-index: 100;
}

.sidebar-mobile-lg.open {
  left: 0;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
}
```

---

### 2.3 Tablet Portrait (768px - 1023px)

#### Características
- **Layout**: 2 columnas principales
- **Navegación**: Sidebar compacto (solo iconos) + top bar
- **Grid**: 2-3 columnas para contenido
- **Fuente base**: 16px
- **Interacción**: Optimizada para touch

#### Especificaciones

```scss
.container-tablet {
  width: 100%;
  padding: 24px;
  max-width: 100%;
}

// Layout con sidebar compacto
.layout-tablet {
  display: grid;
  grid-template-columns: 72px 1fr;
  min-height: 100vh;
}

// Sidebar compacto (solo iconos)
.sidebar-tablet {
  width: 72px;
  background: var(--gray-900);
  padding: 16px 8px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 50;
}

.sidebar-tablet-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  color: var(--gray-300);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  min-height: 64px;
  min-width: 56px;
}

.sidebar-tablet-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.sidebar-tablet-label {
  font-size: 10px;
  text-align: center;
}

// Contenido principal
.main-content-tablet {
  margin-left: 72px;
  padding: 24px;
}

// Grid para cards
.grid-tablet {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

// Tablas responsivas
.table-tablet {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-tablet table {
  min-width: 600px;
}
```

#### Componentes Touch-Optimized

```scss
// Botones más grandes para touch
.btn-tablet {
  min-height: 44px;
  padding: 12px 20px;
  font-size: 15px;
}

// Inputs touch-friendly
.form-input-tablet {
  height: 44px;
  font-size: 16px; // Prevenir zoom
}

// Tabs horizontales con scroll
.tabs-tablet {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  gap: 8px;
}
```

---

### 2.4 Tablet Landscape / Laptop (1024px - 1279px)

#### Características
- **Layout**: Sidebar completo + contenido principal
- **Navegación**: Sidebar visible con texto
- **Grid**: 3-4 columnas para contenido
- **Fuente base**: 16px
- **Funcionalidad**: Casi completa

#### Especificaciones

```scss
.container-laptop {
  width: 100%;
  padding: 24px 32px;
  max-width: 100%;
}

// Layout con sidebar completo
.layout-laptop {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

// Sidebar completo
.sidebar-laptop {
  width: 240px;
  background: var(--gray-900);
  padding: 24px 16px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 50;
}

// Contenido principal
.main-content-laptop {
  margin-left: 240px;
  padding: 32px;
}

// Grid para contenido
.grid-laptop {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

// Tablas completas
.table-laptop {
  width: 100%;
  border-collapse: collapse;
}

.table-laptop th,
.table-laptop td {
  padding: 12px 16px;
}
```

#### Dashboard Layout

```scss
// Métricas en grid
.metrics-laptop {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

// Gráficas en 2 columnas
.charts-laptop {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
```

---

### 2.5 Desktop (1280px - 1535px)

#### Características
- **Layout**: Sidebar + contenido + panel opcional
- **Navegación**: Sidebar completo siempre visible
- **Grid**: 4 columnas para contenido
- **Fuente base**: 16px
- **Funcionalidad**: Completa con todas las características

#### Especificaciones

```scss
.container-desktop {
  width: 100%;
  padding: 32px 40px;
  max-width: 1280px;
  margin: 0 auto;
}

// Layout completo
.layout-desktop {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 0;
  min-height: 100vh;
}

// Grid para contenido
.grid-desktop {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

// Dashboard con panel lateral opcional
.dashboard-desktop {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.dashboard-main {
  min-width: 0; // Prevenir overflow
}

.dashboard-sidebar {
  width: 320px;
}

// Métricas
.metrics-desktop {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

// Tablas con todas las columnas
.table-desktop {
  width: 100%;
  table-layout: auto;
}

.table-desktop th,
.table-desktop td {
  padding: 14px 20px;
}
```

---

### 2.6 Large Desktop (1536px+)

#### Características
- **Layout**: Multi-panel con información adicional
- **Navegación**: Sidebar expandido con sub-menús
- **Grid**: 4-6 columnas para contenido
- **Fuente base**: 16px
- **Funcionalidad**: Completa con vistas adicionales

#### Especificaciones

```scss
.container-large-desktop {
  width: 100%;
  padding: 32px 48px;
  max-width: 1536px;
  margin: 0 auto;
}

// Layout con paneles adicionales
.layout-large-desktop {
  display: grid;
  grid-template-columns: 260px 1fr 320px;
  gap: 24px;
  min-height: 100vh;
}

// Grid expandido
.grid-large-desktop {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
}

// Dashboard con 3 columnas
.dashboard-large-desktop {
  display: grid;
  grid-template-columns: 260px 1fr 380px;
  gap: 32px;
}

// Sidebar expandido
.sidebar-large-desktop {
  width: 260px;
}

// Panel lateral adicional
.side-panel-large-desktop {
  width: 380px;
  background: var(--white);
  border-left: 1px solid var(--gray-200);
  padding: 24px;
}
```

---

## 🧩 3. Comportamiento de Componentes

### 3.1 Sidebar / Navegación

| Breakpoint | Comportamiento |
|------------|----------------|
| **Mobile Small** | Hidden - Hamburger menu → Full-screen drawer |
| **Mobile Large** | Hidden - Hamburger menu → Side drawer (280px) |
| **Tablet Portrait** | Compacto (72px) - Solo iconos + tooltip |
| **Tablet Landscape** | Completo (240px) - Iconos + texto |
| **Desktop** | Completo (240px) - Siempre visible |
| **Large Desktop** | Expandido (260px) - Con sub-menús |

**Código de ejemplo:**

```scss
// Sidebar responsivo
.sidebar {
  @media (max-width: 767px) {
    // Mobile: Drawer
    position: fixed;
    left: -100%;
    width: 100%;
    height: 100vh;
    transition: left 0.3s ease;
    z-index: 100;
    
    &.open {
      left: 0;
    }
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    // Tablet: Compacto
    width: 72px;
    position: fixed;
    
    .sidebar-label {
      display: none;
    }
  }
  
  @media (min-width: 1024px) {
    // Desktop: Completo
    width: 240px;
    position: fixed;
    
    .sidebar-label {
      display: block;
    }
  }
  
  @media (min-width: 1536px) {
    // Large Desktop: Expandido
    width: 260px;
    
    .sidebar-submenu {
      display: block;
    }
  }
}
```

---

### 3.2 Tablas de Datos

| Breakpoint | Comportamiento |
|------------|----------------|
| **Mobile Small** | Cards verticales con información clave |
| **Mobile Large** | Cards con más información |
| **Tablet Portrait** | Scroll horizontal con columnas mínimas |
| **Tablet Landscape** | Tabla con 4-5 columnas visibles |
| **Desktop** | Tabla completa con todas las columnas |
| **Large Desktop** | Tabla con columnas adicionales |

**Transformación Mobile:**

```jsx
// Component: ResponsiveTable.tsx
const ResponsiveTable = ({ data }) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  if (isMobile) {
    return (
      <div className="table-cards">
        {data.map(item => (
          <div className="table-card" key={item.id}>
            <div className="table-card-header">
              <h3>{item.name}</h3>
              <span className={`status-badge ${item.status}`}>
                {item.status}
              </span>
            </div>
            <div className="table-card-body">
              <div className="table-card-row">
                <span className="label">ID:</span>
                <span className="value">{item.id}</span>
              </div>
              <div className="table-card-row">
                <span className="label">Fecha:</span>
                <span className="value">{item.date}</span>
              </div>
              <div className="table-card-row">
                <span className="label">Tipo:</span>
                <span className="value">{item.type}</span>
              </div>
            </div>
            <div className="table-card-actions">
              <button className="btn-icon"><EditIcon /></button>
              <button className="btn-icon"><ViewIcon /></button>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="table-container">
      <table className="table">
        {/* Tabla tradicional para tablet+ */}
      </table>
    </div>
  );
};
```

**Scroll horizontal para Tablet:**

```scss
.table-tablet-scroll {
  @media (min-width: 768px) and (max-width: 1023px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    table {
      min-width: 700px;
    }
    
    // Sticky primera columna
    th:first-child,
    td:first-child {
      position: sticky;
      left: 0;
      background: var(--white);
      z-index: 10;
      box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
    }
  }
}
```

---

### 3.3 Formularios

| Breakpoint | Comportamiento |
|------------|----------------|
| **Mobile** | 1 columna, inputs full-width, botones stacked |
| **Tablet** | 1-2 columnas según complejidad |
| **Desktop** | 2-3 columnas, layout horizontal optimizado |
| **Large Desktop** | Multi-columna con secciones colapsables |

**Código responsive:**

```scss
.form-responsive {
  // Mobile: 1 columna
  @media (max-width: 767px) {
    .form-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-col {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      flex-direction: column-reverse;
      gap: 12px;
      
      .btn {
        width: 100%;
      }
    }
  }
  
  // Tablet: 2 columnas
  @media (min-width: 768px) and (max-width: 1023px) {
    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    
    .form-col-full {
      grid-column: 1 / -1;
    }
  }
  
  // Desktop: 3 columnas
  @media (min-width: 1024px) {
    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    .form-col-2 {
      grid-column: span 2;
    }
    
    .form-col-full {
      grid-column: 1 / -1;
    }
  }
}
```

---

### 3.4 Modales y Diálogos

| Breakpoint | Comportamiento |
|------------|----------------|
| **Mobile** | Full-screen, desde abajo con animación |
| **Tablet** | Centered, 90% width, max 600px |
| **Desktop** | Centered, max 800px, overlay translúcido |
| **Large Desktop** | Multi-modal con side-by-side cuando aplique |

**Implementación:**

```scss
.modal-responsive {
  // Mobile: Full screen
  @media (max-width: 767px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    
    &.open {
      transform: translateY(0);
    }
  }
  
  // Tablet
  @media (min-width: 768px) and (max-width: 1023px) {
    max-width: 90%;
    width: 600px;
    max-height: 85vh;
    border-radius: var(--radius-xl);
  }
  
  // Desktop
  @media (min-width: 1024px) {
    max-width: 800px;
    max-height: 90vh;
    border-radius: var(--radius-2xl);
  }
}
```

---

### 3.5 Dashboard y Métricas

| Breakpoint | Grid de Métricas |
|------------|------------------|
| **Mobile Small** | 1 columna |
| **Mobile Large** | 2 columnas |
| **Tablet Portrait** | 2 columnas |
| **Tablet Landscape** | 3 columnas |
| **Desktop** | 4 columnas |
| **Large Desktop** | 4-6 columnas |

```scss
.metrics-grid {
  display: grid;
  gap: 16px;
  
  @media (min-width: 320px) {
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  @media (min-width: 1536px) {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

---

### 3.6 Calendario de Citas

| Breakpoint | Vista |
|------------|-------|
| **Mobile** | Agenda/Lista diaria |
| **Tablet Portrait** | Vista semanal compacta |
| **Tablet Landscape** | Vista semanal completa |
| **Desktop** | Vista mensual con detalles |
| **Large Desktop** | Vista mensual + panel de detalles |

**Código de ejemplo:**

```jsx
const ResponsiveCalendar = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  if (isMobile) {
    return <AgendaView />; // Lista de citas por día
  }
  
  if (isTablet) {
    return <WeekView compact />; // Vista semanal
  }
  
  return <MonthView />; // Vista mensual
};
```

---

### 3.7 Expediente Médico

| Breakpoint | Layout |
|------------|--------|
| **Mobile** | Tabs verticales + contenido full-width |
| **Tablet** | Tabs horizontales con scroll |
| **Desktop** | Tabs + contenido en grid 2 columnas |
| **Large Desktop** | Sidebar tabs + contenido multi-columna |

```scss
.patient-record-layout {
  @media (max-width: 767px) {
    // Mobile: Accordion vertical
    .tabs {
      display: flex;
      flex-direction: column;
      border: none;
    }
    
    .tab-content {
      padding: 16px;
    }
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    // Tablet: Tabs horizontales
    .tabs {
      display: flex;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border-bottom: 1px solid var(--gray-200);
    }
  }
  
  @media (min-width: 1024px) {
    // Desktop: Layout con sidebar
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
    
    .tabs {
      display: flex;
      flex-direction: column;
    }
    
    .tab-content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
  }
}
```

---

## 🎨 4. Imágenes y Media

### 4.1 Imágenes Responsivas

```html
<!-- Picture element con multiple sources -->
<picture>
  <source media="(min-width: 1280px)" srcset="image-large.jpg">
  <source media="(min-width: 768px)" srcset="image-medium.jpg">
  <source media="(min-width: 320px)" srcset="image-small.jpg">
  <img src="image-fallback.jpg" alt="Description">
</picture>
```

### 4.2 Iconos Responsivos

```scss
.icon-responsive {
  @media (max-width: 639px) {
    width: 20px;
    height: 20px;
  }
  
  @media (min-width: 640px) {
    width: 24px;
    height: 24px;
  }
  
  @media (min-width: 1280px) {
    width: 28px;
    height: 28px;
  }
}
```

---

## ⚡ 5. Optimizaciones de Rendimiento

### 5.1 Lazy Loading

```jsx
// Lazy load componentes pesados en móvil
const HeavyChart = lazy(() => import('./HeavyChart'));

const Dashboard = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return (
    <div>
      {isDesktop && (
        <Suspense fallback={<Skeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
};
```

### 5.2 Imágenes Optimizadas

```jsx
// Cargar imágenes según breakpoint
const useResponsiveImage = (images) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  
  if (isMobile) return images.mobile;
  if (isTablet) return images.tablet;
  return images.desktop;
};
```

### 5.3 Code Splitting por Ruta

```jsx
// Router con lazy loading
const MobileRoutes = lazy(() => import('./routes/MobileRoutes'));
const DesktopRoutes = lazy(() => import('./routes/DesktopRoutes'));

const App = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      {isMobile ? <MobileRoutes /> : <DesktopRoutes />}
    </Suspense>
  );
};
```

---

## 🧪 6. Testing Responsive

### 6.1 Dispositivos de Prueba

| Categoría | Dispositivos | Resolución |
|-----------|--------------|------------|
| **Mobile Small** | iPhone SE, Galaxy S20 | 375x667, 360x800 |
| **Mobile Large** | iPhone 14, Pixel 7 | 390x844, 412x915 |
| **Tablet** | iPad, Galaxy Tab | 768x1024, 800x1280 |
| **Desktop** | Laptop 13", Monitor 24" | 1280x800, 1920x1080 |
| **Large Desktop** | Monitor 27", 4K | 2560x1440, 3840x2160 |

### 6.2 Checklist de Validación

```markdown
Por cada pantalla/componente:

Mobile (320px - 767px):
- [ ] Layout se adapta a 1 columna
- [ ] Sidebar/menú colapsado funciona
- [ ] Botones tienen mínimo 44x44px
- [ ] Texto legible sin zoom
- [ ] No hay scroll horizontal
- [ ] Inputs tienen mínimo 16px font-size
- [ ] Tablas se convierten a cards

Tablet (768px - 1023px):
- [ ] Layout 2 columnas funciona
- [ ] Sidebar compacto visible
- [ ] Touch targets adecuados (44x44px)
- [ ] Scroll horizontal en tablas
- [ ] Modales centrados

Desktop (1024px+):
- [ ] Layout completo funcional
- [ ] Sidebar siempre visible
- [ ] Hover states funcionan
- [ ] Grid de 3-4 columnas
- [ ] Tablas muestran todas las columnas
```

### 6.3 Media Query Testing

```javascript
// Hook personalizado para testing
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('mobile');
      else if (width < 768) setBreakpoint('mobile-lg');
      else if (width < 1024) setBreakpoint('tablet');
      else if (width < 1280) setBreakpoint('laptop');
      else if (width < 1536) setBreakpoint('desktop');
      else setBreakpoint('desktop-lg');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
};
```

---

## ♿ 7. Accesibilidad Responsive

### 7.1 Touch Targets

```scss
// Mínimo 44x44px para elementos táctiles
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
  
  @media (min-width: 1024px) {
    // Desktop puede ser más pequeño (mouse precision)
    min-width: 32px;
    min-height: 32px;
    padding: 8px;
  }
}
```

### 7.2 Font Size

```scss
// Prevenir zoom en iOS
input,
select,
textarea {
  font-size: 16px; // Mínimo en mobile
  
  @media (min-width: 1024px) {
    font-size: 14px; // Puede ser menor en desktop
  }
}
```

### 7.3 Focus States

```scss
// Focus visible en todos los dispositivos
*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
  
  @media (max-width: 767px) {
    // Más prominente en mobile
    outline-width: 3px;
    outline-offset: 3px;
  }
}
```

---

## 📋 8. Checklist de Implementación

### Diseño
- [x] Breakpoints definidos y documentados
- [x] Especificaciones por breakpoint creadas
- [x] Comportamiento de componentes especificado
- [ ] Mockups para cada breakpoint
- [ ] Prototipos interactivos
- [ ] Guías de animación responsive

### Desarrollo
- [ ] Media queries implementadas
- [ ] Componentes responsivos creados
- [ ] Sistema de grid responsive
- [ ] Navegación responsive
- [ ] Tablas responsivas
- [ ] Formularios responsive
- [ ] Modales responsive

### Testing
- [ ] Tests en dispositivos reales
- [ ] Tests en emuladores
- [ ] Tests de performance
- [ ] Tests de accesibilidad
- [ ] Tests de usabilidad

### Documentación
- [x] Guía de breakpoints
- [x] Especificaciones de componentes
- [x] Ejemplos de código
- [ ] Guía de mejores prácticas
- [ ] Video tutoriales

---

## 📚 9. Referencias y Recursos

### Herramientas de Testing
- **Chrome DevTools**: Device emulation
- **Firefox Responsive Design Mode**: Testing multi-dispositivo
- **BrowserStack**: Testing en dispositivos reales
- **Responsively App**: Testing multi-viewport simultáneo

### Frameworks y Librerías
- **TailwindCSS**: Utility classes responsive
- **React Responsive**: Media query hooks
- **React Device Detect**: Device detection
- **React Media**: Component-based media queries

### Guías de Referencia
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [A11y Project](https://www.a11yproject.com/)
- [WCAG 2.1 Mobile Accessibility](https://www.w3.org/WAI/standards-guidelines/mobile/)

### Healthcare Specific
- [Healthcare UI Patterns](https://www.nngroup.com/articles/health-medical-design/)
- [HIPAA Mobile Compliance](https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html)

---

## 📝 Notas de Implementación

### Consideraciones Especiales para EHR

1. **Legibilidad Crítica**: 
   - Información médica debe ser legible en TODOS los dispositivos
   - Fuentes mínimas: 14px mobile, 16px desktop
   - Alto contraste requerido

2. **Precisión Touch**:
   - Botones de acciones críticas: mínimo 48x48px en mobile
   - Separación adecuada entre elementos interactivos
   - Confirmaciones para acciones destructivas

3. **Performance**:
   - Expedientes grandes: lazy loading de secciones
   - Imágenes médicas: carga progresiva
   - Cache de datos frecuentes

4. **Offline Support**:
   - Funcionalidad básica offline en mobile
   - Sincronización cuando hay conexión
   - Indicadores claros de estado de conexión

5. **Seguridad**:
   - Timeouts más cortos en mobile
   - Auto-lock en inactividad
   - Biometría para autenticación rápida

---

## ✅ Validación y Aprobación

### Criterios de Aceptación

- [x] Breakpoints definidos y documentados
- [x] Especificaciones técnicas por breakpoint
- [x] Comportamiento de componentes especificado
- [ ] Mockups creados para breakpoints principales
- [ ] Prototipos interactivos
- [ ] Validación con usuarios
- [ ] Validación con equipo de desarrollo

### Stakeholders

- **Product Owner**: Aprobación de funcionalidad por dispositivo
- **Diseñador UX**: Validación de usabilidad
- **Equipo Médico**: Validación de flujos clínicos
- **Desarrolladores**: Factibilidad técnica

---

**Última actualización**: 2026-02-14
**Versión**: 1.0.0
**Estado**: ✅ Documentación Completa - Pendiente Mockups Visuales
