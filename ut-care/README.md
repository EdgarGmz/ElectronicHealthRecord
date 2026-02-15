# UT-Care Frontend 🏥

Sistema de Registro Electrónico de Salud - Frontend Application

## 🚀 Stack Tecnológico

Este proyecto utiliza las siguientes tecnologías principales:

- **React 19** - Biblioteca para interfaces de usuario
- **Vite 7** - Build tool ultrarrápido
- **TypeScript 5.9** - Tipado estático
- **TailwindCSS 3** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI accesibles y personalizables
- **React Router DOM 7** - Enrutamiento
- **Zustand 5** - Gestión de estado minimalista
- **ESLint 9** - Linter de código
- **Prettier 3** - Formateador de código
- **Husky** - Git hooks
- **lint-staged** - Linting en archivos staged

Para ver la lista completa del stack tecnológico disponible, consulta [README-stack.md](./README-stack.md).

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🔧 Instalación

```bash
# Instalar dependencias
npm install
```

## 🏃 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev
```

### Construcción

```bash
# Construir para producción
npm run build

# Vista previa del build de producción
npm run preview
```

### Calidad de Código

```bash
# Ejecutar linter (reporta errores)
npm run lint

# Ejecutar linter y auto-fix
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar formato sin modificar
npm run format:check
```

### Git Hooks

```bash
# Inicializar Husky (se ejecuta automáticamente en npm install)
npm run prepare
```

## 📁 Estructura del Proyecto

```
ut-care/
├── .husky/                 # Git hooks (en root del repo)
├── public/                 # Assets estáticos
├── src/
│   ├── assets/            # Assets del proyecto
│   ├── components/        # Componentes React
│   │   ├── atoms/        # Componentes atómicos
│   │   ├── molecules/    # Componentes moleculares
│   │   ├── organisms/    # Componentes organismos
│   │   └── ui/           # Componentes de shadcn/ui
│   ├── lib/              # Utilidades y helpers
│   ├── pages/            # Páginas/vistas de la aplicación
│   ├── services/         # Servicios y API calls
│   ├── store/            # Stores de Zustand
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── eslint.config.js      # Configuración ESLint
├── .prettierrc           # Configuración Prettier
├── tailwind.config.js    # Configuración TailwindCSS
├── tsconfig.json         # Configuración TypeScript
├── vite.config.ts        # Configuración Vite
└── package.json
```

## 🎨 Metodología de Diseño

Este proyecto sigue la metodología **Atomic Design**:

- **Atoms** (`components/atoms/`): Componentes básicos e indivisibles (botones, inputs, labels)
- **Molecules** (`components/molecules/`): Grupos de atoms que forman componentes más complejos
- **Organisms** (`components/organisms/`): Componentes complejos formados por molecules y atoms
- **Templates**: Estructuras de página sin datos específicos
- **Pages** (`pages/`): Instancias específicas de templates con datos reales

## 🔧 Configuración de Herramientas

### TailwindCSS

TailwindCSS está configurado con:
- Dark mode mediante clase `.dark`
- Variables CSS personalizadas para colores del tema
- Integración con shadcn/ui

### shadcn/ui

Los componentes de shadcn/ui se encuentran en `src/components/ui/` y utilizan:
- Path alias `@/` configurado para imports limpios
- Variables de diseño mediante TailwindCSS
- Componentes totalmente personalizables

Para agregar nuevos componentes de shadcn/ui:

```bash
# Ejemplo: agregar componente Card
npx shadcn@latest add card
```

### ESLint

ESLint está configurado con:
- Reglas recomendadas para React y TypeScript
- React Hooks rules
- React Refresh plugin para HMR
- Permite exportar constantes junto a componentes (ej: `buttonVariants`)

### Prettier

Prettier está configurado con:
- Plugin de TailwindCSS para ordenamiento automático de clases
- Single quotes: `false`
- Semi: `true`
- Print width: `100`
- Tab width: `2`

### Husky y lint-staged

Los Git hooks están configurados para ejecutarse automáticamente:

#### Pre-commit Hook

Antes de cada commit, se ejecuta automáticamente:
1. ESLint con auto-fix en archivos `.ts` y `.tsx` modificados
2. Prettier en todos los archivos modificados

Si hay errores de linting que no se pueden auto-corregir, el commit fallará.

**Para probar el flujo:**

```bash
# 1. Hacer cambios en un archivo
# 2. Hacer git add
git add src/pages/HomePage.tsx

# 3. Intentar commit (se ejecutará lint-staged automáticamente)
git commit -m "test: verificar pre-commit hook"

# Si hay errores, se mostrarán y el commit fallará
# Si todo está correcto, el commit se realizará exitosamente
```

## 🎯 Path Aliases

El proyecto tiene configurado el alias `@/` que apunta a `./src`:

```typescript
// En lugar de:
import { Button } from "../../../components/ui/button";

// Puedes usar:
import { Button } from "@/components/ui/button";
```

## 🔄 Gestión de Estado

### Zustand

Zustand se utiliza para la gestión de estado global. Ejemplo de store:

```typescript
// src/store/counterStore.ts
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Usar en componentes
import { useCounterStore } from "@/store/counterStore";

function MyComponent() {
  const { count, increment } = useCounterStore();
  return <button onClick={increment}>Count: {count}</button>;
}
```

## 🎨 Sistema de Colores

El proyecto utiliza un sistema de colores basado en variables CSS (HSL):

- `--background` / `--foreground`: Colores de fondo y texto principal
- `--primary` / `--primary-foreground`: Colores primarios
- `--secondary` / `--secondary-foreground`: Colores secundarios
- `--muted` / `--muted-foreground`: Colores silenciados
- `--accent` / `--accent-foreground`: Colores de acento
- `--destructive`: Color para acciones destructivas
- `--border` / `--input` / `--ring`: Colores de UI

Todos los colores tienen soporte para modo oscuro mediante la clase `.dark`.

## 📦 Agregar Nuevas Dependencias

```bash
# Dependencias de producción
npm install nombre-paquete

# Dependencias de desarrollo
npm install -D nombre-paquete
```

**Nota:** Después de agregar nuevas dependencias, asegúrate de que pasen los checks de lint y build.

## 🐛 Troubleshooting

### El servidor de desarrollo no inicia

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Errores de TypeScript en imports con @/

Asegúrate de que `tsconfig.app.json` tenga configurado:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Los estilos de TailwindCSS no se aplican

Verifica que `src/index.css` incluya:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Husky no ejecuta los hooks

Asegúrate de que:
1. Estés en el directorio raíz del repositorio Git
2. Los hooks tengan permisos de ejecución: `chmod +x .husky/pre-commit`
3. La carpeta `.husky` exista en el root del repositorio

## 🧪 Testing

_(Por implementar)_

El proyecto está preparado para agregar:
- Vitest para unit tests
- React Testing Library para component tests
- Cypress o Playwright para E2E tests

## 📝 Convenciones de Código

### Nomenclatura

- **Componentes**: PascalCase (`HomePage.tsx`, `UserProfile.tsx`)
- **Archivos**: camelCase (`counterStore.ts`, `utils.ts`)
- **Carpetas**: lowercase (`components/`, `pages/`)

### Importaciones

```typescript
// 1. React y librerías externas
import { useState } from "react";
import { Link } from "react-router-dom";

// 2. Componentes internos (usando alias @/)
import { Button } from "@/components/ui/button";

// 3. Stores y servicios
import { useCounterStore } from "@/store/counterStore";

// 4. Tipos e interfaces
import type { User } from "@/types";

// 5. Estilos
import "./HomePage.css";
```

### Componentes

```typescript
// Usar export default para páginas
export default function HomePage() {
  return <div>Home</div>;
}

// Usar named exports para componentes reutilizables
export function UserCard() {
  return <div>User Card</div>;
}
```

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🤝 Contribuir

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Haz commits siguiendo conventional commits: `git commit -m "feat: agregar nueva funcionalidad"`
3. Asegúrate de que pase lint y build: `npm run lint && npm run build`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado con ❤️ para UT-Care**
