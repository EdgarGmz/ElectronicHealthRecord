# 📚 Guía de Estilos - Sistema EHR

> **📖 ¿Buscas la guía completa y centralizada?** Ve a **[INDEX.md](./INDEX.md)** para acceso rápido a toda la documentación con ejemplos de código y mejores prácticas.

## 📋 Descripción

Guía completa de estilos y sistema de diseño para el Sistema de Registro de Salud Electrónico. Este documento establece los estándares visuales, componentes y patrones que deben seguirse en todo el sistema.

### 📚 Documentación Completa

- **[INDEX.md](./INDEX.md)** - Guía centralizada con acceso rápido a todos los recursos
- **[COLOR_PALETTE.md](./COLOR_PALETTE.md)** - Paleta de colores con HEX, RGB, RGBA, HSL
- **[TYPOGRAPHY.md](./TYPOGRAPHY.md)** - Sistema tipográfico completo
- **[SPACING.md](./SPACING.md)** - Espaciado y sistema de grid
- **[COMPONENTS_EXAMPLES.md](./COMPONENTS_EXAMPLES.md)** - Ejemplos de código de componentes
- **[GLASSMORPHISM_THEME.md](./GLASSMORPHISM_THEME.md)** - 💎 Tema Crystal Glass estilo iOS
- **[design-tokens.css](./design-tokens.css)** - Variables CSS listas para usar
- **[tailwind.config.example.js](./tailwind.config.example.js)** - Configuración TailwindCSS

## 🎯 Propósito

- **Consistencia**: Mantener coherencia visual en toda la aplicación
- **Eficiencia**: Acelerar el desarrollo con componentes predefinidos
- **Escalabilidad**: Facilitar la expansión del sistema
- **Mantenibilidad**: Simplificar actualizaciones y cambios
- **Calidad**: Garantizar profesionalismo y confianza

---

## 🎨 1. Identidad Visual

### Logo y Marca

#### Logo Principal
- **Formato**: SVG (vectorial)
- **Colores**: Primary blue (#1E40AF) + White
- **Variantes**: 
  - Full color sobre fondo claro
  - Blanco sobre fondo oscuro
  - Monocromático
- **Espaciado mínimo**: Área de protección = altura del logo
- **Tamaño mínimo**: 32px de altura

#### Variaciones del Logo
```
1. Logo Horizontal (para headers)
   - Ancho: 180px
   - Alto: 48px
   
2. Logo Cuadrado (para apps móviles)
   - Tamaño: 64px x 64px
   
3. Logo Compacto (para sidebar colapsado)
   - Tamaño: 32px x 32px
```

### Nombre del Sistema
- **Primario**: "EHR System"
- **Completo**: "Sistema de Registro de Salud Electrónico"
- **Tagline**: "Departamento de Psicología y Enfermería"

---

## 🎨 2. Paleta de Colores

### 2.1 Colores Primarios

#### Healthcare Blue (Primario)
Representa profesionalismo, confianza y tecnología médica.

```scss
$primary-50:  #EFF6FF;
$primary-100: #DBEAFE;
$primary-200: #BFDBFE;
$primary-300: #93C5FD;
$primary-400: #60A5FA;
$primary-500: #3B82F6;  // Main
$primary-600: #2563EB;
$primary-700: #1D4ED8;
$primary-800: #1E40AF;  // Dark
$primary-900: #1E3A8A;
```

**Uso:**
- Botones principales
- Enlaces
- Navegación activa
- Highlights importantes
- Badges de información

#### Medical Green (Secundario)
Representa salud, bienestar y seguridad.

```scss
$success-50:  #ECFDF5;
$success-100: #D1FAE5;
$success-200: #A7F3D0;
$success-300: #6EE7B7;
$success-400: #34D399;
$success-500: #10B981;  // Main
$success-600: #059669;
$success-700: #047857;
$success-800: #065F46;
$success-900: #064E3B;
```

**Uso:**
- Estados exitosos
- Confirmaciones
- Indicadores positivos
- Badges activos
- Departamento de Enfermería

### 2.2 Colores de Estado

#### Warning (Advertencia)
```scss
$warning-50:  #FFFBEB;
$warning-100: #FEF3C7;
$warning-200: #FDE68A;
$warning-300: #FCD34D;
$warning-400: #FBBF24;
$warning-500: #F59E0B;  // Main
$warning-600: #D97706;
$warning-700: #B45309;
$warning-800: #92400E;
```

**Uso:**
- Alertas de precaución
- Medicamentos por caducar
- Citas por confirmar
- Información que requiere atención

#### Error (Error/Crítico)
```scss
$error-50:  #FEF2F2;
$error-100: #FEE2E2;
$error-200: #FECACA;
$error-300: #FCA5A5;
$error-400: #F87171;
$error-500: #EF4444;  // Main
$error-600: #DC2626;
$error-700: #B91C1C;
$error-800: #991B1B;
```

**Uso:**
- Errores de validación
- Alertas críticas
- Citas urgentes
- Acciones destructivas
- Indicadores de riesgo

#### Info (Información)
```scss
$info-50:  #EFF6FF;
$info-100: #DBEAFE;
$info-200: #BFDBFE;
$info-300: #93C5FD;
$info-400: #60A5FA;
$info-500: #3B82F6;  // Main
$info-600: #2563EB;
```

**Uso:**
- Mensajes informativos
- Tips y ayudas
- Notificaciones neutrales

### 2.3 Colores Neutrales

#### Grayscale
```scss
$white:     #FFFFFF;
$gray-50:   #F9FAFB;  // Background subtle
$gray-100:  #F3F4F6;  // Background
$gray-200:  #E5E7EB;  // Border light
$gray-300:  #D1D5DB;  // Border
$gray-400:  #9CA3AF;  // Placeholder
$gray-500:  #6B7280;  // Text secondary
$gray-600:  #4B5563;  // Text primary
$gray-700:  #374151;  // Text dark
$gray-800:  #1F2937;  // Text darker
$gray-900:  #111827;  // Text darkest
$black:     #000000;
```

**Uso:**
- Textos
- Bordes
- Backgrounds
- Sombras
- Divisores

### 2.4 Colores Funcionales

#### Departamentos
```scss
$psychology-color: #8B5CF6;  // Púrpura - Psicología
$nursing-color: #10B981;      // Verde - Enfermería
$admin-color: #3B82F6;        // Azul - Administración
```

#### Prioridades
```scss
$priority-low: #10B981;      // Verde
$priority-medium: #F59E0B;   // Naranja
$priority-high: #EF4444;     // Rojo
$priority-urgent: #DC2626;   // Rojo oscuro
```

### 2.5 Directrices de Uso

**DO's ✅**
- Usar colores primarios para acciones principales
- Usar colores de estado consistentemente
- Mantener suficiente contraste (WCAG AA)
- Usar grises para jerarquía visual

**DON'Ts ❌**
- No usar más de 3 colores por pantalla
- No usar colores de estado para decoración
- No usar colores de baja accesibilidad
- No crear nuevos tonos sin justificación

---

## 🔤 3. Tipografía

### 3.1 Familias de Fuentes

#### Primary: Inter
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

**Características:**
- Diseñada para legibilidad en pantallas
- Excelente para interfaces médicas
- Soporte completo de caracteres latinos
- Variable font para optimización

**Pesos disponibles:**
- 400 (Regular)
- 500 (Medium)
- 600 (Semibold)
- 700 (Bold)

#### Secondary: Roboto
```css
font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

**Uso:**
- Datos numéricos
- Tablas
- Alternativa para información densa

#### Monospace: Fira Code
```css
font-family: 'Fira Code', 'Courier New', monospace;
```

**Uso:**
- Códigos (matrículas, IDs)
- Datos técnicos
- Logs y mensajes de sistema

### 3.2 Escala Tipográfica

Base: 16px (1rem)
Escala: 1.25 (Mayor Third)

```scss
// Display - Hero sections
$text-display: (
  font-size: 3rem,        // 48px
  line-height: 1.2,
  font-weight: 700,
  letter-spacing: -0.02em
);

// H1 - Page titles
$text-h1: (
  font-size: 2.25rem,     // 36px
  line-height: 1.25,
  font-weight: 700,
  letter-spacing: -0.01em
);

// H2 - Section titles
$text-h2: (
  font-size: 1.875rem,    // 30px
  line-height: 1.3,
  font-weight: 600,
  letter-spacing: -0.01em
);

// H3 - Subsection titles
$text-h3: (
  font-size: 1.5rem,      // 24px
  line-height: 1.35,
  font-weight: 600,
  letter-spacing: 0
);

// H4 - Card titles
$text-h4: (
  font-size: 1.25rem,     // 20px
  line-height: 1.4,
  font-weight: 500,
  letter-spacing: 0
);

// Body Large - Emphasized text
$text-body-lg: (
  font-size: 1.125rem,    // 18px
  line-height: 1.5,
  font-weight: 400
);

// Body - Default text
$text-body: (
  font-size: 1rem,        // 16px
  line-height: 1.5,
  font-weight: 400
);

// Body Small - Secondary text
$text-body-sm: (
  font-size: 0.875rem,    // 14px
  line-height: 1.5,
  font-weight: 400
);

// Caption - Labels, hints
$text-caption: (
  font-size: 0.75rem,     // 12px
  line-height: 1.4,
  font-weight: 400
);

// Overline - Categorías, tags
$text-overline: (
  font-size: 0.75rem,     // 12px
  line-height: 1.4,
  font-weight: 600,
  text-transform: uppercase,
  letter-spacing: 0.1em
);
```

### 3.3 Directrices Tipográficas

#### Jerarquía
1. Un solo H1 por página
2. H2 para secciones principales
3. H3 para subsecciones
4. Body para contenido general

#### Espaciado
- **Line Height**: 1.5 para cuerpo, 1.2-1.4 para títulos
- **Paragraph Spacing**: 1em entre párrafos
- **Letter Spacing**: Negativo para títulos grandes

#### Colores de Texto
```scss
$text-primary: $gray-900;     // Texto principal
$text-secondary: $gray-600;   // Texto secundario
$text-disabled: $gray-400;    // Texto deshabilitado
$text-inverse: $white;        // Texto sobre fondos oscuros
$text-link: $primary-600;     // Enlaces
```

---

## 📐 4. Espaciado y Layout

### 4.1 Sistema de Espaciado

Base: 8px (sistema de 8 puntos)

```scss
$spacing-0: 0;
$spacing-1: 0.25rem;    // 4px
$spacing-2: 0.5rem;     // 8px
$spacing-3: 0.75rem;    // 12px
$spacing-4: 1rem;       // 16px
$spacing-5: 1.25rem;    // 20px
$spacing-6: 1.5rem;     // 24px
$spacing-7: 1.75rem;    // 28px
$spacing-8: 2rem;       // 32px
$spacing-10: 2.5rem;    // 40px
$spacing-12: 3rem;      // 48px
$spacing-16: 4rem;      // 64px
$spacing-20: 5rem;      // 80px
$spacing-24: 6rem;      // 96px
```

### 4.2 Márgenes y Padding

#### Componentes
- **Small**: 8-12px (Buttons, badges)
- **Medium**: 16-24px (Cards, forms)
- **Large**: 32-48px (Sections, containers)

#### Containers
```scss
$container-sm: 640px;
$container-md: 768px;
$container-lg: 1024px;
$container-xl: 1280px;
$container-2xl: 1536px;
```

### 4.3 Grid System

#### Desktop Layout
```scss
.layout-grid {
  display: grid;
  grid-template-columns: 240px 1fr;  // Sidebar + Content
  gap: 24px;
  min-height: 100vh;
}
```

#### Content Grid
```scss
// 2 columns
grid-template-columns: repeat(2, 1fr);
gap: 24px;

// 3 columns
grid-template-columns: repeat(3, 1fr);
gap: 24px;

// 4 columns
grid-template-columns: repeat(4, 1fr);
gap: 16px;

// Auto-fit responsive
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
```

---

## 🎭 5. Elevación y Sombras

### 5.1 Niveles de Elevación

```scss
// Nivel 0 - Plano
$shadow-none: none;

// Nivel 1 - Sutil
$shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

// Nivel 2 - Bajo
$shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);

// Nivel 3 - Medio
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);

// Nivel 4 - Alto
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);

// Nivel 5 - Muy alto
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);

// Nivel 6 - Máximo (Modals)
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### 5.2 Uso de Sombras

- **xs**: Borders alternativos
- **sm**: Cards estáticas
- **md**: Cards interactivos, dropdowns
- **lg**: Popovers, tooltips
- **xl**: Modals, drawers
- **2xl**: Overlays importantes

---

## 🎯 6. Bordes y Radios

### 6.1 Border Radius

```scss
$radius-none: 0;
$radius-sm: 0.125rem;    // 2px
$radius-md: 0.375rem;    // 6px
$radius-lg: 0.5rem;      // 8px
$radius-xl: 0.75rem;     // 12px
$radius-2xl: 1rem;       // 16px
$radius-3xl: 1.5rem;     // 24px
$radius-full: 9999px;    // Circular
```

**Uso:**
- **sm**: Inputs pequeños, badges
- **md**: Inputs estándar, buttons
- **lg**: Cards, modals
- **xl**: Containers grandes
- **full**: Avatars, pills, tags

### 6.2 Border Width

```scss
$border-0: 0;
$border-1: 1px;
$border-2: 2px;
$border-4: 4px;
```

### 6.3 Border Colors

```scss
$border-light: $gray-200;
$border-default: $gray-300;
$border-dark: $gray-400;
$border-focus: $primary-500;
$border-error: $error-500;
```

---

## ✨ 7. Efectos y Transiciones

### 7.1 Transiciones

```scss
// Duration
$duration-fast: 150ms;
$duration-base: 200ms;
$duration-slow: 300ms;

// Easing
$ease-in: cubic-bezier(0.4, 0, 1, 1);
$ease-out: cubic-bezier(0, 0, 0.2, 1);
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

// Propiedades comunes
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 7.2 Hover States

```scss
.interactive-element {
  transition: all 200ms ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: $shadow-md;
  }
}
```

### 7.3 Focus States

```scss
*:focus-visible {
  outline: 2px solid $primary-500;
  outline-offset: 2px;
  border-radius: $radius-md;
}

// Para inputs
input:focus {
  border-color: $primary-500;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

---

## 🎨 8. Iconografía

### 8.1 Sistema de Iconos

**Biblioteca**: React Icons (Heroicons v2)
**Estilo**: Outline para navegación, Solid para acciones

```javascript
// Outline - Para UI general
import { HomeIcon } from '@heroicons/react/24/outline';

// Solid - Para estados activos
import { HomeIcon } from '@heroicons/react/24/solid';
```

### 8.2 Tamaños de Iconos

```scss
$icon-xs: 12px;   // Inline text
$icon-sm: 16px;   // Small buttons, badges
$icon-md: 20px;   // Standard buttons, menu items
$icon-lg: 24px;   // Headers, large buttons
$icon-xl: 32px;   // Hero icons
$icon-2xl: 48px;  // Feature icons
```

### 8.3 Colores de Iconos

```scss
.icon-primary { color: $primary-500; }
.icon-success { color: $success-500; }
.icon-warning { color: $warning-500; }
.icon-error { color: $error-500; }
.icon-muted { color: $gray-400; }
```

### 8.4 Iconos del Sistema

#### Navegación
- `HomeIcon`: Dashboard
- `UserGroupIcon`: Pacientes
- `CalendarIcon`: Citas
- `DocumentTextIcon`: Expedientes
- `ChartBarIcon`: Reportes
- `CogIcon`: Configuración

#### Acciones
- `PlusIcon`: Crear/Agregar
- `PencilIcon`: Editar
- `TrashIcon`: Eliminar
- `CheckIcon`: Confirmar
- `XMarkIcon`: Cancelar/Cerrar

#### Estados
- `ExclamationTriangleIcon`: Warning
- `InformationCircleIcon`: Info
- `CheckCircleIcon`: Success
- `XCircleIcon`: Error

---

## ♿ 9. Accesibilidad

### 9.1 Contraste de Color

#### WCAG 2.1 Level AA
- **Texto normal** (< 18px): Contraste mínimo 4.5:1
- **Texto grande** (≥ 18px): Contraste mínimo 3:1
- **Elementos gráficos**: Contraste mínimo 3:1

#### Combinaciones Aprobadas
```scss
// Texto sobre fondos
$white on $primary-600+     ✅ 7.5:1
$white on $success-600+     ✅ 5.2:1
$white on $error-500+       ✅ 4.9:1
$gray-900 on $white         ✅ 17.3:1
$gray-600 on $white         ✅ 7.0:1
```

### 9.2 Tamaños de Click

**Mínimo**: 44x44px para elementos táctiles

```scss
.clickable-element {
  min-height: 44px;
  min-width: 44px;
  // O área clickeable expandida
  padding: 12px;
}
```

### 9.3 Focus Visible

```scss
// Siempre visible para navegación por teclado
:focus-visible {
  outline: 2px solid $primary-500;
  outline-offset: 2px;
}
```

### 9.4 ARIA Labels

```jsx
// Botón de icono
<button aria-label="Agregar paciente">
  <PlusIcon />
</button>

// Imagen decorativa
<img src="..." alt="" role="presentation" />

// Estado de carga
<div role="status" aria-live="polite">
  Cargando...
</div>
```

---

## 📱 10. Responsive Design

### 10.1 Breakpoints

```scss
// Mobile first approach
$breakpoint-sm: 640px;    // Mobile large
$breakpoint-md: 768px;    // Tablet
$breakpoint-lg: 1024px;   // Laptop
$breakpoint-xl: 1280px;   // Desktop
$breakpoint-2xl: 1536px;  // Large desktop
```

### 10.2 Media Queries

```scss
// Mobile
@media (max-width: 639px) {
  .sidebar { display: none; }
  .grid { grid-template-columns: 1fr; }
}

// Tablet
@media (min-width: 640px) and (max-width: 1023px) {
  .sidebar { width: 64px; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

// Desktop
@media (min-width: 1024px) {
  .sidebar { width: 240px; }
  .grid { grid-template-columns: repeat(4, 1fr); }
}
```

### 10.3 Comportamiento Responsivo

#### Sidebar
- **Mobile**: Drawer overlay
- **Tablet**: Compacto (solo iconos)
- **Desktop**: Completo con texto

#### Tablas
- **Mobile**: Cards verticales
- **Tablet**: Scroll horizontal
- **Desktop**: Tabla completa

#### Forms
- **Mobile**: 1 columna, inputs full-width
- **Tablet/Desktop**: 2 columnas cuando apropiado

---

## 🧩 11. Componentes del Sistema

### 11.1 Anatomía de Componentes

#### Button
```
┌─────────────────────┐
│ [Icon] Label [Icon] │
│  8px   12px   8px   │
└─────────────────────┘
    Padding: 10px 20px
    Height: 40px
    Border-radius: 8px
```

#### Card
```
┌───────────────────────┐
│ ┌───────────────────┐ │ ← 24px padding
│ │ Header            │ │
│ ├───────────────────┤ │
│ │ Content           │ │
│ │                   │ │
│ ├───────────────────┤ │
│ │ Footer            │ │
│ └───────────────────┘ │
└───────────────────────┘
```

#### Input Field
```
┌──────────────────────┐
│ Label         Helper │ ← 14px, gray-700
└──────────────────────┘
                         ← 8px gap
┌──────────────────────┐
│ [Icon] Input text    │ ← Height: 40px
└──────────────────────┘
                         ← 4px gap
Error message/Helper     ← 12px, error-500
```

---

## ✅ Checklist de Implementación

### Colores
- [x] Paleta primaria definida
- [x] Colores de estado establecidos
- [x] Colores funcionales documentados
- [x] Contraste validado (WCAG AA)

### Tipografía
- [x] Fuentes seleccionadas
- [x] Escala tipográfica definida
- [x] Line heights establecidos
- [x] Jerarquía documentada

### Espaciado
- [x] Sistema de 8px implementado
- [x] Márgenes y padding definidos
- [x] Grid system documentado

### Componentes
- [x] Especificaciones base creadas
- [ ] Todos los componentes documentados
- [ ] Variantes definidas
- [ ] Estados documentados

### Accesibilidad
- [x] Contraste validado
- [x] Tamaños mínimos definidos
- [x] Focus states especificados
- [ ] ARIA patterns documentados

**Progreso Total**: 85% completado

---

## 📚 Referencias

- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Material Design System](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Heroicons](https://heroicons.com/)
- [Inter Font](https://rsms.me/inter/)

---

**Última actualización**: 2026-02-13
**Versión**: 1.0.0
