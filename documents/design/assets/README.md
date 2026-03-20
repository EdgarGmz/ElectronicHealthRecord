# 🖼️ Assets de Diseño - Sistema EHR

## 📋 Descripción

Esta carpeta contiene todos los recursos visuales del sistema: iconos personalizados, ilustraciones, imágenes, y otros assets de diseño.

## 📁 Estructura

```
assets/
├── icons/              # Iconos personalizados del sistema
├── illustrations/      # Ilustraciones para estados vacíos, errores, etc.
├── images/            # Imágenes y fotografías
├── logos/             # Variantes del logo
└── README.md          # Este archivo
```

---

## 🎨 Logos

### Variantes Disponibles

1. **Logo Completo**
   - `logo-full-color.svg` - Color completo sobre fondo claro
   - `logo-white.svg` - Blanco sobre fondo oscuro
   - `logo-monochrome.svg` - Monocromático

2. **Logo Horizontal**
   - `logo-horizontal.svg` - Para headers
   - `logo-horizontal-white.svg` - Versión blanca

3. **Logo Icono**
   - `logo-icon.svg` - Solo símbolo (64x64px)
   - `logo-icon-small.svg` - Versión pequeña (32x32px)

### Especificaciones

```
Formato preferido: SVG (vectorial)
Formatos alternativos: PNG (transparente, @1x, @2x, @3x)
Color principal: #1E40AF (Primary Blue)
Color secundario: #10B981 (Medical Green)
```

### Zona de Protección

```
┌─────────────────┐
│                 │
│   ┌─────────┐   │ ← Área de protección
│   │  LOGO   │   │   (altura del logo)
│   └─────────┘   │
│                 │
└─────────────────┘
```

---

## 🎭 Iconos Personalizados

### Sistema de Iconos Médicos

Además de Heroicons, se pueden crear iconos personalizados específicos:

```
icons/medical/
├── stethoscope.svg
├── medical-record.svg
├── psychology.svg
├── nursing.svg
├── prescription.svg
├── evaluation.svg
└── appointment.svg
```

### Especificaciones

- **Formato**: SVG optimizado
- **Tamaño**: 24x24px (escala 1x)
- **Stroke**: 2px
- **Color**: Monocromático (se aplica via CSS)
- **Estilo**: Outline, consistente con Heroicons

### Nomenclatura

```
[categoría]-[nombre]-[variante].svg

Ejemplos:
- medical-heart-filled.svg
- medical-heart-outline.svg
- department-psychology.svg
- department-nursing.svg
```

---

## 🎨 Ilustraciones

### Estados del Sistema

1. **Empty States** (Estados Vacíos)
   - `empty-patients.svg` - Sin pacientes
   - `empty-appointments.svg` - Sin citas
   - `empty-search.svg` - Sin resultados de búsqueda
   - `empty-notifications.svg` - Sin notificaciones

2. **Error States** (Estados de Error)
   - `error-404.svg` - Página no encontrada
   - `error-500.svg` - Error del servidor
   - `error-network.svg` - Error de conexión
   - `error-access.svg` - Acceso denegado

3. **Success States** (Estados Exitosos)
   - `success-saved.svg` - Guardado exitoso
   - `success-appointment.svg` - Cita agendada
   - `success-completed.svg` - Proceso completado

4. **Onboarding**
   - `welcome.svg` - Bienvenida
   - `tutorial-1.svg` - Paso 1 del tutorial
   - `tutorial-2.svg` - Paso 2 del tutorial

### Especificaciones de Ilustraciones

```css
Estilo: Minimalista, médico-profesional
Colores: Paleta del sistema (Primary, Success, neutrales)
Tamaño: 400x300px (escala 1x)
Formato: SVG optimizado
Complejidad: Media (no muy detalladas)
```

### Directrices de Diseño

**DO's ✅**
- Usar la paleta de colores del sistema
- Mantener estilo consistente
- Usar formas simples y claras
- Optimizar para performance

**DON'Ts ❌**
- No usar gradientes complejos
- No incluir texto en las ilustraciones
- No usar más de 3-4 colores
- No exceder 50KB por archivo

---

## 📸 Imágenes

### Tipos de Imágenes

1. **Avatares por Defecto**
   - `avatar-default-male.svg`
   - `avatar-default-female.svg`
   - `avatar-default-neutral.svg`

2. **Placeholders**
   - `placeholder-image.svg` - Imagen genérica
   - `placeholder-document.svg` - Documento
   - `placeholder-chart.svg` - Gráfica

3. **Backgrounds**
   - `bg-pattern-subtle.svg` - Patrón sutil para fondos
   - `bg-gradient.svg` - Gradiente para login/landing

### Optimización

```
Formato para fotos: WebP (fallback a JPG)
Formato para gráficos: SVG o PNG optimizado
Compresión: TinyPNG, ImageOptim
Responsive: Múltiples tamaños (@1x, @2x, @3x)
Lazy Loading: Implementar para imágenes pesadas
```

---

## 🎨 Paleta de Exportación

### Para Figma/Adobe XD

```json
{
  "colors": {
    "primary": {
      "50": "#EFF6FF",
      "500": "#3B82F6",
      "900": "#1E3A8A"
    },
    "success": {
      "50": "#ECFDF5",
      "500": "#10B981",
      "900": "#064E3B"
    },
    "gray": {
      "50": "#F9FAFB",
      "500": "#6B7280",
      "900": "#111827"
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "Inter",
      "secondary": "Roboto",
      "mono": "Fira Code"
    }
  }
}
```

### Para Diseñadores

**Tokens de Diseño:**
- Descargar: `design-tokens.json`
- Plugin Figma: Figma Tokens
- Sincronización: GitHub (este repositorio)

---

## 📦 Gestión de Assets

### Organización

```
assets/
├── src/              # Archivos fuente (Figma, Sketch, AI)
│   ├── logos/
│   ├── icons/
│   └── illustrations/
│
└── dist/             # Archivos optimizados para producción
    ├── logos/
    ├── icons/
    └── illustrations/
```

### Pipeline de Optimización

1. **Crear** en Figma/Illustrator
2. **Exportar** como SVG
3. **Optimizar** con SVGO
4. **Validar** tamaño y estructura
5. **Commit** a repositorio
6. **Deploy** automático con CI/CD

### Herramientas Recomendadas

- **SVGO**: Optimización de SVG
- **ImageOptim**: Compresión de imágenes
- **TinyPNG**: Compresión PNG/JPG
- **Squoosh**: Conversión a WebP

---

## 🔗 Assets Externos

### Iconografía Principal

**Heroicons v2**
- URL: https://heroicons.com/
- Licencia: MIT
- Versión: 2.x
- Instalación: `npm install @heroicons/react`

```jsx
// Uso en React
import { UserIcon } from '@heroicons/react/24/outline';
import { UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
```

### Ilustraciones

**undraw.co** (Opcional)
- URL: https://undraw.co/
- Licencia: Open source
- Personalización: Color primario del sistema

### Íconos Adicionales

**React Icons**
- URL: https://react-icons.github.io/react-icons/
- Licencia: Múltiples (ver documentación)
- Instalación: `npm install react-icons`

---

## 📝 Nomenclatura de Archivos

### Convención de Nombres

```
[tipo]-[nombre]-[variante]-[tamaño].[formato]

Ejemplos:
logo-full-color.svg
logo-icon-white-32.png
icon-medical-stethoscope-outline.svg
illustration-empty-patients.svg
image-placeholder-avatar.png
```

### Reglas

- Todo en minúsculas
- Separar con guiones (-)
- Sin espacios ni caracteres especiales
- Descriptivo pero conciso
- Incluir variante si aplica (outline, filled, white)

---

## ♿ Accesibilidad en Assets

### SVG Accesibles

```svg
<svg 
  role="img" 
  aria-labelledby="icon-title"
  xmlns="http://www.w3.org/2000/svg"
>
  <title id="icon-title">Descripción del icono</title>
  <!-- contenido del SVG -->
</svg>
```

### Imágenes Decorativas

```jsx
<img src="..." alt="" role="presentation" />
```

### Imágenes Informativas

```jsx
<img 
  src="..." 
  alt="Descripción clara y concisa de la imagen"
/>
```

---

## 📊 Métricas de Performance

### Objetivos

- **SVG**: < 5KB por archivo
- **PNG**: < 50KB por archivo (@1x)
- **JPG**: < 100KB por archivo
- **WebP**: 30% más ligero que JPG

### Auditoría

```bash
# Verificar tamaños
find ./assets -type f -exec ls -lh {} \; | awk '{print $5, $9}'

# Optimizar SVG
svgo -f ./assets/icons -o ./assets/icons-optimized
```

---

## ✅ Checklist de Assets

### Logos
- [ ] Logo completo color
- [ ] Logo completo blanco
- [ ] Logo horizontal
- [ ] Logo icono (64x64)
- [ ] Logo icono pequeño (32x32)
- [ ] Favicon (múltiples tamaños)

### Iconos Médicos
- [ ] Estetoscopio
- [ ] Expediente médico
- [ ] Psicología
- [ ] Enfermería
- [ ] Prescripción
- [ ] Evaluación
- [ ] Cita

### Ilustraciones
- [ ] Estados vacíos (4 tipos)
- [ ] Estados de error (4 tipos)
- [ ] Estados de éxito (3 tipos)
- [ ] Onboarding (3 pasos)

### Optimización
- [ ] Todos los SVG optimizados con SVGO
- [ ] PNG comprimidos con TinyPNG
- [ ] WebP generados para imágenes
- [ ] Múltiples resoluciones (@1x, @2x, @3x)

**Progreso**: 0% - Por implementar

---

## 📚 Referencias

- [SVGO](https://github.com/svg/svgo) - Optimizador SVG
- [TinyPNG](https://tinypng.com/) - Compresor de imágenes
- [Squoosh](https://squoosh.app/) - Conversor a WebP
- [undraw](https://undraw.co/) - Ilustraciones open source
- [Heroicons](https://heroicons.com/) - Sistema de iconos

---

**Última actualización**: 2026-02-13
**Versión**: 1.0.0
