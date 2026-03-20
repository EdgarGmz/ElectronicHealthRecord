# 💎 Tema Crystal Glass - Sistema EHR

## 📋 Descripción

Tema de diseño glassmorphism (cristal esmerilado) inspirado en el sistema de diseño de iOS. Este tema utiliza efectos de vidrio translúcido con difuminado de fondo (backdrop blur), transparencias sutiles y bordes delicados para crear una interfaz moderna y elegante.

---

## 🎨 Principios del Glassmorphism

### Características Principales

1. **Transparencia**: Fondos semi-transparentes (60-90% opacidad)
2. **Backdrop Blur**: Efecto de desenfoque del contenido detrás
3. **Bordes Sutiles**: Bordes semi-transparentes con brillo sutil
4. **Sombras Suaves**: Sombras ligeras para profundidad
5. **Colores Vibrantes**: Colores saturados sobre fondos translúcidos

### Inspiración iOS

Este tema está inspirado en:
- iOS Control Center
- iOS Notification Center
- macOS Big Sur y posteriores
- Apple Music, Weather app

---

## 🎨 Paleta de Colores Glass

### Fondos Glass (Backgrounds)

#### Glass Light (Claro)
```css
/* Fondo glass claro */
--glass-light: rgba(255, 255, 255, 0.7);
--glass-light-border: rgba(255, 255, 255, 0.8);
--glass-light-hover: rgba(255, 255, 255, 0.8);
--glass-light-active: rgba(255, 255, 255, 0.9);
```

**Uso:** Cards, modales, popovers sobre fondos claros

#### Glass Dark (Oscuro)
```css
/* Fondo glass oscuro */
--glass-dark: rgba(0, 0, 0, 0.4);
--glass-dark-border: rgba(255, 255, 255, 0.1);
--glass-dark-hover: rgba(0, 0, 0, 0.5);
--glass-dark-active: rgba(0, 0, 0, 0.6);
```

**Uso:** Cards, modales sobre fondos oscuros o imágenes

#### Glass Tinted (Tintados con Color)

```css
/* Glass Primary (Azul) */
--glass-primary: rgba(37, 99, 235, 0.15);
--glass-primary-border: rgba(37, 99, 235, 0.3);
--glass-primary-strong: rgba(37, 99, 235, 0.25);

/* Glass Success (Verde) */
--glass-success: rgba(5, 150, 105, 0.15);
--glass-success-border: rgba(5, 150, 105, 0.3);
--glass-success-strong: rgba(5, 150, 105, 0.25);

/* Glass Warning (Naranja) */
--glass-warning: rgba(217, 119, 6, 0.15);
--glass-warning-border: rgba(217, 119, 6, 0.3);
--glass-warning-strong: rgba(217, 119, 6, 0.25);

/* Glass Error (Rojo) */
--glass-error: rgba(220, 38, 38, 0.15);
--glass-error-border: rgba(220, 38, 38, 0.3);
--glass-error-strong: rgba(220, 38, 38, 0.25);
```

**Uso:** Badges, alerts, notificaciones con estado

---

## 🔲 Efectos de Difuminado (Backdrop Blur)

### Niveles de Blur

```css
/* Blur Suave - Para sutileza */
--blur-xs: blur(2px);
--blur-sm: blur(4px);

/* Blur Medio - Estándar para glass */
--blur-md: blur(8px);
--blur-lg: blur(12px);

/* Blur Intenso - Para énfasis */
--blur-xl: blur(16px);
--blur-2xl: blur(24px);
--blur-3xl: blur(32px);
```

### Uso por Contexto

| Componente | Blur Recomendado | Opacidad |
|------------|------------------|----------|
| **Cards** | blur(8px) - md | 0.7 - 0.8 |
| **Modales** | blur(12px) - lg | 0.8 - 0.9 |
| **Sidebar** | blur(16px) - xl | 0.75 - 0.85 |
| **Popovers** | blur(8px) - md | 0.75 - 0.85 |
| **Notifications** | blur(12px) - lg | 0.8 - 0.9 |
| **Overlays** | blur(24px) - 2xl | 0.4 - 0.6 |

---

## 🎭 Componentes Glass

### 1. Glass Card (Tarjeta de Cristal)

#### Básico
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

/* Hover state */
.glass-card:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}
```

#### HTML Example
```html
<div class="glass-card">
  <h3 class="text-xl font-semibold text-gray-900 mb-2">
    Información del Paciente
  </h3>
  <p class="text-gray-700">
    Contenido de la tarjeta con efecto glass...
  </p>
</div>
```

#### TailwindCSS
```html
<div class="
  bg-white/70 
  backdrop-blur-md 
  border border-white/80 
  rounded-2xl 
  shadow-lg 
  p-6
  hover:bg-white/80 
  hover:shadow-xl 
  transition-all
">
  <h3 class="text-xl font-semibold text-gray-900 mb-2">
    Información del Paciente
  </h3>
  <p class="text-gray-700">
    Contenido...
  </p>
</div>
```

---

### 2. Glass Button (Botón de Cristal)

```css
.glass-button {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 10px 20px;
  color: #1F2937;
  font-weight: 500;
  transition: all 0.2s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(255, 255, 255, 0.85);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.glass-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

#### TailwindCSS
```html
<button class="
  bg-white/60 
  backdrop-blur-md 
  border border-white/70 
  rounded-xl 
  px-5 py-2.5 
  text-gray-800 
  font-medium
  hover:bg-white/75 
  hover:-translate-y-0.5 
  hover:shadow-lg
  active:translate-y-0
  transition-all
">
  Guardar Cambios
</button>
```

---

### 3. Glass Modal (Modal de Cristal)

```css
/* Backdrop oscurecido con blur */
.glass-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  z-index: 1400;
}

/* Modal glass */
.glass-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 32px;
  max-width: 500px;
  width: 90%;
  z-index: 1500;
}
```

#### HTML Example
```html
<div class="glass-modal-backdrop">
  <div class="glass-modal">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      Confirmar Acción
    </h2>
    <p class="text-gray-700 mb-6">
      ¿Está seguro que desea continuar?
    </p>
    <div class="flex gap-3 justify-end">
      <button class="glass-button">Cancelar</button>
      <button class="glass-button-primary">Confirmar</button>
    </div>
  </div>
</div>
```

---

### 4. Glass Sidebar (Barra Lateral de Cristal)

```css
.glass-sidebar {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.05);
  min-height: 100vh;
  width: 240px;
}

.glass-sidebar-item {
  padding: 12px 16px;
  margin: 4px 8px;
  border-radius: 10px;
  color: #4B5563;
  font-weight: 500;
  transition: all 0.2s ease;
}

.glass-sidebar-item:hover {
  background: rgba(255, 255, 255, 0.6);
  color: #1F2937;
}

.glass-sidebar-item.active {
  background: rgba(37, 99, 235, 0.15);
  color: #2563EB;
  border: 1px solid rgba(37, 99, 235, 0.3);
}
```

---

### 5. Glass Badge (Insignia de Cristal)

```css
.glass-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Variantes con color */
.glass-badge-primary {
  background: rgba(37, 99, 235, 0.2);
  border-color: rgba(37, 99, 235, 0.4);
  color: #1D4ED8;
}

.glass-badge-success {
  background: rgba(5, 150, 105, 0.2);
  border-color: rgba(5, 150, 105, 0.4);
  color: #047857;
}

.glass-badge-warning {
  background: rgba(217, 119, 6, 0.2);
  border-color: rgba(217, 119, 6, 0.4);
  color: #B45309;
}

.glass-badge-error {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.4);
  color: #B91C1C;
}
```

#### HTML Examples
```html
<span class="glass-badge glass-badge-primary">Activo</span>
<span class="glass-badge glass-badge-success">Completado</span>
<span class="glass-badge glass-badge-warning">Pendiente</span>
<span class="glass-badge glass-badge-error">Error</span>
```

---

### 6. Glass Input (Input de Cristal)

```css
.glass-input {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 10px 16px;
  color: #1F2937;
  font-size: 16px;
  transition: all 0.2s ease;
}

.glass-input::placeholder {
  color: rgba(107, 114, 128, 0.7);
}

.glass-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

---

### 7. Glass Alert (Alerta de Cristal)

```css
.glass-alert {
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.glass-alert-info {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.3);
}

.glass-alert-success {
  background: rgba(5, 150, 105, 0.15);
  border-color: rgba(5, 150, 105, 0.3);
}

.glass-alert-warning {
  background: rgba(217, 119, 6, 0.15);
  border-color: rgba(217, 119, 6, 0.3);
}

.glass-alert-error {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.3);
}
```

---

## 🎨 Fondos Recomendados para Glass

### Gradientes de Fondo

Para maximizar el efecto glass, usa fondos con gradientes suaves:

```css
/* Gradiente sutil */
.glass-bg-subtle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Gradiente vibrante */
.glass-bg-vibrant {
  background: linear-gradient(135deg, #667eea 0%, #f093fb 50%, #4facfe 100%);
}

/* Gradiente Healthcare */
.glass-bg-healthcare {
  background: linear-gradient(135deg, #2563EB 0%, #10B981 100%);
}

/* Mesh gradient (iOS style) */
.glass-bg-mesh {
  background: 
    radial-gradient(at 40% 20%, rgba(37, 99, 235, 0.3) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(16, 185, 129, 0.3) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(139, 92, 246, 0.3) 0px, transparent 50%),
    radial-gradient(at 80% 50%, rgba(245, 158, 11, 0.3) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.3) 0px, transparent 50%),
    linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%);
}
```

---

## 💻 Implementación en CSS

### Variables CSS Completas

```css
:root {
  /* Glass Backgrounds */
  --glass-light: rgba(255, 255, 255, 0.7);
  --glass-light-hover: rgba(255, 255, 255, 0.8);
  --glass-light-active: rgba(255, 255, 255, 0.9);
  
  --glass-dark: rgba(0, 0, 0, 0.4);
  --glass-dark-hover: rgba(0, 0, 0, 0.5);
  --glass-dark-active: rgba(0, 0, 0, 0.6);
  
  /* Glass Tinted */
  --glass-primary: rgba(37, 99, 235, 0.15);
  --glass-primary-strong: rgba(37, 99, 235, 0.25);
  --glass-success: rgba(5, 150, 105, 0.15);
  --glass-success-strong: rgba(5, 150, 105, 0.25);
  --glass-warning: rgba(217, 119, 6, 0.15);
  --glass-warning-strong: rgba(217, 119, 6, 0.25);
  --glass-error: rgba(220, 38, 38, 0.15);
  --glass-error-strong: rgba(220, 38, 38, 0.25);
  
  /* Glass Borders */
  --glass-border-light: rgba(255, 255, 255, 0.8);
  --glass-border-dark: rgba(255, 255, 255, 0.1);
  --glass-border-primary: rgba(37, 99, 235, 0.3);
  --glass-border-success: rgba(5, 150, 105, 0.3);
  --glass-border-warning: rgba(217, 119, 6, 0.3);
  --glass-border-error: rgba(220, 38, 38, 0.3);
  
  /* Blur Levels */
  --blur-xs: blur(2px);
  --blur-sm: blur(4px);
  --blur-md: blur(8px);
  --blur-lg: blur(12px);
  --blur-xl: blur(16px);
  --blur-2xl: blur(24px);
  --blur-3xl: blur(32px);
  
  /* Glass Radius */
  --glass-radius-sm: 10px;
  --glass-radius-md: 12px;
  --glass-radius-lg: 16px;
  --glass-radius-xl: 20px;
  
  /* Glass Shadows */
  --glass-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --glass-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --glass-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --glass-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

---

## ⚙️ TailwindCSS Configuration

### Extend Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // Glass backgrounds
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.7)',
        'glass-light-hover': 'rgba(255, 255, 255, 0.8)',
        'glass-dark': 'rgba(0, 0, 0, 0.4)',
        'glass-dark-hover': 'rgba(0, 0, 0, 0.5)',
        'glass-primary': 'rgba(37, 99, 235, 0.15)',
        'glass-success': 'rgba(5, 150, 105, 0.15)',
        'glass-warning': 'rgba(217, 119, 6, 0.15)',
        'glass-error': 'rgba(220, 38, 38, 0.15)',
      },
      
      // Backdrop blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      
      // Border colors
      borderColor: {
        'glass-light': 'rgba(255, 255, 255, 0.8)',
        'glass-primary': 'rgba(37, 99, 235, 0.3)',
        'glass-success': 'rgba(5, 150, 105, 0.3)',
        'glass-warning': 'rgba(217, 119, 6, 0.3)',
        'glass-error': 'rgba(220, 38, 38, 0.3)',
      },
    },
  },
}
```

### Utility Classes

```css
/* Glass utilities */
.glass-effect {
  @apply backdrop-blur-md bg-white/70 border border-white/80;
}

.glass-card-base {
  @apply backdrop-blur-md bg-white/70 border border-white/80 rounded-2xl shadow-lg;
}

.glass-button-base {
  @apply backdrop-blur-md bg-white/60 border border-white/70 rounded-xl;
}
```

---

## 🎯 Mejores Prácticas

### DO's ✅

1. **Usa fondos con contenido visual**
   ```html
   ✅ Glass sobre gradientes, imágenes, o contenido variado
   ```

2. **Mantén suficiente contraste**
   ```css
   ✅ color: #1F2937; /* Texto oscuro sobre glass claro */
   ```

3. **Combina con sombras suaves**
   ```css
   ✅ box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
   ```

4. **Usa border-radius generoso**
   ```css
   ✅ border-radius: 16px; /* Esquinas redondeadas */
   ```

5. **Aplica transiciones suaves**
   ```css
   ✅ transition: all 0.2s ease;
   ```

### DON'Ts ❌

1. **No uses glass sobre fondos planos sin textura**
   ```html
   ❌ Glass sobre fondo blanco sólido (no se ve el efecto)
   ```

2. **No abuses de la opacidad**
   ```css
   ❌ background: rgba(255, 255, 255, 0.3); /* Muy transparente */
   ```

3. **No uses blur excesivo**
   ```css
   ❌ backdrop-filter: blur(50px); /* Demasiado blur */
   ```

4. **No mezcles demasiados efectos**
   ```css
   ❌ Múltiples layers glass superpuestos
   ```

5. **No sacrifiques legibilidad**
   ```css
   ❌ Texto de bajo contraste sobre glass
   ```

---

## ♿ Accesibilidad

### Consideraciones

1. **Contraste de Texto**
   - Mínimo 4.5:1 para texto normal
   - Usar textos oscuros (#1F2937) sobre glass claro
   - Usar textos claros (#FFFFFF) sobre glass oscuro

2. **Focus States**
   ```css
   .glass-button:focus-visible {
     outline: 2px solid #2563EB;
     outline-offset: 2px;
     box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
   }
   ```

3. **Motion Sensitivity**
   ```css
   @media (prefers-reduced-motion: reduce) {
     .glass-card {
       transition: none;
       transform: none !important;
     }
   }
   ```

---

## 📱 Soporte de Navegadores

### Backdrop Filter Support

```css
/* Fallback para navegadores sin soporte */
.glass-card {
  background: rgba(255, 255, 255, 0.9); /* Fallback más opaco */
}

@supports (backdrop-filter: blur(8px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
  }
}

/* Webkit prefix para Safari */
@supports (-webkit-backdrop-filter: blur(8px)) {
  .glass-card {
    -webkit-backdrop-filter: blur(8px);
  }
}
```

### Compatibilidad

| Navegador | Versión | Soporte |
|-----------|---------|---------|
| Chrome | 76+ | ✅ Completo |
| Safari | 9+ | ✅ Completo (con prefix) |
| Firefox | 103+ | ✅ Completo |
| Edge | 79+ | ✅ Completo |
| iOS Safari | 9+ | ✅ Completo |
| Android Chrome | 76+ | ✅ Completo |

---

## 🎨 Ejemplos Completos

### Dashboard Glass

```html
<div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
  <!-- Sidebar Glass -->
  <aside class="glass-sidebar">
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-6">EHR System</h2>
      <nav class="space-y-2">
        <a href="#" class="glass-sidebar-item active">Dashboard</a>
        <a href="#" class="glass-sidebar-item">Pacientes</a>
        <a href="#" class="glass-sidebar-item">Citas</a>
      </nav>
    </div>
  </aside>
  
  <!-- Main Content -->
  <main class="ml-[240px] p-8">
    <div class="grid grid-cols-3 gap-6 mb-8">
      <!-- Stat Cards -->
      <div class="glass-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">Total Pacientes</span>
          <span class="glass-badge glass-badge-primary">+12%</span>
        </div>
        <div class="text-3xl font-bold text-gray-900">142</div>
      </div>
      
      <div class="glass-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">Citas Hoy</span>
          <span class="glass-badge glass-badge-success">Activas</span>
        </div>
        <div class="text-3xl font-bold text-gray-900">24</div>
      </div>
      
      <div class="glass-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">Pendientes</span>
          <span class="glass-badge glass-badge-warning">8</span>
        </div>
        <div class="text-3xl font-bold text-gray-900">8</div>
      </div>
    </div>
    
    <!-- Content Card -->
    <div class="glass-card">
      <h3 class="text-xl font-semibold text-gray-900 mb-4">
        Citas Recientes
      </h3>
      <p class="text-gray-700">
        Contenido de la tabla...
      </p>
    </div>
  </main>
</div>
```

---

## 📚 Referencias

- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Glassmorphism in User Interfaces](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)
- [CSS backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)

---

**Última actualización**: 2026-02-15  
**Versión**: 1.0.0  
**Autor**: Equipo de Diseño EHR System
