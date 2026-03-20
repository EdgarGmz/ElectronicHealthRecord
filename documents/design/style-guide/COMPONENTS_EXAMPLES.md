# 🧩 Ejemplos de Componentes - Sistema EHR

## 📋 Descripción

Guía visual y de código de componentes UI clave del Sistema de Registro de Salud Electrónico. Incluye especificaciones detalladas de botones, cards, inputs, y otros elementos aplicando la guía de estilos completa.

---

## 🔘 Botones

### Anatomía del Botón

```
┌─────────────────────────────────┐
│  [Icon]  Label Text  [Icon]     │  ← Height: 40px (md)
│   8px      auto        8px      │
└─────────────────────────────────┘
     ↑                      ↑
  Padding: 10px 16px (py-2.5 px-4)
  Border-radius: 8px (rounded-lg)
  Font: Inter 16px Medium
```

### Variantes

#### 1. Primary Button
**Uso**: Acción principal de una página o modal

```html
<button class="
  px-4 py-2.5 
  bg-primary-600 hover:bg-primary-700 
  text-white 
  font-medium 
  rounded-lg 
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Guardar Cambios
</button>
```

**Estados**:
- Default: `bg-primary-600`
- Hover: `bg-primary-700`
- Active: `bg-primary-800`
- Focus: `ring-2 ring-primary-500`
- Disabled: `opacity-50 cursor-not-allowed`

**Colores**:
- Background: `#2563EB` (Primary 600)
- Background Hover: `#1D4ED8` (Primary 700)
- Text: `#FFFFFF` (White)

---

#### 2. Secondary Button
**Uso**: Acciones secundarias, alternativas a primary

```html
<button class="
  px-4 py-2.5 
  bg-white 
  border border-gray-300 hover:border-gray-400 
  text-gray-700 hover:text-gray-900 
  font-medium 
  rounded-lg 
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  Cancelar
</button>
```

**Colores**:
- Background: `#FFFFFF` (White)
- Border: `#D1D5DB` (Gray 300)
- Text: `#374151` (Gray 700)

---

#### 3. Danger Button
**Uso**: Acciones destructivas (eliminar, rechazar)

```html
<button class="
  px-4 py-2.5 
  bg-error-600 hover:bg-error-700 
  text-white 
  font-medium 
  rounded-lg 
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2
">
  Eliminar Paciente
</button>
```

**Colores**:
- Background: `#DC2626` (Error 600)
- Background Hover: `#B91C1C` (Error 700)
- Text: `#FFFFFF` (White)

---

#### 4. Ghost Button
**Uso**: Acciones terciarias, menos énfasis

```html
<button class="
  px-4 py-2.5 
  text-gray-700 hover:text-gray-900 
  hover:bg-gray-100 
  font-medium 
  rounded-lg 
  transition-colors duration-200
">
  Ver Más
</button>
```

---

#### 5. Icon Button
**Uso**: Acciones con solo ícono

```html
<button class="
  p-2 
  text-gray-600 hover:text-gray-900 
  hover:bg-gray-100 
  rounded-lg 
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500
" aria-label="Editar">
  <svg class="w-5 h-5"><!-- icon --></svg>
</button>
```

---

### Tamaños de Botones

```html
<!-- Small -->
<button class="px-3 py-2 text-sm">Small</button>

<!-- Medium (Default) -->
<button class="px-4 py-2.5 text-base">Medium</button>

<!-- Large -->
<button class="px-6 py-3 text-lg">Large</button>
```

| Tamaño | Padding | Font Size | Height | Uso |
|--------|---------|-----------|--------|-----|
| **Small** | `8px 12px` | 14px | 32px | Tablas, espacios reducidos |
| **Medium** | `10px 16px` | 16px | 40px | **Estándar** |
| **Large** | `12px 24px` | 18px | 48px | CTAs importantes |

---

### Botones con Iconos

```html
<!-- Icon Left -->
<button class="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg">
  <svg class="w-5 h-5"><!-- plus icon --></svg>
  <span>Nuevo Paciente</span>
</button>

<!-- Icon Right -->
<button class="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-lg">
  <span>Descargar Reporte</span>
  <svg class="w-5 h-5"><!-- download icon --></svg>
</button>

<!-- Loading State -->
<button class="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg" disabled>
  <svg class="w-5 h-5 animate-spin"><!-- spinner --></svg>
  <span>Guardando...</span>
</button>
```

---

## 📇 Cards

### Anatomía del Card

```
┌────────────────────────────────────┐
│  ← 24px padding all sides →       │
│  ┌──────────────────────────────┐ │
│  │  Header (H4)                 │ │
│  ├──────────────────────────────┤ │ ← 16px gap
│  │  Content                     │ │
│  │  Body text...                │ │
│  │                              │ │
│  ├──────────────────────────────┤ │
│  │  Footer                      │ │
│  │  [Action buttons]            │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
     Shadow: md
     Border-radius: 8px
     Background: White
```

### Card Básico

```html
<div class="bg-white rounded-lg shadow-md p-6">
  <h4 class="text-xl font-semibold text-gray-900 mb-4">
    Título del Card
  </h4>
  <p class="text-gray-600 mb-4">
    Contenido del card con información relevante para el usuario.
  </p>
  <div class="flex gap-3">
    <button class="px-4 py-2 bg-primary-600 text-white rounded-lg">
      Acción Principal
    </button>
    <button class="px-4 py-2 border rounded-lg">
      Cancelar
    </button>
  </div>
</div>
```

**Especificaciones**:
- Padding: `24px` (p-6)
- Border-radius: `8px` (rounded-lg)
- Shadow: `shadow-md` (0 4px 6px rgba(0,0,0,0.1))
- Background: White
- Gap entre elementos: `16px` (space-y-4)

---

### Card con Header y Divisor

```html
<div class="bg-white rounded-lg shadow-md overflow-hidden">
  <!-- Header -->
  <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
    <h4 class="text-lg font-semibold text-gray-900">
      Información del Paciente
    </h4>
  </div>
  
  <!-- Body -->
  <div class="p-6 space-y-4">
    <div class="flex justify-between">
      <span class="text-sm text-gray-500">Nombre:</span>
      <span class="text-sm font-medium text-gray-900">Juan Pérez</span>
    </div>
    <div class="flex justify-between">
      <span class="text-sm text-gray-500">Matrícula:</span>
      <span class="text-sm font-mono text-gray-900">A01234567</span>
    </div>
  </div>
</div>
```

---

### Stat Card (Dashboard)

```html
<div class="bg-white rounded-lg shadow-md p-6">
  <div class="flex items-center justify-between mb-2">
    <span class="text-sm font-medium text-gray-600">Total Pacientes</span>
    <svg class="w-8 h-8 text-primary-600"><!-- icon --></svg>
  </div>
  <div class="text-3xl font-bold text-gray-900 font-roboto mb-1">
    142
  </div>
  <div class="flex items-center text-sm">
    <span class="text-success-600 font-medium">+12.5%</span>
    <span class="text-gray-500 ml-2">vs mes anterior</span>
  </div>
</div>
```

**Uso**: Mostrar métricas importantes en dashboards

---

### Card Interactivo (Hover)

```html
<div class="
  bg-white rounded-lg shadow-md p-6 
  transition-all duration-200 
  hover:shadow-lg hover:-translate-y-1 
  cursor-pointer
">
  <h4 class="text-lg font-semibold text-gray-900 mb-2">
    Última Cita
  </h4>
  <p class="text-sm text-gray-600 mb-4">
    15 de Febrero, 2026 - 10:00 AM
  </p>
  <span class="text-sm text-primary-600 font-medium">
    Ver detalles →
  </span>
</div>
```

---

## 📝 Inputs y Formularios

### Anatomía del Input Field

```
Label Text           Helper Icon
    ↓                    ↓
┌────────────────────────────────┐
│  Nombre Completo          [?]  │  ← Label (14px Medium)
└────────────────────────────────┘
         ↓ 8px gap
┌────────────────────────────────┐
│  [Icon]  Input text...         │  ← Height: 40px
│   12px      padding             │
└────────────────────────────────┘
         ↓ 4px gap
Texto de ayuda o error (12px)
```

### Input Básico

```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">
    Nombre Completo
  </label>
  <input 
    type="text"
    placeholder="Ingrese el nombre completo"
    class="
      w-full px-3 py-2.5 
      border border-gray-300 
      rounded-lg 
      text-gray-900 
      placeholder:text-gray-400
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed
    "
  />
  <p class="text-xs text-gray-500">
    Nombre y apellidos del paciente
  </p>
</div>
```

**Especificaciones**:
- Height: `40px` (py-2.5)
- Padding: `12px` horizontal
- Border: `1px solid #D1D5DB` (Gray 300)
- Border-radius: `8px`
- Font: Inter 16px Regular

---

### Estados de Input

#### Normal
```html
<input class="border border-gray-300 focus:ring-2 focus:ring-primary-500" />
```

#### Error
```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">Email</label>
  <input 
    type="email"
    class="
      w-full px-3 py-2.5 
      border-2 border-error-500 
      rounded-lg 
      focus:outline-none focus:ring-2 focus:ring-error-500
    "
  />
  <p class="text-xs text-error-600 flex items-center gap-1">
    <svg class="w-4 h-4"><!-- error icon --></svg>
    Email inválido
  </p>
</div>
```

#### Success
```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">Matrícula</label>
  <input 
    type="text"
    value="A01234567"
    class="
      w-full px-3 py-2.5 
      border-2 border-success-500 
      rounded-lg 
      focus:outline-none focus:ring-2 focus:ring-success-500
    "
  />
  <p class="text-xs text-success-600 flex items-center gap-1">
    <svg class="w-4 h-4"><!-- check icon --></svg>
    Matrícula válida
  </p>
</div>
```

#### Disabled
```html
<input 
  disabled
  class="
    w-full px-3 py-2.5 
    border border-gray-300 
    bg-gray-100 
    text-gray-500 
    cursor-not-allowed
    rounded-lg
  "
/>
```

---

### Input con Icono

```html
<!-- Icon Left -->
<div class="relative">
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg class="w-5 h-5 text-gray-400"><!-- search icon --></svg>
  </div>
  <input 
    type="text"
    placeholder="Buscar paciente..."
    class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg"
  />
</div>

<!-- Icon Right -->
<div class="relative">
  <input 
    type="password"
    class="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg"
  />
  <button class="absolute inset-y-0 right-0 pr-3 flex items-center">
    <svg class="w-5 h-5 text-gray-400"><!-- eye icon --></svg>
  </button>
</div>
```

---

### Select / Dropdown

```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">
    Departamento
  </label>
  <select class="
    w-full px-3 py-2.5 
    border border-gray-300 
    rounded-lg 
    text-gray-900 
    bg-white
    focus:outline-none focus:ring-2 focus:ring-primary-500
  ">
    <option value="">Seleccione un departamento</option>
    <option value="psicologia">Psicología</option>
    <option value="enfermeria">Enfermería</option>
    <option value="administracion">Administración</option>
  </select>
</div>
```

---

### Textarea

```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">
    Observaciones
  </label>
  <textarea 
    rows="4"
    placeholder="Escriba sus observaciones aquí..."
    class="
      w-full px-3 py-2.5 
      border border-gray-300 
      rounded-lg 
      text-gray-900 
      placeholder:text-gray-400
      focus:outline-none focus:ring-2 focus:ring-primary-500
      resize-none
    "
  ></textarea>
  <div class="flex justify-between text-xs text-gray-500">
    <span>Máximo 500 caracteres</span>
    <span>0 / 500</span>
  </div>
</div>
```

---

### Checkbox

```html
<div class="flex items-start gap-3">
  <input 
    type="checkbox" 
    id="terms"
    class="
      w-4 h-4 mt-1
      text-primary-600 
      border-gray-300 
      rounded 
      focus:ring-2 focus:ring-primary-500
    "
  />
  <label for="terms" class="text-sm text-gray-700">
    Acepto los términos y condiciones del tratamiento de datos personales
  </label>
</div>
```

---

### Radio Buttons

```html
<div class="space-y-3">
  <label class="block text-sm font-medium text-gray-700 mb-3">
    Tipo de Consulta
  </label>
  
  <div class="flex items-center gap-3">
    <input 
      type="radio" 
      id="primera" 
      name="tipo"
      class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500"
    />
    <label for="primera" class="text-sm text-gray-700">
      Primera vez
    </label>
  </div>
  
  <div class="flex items-center gap-3">
    <input 
      type="radio" 
      id="seguimiento" 
      name="tipo"
      class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500"
    />
    <label for="seguimiento" class="text-sm text-gray-700">
      Seguimiento
    </label>
  </div>
</div>
```

---

## 🏷️ Badges

### Badge Básico

```html
<span class="
  inline-flex items-center 
  px-3 py-1 
  rounded-full 
  text-xs font-medium 
  bg-primary-100 text-primary-700
">
  Nuevo
</span>
```

### Variantes de Color

```html
<!-- Success -->
<span class="px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
  Activo
</span>

<!-- Warning -->
<span class="px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
  Pendiente
</span>

<!-- Error -->
<span class="px-3 py-1 rounded-full text-xs font-medium bg-error-100 text-error-700">
  Cancelado
</span>

<!-- Info -->
<span class="px-3 py-1 rounded-full text-xs font-medium bg-info-100 text-info-700">
  En Proceso
</span>

<!-- Gray -->
<span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
  Archivado
</span>
```

### Badge con Icono

```html
<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
  <svg class="w-3 h-3"><!-- check icon --></svg>
  Completado
</span>
```

### Badge con Dot

```html
<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
  <span class="w-2 h-2 rounded-full bg-primary-600"></span>
  En Línea
</span>
```

---

## 🔔 Alerts

### Alert Informativo

```html
<div class="flex items-start gap-3 p-4 bg-info-50 border border-info-200 rounded-lg">
  <svg class="w-5 h-5 text-info-600 mt-0.5"><!-- info icon --></svg>
  <div class="flex-1">
    <h5 class="text-sm font-semibold text-info-800 mb-1">
      Información Importante
    </h5>
    <p class="text-sm text-info-700">
      Este es un mensaje informativo para el usuario.
    </p>
  </div>
  <button class="text-info-600 hover:text-info-800">
    <svg class="w-5 h-5"><!-- close icon --></svg>
  </button>
</div>
```

### Variantes de Alert

```html
<!-- Success -->
<div class="flex items-start gap-3 p-4 bg-success-50 border border-success-200 rounded-lg">
  <svg class="w-5 h-5 text-success-600"><!-- check icon --></svg>
  <div class="flex-1">
    <h5 class="text-sm font-semibold text-success-800 mb-1">¡Éxito!</h5>
    <p class="text-sm text-success-700">Paciente guardado correctamente.</p>
  </div>
</div>

<!-- Warning -->
<div class="flex items-start gap-3 p-4 bg-warning-50 border border-warning-200 rounded-lg">
  <svg class="w-5 h-5 text-warning-600"><!-- warning icon --></svg>
  <div class="flex-1">
    <h5 class="text-sm font-semibold text-warning-800 mb-1">Advertencia</h5>
    <p class="text-sm text-warning-700">Verifique los datos antes de continuar.</p>
  </div>
</div>

<!-- Error -->
<div class="flex items-start gap-3 p-4 bg-error-50 border border-error-200 rounded-lg">
  <svg class="w-5 h-5 text-error-600"><!-- error icon --></svg>
  <div class="flex-1">
    <h5 class="text-sm font-semibold text-error-800 mb-1">Error</h5>
    <p class="text-sm text-error-700">No se pudo guardar el registro.</p>
  </div>
</div>
```

---

## 🍞 Toast Notifications

```html
<div class="
  fixed bottom-4 right-4 
  flex items-center gap-3 
  p-4 
  bg-white 
  border border-gray-200 
  rounded-lg 
  shadow-lg 
  min-w-[320px]
  animate-slide-in-right
">
  <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-success-100">
    <svg class="w-5 h-5 text-success-600"><!-- check icon --></svg>
  </div>
  <div class="flex-1">
    <p class="text-sm font-medium text-gray-900">
      Cambios guardados
    </p>
    <p class="text-xs text-gray-500">
      La información se actualizó correctamente
    </p>
  </div>
  <button class="text-gray-400 hover:text-gray-600">
    <svg class="w-5 h-5"><!-- close icon --></svg>
  </button>
</div>
```

---

## 📊 Tablas

### Tabla Básica

```html
<div class="overflow-x-auto rounded-lg border border-gray-200">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Paciente
        </th>
        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Matrícula
        </th>
        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-roboto">
          Edad
        </th>
        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span class="text-sm font-medium text-primary-700">JP</span>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">Juan Pérez</div>
              <div class="text-xs text-gray-500">juan.perez@mail.com</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <code class="text-sm font-mono text-gray-900">A01234567</code>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-sm font-roboto text-gray-900">23</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right">
          <div class="flex justify-end gap-2">
            <button class="p-2 text-gray-600 hover:text-primary-600">
              <svg class="w-5 h-5"><!-- edit icon --></svg>
            </button>
            <button class="p-2 text-gray-600 hover:text-error-600">
              <svg class="w-5 h-5"><!-- trash icon --></svg>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 📚 Referencias

- [TailwindCSS Components](https://tailwindcss.com/docs/components)
- [Headless UI](https://headlessui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Material Design Components](https://m3.material.io/components)

---

**Última actualización**: 2026-02-14  
**Versión**: 1.0.0  
**Autor**: Equipo de Diseño EHR System
