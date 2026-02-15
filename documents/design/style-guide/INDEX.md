# 📚 Guía de Estilos Completa - Sistema EHR

## 🎯 Bienvenida

Esta es la guía de estilos completa del **Sistema de Registro de Salud Electrónico (EHR)**. Este documento centraliza todas las decisiones de diseño visual, componentes, patrones y mejores prácticas para mantener consistencia en toda la aplicación.

---

## 📋 Tabla de Contenidos

### 1. [Resumen Ejecutivo](#resumen-ejecutivo)
### 2. [Documentación Detallada](#documentación-detallada)
### 3. [Implementación](#implementación)
### 4. [Uso Rápido](#uso-rápido)
### 5. [Recursos y Referencias](#recursos-y-referencias)

---

## 📊 Resumen Ejecutivo

### Identidad Visual

**Colores Principales:**
- 🔵 **Primary**: Healthcare Blue (#2563EB) - Profesionalismo y confianza
- 🟢 **Success**: Medical Green (#10B981) - Salud y bienestar
- 🟡 **Warning**: (#F59E0B) - Advertencias y precauciones
- 🔴 **Error**: (#EF4444) - Errores y estados críticos

**Tipografía:**
- 📝 **Principal**: Inter (Sans-serif moderna, optimizada para pantallas)
- 🔢 **Secundaria**: Roboto (Para datos numéricos y tablas)
- 💻 **Monospace**: Fira Code (Para códigos e identificadores)

**Espaciado:**
- 📐 **Sistema Base**: 8px (escala de múltiplos de 8)
- 🎯 **Filosofía**: Consistencia visual y escalabilidad

**Componentes:**
- ✅ Botones (5 variantes)
- 📇 Cards (múltiples estilos)
- 📝 Formularios (inputs, selects, textareas)
- 🏷️ Badges y estados
- 🔔 Alertas y notificaciones
- 📊 Tablas de datos

---

## 📚 Documentación Detallada

### 🎨 [Paleta de Colores](./COLOR_PALETTE.md)
**Contenido:**
- Colores primarios y secundarios con códigos HEX, RGB, RGBA, y HSL
- Colores de estado (success, warning, error, info)
- Escala completa de grises (neutrales)
- Colores funcionales por departamento
- Colores de prioridad
- Combinaciones de contraste WCAG 2.1 AA/AAA
- Ejemplos de uso y mejores prácticas

**Casos de Uso:**
- Definir colores de marca y UI
- Asegurar accesibilidad (contraste)
- Mantener consistencia visual
- Identificar departamentos y prioridades

[➡️ Ver Guía de Colores Completa](./COLOR_PALETTE.md)

---

### 🔤 [Tipografía](./TYPOGRAPHY.md)
**Contenido:**
- Familias de fuentes (Inter, Roboto, Fira Code)
- Escala tipográfica completa (12px - 60px)
- Estilos definidos (Display, H1-H4, Body, Caption, Overline)
- Pesos, alturas de línea, y letter-spacing
- Colores de texto jerárquicos
- Tipografía responsive
- Mejores prácticas y ejemplos de código

**Casos de Uso:**
- Establecer jerarquía de información
- Mejorar legibilidad y accesibilidad
- Mantener consistencia en textos
- Adaptación a diferentes dispositivos

[➡️ Ver Guía de Tipografía Completa](./TYPOGRAPHY.md)

---

### 📐 [Sistema de Espaciado y Grid](./SPACING.md)
**Contenido:**
- Escala de espaciado base (sistema de 8px)
- Espaciado por tipo de componente (botones, cards, forms, etc.)
- Sistema de Grid CSS (2, 3, 4 columnas, auto-fit)
- Layout principal (sidebar + content)
- Márgenes y padding responsivos
- Patrones comunes (stack, inline, center)
- Mejores prácticas de espaciado

**Casos de Uso:**
- Crear layouts consistentes
- Mantener ritmo vertical
- Diseñar interfaces responsivas
- Organizar contenido de forma clara

[➡️ Ver Guía de Espaciado Completa](./SPACING.md)

---

### 💎 [Tema Crystal Glass (Glassmorphism)](./GLASSMORPHISM_THEME.md)
**Contenido:**
- Principios del glassmorphism inspirado en iOS
- Paleta de colores glass (light, dark, tinted)
- Efectos de backdrop blur (7 niveles)
- Componentes glass (cards, buttons, modals, sidebar, badges, inputs, alerts)
- Fondos recomendados con gradientes
- Variables CSS completas para glass
- Configuración TailwindCSS para glass
- Mejores prácticas y accesibilidad
- Soporte de navegadores

**Casos de Uso:**
- Crear interfaces modernas con efecto cristal
- Aplicar estética iOS al sistema
- Elementos flotantes sobre fondos ricos
- Modales y overlays elegantes

[➡️ Ver Guía de Glassmorphism Completa](./GLASSMORPHISM_THEME.md)

---

### 🌓 [Temas Claro y Oscuro](./DARK_MODE.md)
**Contenido:**
- Especificación de tema claro (Light Mode) y oscuro (Dark Mode)
- Paletas de colores para cada tema
- Sistema de cambio automático:
  - Por turno médico (día 6am-6pm, noche 6pm-6am)
  - Por preferencia del sistema operativo
  - Manual/estático con persistencia
- Variables CSS para ambos temas
- Componentes adaptados a cada tema
- Glassmorphism con soporte dark mode
- Accesibilidad y contraste en ambos modos
- Componente toggle de tema (React/TypeScript)
- Configuración TailwindCSS dark mode

**Casos de Uso:**
- Reducir fatiga visual en turnos nocturnos
- Adaptarse a preferencias del usuario
- Cambio automático según horario médico
- Interfaz moderna con soporte completo de temas

[➡️ Ver Guía de Dark Mode Completa](./DARK_MODE.md)

---

### 🧩 [Ejemplos de Componentes](./COMPONENTS_EXAMPLES.md)
**Contenido:**
- Botones (5 variantes con estados)
- Cards (básico, con header, stat, interactivo)
- Inputs y formularios (con estados y validación)
- Select, textarea, checkbox, radio
- Badges (múltiples colores y estilos)
- Alerts (info, success, warning, error)
- Toast notifications
- Tablas de datos

**Casos de Uso:**
- Implementar componentes consistentes
- Copiar código listo para usar
- Entender anatomía de componentes
- Ver ejemplos visuales de la guía

[➡️ Ver Ejemplos de Componentes Completos](./COMPONENTS_EXAMPLES.md)

---

### 📄 [Guía Base (README)](./README.md)
**Contenido:**
- Resumen completo del sistema de diseño
- Identidad visual (logo y marca)
- Todos los aspectos del diseño condensados
- Elevación y sombras
- Bordes y radios
- Efectos y transiciones
- Iconografía
- Accesibilidad
- Responsive design
- Checklist de implementación

**Casos de Uso:**
- Vista general del sistema de diseño
- Referencia rápida
- Onboarding de nuevos desarrolladores
- Verificar cumplimiento de estándares

[➡️ Ver Guía Base Completa](./README.md)

---

## 💻 Implementación

### 🎨 [Design Tokens CSS](./design-tokens.css)
Archivo CSS con todas las variables custom properties para fácil implementación:

```css
/* Ejemplo de uso */
.button-primary {
  padding: var(--btn-padding-md);
  background-color: var(--color-primary-600);
  color: var(--color-white);
  border-radius: var(--radius-lg);
  font-family: var(--font-primary);
  transition: all var(--duration-base) var(--ease-in-out);
}
```

**Incluye:**
- ✅ Todas las escalas de color
- ✅ Tipografía (fuentes, tamaños, pesos)
- ✅ Espaciado completo
- ✅ Bordes y sombras
- ✅ Transiciones y animaciones
- ✅ Z-index layers
- ✅ Breakpoints
- ✅ Utilidades básicas

[➡️ Ver Design Tokens](./design-tokens.css)

---

### ⚙️ [Configuración TailwindCSS](./tailwind.config.example.js)
Configuración completa de TailwindCSS con todos los design tokens:

```javascript
// Ejemplo de uso en HTML
<button class="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
  Guardar
</button>
```

**Incluye:**
- ✅ Paleta de colores extendida
- ✅ Fuentes personalizadas
- ✅ Espaciado de 8px
- ✅ Breakpoints responsivos
- ✅ Sombras personalizadas
- ✅ Configuración de container
- ✅ Plugins recomendados

[➡️ Ver Configuración TailwindCSS](./tailwind.config.example.js)

---

## 🚀 Uso Rápido

### Comenzar a Usar la Guía

#### 1️⃣ **Para Diseñadores**

1. Lee el [README principal](./README.md) para entender la visión
2. Explora la [paleta de colores](./COLOR_PALETTE.md) y selecciona colores apropiados
3. Consulta [tipografía](./TYPOGRAPHY.md) para jerarquías de texto
4. Usa [espaciado](./SPACING.md) para mantener consistencia
5. Referencia [componentes](./COMPONENTS_EXAMPLES.md) para elementos comunes

#### 2️⃣ **Para Desarrolladores Frontend**

**Opción A: Usando TailwindCSS**
```bash
# 1. Instalar TailwindCSS
npm install -D tailwindcss postcss autoprefixer

# 2. Copiar configuración
cp documents/design/style-guide/tailwind.config.example.js tailwind.config.js

# 3. Usar clases en componentes
<button class="px-4 py-2.5 bg-primary-600 text-white rounded-lg">
  Botón
</button>
```

**Opción B: Usando CSS Variables**
```html
<!-- 1. Importar design tokens en tu CSS principal -->
<link rel="stylesheet" href="design-tokens.css">

<!-- 2. Usar variables en tu CSS -->
<style>
.my-button {
  padding: var(--btn-padding-md);
  background: var(--color-primary-600);
  color: var(--color-white);
}
</style>
```

#### 3️⃣ **Componentes React/TypeScript**

```tsx
// Ejemplo: Botón Primary
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        px-4 py-2.5 
        bg-primary-600 hover:bg-primary-700 
        text-white font-medium 
        rounded-lg 
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {children}
    </button>
  );
};

export default Button;
```

---

## 📖 Referencia Rápida de Valores

### Colores Más Usados
```css
/* Primary Actions */
--color-primary-600: #2563EB;
--color-primary-700: #1D4ED8; /* hover */

/* Success States */
--color-success-600: #059669;

/* Warnings */
--color-warning-600: #D97706;

/* Errors */
--color-error-600: #DC2626;

/* Text */
--color-gray-900: #111827; /* Primary text */
--color-gray-600: #4B5563; /* Secondary text */
--color-gray-500: #6B7280; /* Muted text */
```

### Espaciado Más Usado
```css
--space-2: 0.5rem;   /* 8px - gaps pequeños */
--space-4: 1rem;     /* 16px - espaciado estándar */
--space-6: 1.5rem;   /* 24px - padding cards */
--space-8: 2rem;     /* 32px - secciones */
```

### Tipografía Más Usada
```css
--text-sm: 0.875rem;   /* 14px - labels, secondary */
--text-base: 1rem;     /* 16px - body text */
--text-lg: 1.125rem;   /* 18px - emphasis */
--text-2xl: 1.5rem;    /* 24px - H3 */
--text-4xl: 2.25rem;   /* 36px - H1 */
```

---

## ✅ Checklist de Implementación

### Para Nuevo Proyecto
- [ ] Instalar dependencias (TailwindCSS, fonts)
- [ ] Copiar `tailwind.config.example.js` → `tailwind.config.js`
- [ ] Importar `design-tokens.css` en proyecto
- [ ] Cargar fuentes (Inter, Roboto, Fira Code)
- [ ] Configurar ESLint/Prettier con estilos
- [ ] Crear componentes base siguiendo guía
- [ ] Implementar sistema de theming si es necesario
- [ ] Validar accesibilidad (contraste, tamaños)

### Para Nuevo Componente
- [ ] Consultar [COMPONENTS_EXAMPLES.md](./COMPONENTS_EXAMPLES.md)
- [ ] Usar colores de la paleta definida
- [ ] Aplicar tipografía según jerarquía
- [ ] Usar espaciado del sistema (múltiplos de 8)
- [ ] Implementar estados (hover, focus, disabled)
- [ ] Asegurar accesibilidad (ARIA, contraste)
- [ ] Hacer responsive (móvil, tablet, desktop)
- [ ] Documentar variantes y props

### Para Revisar Diseño
- [ ] Verifica que use colores de la paleta
- [ ] Tipografía sigue escala y jerarquía
- [ ] Espaciado es múltiplo de 8px
- [ ] Contraste cumple WCAG AA (min 4.5:1)
- [ ] Componentes siguen patrones existentes
- [ ] Responsive en todos los breakpoints
- [ ] Estados interactivos claros
- [ ] Accesibilidad implementada

---

## 🎓 Mejores Prácticas

### DO's ✅

1. **Usar colores de la paleta definida**
   - ✅ `bg-primary-600`
   - ❌ `bg-[#2563EB]` (valor arbitrario)

2. **Seguir la escala tipográfica**
   - ✅ `text-base` (16px)
   - ❌ `text-[15px]` (tamaño no estándar)

3. **Múltiplos de 8px para espaciado**
   - ✅ `p-4` (16px), `p-6` (24px)
   - ❌ `p-[18px]` (no múltiplo de 8)

4. **Mantener jerarquía clara**
   - ✅ H1 > H2 > H3 > Body
   - ❌ Tamaños aleatorios

5. **Implementar estados interactivos**
   - ✅ hover, focus, active, disabled
   - ❌ Solo estado default

6. **Pensar en accesibilidad**
   - ✅ Contraste mínimo 4.5:1
   - ✅ ARIA labels
   - ✅ Navegación por teclado

### DON'Ts ❌

1. **No inventar colores nuevos**
   - ❌ `#FF5733` (no en paleta)
   - ✅ Usar paleta existente

2. **No usar tamaños arbitrarios**
   - ❌ `text-[17px]`
   - ✅ `text-lg` (18px)

3. **No ignorar responsive**
   - ❌ Solo desktop
   - ✅ Mobile-first

4. **No omitir estados de accesibilidad**
   - ❌ Sin focus visible
   - ✅ `focus:ring-2`

5. **No usar demasiadas fuentes**
   - ❌ 5+ familias diferentes
   - ✅ Inter + Roboto + Fira Code

---

## 📚 Recursos y Referencias

### Documentación Interna
- [📊 Requisitos Funcionales](../../Req-Funcionales.md)
- [🔒 Requisitos de Seguridad](../../Req-Seguridad.md)
- [🎨 Diseño UI/UX](../README.md)
- [📁 Estructura del Proyecto](../../../PROJECT_STRUCTURE.md)

### Herramientas Recomendadas
- [Figma](https://www.figma.com/) - Diseño y prototipado
- [TailwindCSS Docs](https://tailwindcss.com/) - Framework CSS
- [Heroicons](https://heroicons.com/) - Sistema de iconos
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Validar contraste

### Referencias Externas
- [Material Design 3](https://m3.material.io/) - Sistema de diseño de Google
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accesibilidad web
- [Inter Font](https://rsms.me/inter/) - Fuente principal
- [8-Point Grid System](https://spec.fm/specifics/8-pt-grid) - Sistema de espaciado

### Inspiración y Comunidad
- [Dribbble Healthcare](https://dribbble.com/search/healthcare-dashboard) - Inspiración visual
- [Behance Medical UI](https://www.behance.net/search/projects?search=medical%20ui) - Diseños médicos
- [Healthcare Design Patterns](https://www.nngroup.com/articles/health-medical-design/) - Mejores prácticas

---

## 🤝 Contribuir

### Proponer Cambios

Si necesitas proponer cambios a la guía de estilos:

1. **Documenta el cambio propuesto**
   - ¿Qué elemento quieres cambiar/agregar?
   - ¿Por qué es necesario?
   - ¿Cómo afecta al sistema actual?

2. **Consulta con el equipo de diseño**
   - Valida que es consistente con la identidad
   - Verifica que no rompe componentes existentes

3. **Actualiza documentación**
   - Modifica archivos relevantes (COLOR_PALETTE.md, etc.)
   - Actualiza ejemplos de código
   - Actualiza design-tokens.css

4. **Comunica cambios al equipo**
   - Notifica a desarrolladores
   - Actualiza componentes afectados
   - Documenta migración si es breaking change

---

## 📞 Soporte

### Preguntas sobre Diseño
- 📧 Email: design@ehr-system.com
- 💬 GitHub Discussions: [Link]
- 🐛 Reportar problemas: [GitHub Issues]

### Equipo de Diseño
- **UI/UX Designer**: Responsable de decisiones visuales
- **Frontend Lead**: Implementación técnica
- **Accessibility Expert**: Cumplimiento WCAG

---

## 📝 Historial de Versiones

### v1.0.0 (2026-02-14)
- ✅ Guía de colores completa (HEX, RGB, RGBA, HSL)
- ✅ Sistema tipográfico detallado (Inter, Roboto, Fira Code)
- ✅ Sistema de espaciado de 8px con grid
- ✅ Ejemplos de componentes (botones, cards, forms, etc.)
- ✅ Design tokens CSS implementados
- ✅ Configuración TailwindCSS completa
- ✅ Guía de implementación y mejores prácticas
- ✅ Referencias y recursos externos

---

## 🎉 Resumen Final

Esta guía de estilos proporciona todo lo necesario para:

✅ **Diseñar** interfaces consistentes y profesionales  
✅ **Desarrollar** componentes siguiendo estándares  
✅ **Mantener** coherencia visual en toda la aplicación  
✅ **Escalar** el sistema a futuro  
✅ **Asegurar** accesibilidad y usabilidad  

**Usa esta guía como tu fuente única de verdad para todas las decisiones de diseño visual en el Sistema EHR.**

---

<div align="center">

**Sistema de Registro de Salud Electrónico**  
Departamento de Psicología y Enfermería

Diseñado con ❤️ para mejorar la atención en salud

[🏠 Inicio](../../../README.md) • [📚 Documentación](../../README.md) • [🎨 Diseño](../README.md)

**Última actualización**: 2026-02-14 | **Versión**: 1.0.0

</div>
