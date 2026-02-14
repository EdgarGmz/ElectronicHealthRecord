# 🎨 Sistema de Diseño Básico - EHR System

Sistema de componentes reutilizables basado en Atomic Design para el Electronic Health Record System.

## 📋 Descripción

Este directorio contiene la implementación del sistema de diseño básico con componentes reutilizables construidos con React, TypeScript y TailwindCSS.

## 🏗️ Estructura

```
frontend/
├── src/
│   ├── components/
│   │   ├── atoms/              # Componentes básicos
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Badge/
│   │   │   └── Avatar/
│   │   ├── molecules/          # Combinaciones simples
│   │   │   ├── FormField/
│   │   │   ├── Card/
│   │   │   └── SearchBar/
│   │   ├── organisms/          # Componentes complejos
│   │   │   └── Sidebar/
│   │   └── templates/          # Layouts
│   │       └── DashboardLayout/
│   ├── utils/
│   │   └── cn.ts              # Utilidad para merge de clases
│   └── types/                  # TypeScript types
```

## 🎨 Componentes Implementados

### Atoms (Átomos)

- **Button**: Botón con 5 variantes (primary, secondary, success, danger, ghost) y 4 tamaños
- **Input**: Campo de entrada con manejo de errores
- **Badge**: Etiquetas para estados y categorías
- **Avatar**: Avatar con fallback a iniciales

### Molecules (Moléculas)

- **FormField**: Campo de formulario completo con label, validación y ayuda
- **Card**: Tarjeta contenedora con header, title y content

### Organisms (Organismos)

- **Sidebar**: Barra lateral de navegación con menú y sección de usuario

### Templates (Plantillas)

- **DashboardLayout**: Layout completo con sidebar y topbar

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 📚 Tecnologías

- React 18+ con TypeScript
- Vite como build tool
- TailwindCSS para estilos
- class-variance-authority para variantes de componentes

Ver documentación completa en `/documents/design/`

---

**Versión**: 1.0.0
