# 🎨 Documentación de Diseño UI/UX - Sistema EHR

## 📋 Descripción General

Esta carpeta contiene toda la documentación de diseño del Sistema de Registro de Salud Electrónico (EHR), incluyendo wireframes, mockups de alta fidelidad, guías de estilo y especificaciones de prototipos.

## 📁 Estructura de Carpetas

```
design/
├── wireframes/          # Wireframes de baja fidelidad
├── mockups/            # Mockups de alta fidelidad
├── style-guide/        # Guía de estilos y sistema de diseño
├── prototypes/         # Documentación de prototipos interactivos
├── assets/             # Recursos de diseño (iconos, imágenes)
└── README.md          # Este archivo
```

## 🎯 Objetivos del Diseño

1. **Usabilidad**: Crear interfaces intuitivas para personal médico y administrativo
2. **Accesibilidad**: Cumplir con estándares WCAG 2.1 AA
3. **Consistencia**: Mantener coherencia visual en todo el sistema
4. **Eficiencia**: Optimizar flujos de trabajo del personal de salud
5. **Profesionalismo**: Reflejar confiabilidad en entorno médico

## 🎨 Principios de Diseño

### 1. Claridad sobre Decoración
- Priorizar información médica crítica
- Eliminar elementos visuales innecesarios
- Usar espacios en blanco estratégicamente

### 2. Jerarquía Visual Clara
- Información crítica debe ser inmediatamente visible
- Usar tamaño, color y posición para guiar la atención
- Mantener consistencia en la jerarquía

### 3. Feedback Inmediato
- Confirmación visual de acciones completadas
- Indicadores de carga durante operaciones
- Mensajes de error claros y accionables

### 4. Prevención de Errores
- Validación en tiempo real
- Confirmaciones para acciones críticas
- Diseño que previene errores de usuario

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18+ con TypeScript
- **Styling**: TailwindCSS (utility-first)
- **Componentes UI**: shadcn/ui, Material-UI, Ant Design
- **Iconos**: React Icons
- **Arquitectura**: Atomic Design Pattern

### Herramientas de Diseño
- **Wireframes**: Figma, draw.io
- **Mockups**: Figma, Adobe XD
- **Prototipos**: Figma (interactivos)
- **Diagramas**: draw.io, Mermaid

## 📚 Documentación

- **[Wireframes](./wireframes/)** - Diseños de baja fidelidad
- **[Mockups](./mockups/)** - Diseños de alta fidelidad
- **[Guía de Estilos](./style-guide/)** - Sistema de diseño completo
- **[Prototipos](./prototypes/)** - Flujos interactivos

## 👥 Usuarios del Sistema

### Roles Principales
1. **Administrador**: Gestión completa del sistema
2. **Psicólogo**: Registro de sesiones terapéuticas y evaluaciones
3. **Enfermero**: Gestión de procedimientos y medicamentos
4. **Recepcionista**: Gestión de citas y pacientes

## 🎨 Paleta de Colores Base

### Colores Primarios
- **Primary**: `#1E40AF` (Azul médico profesional)
- **Secondary**: `#10B981` (Verde salud)
- **Accent**: `#3B82F6` (Azul interactivo)

### Colores de Estado
- **Success**: `#10B981` (Verde)
- **Warning**: `#F59E0B` (Naranja)
- **Error**: `#EF4444` (Rojo)
- **Info**: `#3B82F6` (Azul)

### Colores Neutrales
- **Background**: `#F9FAFB` (Gris muy claro)
- **Surface**: `#FFFFFF` (Blanco)
- **Text Primary**: `#111827` (Negro suave)
- **Text Secondary**: `#6B7280` (Gris)

## 📐 Sistema de Espaciado

Basado en escala de 8px (TailwindCSS):
- **xs**: 4px (0.5)
- **sm**: 8px (1)
- **md**: 16px (2)
- **lg**: 24px (3)
- **xl**: 32px (4)
- **2xl**: 48px (6)
- **3xl**: 64px (8)

## 🔤 Tipografía

### Fuentes
- **Primary**: Inter (sans-serif) - Legibilidad en pantallas médicas
- **Secondary**: Roboto - Alternativa para datos numéricos
- **Monospace**: Fira Code - Código y datos técnicos

### Escala Tipográfica
- **Display**: 48px / 3rem (font-bold)
- **H1**: 36px / 2.25rem (font-bold)
- **H2**: 30px / 1.875rem (font-semibold)
- **H3**: 24px / 1.5rem (font-semibold)
- **H4**: 20px / 1.25rem (font-medium)
- **Body**: 16px / 1rem (font-normal)
- **Small**: 14px / 0.875rem (font-normal)
- **XSmall**: 12px / 0.75rem (font-normal)

## 🖼️ Componentes Base (Atomic Design)

### Atoms (Átomos)
- Botones
- Inputs
- Labels
- Iconos
- Badges
- Avatars

### Molecules (Moléculas)
- Form Fields
- Search Bars
- Cards
- Dropdowns
- Tooltips

### Organisms (Organismos)
- Navigation Bars
- Forms
- Tables
- Modals
- Sidebars

### Templates (Plantillas)
- Dashboard Layout
- Form Layout
- List Layout
- Detail Layout

### Pages (Páginas)
- Login
- Dashboard
- Patient List
- Appointment Calendar
- Medical Records

## ♿ Accesibilidad

### Estándares WCAG 2.1 AA
- **Contraste**: Mínimo 4.5:1 para texto normal
- **Tamaño de Click**: Mínimo 44x44px para elementos interactivos
- **Navegación por Teclado**: Todos los elementos interactivos accesibles
- **Screen Readers**: Etiquetas ARIA apropiadas
- **Focus States**: Indicadores visuales claros

### Consideraciones Especiales
- Fuentes legibles para personal médico
- Alto contraste para ambientes con iluminación variable
- Soporte para zoom hasta 200%
- Mensajes de error descriptivos

## 📱 Responsive Design

### Breakpoints (TailwindCSS)
- **xs**: 320px (móvil pequeño - mínimo soportado)
- **sm**: 640px (móvil grande)
- **md**: 768px (tablet)
- **lg**: 1024px (laptop)
- **xl**: 1280px (desktop)
- **2xl**: 1536px (desktop grande)
- **3xl**: 1920px (monitors Full HD)

### Prioridad
1. **Desktop First**: Sistema principalmente usado en escritorio
2. **Tablet Support**: Para uso en consultorios
3. **Mobile Responsive**: Vistas de solo lectura en móvil

### Documentación Completa
- **[Guía de Diseño Responsive](./RESPONSIVE_DESIGN.md)** - Breakpoints, especificaciones técnicas y comportamiento de componentes
- **[Mockups Responsivos](./RESPONSIVE_MOCKUPS.md)** - Especificaciones visuales por breakpoint

## 🔗 Referencias

### Design Systems
- [Material Design 3](https://m3.material.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Ant Design](https://ant.design/)

### Healthcare UI/UX
- [Healthcare Design Patterns](https://www.healthdesignchallenge.com/)
- [Medical UI Best Practices](https://www.nngroup.com/articles/health-medical-design/)

### Accesibilidad
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project](https://www.a11yproject.com/)

## 📝 Notas de Implementación

### Dependencias del Proyecto
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.x",
  "tailwindcss": "^3.x",
  "@shadcn/ui": "latest",
  "@mui/material": "^5.x",
  "antd": "^5.x",
  "react-icons": "^4.x"
}
```

### Convenciones de Código
- Componentes en PascalCase
- Props en camelCase
- Clases CSS con TailwindCSS utilities
- Atomic Design para estructura de carpetas

## 🚀 Proceso de Diseño

1. **Investigación**: Análisis de requisitos y usuarios
2. **Wireframes**: Diseños de baja fidelidad
3. **Mockups**: Diseños de alta fidelidad
4. **Prototipo**: Interacciones y flujos
5. **Testing**: Validación con usuarios
6. **Implementación**: Desarrollo frontend
7. **Iteración**: Mejoras continuas

## ✅ Checklist de Diseño

- [ ] Wireframes completados y aprobados
- [ ] Mockups de alta fidelidad finalizados
- [ ] Guía de estilos documentada
- [ ] Sistema de componentes definido
- [ ] Prototipo interactivo creado
- [ ] Pruebas de usabilidad realizadas
- [ ] Documentación de accesibilidad completa
- [ ] Handoff a desarrollo preparado

## 👨‍💻 Contacto

Para preguntas sobre diseño:
- **Issue Tracker**: GitHub Issues
- **Email**: design@ehr-system.com
- **Figma**: [Proyecto EHR en Figma]

---

**Última actualización**: 2026-02-13
**Versión**: 1.0.0
