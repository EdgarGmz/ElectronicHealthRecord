# 📐 Sistema de Espaciado y Grid - Sistema EHR

## 📋 Descripción

Guía completa del sistema de espaciado, rejilla (grid) y layout del Sistema de Registro de Salud Electrónico. Define la escala de espaciado, márgenes, padding, y sistema de grid para mantener consistencia visual en toda la aplicación.

---

## 📏 Sistema de Espaciado Base

### Principio: Escala de 8px

El sistema utiliza una escala base de **8px (0.5rem)** para todos los espaciados. Esto asegura:
- ✅ Consistencia visual en toda la aplicación
- ✅ Alineación perfecta en grids
- ✅ Escalabilidad predecible
- ✅ Armonía visual

### ¿Por qué 8px?

1. **Múltiplo común**: La mayoría de pantallas y dispositivos usan resoluciones divisibles por 8
2. **Escala práctica**: Permite granularidad sin complejidad excesiva
3. **Estándar de industria**: Usado por Material Design, iOS, y otros sistemas
4. **Matemática simple**: Fácil de calcular mentalmente (8, 16, 24, 32...)

---

## 🎯 Escala de Espaciado

### Tabla Completa de Valores

| Token | Valor | Rem | Pixel | Uso Principal |
|-------|-------|-----|-------|---------------|
| **0** | 0 | 0 | 0px | Sin espacio, reset |
| **0.5** ⭐ | 0.125rem | 0.125 | 2px | Separación mínima, borders |
| **1** | 0.25rem | 0.25 | 4px | Espaciado muy pequeño |
| **1.5** | 0.375rem | 0.375 | 6px | Espaciado intermedio |
| **2** ⭐ | 0.5rem | 0.5 | 8px | **Base del sistema** |
| **2.5** | 0.625rem | 0.625 | 10px | Padding pequeño de botones |
| **3** | 0.75rem | 0.75 | 12px | Padding de badges, pills |
| **4** ⭐ | 1rem | 1 | 16px | **Espaciado estándar** |
| **5** | 1.25rem | 1.25 | 20px | Padding de botones medianos |
| **6** ⭐ | 1.5rem | 1.5 | 24px | **Cards, containers** |
| **7** | 1.75rem | 1.75 | 28px | Espaciado intermedio |
| **8** ⭐ | 2rem | 2 | 32px | **Secciones, headers** |
| **10** | 2.5rem | 2.5 | 40px | Separación entre secciones |
| **12** ⭐ | 3rem | 3 | 48px | **Espaciado grande** |
| **16** | 4rem | 4 | 64px | Márgenes de página |
| **20** | 5rem | 5 | 80px | Espaciado muy grande |
| **24** | 6rem | 6 | 96px | Separadores principales |
| **32** | 8rem | 8 | 128px | Espaciado excepcional |

⭐ = Valores más utilizados

---

## 📦 Uso por Tipo de Componente

### Botones

```css
/* Small Button */
.btn-sm {
  padding: 0.5rem 0.75rem;  /* 8px 12px */
  gap: 0.5rem;              /* 8px entre icono y texto */
}

/* Medium Button (Default) */
.btn-md {
  padding: 0.625rem 1rem;   /* 10px 16px */
  gap: 0.5rem;              /* 8px */
}

/* Large Button */
.btn-lg {
  padding: 0.75rem 1.5rem;  /* 12px 24px */
  gap: 0.75rem;             /* 12px */
}
```

**Ejemplo HTML**:
```html
<button class="px-4 py-2.5 gap-2">
  <Icon /> Guardar
</button>
```

---

### Cards

```css
/* Small Card */
.card-sm {
  padding: 1rem;            /* 16px */
  gap: 0.75rem;             /* 12px entre elementos */
}

/* Medium Card (Default) */
.card-md {
  padding: 1.5rem;          /* 24px */
  gap: 1rem;                /* 16px */
}

/* Large Card */
.card-lg {
  padding: 2rem;            /* 32px */
  gap: 1.5rem;              /* 24px */
}
```

**Ejemplo HTML**:
```html
<div class="bg-white rounded-lg shadow p-6 space-y-4">
  <h3>Título de Card</h3>
  <p>Contenido...</p>
  <div class="flex gap-4">
    <button>Acción 1</button>
    <button>Acción 2</button>
  </div>
</div>
```

---

### Formularios

```css
/* Form Field */
.form-field {
  margin-bottom: 1.5rem;    /* 24px entre campos */
}

/* Label to Input Gap */
.label-gap {
  margin-bottom: 0.5rem;    /* 8px */
}

/* Input Padding */
.input {
  padding: 0.625rem 0.75rem; /* 10px 12px */
}

/* Helper Text Gap */
.helper-gap {
  margin-top: 0.25rem;      /* 4px */
}
```

**Ejemplo HTML**:
```html
<div class="space-y-6">
  <div class="space-y-2">
    <label class="block">Nombre</label>
    <input class="px-3 py-2.5" />
    <p class="text-sm text-gray-500 mt-1">Campo obligatorio</p>
  </div>
</div>
```

---

### Listas y Tablas

```css
/* List Items */
.list-item {
  padding: 0.75rem 1rem;    /* 12px 16px */
  gap: 0.75rem;             /* 12px entre elementos */
}

/* Table Cells */
.table-cell {
  padding: 0.75rem 1rem;    /* 12px 16px */
}

/* Table Headers */
.table-header {
  padding: 1rem;            /* 16px */
}
```

---

### Modales y Overlays

```css
/* Modal */
.modal {
  padding: 2rem;            /* 32px */
  gap: 1.5rem;              /* 24px entre secciones */
}

/* Modal Header */
.modal-header {
  padding-bottom: 1rem;     /* 16px */
  margin-bottom: 1.5rem;    /* 24px */
  border-bottom: 1px solid;
}

/* Modal Footer */
.modal-footer {
  padding-top: 1rem;        /* 16px */
  margin-top: 1.5rem;       /* 24px */
  gap: 0.75rem;             /* 12px entre botones */
}
```

---

### Navegación

```css
/* Sidebar Item */
.nav-item {
  padding: 0.75rem 1rem;    /* 12px 16px */
  gap: 0.75rem;             /* 12px entre icono y texto */
  margin-bottom: 0.25rem;   /* 4px entre items */
}

/* Header/Navbar */
.navbar {
  padding: 1rem 1.5rem;     /* 16px 24px */
}

/* Breadcrumbs */
.breadcrumb-item {
  padding: 0 0.5rem;        /* 0 8px */
}
```

---

## 📐 Grid System

### Container Widths

Anchos máximos para diferentes breakpoints:

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;       /* 16px */
  padding-right: 1rem;      /* 16px */
}

/* Small - Mobile Large */
@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-left: 1.5rem;   /* 24px */
    padding-right: 1.5rem;  /* 24px */
  }
}

/* Medium - Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

/* Large - Laptop */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding-left: 2rem;     /* 32px */
    padding-right: 2rem;    /* 32px */
  }
}

/* Extra Large - Desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

/* 2XL - Large Desktop */
@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}
```

---

### CSS Grid Layouts

#### Layout Principal (Sidebar + Content)

```css
.app-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.5rem;              /* 24px */
  min-height: 100vh;
}

/* Tablet: Sidebar colapsado */
@media (max-width: 1023px) {
  .app-layout {
    grid-template-columns: 64px 1fr;
    gap: 1rem;              /* 16px */
  }
}

/* Mobile: Sidebar como drawer */
@media (max-width: 767px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
}
```

**Ejemplo HTML**:
```html
<div class="grid grid-cols-[240px_1fr] gap-6 min-h-screen">
  <aside class="sidebar">...</aside>
  <main class="content">...</main>
</div>
```

---

#### Grid de 2 Columnas

```css
.grid-2-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;              /* 24px */
}

/* Responsive: 1 columna en mobile */
@media (max-width: 767px) {
  .grid-2-col {
    grid-template-columns: 1fr;
    gap: 1rem;              /* 16px */
  }
}
```

**Ejemplo HTML**:
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
</div>
```

---

#### Grid de 3 Columnas

```css
.grid-3-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;              /* 24px */
}

/* Tablet: 2 columnas */
@media (max-width: 1023px) {
  .grid-3-col {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;              /* 16px */
  }
}

/* Mobile: 1 columna */
@media (max-width: 767px) {
  .grid-3-col {
    grid-template-columns: 1fr;
  }
}
```

**Ejemplo HTML**:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

---

#### Grid de 4 Columnas (Dashboard)

```css
.grid-4-col {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;                /* 16px */
}

/* Desktop: 4 columnas */
@media (max-width: 1279px) {
  .grid-4-col {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tablet: 2 columnas */
@media (max-width: 1023px) {
  .grid-4-col {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile: 1 columna */
@media (max-width: 767px) {
  .grid-4-col {
    grid-template-columns: 1fr;
  }
}
```

**Ejemplo HTML**:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div class="stat-card">Stat 1</div>
  <div class="stat-card">Stat 2</div>
  <div class="stat-card">Stat 3</div>
  <div class="stat-card">Stat 4</div>
</div>
```

---

#### Grid Auto-Fit (Responsive Automático)

```css
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;              /* 24px */
}
```

**Uso**: Cards que se adaptan automáticamente sin media queries

**Ejemplo HTML**:
```html
<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

---

## 📱 Márgenes y Padding Responsivos

### Page Container

```css
.page-container {
  padding: 1rem;            /* Mobile: 16px */
}

@media (min-width: 640px) {
  .page-container {
    padding: 1.5rem;        /* Tablet: 24px */
  }
}

@media (min-width: 1024px) {
  .page-container {
    padding: 2rem;          /* Desktop: 32px */
  }
}
```

**TailwindCSS**:
```html
<div class="p-4 sm:p-6 lg:p-8">
  Contenido con padding responsivo
</div>
```

---

### Section Spacing

```css
/* Espaciado entre secciones principales */
.section {
  margin-bottom: 2rem;      /* Mobile: 32px */
}

@media (min-width: 768px) {
  .section {
    margin-bottom: 3rem;    /* Tablet: 48px */
  }
}

@media (min-width: 1024px) {
  .section {
    margin-bottom: 4rem;    /* Desktop: 64px */
  }
}
```

**TailwindCSS**:
```html
<section class="mb-8 md:mb-12 lg:mb-16">
  ...
</section>
```

---

## 🎯 Patrones Comunes de Espaciado

### Stack (Espaciado Vertical)

Para apilar elementos verticalmente con espaciado consistente:

```css
.stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;                /* 16px por defecto */
}

.stack-sm { gap: 0.5rem; }  /* 8px */
.stack-md { gap: 1rem; }    /* 16px */
.stack-lg { gap: 1.5rem; }  /* 24px */
.stack-xl { gap: 2rem; }    /* 32px */
```

**TailwindCSS**:
```html
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

### Inline (Espaciado Horizontal)

Para elementos en línea:

```css
.inline {
  display: flex;
  gap: 1rem;                /* 16px por defecto */
}

.inline-sm { gap: 0.5rem; } /* 8px */
.inline-md { gap: 1rem; }   /* 16px */
.inline-lg { gap: 1.5rem; } /* 24px */
```

**TailwindCSS**:
```html
<div class="flex gap-4">
  <button>Botón 1</button>
  <button>Botón 2</button>
</div>
```

---

### Center Layout

Para centrar contenido con márgenes laterales:

```css
.center-layout {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
```

**TailwindCSS**:
```html
<div class="max-w-7xl mx-auto px-4">
  Contenido centrado
</div>
```

---

## ✅ Mejores Prácticas

### DO's ✅

1. **Usar múltiplos de 8px**
   ```css
   ✅ padding: 0.5rem;   /* 8px */
   ✅ padding: 1rem;     /* 16px */
   ✅ padding: 1.5rem;   /* 24px */
   ```

2. **Usar CSS Gap en lugar de margin**
   ```css
   ✅ display: flex; gap: 1rem;
   ❌ margin-right: 1rem; (en cada elemento)
   ```

3. **Usar unidades relativas (rem)**
   ```css
   ✅ padding: 1rem;
   ❌ padding: 16px;
   ```

4. **Mantener consistencia en componentes similares**
   ```css
   /* Todos los cards con mismo padding */
   .card { padding: 1.5rem; }
   ```

5. **Usar TailwindCSS utility classes**
   ```html
   ✅ <div class="p-6 space-y-4">
   ❌ <div style="padding: 24px;">
   ```

### DON'Ts ❌

1. **No usar valores arbitrarios**
   ```css
   ❌ padding: 17px;
   ❌ margin: 23px;
   ✅ Use escala definida
   ```

2. **No mezclar unidades**
   ```css
   ❌ padding: 16px 1rem;
   ✅ padding: 1rem;
   ```

3. **No usar espaciado negativo excesivo**
   ```css
   ❌ margin: -50px;
   ✅ Ajustar layout en su lugar
   ```

4. **No olvidar responsive**
   ```css
   ❌ padding: 48px;  /* En mobile también */
   ✅ padding: 1rem;  /* Mobile */
   ✅ @media (min-width: 1024px) { padding: 3rem; }
   ```

---

## 💻 Implementación en Código

### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',  // 2px
      1: '0.25rem',     // 4px
      1.5: '0.375rem',  // 6px
      2: '0.5rem',      // 8px
      2.5: '0.625rem',  // 10px
      3: '0.75rem',     // 12px
      4: '1rem',        // 16px
      5: '1.25rem',     // 20px
      6: '1.5rem',      // 24px
      7: '1.75rem',     // 28px
      8: '2rem',        // 32px
      10: '2.5rem',     // 40px
      12: '3rem',       // 48px
      16: '4rem',       // 64px
      20: '5rem',       // 80px
      24: '6rem',       // 96px
      32: '8rem',       // 128px
    },
    gap: (theme) => theme('spacing'),
  },
}
```

### CSS Custom Properties

```css
:root {
  /* Spacing Scale */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  
  /* Component Spacing */
  --btn-padding-sm: 0.5rem 0.75rem;
  --btn-padding-md: 0.625rem 1rem;
  --btn-padding-lg: 0.75rem 1.5rem;
  
  --card-padding-sm: 1rem;
  --card-padding-md: 1.5rem;
  --card-padding-lg: 2rem;
  
  --container-padding: 1rem;
  --section-gap: 2rem;
}

@media (min-width: 1024px) {
  :root {
    --container-padding: 2rem;
    --section-gap: 4rem;
  }
}
```

---

## 📊 Ejemplos Completos

### Dashboard Layout

```html
<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b px-6 py-4">
    <h1 class="text-2xl font-bold">Dashboard</h1>
  </header>
  
  <!-- Main Content -->
  <main class="p-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-2">Pacientes</h3>
        <p class="text-3xl font-bold">142</p>
      </div>
      <!-- Más stats... -->
    </div>
    
    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Cards grandes -->
      </div>
      <div class="space-y-6">
        <!-- Sidebar content -->
      </div>
    </div>
  </main>
</div>
```

### Form Layout

```html
<form class="max-w-2xl mx-auto p-6 space-y-6">
  <h2 class="text-2xl font-bold mb-6">Nuevo Paciente</h2>
  
  <!-- 2 column grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label class="block text-sm font-medium">Nombre</label>
      <input class="w-full px-3 py-2 border rounded" />
    </div>
    <div class="space-y-2">
      <label class="block text-sm font-medium">Apellido</label>
      <input class="w-full px-3 py-2 border rounded" />
    </div>
  </div>
  
  <!-- Full width field -->
  <div class="space-y-2">
    <label class="block text-sm font-medium">Email</label>
    <input class="w-full px-3 py-2 border rounded" />
    <p class="text-xs text-gray-500">Correo electrónico de contacto</p>
  </div>
  
  <!-- Actions -->
  <div class="flex gap-3 pt-4">
    <button class="px-4 py-2 bg-primary-600 text-white rounded">
      Guardar
    </button>
    <button class="px-4 py-2 border rounded">
      Cancelar
    </button>
  </div>
</form>
```

---

## 📚 Referencias

- [TailwindCSS Spacing](https://tailwindcss.com/docs/customizing-spacing)
- [Material Design Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing)
- [8-Point Grid System](https://spec.fm/specifics/8-pt-grid)
- [Grid Garden (Learn CSS Grid)](https://cssgridgarden.com/)

---

**Última actualización**: 2026-02-14  
**Versión**: 1.0.0  
**Autor**: Equipo de Diseño EHR System
