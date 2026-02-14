# 🏥 EHR System - Frontend (ut-care)

Sistema de Registro de Salud Electrónico - Aplicación Frontend

## 📋 Descripción

Aplicación web frontend desarrollada con React, TypeScript y Vite para el Sistema de Registro de Salud Electrónico. Implementa una interfaz moderna y profesional siguiendo el sistema de diseño documentado.

## 🚀 Características Implementadas

### ✅ Pantalla de Login (v1.0)
- Diseño profesional con gradiente de fondo púrpura
- Card centrada con formulario de autenticación
- Campos de correo electrónico y contraseña con iconos
- Validación de formularios con react-hook-form y Zod
- Manejo de errores y estados de carga
- Integración completa con API backend
- Notificaciones toast para feedback del usuario
- Opción "Recordarme" y "¿Olvidaste tu contraseña?"

## 🛠️ Stack Tecnológico

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS con sistema de diseño personalizado
- **Routing:** React Router DOM
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Icons:** Heroicons

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu API
```

## 🔧 Configuración

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:5173
```

## 🏗️ Producción

```bash
# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes de UI (Atomic Design)
│   ├── atoms/           # Componentes básicos (Button, Input)
│   ├── molecules/       # Combinaciones simples (FormField)
│   ├── organisms/       # Componentes complejos
│   ├── templates/       # Layouts (AuthLayout)
│   └── pages/           # Páginas completas (LoginPage, DashboardPage)
├── hooks/               # Custom React hooks
├── services/            # Servicios de API
│   ├── api.ts          # Cliente Axios configurado
│   └── authService.ts  # Servicio de autenticación
├── store/               # Estado global (Zustand)
│   └── authStore.ts    # Store de autenticación
├── types/               # Definiciones TypeScript
│   └── auth.ts         # Tipos de autenticación
├── utils/               # Utilidades
│   └── cn.ts           # Función para combinar clases
├── App.tsx              # Componente principal con rutas
└── main.tsx            # Punto de entrada
```

## 🎨 Sistema de Diseño

El proyecto implementa el sistema de diseño documentado en `/documents/design/mockups/README.md`:

### Colores Principales
- **Primary (Healthcare Blue):** `#3B82F6`
- **Success (Medical Green):** `#10B981`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`

### Tipografía
- **Font Family:** Inter
- **Base Size:** 16px

### Componentes
- Buttons con variantes (primary, secondary, success, danger, ghost)
- Inputs con estados de focus y error
- FormFields con labels y mensajes de validación
- Layouts responsivos

## 🔐 Autenticación

### Flujo de Login
1. Usuario ingresa credenciales
2. Validación del lado del cliente (Zod)
3. Petición a `/api/auth/login`
4. Almacenamiento de tokens en localStorage
5. Redirección al dashboard

### Tokens
- **Access Token:** JWT de corta duración
- **Refresh Token:** JWT de larga duración
- Almacenados en localStorage
- Interceptor Axios agrega token automáticamente

## 🛣️ Rutas

- `/` - Redirige a `/login`
- `/login` - Pantalla de inicio de sesión
- `/dashboard` - Dashboard principal (ruta protegida)

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm run test
```

## 📝 Validaciones

### Correo Electrónico
- Campo requerido
- Formato de email válido

### Contraseña
- Campo requerido
- Mínimo 8 caracteres

## 🔄 Estado de la Aplicación

La aplicación mantiene el estado de autenticación usando Zustand:
- `user`: Información del usuario autenticado
- `isAuthenticated`: Estado de autenticación
- `isLoading`: Estado de carga
- `error`: Mensajes de error

## 🚧 Próximas Características

- [ ] Registro de usuarios
- [ ] Recuperación de contraseña
- [ ] Dashboard con métricas
- [ ] Gestión de pacientes
- [ ] Calendario de citas
- [ ] Expedientes médicos
- [ ] Reportes y analytics

## 📚 Documentación de Referencia

- [Documentación de Diseño](/documents/design/README.md)
- [Mockups](/documents/design/mockups/README.md)
- [Guía de Implementación](/documents/design/IMPLEMENTATION_GUIDE.md)

## 🤝 Contribuir

1. Seguir la estructura de carpetas (Atomic Design)
2. Usar TypeScript para todos los componentes
3. Implementar validación de formularios
4. Seguir el sistema de diseño establecido
5. Agregar pruebas cuando sea posible

## 📄 Licencia

Este proyecto es parte del Sistema EHR y sigue las mismas políticas de licencia del repositorio principal.

---

**Última actualización:** 2026-02-14  
**Versión:** 1.0.0 - Login Screen Implementation
