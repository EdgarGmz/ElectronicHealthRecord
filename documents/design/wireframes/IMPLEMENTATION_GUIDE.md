# 👨‍💻 Guía de Implementación - Diseño UI/UX

## 📋 Descripción

Guía práctica para desarrolladores frontend sobre cómo implementar el sistema de diseño del EHR System usando React, TypeScript, TailwindCSS y shadcn/ui.

## 🎯 Objetivo

Facilitar la transición del diseño a código con especificaciones claras, ejemplos prácticos y mejores prácticas.

---

## 🚀 Setup Inicial

### 1. Instalación de Dependencias

```bash
cd ut-care

# Dependencias principales
npm install react react-dom
npm install react-router-dom
npm install typescript @types/react @types/react-dom

# Styling
npm install tailwindcss postcss autoprefixer
npm install @tailwindcss/forms @tailwindcss/typography

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge

# Icons
npm install @heroicons/react
npm install react-icons

# Forms
npm install react-hook-form
npm install zod @hookform/resolvers

# State Management
npm install @reduxjs/toolkit react-redux
npm install zustand
npm install @tanstack/react-query

# Utilities
npm install date-fns
npm install axios
npm install react-hot-toast
```

### 2. Configuración de TailwindCSS

**tailwind.config.js:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### 3. Estructura de Carpetas (Atomic Design)

```
src/
├── components/
│   ├── atoms/              # Componentes básicos
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Avatar/
│   │   └── Icon/
│   │
│   ├── molecules/          # Combinaciones simples
│   │   ├── FormField/
│   │   ├── SearchBar/
│   │   ├── Card/
│   │   └── Dropdown/
│   │
│   ├── organisms/          # Componentes complejos
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── PatientCard/
│   │   └── AppointmentCalendar/
│   │
│   ├── templates/          # Layouts
│   │   ├── DashboardLayout/
│   │   ├── AuthLayout/
│   │   └── FormLayout/
│   │
│   └── pages/              # Páginas completas
│       ├── LoginPage/
│       ├── DashboardPage/
│       ├── PatientsPage/
│       └── AppointmentsPage/
│
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── usePatients.ts
│   └── useAppointments.ts
│
├── store/                  # Redux/Zustand stores
│   ├── authSlice.ts
│   ├── patientsSlice.ts
│   └── store.ts
│
├── services/               # API calls
│   ├── api.ts
│   ├── authService.ts
│   └── patientsService.ts
│
├── utils/                  # Utilidades
│   ├── cn.ts              # Class name merger
│   ├── formatters.ts
│   └── validators.ts
│
├── types/                  # TypeScript types
│   ├── patient.ts
│   ├── appointment.ts
│   └── user.ts
│
├── styles/                 # Estilos globales
│   └── globals.css
│
└── App.tsx
```

---

## 🎨 Implementación de Componentes

### Atom: Button

**src/components/atoms/Button/Button.tsx:**

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-500',
        success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500',
        danger: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Uso:**

```tsx
import { Button } from '@/components/atoms/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

// Botón primario
<Button>Guardar</Button>

// Botón con icono
<Button variant="primary" size="md">
  <PlusIcon className="h-5 w-5" />
  Nuevo Paciente
</Button>

// Botón de carga
<Button isLoading disabled>
  Guardando...
</Button>

// Botón secundario
<Button variant="secondary">
  Cancelar
</Button>
```

---

### Molecule: FormField

**src/components/molecules/FormField/FormField.tsx:**

```typescript
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
        
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors duration-200',
            error
              ? 'border-error-500 focus:ring-error-500'
              : 'border-gray-300',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-error-500">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
```

**Uso:**

```tsx
import { FormField } from '@/components/molecules/FormField';
import { useForm } from 'react-hook-form';

function PatientForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <form>
      <FormField
        label="Matrícula"
        required
        {...register('matricula', { required: 'La matrícula es requerida' })}
        error={errors.matricula?.message}
        helperText="Ingrese la matrícula del estudiante"
      />
    </form>
  );
}
```

---

### Organism: Sidebar

**src/components/organisms/Sidebar/Sidebar.tsx:**

```typescript
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

interface NavItem {
  name: string;
  href: string;
  icon: typeof HomeIcon;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Pacientes', href: '/patients', icon: UserGroupIcon },
  { name: 'Citas', href: '/appointments', icon: CalendarIcon },
  { name: 'Expedientes', href: '/records', icon: DocumentTextIcon },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
  { name: 'Configuración', href: '/settings', icon: CogIcon },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">EHR System</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
            <span className="text-sm font-semibold">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-400">Psicólogo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

---

### Template: DashboardLayout

**src/components/templates/DashboardLayout/DashboardLayout.tsx:**

```typescript
import { ReactNode } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';
import { Topbar } from '@/components/organisms/Topbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64">
        <Topbar />
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 🎭 Utilidades

### cn - Class Name Merger

**src/utils/cn.ts:**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 🎨 Temas y Variables CSS

**src/styles/globals.css:**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Colors */
    --color-primary: 59 130 246;
    --color-success: 16 185 129;
    --color-warning: 245 158 11;
    --color-error: 239 68 68;
    
    /* Transitions */
    --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  * {
    @apply border-gray-300;
  }

  body {
    @apply bg-gray-50 text-gray-900 font-sans antialiased;
  }

  /* Focus styles */
  *:focus-visible {
    @apply outline-none ring-2 ring-primary-500 ring-offset-2;
  }
}

@layer components {
  /* Custom scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    @apply w-2;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-400 rounded-full;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500;
  }
}
```

---

## 🧪 Testing

### Test de Componente

**src/components/atoms/Button/Button.test.tsx:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant styles', () => {
    const { container } = render(
      <Button variant="success">Success Button</Button>
    );
    expect(container.firstChild).toHaveClass('bg-success-500');
  });
});
```

---

## 📚 Mejores Prácticas

### 1. TypeScript

```typescript
// ✅ DO: Definir tipos explícitos
interface Patient {
  id: string;
  name: string;
  matricula: string;
  dateOfBirth: Date;
}

// ❌ DON'T: Usar 'any'
function processPatient(data: any) { }

// ✅ DO: Usar tipos específicos
function processPatient(data: Patient) { }
```

### 2. Componentes

```typescript
// ✅ DO: Componentes pequeños y enfocados
function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Card>
      <PatientAvatar patient={patient} />
      <PatientInfo patient={patient} />
      <PatientActions patient={patient} />
    </Card>
  );
}

// ❌ DON'T: Componentes monolíticos
function PatientEverything() {
  // 500 lines of code...
}
```

### 3. Styling

```typescript
// ✅ DO: Usar Tailwind utilities
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">

// ❌ DON'T: CSS inline
<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

// ✅ DO: Usar cn() para combinar clases
className={cn('base-class', isActive && 'active-class', className)}

// ❌ DON'T: Concatenación manual
className={'base-class' + (isActive ? ' active-class' : '')}
```

### 4. Performance

```typescript
// ✅ DO: Memoizar componentes pesados
import { memo } from 'react';

export const PatientList = memo(function PatientList({ patients }) {
  return patients.map(patient => <PatientCard key={patient.id} patient={patient} />);
});

// ✅ DO: Lazy loading de rutas
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
```

---

## ✅ Checklist de Implementación

### Setup
- [ ] Instalar dependencias
- [ ] Configurar TailwindCSS
- [ ] Configurar TypeScript
- [ ] Crear estructura de carpetas
- [ ] Configurar ESLint y Prettier

### Componentes Base (Atoms)
- [ ] Button
- [ ] Input
- [ ] Badge
- [ ] Avatar
- [ ] Icon

### Componentes Compuestos (Molecules)
- [ ] FormField
- [ ] SearchBar
- [ ] Card
- [ ] Dropdown

### Componentes Complejos (Organisms)
- [ ] Navbar
- [ ] Sidebar
- [ ] PatientCard
- [ ] AppointmentCalendar

### Templates
- [ ] DashboardLayout
- [ ] AuthLayout
- [ ] FormLayout

### Pages
- [ ] LoginPage
- [ ] DashboardPage
- [ ] PatientsPage
- [ ] AppointmentsPage

### Testing
- [ ] Setup de testing
- [ ] Tests de componentes atoms
- [ ] Tests de integración

---

## 📚 Referencias

- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Heroicons](https://heroicons.com/)
- [React Hook Form](https://react-hook-form.com/)

---

**Última actualización**: 2026-02-13
**Versión**: 1.0.0
