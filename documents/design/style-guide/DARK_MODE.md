# 🌓 Temas Claro y Oscuro - Sistema EHR

## 📋 Descripción

Especificación completa de los temas claro (Light Mode) y oscuro (Dark Mode) para el Sistema de Registro de Salud Electrónico. El sistema soporta cambio automático por turno (día/noche) o selección manual estática.

---

## 🎨 Modos de Tema

### Tipos de Tema Disponibles

1. **Tema Claro (Light Mode)** - Por defecto, óptimo para ambientes bien iluminados
2. **Tema Oscuro (Dark Mode)** - Reduce fatiga visual en ambientes con poca luz
3. **Automático por Turno** - Cambia según turno médico (día 6am-6pm, noche 6pm-6am)
4. **Automático por Sistema** - Sigue preferencia del sistema operativo
5. **Manual/Estático** - Usuario selecciona y persiste su preferencia

---

## 🌞 Tema Claro (Light Mode)

### Paleta de Colores - Light Mode

```css
/* Light Mode Backgrounds */
--bg-primary-light: #FFFFFF;
--bg-secondary-light: #F9FAFB;
--bg-tertiary-light: #F3F4F6;

/* Light Mode Text */
--text-primary-light: #111827;
--text-secondary-light: #4B5563;
--text-tertiary-light: #6B7280;

/* Light Mode Borders */
--border-light-mode: #E5E7EB;

/* Light Mode Brand Colors */
--primary-light: #2563EB;
--success-light: #059669;
--warning-light: #D97706;
--error-light: #DC2626;
```

---

## 🌙 Tema Oscuro (Dark Mode)

### Paleta de Colores - Dark Mode

```css
/* Dark Mode Backgrounds */
--bg-primary-dark: #111827;
--bg-secondary-dark: #1F2937;
--bg-tertiary-dark: #374151;

/* Dark Mode Text */
--text-primary-dark: #F9FAFB;
--text-secondary-dark: #D1D5DB;
--text-tertiary-dark: #9CA3AF;

/* Dark Mode Borders */
--border-dark-mode: #374151;

/* Dark Mode Brand Colors (Brighter for contrast) */
--primary-dark: #60A5FA;
--success-dark: #34D399;
--warning-dark: #FBBF24;
--error-dark: #F87171;
```

---

## 🔄 Sistema de Cambio Automático

### 1. Por Turno Médico (Recomendado para EHR)

```javascript
/**
 * Detecta turno médico y aplica tema correspondiente
 * Turno Día: 6:00 AM - 5:59 PM (Light Mode)
 * Turno Noche: 6:00 PM - 5:59 AM (Dark Mode)
 */
function applyShiftBasedTheme() {
  const hour = new Date().getHours();
  const isNightShift = hour >= 18 || hour < 6;
  
  if (isNightShift) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// Ejecutar al cargar y verificar cada hora
applyShiftBasedTheme();
setInterval(applyShiftBasedTheme, 3600000); // Cada hora
```

### 2. Por Preferencia de Sistema

```javascript
/**
 * Detecta y sigue preferencia del sistema operativo
 */
function applySystemTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// Escuchar cambios en preferencia del sistema
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', applySystemTheme);
```

### 3. Manual/Estático con Persistencia

```javascript
/**
 * Permite selección manual del usuario con persistencia
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ehr-theme', theme);
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('ehr-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // Fallback a automático por turno
    applyShiftBasedTheme();
  }
}

// Cargar tema guardado al iniciar
loadSavedTheme();
```

---

## 💻 Implementación CSS

### Configuración Base con CSS Variables

```css
:root {
  /* Active theme tokens (Default: Light) */
  --bg-primary: var(--bg-primary-light);
  --bg-secondary: var(--bg-secondary-light);
  --text-primary: var(--text-primary-light);
  --text-secondary: var(--text-secondary-light);
  --border: var(--border-light-mode);
  --color-primary: var(--primary-light);
}

/* Dark Mode */
[data-theme="dark"] {
  --bg-primary: var(--bg-primary-dark);
  --bg-secondary: var(--bg-secondary-dark);
  --text-primary: var(--text-primary-dark);
  --text-secondary: var(--text-secondary-dark);
  --border: var(--border-dark-mode);
  --color-primary: var(--primary-dark);
}

/* Smooth transitions for theme changes */
* {
  transition-property: background-color, color, border-color;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
```

---

## ⚙️ TailwindCSS Dark Mode

### Configuración

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Usa [data-theme="dark"]
  plugins: [
    function({ addVariant }) {
      addVariant('dark', '[data-theme="dark"] &');
    }
  ]
}
```

### Uso con TailwindCSS

```html
<!-- Fondo que cambia con el tema -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Contenido adaptativo
</div>

<!-- Card con tema -->
<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
  <h3 class="text-gray-900 dark:text-gray-100">Título</h3>
  <p class="text-gray-600 dark:text-gray-300">Descripción</p>
</div>

<!-- Botón con tema -->
<button class="bg-primary-600 dark:bg-primary-400 text-white rounded-lg px-4 py-2">
  Guardar
</button>
```

---

## 🎛️ Componente Toggle de Tema

### React/TypeScript

```tsx
import React, { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto-shift' | 'auto-system';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('auto-shift');

  useEffect(() => {
    const savedTheme = localStorage.getItem('ehr-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    let actualTheme: 'light' | 'dark' = 'light';
    
    switch (newTheme) {
      case 'light':
        actualTheme = 'light';
        break;
      case 'dark':
        actualTheme = 'dark';
        break;
      case 'auto-shift':
        const hour = new Date().getHours();
        actualTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
        break;
      case 'auto-system':
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' : 'light';
        break;
    }
    
    document.documentElement.setAttribute('data-theme', actualTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('ehr-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="theme-toggle">
      <label className="text-sm font-medium mb-2 block">
        Tema de Interfaz
      </label>
      <select 
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value as Theme)}
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="light">☀️ Claro</option>
        <option value="dark">🌙 Oscuro</option>
        <option value="auto-shift">🏥 Automático (Turno)</option>
        <option value="auto-system">⚙️ Automático (Sistema)</option>
      </select>
      
      <p className="text-xs text-gray-500 mt-2">
        {theme === 'auto-shift' && 'Cambia con el turno médico (día: 6am-6pm, noche: 6pm-6am)'}
        {theme === 'auto-system' && 'Sigue la preferencia de tu sistema operativo'}
      </p>
    </div>
  );
};

export default ThemeToggle;
```

---

## ♿ Accesibilidad

### Contraste en Ambos Modos

#### Light Mode
- ✅ Texto principal: #111827 sobre #FFFFFF (17.3:1) - AAA
- ✅ Texto secundario: #4B5563 sobre #FFFFFF (7.0:1) - AAA
- ✅ Primary button: #FFFFFF sobre #2563EB (7.5:1) - AAA

#### Dark Mode
- ✅ Texto principal: #F9FAFB sobre #111827 (16.8:1) - AAA
- ✅ Texto secundario: #D1D5DB sobre #111827 (11.5:1) - AAA
- ✅ Primary button: #111827 sobre #60A5FA (7.2:1) - AAA

---

## 📊 Tabla de Referencia Rápida

| Elemento | Light Mode | Dark Mode |
|----------|------------|-----------|
| **Fondo Principal** | `#FFFFFF` | `#111827` |
| **Fondo Secundario** | `#F9FAFB` | `#1F2937` |
| **Texto Principal** | `#111827` | `#F9FAFB` |
| **Texto Secundario** | `#4B5563` | `#D1D5DB` |
| **Bordes** | `#E5E7EB` | `#374151` |
| **Primary** | `#2563EB` | `#60A5FA` |
| **Success** | `#059669` | `#34D399` |
| **Warning** | `#D97706` | `#FBBF24` |
| **Error** | `#DC2626` | `#F87171` |

---

## 🔧 Configuración Recomendada

### Para Entorno Médico

1. **Default**: Automático por Turno
   - Reduce fatiga visual del personal nocturno
   - Cambio automático a las 6:00 AM y 6:00 PM

2. **Permitir Override Manual**
   - Usuario puede establecer preferencia estática
   - Persistir en localStorage

3. **Transición Suave**
   ```css
   * {
     transition: background-color 0.3s ease, 
                 color 0.3s ease, 
                 border-color 0.3s ease;
   }
   ```

---

## 🎯 Mejores Prácticas

### DO's ✅

1. **Usar variables CSS para todos los colores**
   ```css
   ✅ color: var(--text-primary);
   ❌ color: #111827;
   ```

2. **Probar en ambos modos**

3. **Usar transiciones suaves**

4. **Considerar imágenes y gráficos**

### DON'Ts ❌

1. **No usar colores hardcoded**
2. **No olvidar estados interactivos**
3. **No usar transiciones demasiado largas**

---

**Última actualización**: 2026-02-15  
**Versión**: 1.0.0  
**Autor**: Equipo de Diseño EHR System
