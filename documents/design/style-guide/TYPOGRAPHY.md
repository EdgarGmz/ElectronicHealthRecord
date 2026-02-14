# 🔤 Tipografía - Sistema EHR

## 📋 Descripción

Guía completa de tipografía del Sistema de Registro de Salud Electrónico, incluyendo familias de fuentes, escalas tipográficas, pesos, alturas de línea y mejores prácticas de uso.

---

## 📚 Familias de Fuentes

### Primary: Inter
**Fuente principal para todo el contenido de la interfaz**

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

#### Características
- ✅ Diseñada específicamente para legibilidad en pantallas
- ✅ Excelente para interfaces médicas con datos densos
- ✅ Soporte completo de caracteres latinos y diacríticos
- ✅ Variable font disponible para optimización
- ✅ Amplio rango de pesos (100-900)
- ✅ OpenType features (ligaduras, números tabulares)

#### Pesos Utilizados
- **400** (Regular) - Texto de cuerpo, contenido general
- **500** (Medium) - Subtítulos, énfasis medio
- **600** (Semibold) - Encabezados H3-H4, labels importantes
- **700** (Bold) - Encabezados H1-H2, énfasis fuerte

#### CDN / Import
```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
/* CSS Import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

#### Variable Font (Recomendado)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
```

---

### Secondary: Roboto
**Fuente alternativa para datos numéricos y tablas**

```css
font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

#### Características
- ✅ Excelente legibilidad para números
- ✅ Números tabulares perfectos para tablas
- ✅ Ampliamente soportada
- ✅ Diseño neutral y profesional

#### Pesos Utilizados
- **400** (Regular) - Datos numéricos generales
- **500** (Medium) - Datos destacados
- **700** (Bold) - Headers de tablas

#### Uso Principal
- 📊 Tablas de datos médicos
- 🔢 Valores numéricos (edad, peso, presión arterial)
- 📈 Gráficos y estadísticas
- 📋 Reportes con datos densos

#### CDN / Import
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
```

---

### Monospace: Fira Code
**Fuente monoespaciada para códigos y datos técnicos**

```css
font-family: 'Fira Code', 'Courier New', 'Consolas', 'Monaco', monospace;
```

#### Características
- ✅ Espaciado fijo (monoespaciado)
- ✅ Ligaduras de programación opcionales
- ✅ Excelente para códigos alfanuméricos
- ✅ Claridad en identificadores

#### Uso Principal
- 🆔 Matrículas de estudiantes
- 🔑 IDs de sistema (expedientes, citas)
- 📝 Códigos de diagnóstico (CIE-10, DSM-5)
- 💻 Logs y mensajes del sistema
- 🧪 Códigos de medicamentos

#### CDN / Import
```html
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## 📏 Escala Tipográfica

### Base & Ratio
- **Base**: 16px (1rem)
- **Ratio**: 1.25 (Mayor Third - escala armónica)
- **Mobile Base**: 14px (0.875rem) - opcional para pantallas pequeñas

### Escala Completa

| Nombre | Tamaño | Rem | Pixel | Uso Principal |
|--------|--------|-----|-------|---------------|
| **xs** | 0.75rem | 0.75 | 12px | Captions, pequeños labels |
| **sm** | 0.875rem | 0.875 | 14px | Body pequeño, texto secundario |
| **base** | 1rem | 1 | 16px | Body estándar, contenido |
| **lg** | 1.125rem | 1.125 | 18px | Body enfatizado |
| **xl** | 1.25rem | 1.25 | 20px | H4, subtítulos |
| **2xl** | 1.5rem | 1.5 | 24px | H3, títulos de sección |
| **3xl** | 1.875rem | 1.875 | 30px | H2, títulos principales |
| **4xl** | 2.25rem | 2.25 | 36px | H1, títulos de página |
| **5xl** | 3rem | 3 | 48px | Display, hero sections |
| **6xl** | 3.75rem | 3.75 | 60px | Display grande (uso excepcional) |

---

## 📖 Estilos Tipográficos Definidos

### Display / Hero
**Para secciones destacadas y landing pages**

```css
.text-display {
  font-family: 'Inter', sans-serif;
  font-size: 3rem;           /* 48px */
  font-weight: 700;          /* Bold */
  line-height: 1.2;          /* 57.6px */
  letter-spacing: -0.02em;   /* -0.96px */
  color: var(--color-gray-900);
}
```

**Uso**: Títulos principales de landing, secciones hero, mensajes de bienvenida

---

### H1 - Page Title
**Título principal de cada página**

```css
.text-h1 {
  font-family: 'Inter', sans-serif;
  font-size: 2.25rem;        /* 36px */
  font-weight: 700;          /* Bold */
  line-height: 1.25;         /* 45px */
  letter-spacing: -0.01em;   /* -0.36px */
  color: var(--color-gray-900);
}
```

**Uso**: 
- Título principal de dashboard
- Nombre de página actual
- Headers de módulos principales
- **Regla**: Solo un H1 por página

**Ejemplo**:
```html
<h1 class="text-h1">Dashboard de Psicología</h1>
<h1 class="text-h1">Expediente del Paciente</h1>
```

---

### H2 - Section Title
**Títulos de secciones principales**

```css
.text-h2 {
  font-family: 'Inter', sans-serif;
  font-size: 1.875rem;       /* 30px */
  font-weight: 600;          /* Semibold */
  line-height: 1.3;          /* 39px */
  letter-spacing: -0.01em;   /* -0.3px */
  color: var(--color-gray-800);
}
```

**Uso**:
- Secciones dentro de una página
- Títulos de cards grandes
- Separadores visuales de contenido

**Ejemplo**:
```html
<h2 class="text-h2">Datos Personales</h2>
<h2 class="text-h2">Historial Clínico</h2>
<h2 class="text-h2">Citas Programadas</h2>
```

---

### H3 - Subsection Title
**Títulos de subsecciones**

```css
.text-h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;         /* 24px */
  font-weight: 600;          /* Semibold */
  line-height: 1.35;         /* 32.4px */
  letter-spacing: 0;
  color: var(--color-gray-800);
}
```

**Uso**:
- Subsecciones dentro de secciones H2
- Títulos de cards medianos
- Agrupaciones de formularios

**Ejemplo**:
```html
<h3 class="text-h3">Información de Contacto</h3>
<h3 class="text-h3">Antecedentes Médicos</h3>
```

---

### H4 - Card Title
**Títulos de componentes y cards**

```css
.text-h4 {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;        /* 20px */
  font-weight: 500;          /* Medium */
  line-height: 1.4;          /* 28px */
  letter-spacing: 0;
  color: var(--color-gray-700);
}
```

**Uso**:
- Títulos de cards pequeños
- Headers de componentes
- Nombres en listas
- Labels grandes

**Ejemplo**:
```html
<h4 class="text-h4">Última Cita</h4>
<h4 class="text-h4">Medicamentos Actuales</h4>
```

---

### Body Large - Emphasized Text
**Texto de cuerpo enfatizado**

```css
.text-body-lg {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;       /* 18px */
  font-weight: 400;          /* Regular */
  line-height: 1.5;          /* 27px */
  letter-spacing: 0;
  color: var(--color-gray-700);
}
```

**Uso**:
- Introducciones de secciones
- Descripciones importantes
- Mensajes destacados
- Contenido principal enfatizado

---

### Body - Default Text
**Texto estándar de la aplicación**

```css
.text-body {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;           /* 16px */
  font-weight: 400;          /* Regular */
  line-height: 1.5;          /* 24px */
  letter-spacing: 0;
  color: var(--color-gray-600);
}
```

**Uso**:
- Texto de contenido general
- Párrafos
- Descripciones
- Mensajes
- Labels de formulario
- **Uso más común en la aplicación**

---

### Body Small - Secondary Text
**Texto secundario y de soporte**

```css
.text-body-sm {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;       /* 14px */
  font-weight: 400;          /* Regular */
  line-height: 1.5;          /* 21px */
  letter-spacing: 0;
  color: var(--color-gray-500);
}
```

**Uso**:
- Metadatos (fecha, hora, autor)
- Texto de ayuda
- Footnotes
- Timestamps
- Información secundaria

**Ejemplo**:
```html
<p class="text-body-sm">Última actualización: 12/02/2026</p>
<span class="text-body-sm">Creado por: Dr. García</span>
```

---

### Caption - Labels & Hints
**Texto muy pequeño para labels y hints**

```css
.text-caption {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;        /* 12px */
  font-weight: 400;          /* Regular */
  line-height: 1.4;          /* 16.8px */
  letter-spacing: 0;
  color: var(--color-gray-500);
}
```

**Uso**:
- Etiquetas pequeñas
- Hints de formularios
- Mensajes de validación
- Contadores de caracteres
- Información complementaria

**Ejemplo**:
```html
<span class="text-caption">Máximo 200 caracteres</span>
<p class="text-caption">Campo obligatorio</p>
```

---

### Overline - Categories & Tags
**Texto para categorías y etiquetas**

```css
.text-overline {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;        /* 12px */
  font-weight: 600;          /* Semibold */
  line-height: 1.4;          /* 16.8px */
  letter-spacing: 0.1em;     /* 1.2px */
  text-transform: uppercase;
  color: var(--color-gray-500);
}
```

**Uso**:
- Categorías de sección
- Tags y badges
- Departamentos
- Estados superiores a cards

**Ejemplo**:
```html
<span class="text-overline">Psicología</span>
<span class="text-overline">Urgente</span>
```

---

### Code - Monospace Text
**Texto monoespaciado para códigos**

```css
.text-code {
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;       /* 14px */
  font-weight: 400;          /* Regular */
  line-height: 1.5;          /* 21px */
  letter-spacing: 0;
  color: var(--color-gray-700);
  background-color: var(--color-gray-100);
  padding: 2px 6px;
  border-radius: 4px;
}
```

**Uso**:
- Matrículas: `<code class="text-code">A01234567</code>`
- IDs de sistema: `<code class="text-code">EXP-2024-0123</code>`
- Códigos de diagnóstico: `<code class="text-code">F41.1</code>`

---

## 📐 Line Height (Altura de Línea)

### Principios
- **Títulos**: 1.2 - 1.4 (más compacto)
- **Cuerpo**: 1.5 - 1.6 (más legible)
- **Textos largos**: 1.6 - 1.8 (máxima legibilidad)

### Valores Específicos

| Tipo | Line Height | Uso |
|------|-------------|-----|
| **Display/H1** | 1.2 | Títulos grandes, impacto visual |
| **H2/H3** | 1.3-1.35 | Subtítulos, headers de sección |
| **H4** | 1.4 | Títulos de componentes |
| **Body** | 1.5 | Texto estándar, formularios |
| **Body Large** | 1.5 | Contenido enfatizado |
| **Caption** | 1.4 | Texto pequeño, hints |

---

## 🎨 Colores de Texto

### Jerarquía de Color

```css
/* Texto Principal */
.text-primary {
  color: var(--color-gray-900);  /* #111827 */
}

/* Texto Secundario */
.text-secondary {
  color: var(--color-gray-600);  /* #4B5563 */
}

/* Texto Terciario/Muted */
.text-muted {
  color: var(--color-gray-500);  /* #6B7280 */
}

/* Texto Deshabilitado */
.text-disabled {
  color: var(--color-gray-400);  /* #9CA3AF */
}

/* Texto Inverso (sobre fondos oscuros) */
.text-inverse {
  color: var(--color-white);     /* #FFFFFF */
}

/* Enlaces */
.text-link {
  color: var(--color-primary-600);  /* #2563EB */
}

/* Estados */
.text-success { color: var(--color-success-600); }
.text-warning { color: var(--color-warning-600); }
.text-error { color: var(--color-error-600); }
.text-info { color: var(--color-info-600); }
```

### Uso por Contexto

| Contexto | Color | Uso |
|----------|-------|-----|
| **H1-H2** | Gray 900 | Máximo contraste, jerarquía clara |
| **H3-H4** | Gray 800 | Subtítulos, menos peso visual |
| **Body** | Gray 700 | Contenido principal legible |
| **Body Small** | Gray 600 | Información secundaria |
| **Caption/Meta** | Gray 500 | Datos complementarios |
| **Placeholder** | Gray 400 | Inputs vacíos, hints |
| **Disabled** | Gray 400 | Elementos deshabilitados |

---

## 📱 Responsive Typography

### Breakpoints de Ajuste

```css
/* Mobile (<640px) */
@media (max-width: 639px) {
  :root {
    --text-display: 2.25rem;  /* 36px en lugar de 48px */
    --text-h1: 1.875rem;      /* 30px en lugar de 36px */
    --text-h2: 1.5rem;        /* 24px en lugar de 30px */
    --text-h3: 1.25rem;       /* 20px en lugar de 24px */
  }
}

/* Tablet (640px-1023px) */
@media (min-width: 640px) and (max-width: 1023px) {
  :root {
    --text-display: 2.5rem;   /* 40px */
    --text-h1: 2rem;          /* 32px */
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  /* Tamaños base definidos arriba */
}
```

### Fluid Typography (Opcional)

```css
/* Escala fluida usando clamp() */
.text-h1-fluid {
  font-size: clamp(1.875rem, 5vw, 2.25rem);  /* 30px-36px */
}

.text-h2-fluid {
  font-size: clamp(1.5rem, 4vw, 1.875rem);   /* 24px-30px */
}
```

---

## ✅ Mejores Prácticas

### DO's ✅

1. **Usa Inter para todo el UI estándar**
   ```html
   <p class="font-sans">Texto de interfaz</p>
   ```

2. **Usa Roboto para tablas con números**
   ```html
   <td class="font-roboto">123.45</td>
   ```

3. **Usa Fira Code para identificadores**
   ```html
   <code class="font-mono">A01234567</code>
   ```

4. **Mantén jerarquía clara**
   ```html
   <h1>Título Principal</h1>
   <h2>Sección</h2>
   <h3>Subsección</h3>
   <p>Contenido...</p>
   ```

5. **Usa line-height apropiado**
   - Títulos: 1.2-1.4
   - Cuerpo: 1.5-1.6

6. **Contraste suficiente**
   - Texto principal: Gray 900 o 800
   - Texto secundario: Gray 600 o 700

### DON'Ts ❌

1. **No uses más de 3 fuentes diferentes**
   - ❌ Mezclar muchas familias tipográficas

2. **No uses tamaños arbitrarios**
   - ❌ `font-size: 17px;`
   - ✅ Usa la escala definida

3. **No uses demasiados pesos**
   - ❌ 300, 400, 500, 600, 700, 800
   - ✅ Solo 400, 500, 600, 700

4. **No uses all-caps en textos largos**
   - ❌ Párrafos en mayúsculas
   - ✅ Solo para overlines y labels cortos

5. **No uses letter-spacing negativo en body text**
   - ❌ Body con tracking negativo
   - ✅ Solo en displays y títulos grandes

6. **No omitas unidades relativas**
   - ❌ `font-size: 16px;` (absoluto)
   - ✅ `font-size: 1rem;` (relativo)

---

## 💻 Implementación en Código

### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      roboto: ['Roboto', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.4' }],
      sm: ['0.875rem', { lineHeight: '1.5' }],
      base: ['1rem', { lineHeight: '1.5' }],
      lg: ['1.125rem', { lineHeight: '1.5' }],
      xl: ['1.25rem', { lineHeight: '1.4' }],
      '2xl': ['1.5rem', { lineHeight: '1.35' }],
      '3xl': ['1.875rem', { lineHeight: '1.3' }],
      '4xl': ['2.25rem', { lineHeight: '1.25' }],
      '5xl': ['3rem', { lineHeight: '1.2' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
}
```

### CSS Custom Properties

```css
:root {
  /* Fonts */
  --font-primary: 'Inter', sans-serif;
  --font-secondary: 'Roboto', sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  
  /* Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-snug: 1.35;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
}
```

### React/TypeScript Example

```tsx
// Typography Component
interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption';
  children: React.ReactNode;
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({ 
  variant, 
  children, 
  className = '' 
}) => {
  const styles = {
    h1: 'text-4xl font-bold leading-tight text-gray-900',
    h2: 'text-3xl font-semibold leading-snug text-gray-800',
    h3: 'text-2xl font-semibold leading-normal text-gray-800',
    h4: 'text-xl font-medium leading-normal text-gray-700',
    body: 'text-base font-normal leading-normal text-gray-600',
    'body-sm': 'text-sm font-normal leading-normal text-gray-500',
    caption: 'text-xs font-normal leading-snug text-gray-500',
  };

  const Tag = variant.startsWith('h') ? variant : 'p';
  
  return (
    <Tag className={`${styles[variant]} ${className}`}>
      {children}
    </Tag>
  );
};

// Uso
<Typography variant="h1">Título de Página</Typography>
<Typography variant="body">Contenido del párrafo...</Typography>
<Typography variant="caption">Texto pequeño</Typography>
```

---

## 📊 Ejemplos de Uso por Contexto

### Dashboard

```html
<div class="dashboard">
  <h1 class="text-4xl font-bold text-gray-900">
    Dashboard de Psicología
  </h1>
  
  <div class="card">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      Estadísticas del Mes
    </h2>
    <p class="text-base text-gray-600">
      Total de consultas realizadas este mes
    </p>
    <span class="text-3xl font-bold text-primary-600 font-roboto">
      142
    </span>
  </div>
</div>
```

### Formulario

```html
<form class="patient-form">
  <h2 class="text-3xl font-semibold text-gray-800 mb-6">
    Nuevo Paciente
  </h2>
  
  <div class="form-field">
    <label class="text-sm font-medium text-gray-700">
      Nombre Completo
    </label>
    <input 
      type="text" 
      placeholder="Ingrese el nombre"
      class="text-base text-gray-900"
    />
    <p class="text-xs text-gray-500 mt-1">
      Nombre y apellidos del paciente
    </p>
  </div>
  
  <div class="form-field">
    <label class="text-sm font-medium text-gray-700">
      Matrícula
    </label>
    <input 
      type="text" 
      placeholder="A01234567"
      class="text-base font-mono text-gray-900"
    />
  </div>
</form>
```

### Tabla de Datos

```html
<table class="data-table">
  <thead>
    <tr>
      <th class="text-sm font-semibold text-gray-700 uppercase">
        Paciente
      </th>
      <th class="text-sm font-semibold text-gray-700 uppercase">
        Matrícula
      </th>
      <th class="text-sm font-semibold text-gray-700 uppercase font-roboto">
        Edad
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-base text-gray-900">
        Juan Pérez García
      </td>
      <td class="text-sm font-mono text-gray-700">
        A01234567
      </td>
      <td class="text-base font-roboto text-gray-900">
        23
      </td>
    </tr>
  </tbody>
</table>
```

---

## ♿ Accesibilidad Tipográfica

### Tamaños Mínimos
- ✅ **Texto de cuerpo**: Mínimo 16px (1rem)
- ✅ **Texto pequeño**: Mínimo 14px (0.875rem)
- ⚠️ **Texto muy pequeño**: 12px solo para labels, evitar para lectura

### Contraste de Texto
- ✅ Texto normal (≤18px): Contraste mínimo 4.5:1
- ✅ Texto grande (≥18px): Contraste mínimo 3:1

### Legibilidad
- ✅ Longitud de línea ideal: 50-75 caracteres
- ✅ Máximo: 80-100 caracteres
- ✅ Párrafos cortos: 3-5 líneas

### Soporte de Zoom
- ✅ Soportar zoom hasta 200%
- ✅ Usar unidades relativas (rem, em)
- ✅ No usar `font-size: px` fijo

---

## 📚 Referencias

- [Inter Font](https://rsms.me/inter/)
- [Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)
- [Fira Code](https://github.com/tonsky/FiraCode)
- [TailwindCSS Typography](https://tailwindcss.com/docs/font-size)
- [WCAG Text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design Typography](https://m3.material.io/styles/typography/overview)

---

**Última actualización**: 2026-02-14  
**Versión**: 1.0.0  
**Autor**: Equipo de Diseño EHR System
