# 🎨 Mockups de Alta Fidelidad - Sistema EHR

## ✅ ESTADO: APROBADOS

**Fecha de Aprobación**: 2026-02-14
**Versión Aprobada**: 1.1.0

Los siguientes mockups de alta fidelidad han sido **oficialmente aprobados** para su implementación:
- ✅ M-01: Login
- ✅ M-04: Dashboard Admin
- ✅ M-08: Lista de Pacientes
- ✅ M-14: Calendario
- ✅ M-21: Expediente

El sistema de diseño base y los componentes reutilizables también han sido aprobados y están listos para el desarrollo frontend.

---

## 📋 Descripción

Este documento contiene las especificaciones de mockups de alta fidelidad para el Sistema de Registro de Salud Electrónico. Los mockups incluyen elementos visuales finales: colores, tipografía, iconografía, imágenes y estilos según el sistema de diseño establecido.

## 🎯 Objetivo

Crear especificaciones visuales detalladas que guíen el desarrollo frontend, asegurando:
- Consistencia visual en todo el sistema
- Adherencia al sistema de diseño
- Experiencia de usuario profesional y médica
- Facilidad de implementación para desarrolladores

## 🎨 Sistema de Diseño Base

### Paleta de Colores

#### Colores Primarios
```css
/* Healthcare Blue - Profesional y confiable */
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* Main Primary */
--primary-600: #2563EB;
--primary-700: #1D4ED8;
--primary-800: #1E40AF;  /* Dark Primary */
--primary-900: #1E3A8A;

/* Medical Green - Salud y bienestar */
--success-50: #ECFDF5;
--success-100: #D1FAE5;
--success-200: #A7F3D0;
--success-300: #6EE7B7;
--success-400: #34D399;
--success-500: #10B981;  /* Main Success */
--success-600: #059669;
--success-700: #047857;
--success-800: #065F46;
--success-900: #064E3B;
```

#### Colores de Estado
```css
/* Warning - Precaución */
--warning-50: #FFFBEB;
--warning-100: #FEF3C7;
--warning-200: #FDE68A;
--warning-300: #FCD34D;
--warning-400: #FBBF24;
--warning-500: #F59E0B;  /* Main Warning */
--warning-600: #D97706;
--warning-700: #B45309;

/* Error - Crítico */
--error-50: #FEF2F2;
--error-100: #FEE2E2;
--error-200: #FECACA;
--error-300: #FCA5A5;
--error-400: #F87171;
--error-500: #EF4444;  /* Main Error */
--error-600: #DC2626;
--error-700: #B91C1C;

/* Info - Información */
--info-50: #EFF6FF;
--info-100: #DBEAFE;
--info-200: #BFDBFE;
--info-300: #93C5FD;
--info-400: #60A5FA;
--info-500: #3B82F6;  /* Main Info */
--info-600: #2563EB;
```

#### Colores Neutrales
```css
/* Grayscale - Base del sistema */
--gray-50: #F9FAFB;   /* Background light */
--gray-100: #F3F4F6;  /* Background */
--gray-200: #E5E7EB;  /* Border light */
--gray-300: #D1D5DB;  /* Border */
--gray-400: #9CA3AF;  /* Placeholder */
--gray-500: #6B7280;  /* Text secondary */
--gray-600: #4B5563;  /* Text primary */
--gray-700: #374151;  /* Text dark */
--gray-800: #1F2937;  /* Text darker */
--gray-900: #111827;  /* Text darkest */

/* White & Black */
--white: #FFFFFF;
--black: #000000;
```

### Tipografía

#### Familia de Fuentes
```css
/* Primary Font - Inter */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Secondary Font - Roboto */
font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* Monospace - Fira Code */
font-family: 'Fira Code', 'Courier New', monospace;
```

#### Escala Tipográfica
```css
/* Display */
.text-display {
  font-size: 3rem;      /* 48px */
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Heading 1 */
.text-h1 {
  font-size: 2.25rem;   /* 36px */
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Heading 2 */
.text-h2 {
  font-size: 1.875rem;  /* 30px */
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Heading 3 */
.text-h3 {
  font-size: 1.5rem;    /* 24px */
  line-height: 1.35;
  font-weight: 600;
}

/* Heading 4 */
.text-h4 {
  font-size: 1.25rem;   /* 20px */
  line-height: 1.4;
  font-weight: 500;
}

/* Body Large */
.text-body-lg {
  font-size: 1.125rem;  /* 18px */
  line-height: 1.5;
  font-weight: 400;
}

/* Body */
.text-body {
  font-size: 1rem;      /* 16px */
  line-height: 1.5;
  font-weight: 400;
}

/* Body Small */
.text-body-sm {
  font-size: 0.875rem;  /* 14px */
  line-height: 1.5;
  font-weight: 400;
}

/* Caption */
.text-caption {
  font-size: 0.75rem;   /* 12px */
  line-height: 1.4;
  font-weight: 400;
}
```

### Espaciado

```css
/* Sistema base 8px */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
```

### Sombras

```css
/* Elevaciones */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Bordes

```css
/* Border Radius */
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Circular */

/* Border Width */
--border-0: 0;
--border-1: 1px;
--border-2: 2px;
--border-4: 4px;
```

---

## 🖼️ Especificaciones de Mockups

### M-01: Pantalla de Login

#### Descripción Visual
Pantalla limpia y profesional con enfoque en seguridad y confianza.

#### Especificaciones de Diseño

**Layout:**
- Ancho máximo: 400px centrado
- Padding lateral: 32px
- Background: Gradiente sutil `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Card sobre gradiente con `--shadow-xl`

**Logo:**
- Tamaño: 80px x 80px
- Color: `--primary-500`
- Margin bottom: 32px

**Título:**
- Font: `text-h2`
- Color: `--gray-900`
- Text: "Iniciar Sesión"
- Margin bottom: 24px

**Campos de Entrada:**
```css
.input-field {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: 16px;
  color: var(--gray-900);
  background: var(--white);
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.input-field::placeholder {
  color: var(--gray-400);
}

.input-field.error {
  border-color: var(--error-500);
}
```

**Botón Principal:**
```css
.btn-primary {
  width: 100%;
  height: 48px;
  padding: 12px 24px;
  background: var(--primary-500);
  color: var(--white);
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: var(--primary-600);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-primary:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
  transform: none;
}
```

**Iconos:**
- Biblioteca: React Icons (Heroicons)
- Tamaño: 20px
- Color: `--gray-400`
- Posición: Left padding interno del input

---

### M-04: Dashboard Administrador

#### Descripción Visual
Dashboard moderno con cards de métricas, gráficas y acceso rápido.

#### Layout Principal
```
┌─────────────────────────────────────────────────┐
│ Sidebar (240px) │ Main Content (flex-1)        │
│                 │                               │
│ [Navigation]    │ [Top Bar 64px]               │
│                 │ ─────────────────────────────  │
│                 │                               │
│                 │ [Metrics Grid]                │
│                 │                               │
│                 │ [Charts & Activity]           │
│                 │                               │
└─────────────────────────────────────────────────┘
```

**Sidebar:**
```css
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--gray-900);
  color: var(--white);
  padding: 24px 16px;
  box-shadow: var(--shadow-lg);
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-logo {
  height: 48px;
  margin-bottom: 32px;
  padding: 0 8px;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: var(--radius-lg);
  color: var(--gray-300);
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--white);
}

.sidebar-nav-item.active {
  background: var(--primary-500);
  color: var(--white);
}

.sidebar-nav-icon {
  margin-right: 12px;
  font-size: 20px;
}
```

**Top Bar:**
```css
.top-bar {
  height: 64px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.search-bar {
  width: 400px;
  height: 40px;
  padding: 8px 16px 8px 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-full);
  background: var(--gray-50);
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}
```

**Metric Cards:**
```css
.metric-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
}

.metric-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
}

.metric-icon.primary {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary-500);
}

.metric-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-500);
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: 8px;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.metric-change.positive {
  color: var(--success-600);
}

.metric-change.negative {
  color: var(--error-600);
}
```

**Chart Container:**
```css
.chart-container {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  margin-top: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
}
```

---

### M-08: Lista de Pacientes

#### Especificaciones de Tabla

```css
.table-container {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--gray-200);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.table-header-cell {
  padding: 16px 24px;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  border-bottom: 1px solid var(--gray-200);
  transition: background 0.2s ease;
}

.table-row:hover {
  background: var(--gray-50);
}

.table-cell {
  padding: 16px 24px;
  font-size: 0.875rem;
  color: var(--gray-900);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-700);
}

.status-badge.inactive {
  background: rgba(107, 114, 128, 0.1);
  color: var(--gray-700);
}
```

**Filtros y Búsqueda:**
```css
.filter-bar {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 20px 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-dropdown {
  min-width: 150px;
  height: 40px;
  padding: 8px 16px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  background: var(--white);
  font-size: 14px;
  color: var(--gray-900);
  cursor: pointer;
}
```

---

### M-14: Calendario de Citas

#### Especificaciones de Calendario

```css
.calendar-container {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: 24px;
  border: 1px solid var(--gray-200);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gray-200);
}

.calendar-nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

.calendar-nav-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-300);
  background: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.calendar-nav-btn:hover {
  background: var(--gray-50);
  border-color: var(--primary-500);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day-header {
  text-align: center;
  padding: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
}

.calendar-day {
  aspect-ratio: 1;
  padding: 8px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover {
  background: var(--gray-50);
  border-color: var(--primary-500);
}

.calendar-day.today {
  border-color: var(--primary-500);
  background: rgba(59, 130, 246, 0.05);
}

.calendar-day-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.calendar-appointment-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  margin: 2px;
}

.calendar-appointment-dot.psychology {
  background: var(--primary-500);
}

.calendar-appointment-dot.nursing {
  background: var(--success-500);
}

.calendar-appointment-dot.urgent {
  background: var(--error-500);
}
```

---

### M-21: Vista de Expediente

#### Especificaciones de Layout

```css
.patient-header {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.patient-avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.patient-info {
  flex: 1;
}

.patient-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.patient-meta {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.patient-actions {
  display: flex;
  gap: 12px;
}

.tabs-container {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.tab-button {
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: var(--gray-900);
  background: rgba(0, 0, 0, 0.02);
}

.tab-button.active {
  color: var(--primary-600);
  border-bottom-color: var(--primary-600);
  background: var(--white);
}

.tab-content {
  padding: 24px;
}
```

---

## 📚 Componentes Reutilizables

### Botones

```css
/* Primary Button */
.btn {
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: var(--primary-500);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-600);
}

/* Secondary Button */
.btn-secondary {
  background: var(--white);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

/* Success Button */
.btn-success {
  background: var(--success-500);
  color: var(--white);
}

/* Danger Button */
.btn-danger {
  background: var(--error-500);
  color: var(--white);
}

/* Icon Button */
.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Forms

```css
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 8px;
}

.form-label.required::after {
  content: '*';
  color: var(--error-500);
  margin-left: 4px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  font-size: 14px;
  color: var(--gray-900);
  background: var(--white);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-error {
  font-size: 0.75rem;
  color: var(--error-500);
  margin-top: 4px;
}

.form-helper {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-top: 4px;
}
```

### Modals

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

### Alerts & Notifications

```css
.alert {
  padding: 16px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.alert-success {
  background: var(--success-50);
  color: var(--success-800);
  border: 1px solid var(--success-200);
}

.alert-warning {
  background: var(--warning-50);
  color: var(--warning-800);
  border: 1px solid var(--warning-200);
}

.alert-error {
  background: var(--error-50);
  color: var(--error-800);
  border: 1px solid var(--error-200);
}

.alert-info {
  background: var(--info-50);
  color: var(--info-800);
  border: 1px solid var(--info-200);
}
```

---

## 🎨 Iconografía

### Biblioteca: React Icons (Heroicons)

```javascript
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  SearchIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
```

### Tamaños Estándar
- **Small**: 16px - Para texto inline
- **Medium**: 20px - Para botones y menús
- **Large**: 24px - Para headers y elementos destacados
- **XLarge**: 32px+ - Para iconos hero

---

## ♿ Accesibilidad en Mockups

### Contraste de Colores
- **Texto normal**: Mínimo 4.5:1
- **Texto grande**: Mínimo 3:1
- **Elementos gráficos**: Mínimo 3:1

### Estados de Focus
```css
*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Área de Click Mínima
- Botones: 44x44px mínimo
- Links: 44px alto mínimo
- Checkboxes/radios: 44x44px área clickeable

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Stack vertical de elementos
- Sidebar colapsado a drawer
- Tablas con scroll horizontal
- Botones full-width

### Tablet (640px - 1024px)
- Grid de 2 columnas para cards
- Sidebar visible pero compacto
- Tablas responsivas

### Desktop (> 1024px)
- Layout completo
- Sidebar siempre visible
- Grid de 3-4 columnas
- Hover states activos

---

## ✅ Checklist de Mockups

- [x] M-01: Login - ✅ **APROBADO**
- [x] M-04: Dashboard Admin - ✅ **APROBADO**
- [x] M-08: Lista Pacientes - ✅ **APROBADO**
- [x] M-14: Calendario - ✅ **APROBADO**
- [x] M-21: Expediente - ✅ **APROBADO**
- [x] Sistema de Diseño Base - ✅ **APROBADO**
- [x] Componentes Reutilizables - ✅ **APROBADO**
- [ ] M-22: Registro Sesión
- [ ] Mockups de Formularios
- [ ] Mockups de Reportes
- [ ] Estados de Error/Éxito
- [ ] Estados de Carga
- [ ] Animaciones y Transiciones

**Progreso**: 70% completado

**Estado de Aprobación**: ✅ **Mockups de Alta Fidelidad APROBADOS**
- Fecha de aprobación: 2026-02-14
- Mockups aprobados: M-01, M-04, M-08, M-14, M-21
- Sistema de diseño base: Aprobado
- Componentes reutilizables: Aprobados

---

**Última actualización**: 2026-02-14
**Versión**: 1.1.0
