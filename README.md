<div align="center">

# 🏥 Electronic Health Record System

### Sistema de Registro de Salud Electrónico Institucional
#### Nursing & Psychology Department

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![.NET MAUI](https://img.shields.io/badge/.NET%20MAUI-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/apps/maui)

</div>

---

## 📋 Descripción

Sistema integral de gestión de registros de salud electrónicos diseñado específicamente para departamentos de enfermería y psicología en entornos institucionales. Proporciona una plataforma completa para el manejo de expedientes médicos, citas, historiales clínicos y administración de pacientes, cumpliendo con estándares de seguridad HIPAA.

Incluye **AppEHR**, una aplicación móvil y de escritorio multiplataforma construida con **.NET MAUI** exclusivamente para psicólogos, donde pueden consultar sus citas programadas, revisar sus estadísticas personales y agendar citas rápidas — sin acceso para supervisores ni personal de enfermería.

### ✨ Características Principales

- 📊 **Gestión de Expedientes Médicos** - Creación, edición y consulta de historiales clínicos completos
- 👥 **Registro de Pacientes** - Sistema completo de información demográfica y médica
- 📅 **Sistema de Citas** - Programación y seguimiento de consultas
- 💊 **Control de Medicamentos** - Registro y seguimiento de prescripciones
- 🔐 **Seguridad Avanzada** - Autenticación JWT, encriptación de datos sensibles
- 📱 **Aplicación Desktop** - Multiplataforma con Electron (Windows, macOS, Linux)
- � **App Móvil para Psicólogos (AppEHR)** - App nativa con .NET MAUI (Android, iOS, Windows) exclusiva para psicólogos: citas, estadísticas personales y agendado rápido
- �📈 **Reportes y Estadísticas** - Generación de informes médicos en PDF
- 🌐 **Interfaz Intuitiva** - Diseño moderno con TailwindCSS y Atomic Design
- 🔄 **Tiempo Real** - Notificaciones y actualizaciones instantáneas
- 🌍 **Multiidioma** - Soporte de internacionalización

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│      Electron Desktop App        │  │  AppEHR (.NET MAUI)              │
│  ┌────────────────────────────┐  │  │  Solo psicólogos                 │
│  │   React Frontend (Client)  │  │  │  • Citas programadas             │
│  │  • React Router            │  │  │  • Estadísticas personales       │
│  │  • TailwindCSS             │  │  │  • Agendado rápido               │
│  │  • Redux Toolkit           │  │  │  Android • iOS • Windows         │
│  │  • Atomic Design           │  │  └──────────────┬───────────────────┘
│  └──────────────┬─────────────┘  │                 │
└─────────────────┼────────────────┘                 │
                  │ HTTP/REST API                     │ HTTP/REST API
                  │ WebSocket (Socket.io)             │ JWT
                  └──────────────────┬───────────────┘
                                     │
┌────────────────────────────────────▼──────────────────────────────────┐
│                      Express.js Backend (API)                         │
│          • TypeScript • Prisma • JWT • Repository Pattern             │
│          • Redis Cache • Socket.io • Winston                          │
└────────────────────────────────────┬──────────────────────────────────┘
                                     │
┌────────────────────────────────────▼──────────────────────────────────┐
│                         PostgreSQL Database                           │
│        • Expedientes • Pacientes • Citas • Medicamentos               │
│        • Usuarios • Audit Logs                                        │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### **Frontend Web / Desktop**

| Categoría | Tecnologías |
|-----------|-------------|
| **Core** | TypeScript, React 18+, React Router, Axios |
| **UI/Styling** | TailwindCSS, shadcn/ui, Material-UI, React Icons |
| **Estado** | Redux Toolkit, Zustand, React Query |
| **Formularios** | React Hook Form, Zod, Yup |
| **Testing** | Vitest, React Testing Library, Cypress, Playwright |
| **Desktop** | Electron |
| **Build Tools** | Vite, ESLint, Prettier |
| **Arquitectura** | Atomic Design, Observer Pattern |
| **i18n** | react-i18next |
| **Documentación** | Storybook |

### **App Móvil — AppEHR (solo psicólogos)**

| Categoría | Tecnologías |
|-----------|-------------|
| **Framework** | .NET MAUI (net10.0) |
| **Plataformas** | Android, iOS, Windows (WinUI 3) |
| **Lenguaje** | C# + XAML |
| **UI** | MAUI Controls, Shell Navigation |
| **Autenticación** | JWT (mismo backend) |
| **Acceso** | Exclusivo para rol `Psicólogo` |

### **Backend**

| Categoría | Tecnologías |
|-----------|-------------|
| **Core** | TypeScript, Node.js, Express.js |
| **Base de Datos** | MySQL, TypeORM, TypeORM Migrations |
| **Seguridad** | JWT, Bcrypt, Helmet, CORS, OAuth2 |
| **Validación** | class-validator, class-transformer, Joi, Zod |
| **Cache** | Redis, ioredis |
| **Testing** | Jest, Supertest, ts-jest |
| **Logging** | Winston, Morgan, winston-daily-rotate-file |
| **Archivos** | Multer, Sharp, PDFKit, Puppeteer |
| **Email** | Nodemailer |
| **Documentación** | Swagger/OpenAPI, TypeDoc |
| **Utilidades** | date-fns, uuid, validator.js |
| **Tiempo Real** | Socket.io |
| **Tareas** | node-cron, node-schedule |
| **Arquitectura** | Repository Pattern, Dependency Injection |

---

## 📁 Estructura del Proyecto

```
ElectronicHealthRecord/
├── .github/workflows/            # CI/CD (GitHub Actions)
│   └── ci.yml                    # Jobs: api, kiosko, ut-care, e2e
├── AppEHR/                       # App móvil/escritorio — solo psicólogos (.NET MAUI)
│   ├── AppShell.xaml             # Navegación principal (Shell)
│   ├── MainPage.xaml             # Página inicial
│   ├── MauiProgram.cs            # Entry point y DI
│   ├── Platforms/                # Código específico por plataforma
│   │   ├── Android/
│   │   ├── iOS/
│   │   ├── MacCatalyst/
│   │   └── Windows/
│   ├── Resources/                # Íconos, fuentes, imágenes, splash
│   └── AppEHR.csproj
├── e2e/                          # Pruebas E2E (Playwright, ut-care + API)
│   ├── tests/
│   ├── playwright.config.ts
│   └── package.json
├── api/                          # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/          # Controladores de rutas
│   │   ├── services/             # Lógica de negocio
│   │   ├── repositories/         # Capa de datos
│   │   ├── entities/             # Modelos TypeORM
│   │   ├── middlewares/          # Middlewares Express
│   │   ├── routes/               # Definición de rutas
│   │   ├── utils/                # Utilidades
│   │   ├── config/               # Configuraciones
│   │   └── index.ts              # Entry point
│   ├── tests/                    # Tests unitarios e integración
│   ├── migrations/               # Migraciones de BD
│   ├── .env.example              # Variables de entorno ejemplo
│   ├── package.json
│   └── tsconfig.json
│
├── Kiosko/                       # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/           # Componentes Atomic Design
│   │   │   ├── atoms/            # Componentes básicos
│   │   │   ├── molecules/        # Combinaciones simples
│   │   │   ├── organisms/        # Componentes complejos
│   │   │   ├── templates/        # Layouts
│   │   │   └── pages/            # Páginas completas
│   │   ├── hooks/                # Custom React Hooks
│   │   ├── store/                # Redux store
│   │   ├── services/             # API calls
│   │   ├── utils/                # Utilidades
│   │   ├── types/                # TypeScript types
│   │   ├── styles/               # Estilos globales
│   │   ├── assets/               # Imágenes, iconos
│   │   ├── i18n/                 # Traducciones
│   │   ├── App.tsx               # Componente principal
│   │   └── main.tsx              # Entry point
│   ├── public/                   # Assets públicos
│   ├── tests/                    # Tests
│   ├── .env.example              # Variables de entorno ejemplo
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── documents/                    # Documentación del proyecto
│   ├── architecture/             # Diagramas de arquitectura
│   ├── database/                 # Esquemas de BD
│   ├── api/                      # Documentación API
│   └── user-guides/              # Guías de usuario
│
├── .vscode/                      # Configuración VS Code
│   ├── settings.json
│   └── extensions.json
│
├── .gitignore
├── README.md                     # Este archivo
├── GITHUB_PROJECTS_GUIDE.md      # Guía de GitHub Projects
├── ISSUE_TEMPLATES.md            # Templates de issues
├── PROJECT_STRUCTURE.md          # Estructura detallada
└── QUICK_REFERENCE.md            # Referencia rápida
```

---

## 🚀 Inicio Rápido

### **Prerrequisitos**

Asegúrate de tener instalado:

- **Node.js** v18+ o v20+ ([Descargar](https://nodejs.org/))
- **npm** v9+ o **Yarn** v1.22+
- **Docker & Docker Compose** ([Descargar](https://www.docker.com/products/docker-desktop))
- **Git** v2.40+ ([Descargar](https://git-scm.com/))

### **Instalación**

#### **1. Clonar el repositorio**

```bash
git clone https://github.com/EdgarGmz/ElectronicHealthRecord.git
cd ElectronicHealthRecord
```

#### **2. Levantar la Base de Datos (Docker)**

Este proyecto utiliza Docker para facilitar el levantamiento de la base de datos PostgreSQL.

```bash
# Levantar el contenedor de PostgreSQL
docker compose up -d

# Verificar que el contenedor esté corriendo
docker ps
```

#### **3. Configurar el Backend (API)**

```bash
cd api
cp .env.example .env
npm install
```

Asegúrate de que la `DATABASE_URL` en `api/.env` apunte a `localhost:5432`:
`DATABASE_URL="postgresql://admin:admin1234@localhost:5432/ehr_db?schema=public"`

#### **4. Migraciones y Seed**

```bash
# Ejecutar migraciones de Prisma
npm run prisma:migrate

# (Opcional) Poblar la base de datos con datos de prueba
npx prisma db seed
```

#### **5. Iniciar Desarrollo**

```bash
# Backend (desde la carpeta api)
npm run dev

# O también puedes usar (levanta DB y luego API):
npm run dev:all
```

#### **3. Configurar Backend**

```bash
cd api

# Configuración automática (instala, levanta DB, migra y puebla)
npm run setup

# O manualmente:
npm install
npm run db:up
npm run prisma:migrate
npm run prisma:seed
```

#### **4. Configurar Frontend**

```bash
cd ../Kiosko
cd ../ut-care

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con la URL del backend
# VITE_API_URL=http://localhost:5000/api
```

#### **5. Ejecutar en Desarrollo**

Abre **dos terminales** diferentes:

**Terminal 1 - Backend:**
```bash
cd api
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Kiosko
cd ut-care
npm run dev
```

El backend estará disponible en `http://localhost:5000`  
El frontend estará disponible en `http://localhost:5173`

---

## 👤 Usuarios de prueba

Tras ejecutar el seed (`npx prisma db seed`), puedes iniciar sesión en el frontend con cualquiera de estos usuarios. **La contraseña de todos es:** `Password123!`

| Rol | Correo | Descripción |
|-----|--------|-------------|
| **Administrador** | `admin@ehr-system.com` | Acceso completo al sistema |
| **Coordinador Psicología** | `coord.psicologia@ehr-system.com` | Gestión de psicología y carreras |
| **Coordinador Enfermería** | `coord.enfermeria@ehr-system.com` | Gestión de enfermería y medicamentos |
| **Psicólogo** | `psicologo1@ehr-system.com` | Atención psicológica (también `psicologo2`, `psicologo3`, …) |
| **Enfermero/a** | `enfermera1@ehr-system.com` | Atención de enfermería (también `enfermera2`, …) |
| **Paciente / Estudiante** | `estudiante1@ehr-system.com` | Rol paciente (también `estudiante2`, …) |

> **Nota:** El seed crea más usuarios del mismo tipo (varios psicólogos, enfermeras y estudiantes). La contraseña es la misma para todos.

---

## 📜 Scripts Disponibles

### **Backend (api/)**

```bash
npm run dev              # Ejecutar en modo desarrollo con hot-reload
npm run build            # Compilar TypeScript a JavaScript
npm start                # Ejecutar versión de producción
npm test                 # Ejecutar tests unitarios
npm run test:watch       # Tests en modo watch
npm run lint             # Ejecutar linter
npm run format           # Formatear código con Prettier
npm run migration:generate   # Generar nueva migración
npm run migration:run        # Ejecutar migraciones pendientes
npm run migration:revert     # Revertir última migración
```

### **Frontend (Kiosko/)**
### **Frontend (ut-care/)**

```bash
npm run dev              # Ejecutar en modo desarrollo
npm run build            # Compilar para producción
npm run preview          # Preview de build de producción
npm test                 # Ejecutar tests con Vitest
npm run test:ui          # UI de tests de Vitest
npm run lint             # Ejecutar linter
npm run format           # Formatear código con Prettier
npm run storybook        # Ejecutar Storybook
npm run build-storybook  # Compilar Storybook
```

### **App Móvil para Psicólogos (AppEHR/)**

Requiere el [SDK de .NET 10](https://dotnet.microsoft.com/download/dotnet/10.0) y las cargas de trabajo de MAUI instaladas.

```bash
# Instalar cargas de trabajo MAUI (primera vez)
dotnet workload install maui

# Ejecutar en Windows
dotnet run --project AppEHR/AppEHR.csproj -f net10.0-windows10.0.19041.0

# Ejecutar en Android (emulador o dispositivo)
dotnet run --project AppEHR/AppEHR.csproj -f net10.0-android

# Compilar para producción
dotnet publish AppEHR/AppEHR.csproj -f net10.0-android -c Release
```

> **Nota:** AppEHR consume el mismo backend REST (`VITE_API_URL` → ajustar la URL base en `MauiProgram.cs`). Solo los usuarios con rol `Psicólogo` pueden autenticarse en la app; supervisores y personal de enfermería no tienen acceso.

---

## 🔐 Variables de Entorno

### **Backend (.env)**

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=ehr_user
DB_PASSWORD=tu_password_seguro
DB_DATABASE=ehr_db

# JWT Authentication
JWT_SECRET=tu_secret_key_muy_seguro_aqui
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=otro_secret_key_para_refresh
JWT_REFRESH_EXPIRE=30d

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@institucional.com
SMTP_PASS=tu_password_app
SMTP_FROM=noreply@ehr-system.com

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=400  # peticiones por IP en la ventana (aumentar si ves 429)
```

### **Frontend (.env)**

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
VITE_WS_URL=ws://localhost:5000

# Environment
VITE_ENV=development

# App Configuration
VITE_APP_NAME=EHR System
VITE_APP_VERSION=1.0.0
```

---

## 🔄 CI/CD (GitHub Actions)

En cada `push` y `pull_request` hacia `develop` o `main`, el workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) ejecuta en paralelo:

| Job | Qué hace |
|-----|----------|
| **api** | PostgreSQL de servicio, `npm ci`, Prisma (generate, migrate, seed), `npm run build`, tests **Jest** (se omiten pruebas de rendimiento en `__tests__/performance/`). |
| **kiosko** | `npm ci` y `astro build`. |
| **ut-care** | `npm ci` y `npm run build` (TypeScript + Vite). |
| **e2e** | PostgreSQL, dependencias de `api`, `ut-care` y `e2e` (instalación en paralelo donde aplica), seed, Playwright (Chromium) y pruebas E2E del cliente web. |

Los jobs comparten caché de npm según los `package-lock.json` de cada paquete. Para ampliar el pipeline (despliegue, artefactos entre jobs, etc.), extiende el mismo workflow o añade workflows adicionales en `.github/workflows/`.

---

## 🧪 Testing

### **Tests automatizados (API)**

```bash
cd api
npm test                    # Jest (unitarios + integración)
npm run test:watch          # Modo watch
npm run test:coverage       # Con cobertura
# Mismo criterio que en CI (sin pruebas de carpeta performance):
npm test -- --testPathIgnorePatterns=performance
```

Requisitos: base de datos según `DATABASE_URL` (p. ej. `docker compose up -d` desde la raíz) y migraciones/seed si las pruebas lo necesitan.

### **Pruebas E2E (navegador)**

Las pruebas end-to-end del frontend **ut-care** contra la API real están en [`e2e/`](./e2e/). Usan **Playwright** (Chromium). Resumen de ejecución local:

```bash
# Desde la raíz: PostgreSQL arriba, seed aplicado (ver e2e/README.md)
cd e2e
npm ci
npx playwright install chromium   # primera vez
DATABASE_URL="postgresql://admin:admin1234@localhost:5432/ehr_db" npm test
```

Detalle: [`e2e/README.md`](./e2e/README.md).

### **Cobertura de Tests**

El proyecto mantiene una cobertura mínima de:
- **Backend:** 80% de cobertura
- **Frontend:** 70% de cobertura

---

## 📖 Documentación

### Gestión del Proyecto
- **[📋 Acta de Constitución del Proyecto](./documents/docs/gestion-proyecto/Acta-Constitucion-Proyecto.md)** - Project Charter oficial
- **[Guía de GitHub Projects](./GITHUB_PROJECTS_GUIDE.md)** - Gestión del proyecto
- **[Templates de Issues](./ISSUE_TEMPLATES.md)** - Plantillas para issues
- **[Estructura del Proyecto](./PROJECT_STRUCTURE.md)** - Detalles de arquitectura
- **[Referencia Rápida](./QUICK_REFERENCE.md)** - Comandos y referencias

### Requisitos y Análisis
- **[📋 Reglas de Negocio](./documents/docs/requisitos/Reglas-Negocio.md)** - Reglas de negocio del sistema EHR (ODS 3, HIPAA)
- **[📊 Diagrama de Flujo de Atención](./documents/docs/diseno-tecnico/Diagrama-Flujo-Atencion.md)** - Proceso completo de atención al paciente
- **[🗺️ Flujo de Navegación Completo](./documents/Flujo-Navegacion-Completo.md)** - Arquitectura de navegación y flujos de usuario
- **[Requisitos Funcionales](./documents/docs/requisitos/Req-Funcionales.md)** - Especificación de funcionalidades
- **[Requisitos No Funcionales](./documents/Req-NoFuncionales.md)** - Criterios de calidad
- **[Requisitos de Seguridad](./documents/Req-Seguridad.md)** - Especificación de seguridad
- **[Análisis de Riesgos y Amenazas](./documents/docs/riesgos/Analisis-Riesgos-Amenazas.md)** - Evaluación de seguridad y cumplimiento

### Documentación Técnica
- **[🎭 Pruebas E2E (Playwright)](./e2e/README.md)** - Automatización del cliente ut-care y CI
- **[📚 Documentación API REST](./api/API_DOCUMENTATION.md)** - Guía completa de endpoints y uso
- **[📄 Especificación OpenAPI](./api/openapi.yaml)** - Definición OpenAPI 3.0 de la API
- **[API Documentation (Swagger UI)](http://localhost:5000/api-docs)** - Documentación interactiva (en desarrollo)
- **[Frontend Docs](./Kiosko/README.md)** - Stack tecnológico frontend
- **[Frontend Docs](./ut-care/README.md)** - Stack tecnológico frontend
- **[Backend Docs](./api/README.md)** - Stack tecnológico backend

---

## 🤝 Contribución

### **Workflow de Desarrollo**

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios usando [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: agregar módulo de prescripciones médicas"
   git commit -m "fix: corregir validación de fechas en citas"
   git commit -m "docs: actualizar README con nuevas instrucciones"
   ```
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

### **Convenciones de Código**

- **TypeScript** estricto habilitado
- **ESLint** + **Prettier** configurados
- **Pre-commit hooks** con Husky
- **Code reviews** obligatorios antes de merge
- **Tests** requeridos para nuevas funcionalidades

### **Tipos de Commits**

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Formato, sin cambios de código
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

---

## 🔒 Seguridad y Compliance

Este sistema cumple con:

- ✅ **HIPAA** (Health Insurance Portability and Accountability Act)
- ✅ **Encriptación** de datos sensibles (AES-256)
- ✅ **Audit Logs** completos de acciones críticas
- ✅ **Autenticación** JWT con refresh tokens
- ✅ **Rate Limiting** contra ataques DDoS
- ✅ **Validación** y sanitización de inputs
- ✅ **Backups** automáticos programados

### **Reportar Vulnerabilidades**

Si encuentras una vulnerabilidad de seguridad, por favor **NO** abras un issue público. En su lugar, envía un email a: [security@ehr-system.com](mailto:security@ehr-system.com)

---

## 📊 Roadmap

### **Versión 1.0 (Actual)**
- [x] Gestión de pacientes
- [x] Sistema de citas
- [x] Expedientes médicos básicos
- [x] Autenticación y autorización

### **Versión 1.5 (Q2 2026)**
- [ ] Módulo de reportes avanzados
- [ ] Integración con laboratorios
- [ ] Notificaciones push
- [ ] App móvil (React Native)

### **Versión 2.0 (Q4 2026)**
- [ ] Telemedicina integrada
- [ ] IA para diagnóstico asistido
- [ ] Blockchain para historial médico
- [ ] Interoperabilidad HL7 FHIR

---

## 👥 Equipo

| Rol | Responsabilidad |
|-----|-----------------|
| **Project Manager** | Coordinación general y planning |
| **Tech Lead** | Arquitectura y decisiones técnicas |
| **Backend Developers** | API, base de datos, seguridad |
| **Frontend Developers** | Interfaz de usuario, UX |
| **QA Engineers** | Testing y aseguramiento de calidad |
| **DevOps** | CI/CD, deployment, infraestructura |

---

## 📄 Licencia

Este proyecto es propiedad de [Tu Institución] y está protegido bajo licencia privada. Todos los derechos reservados.

**Uso Interno:** Este software es de uso exclusivo para personal autorizado de la institución.

---

## 📞 Contacto y Soporte

- **Email:** support@ehr-system.com
- **Issues:** [GitHub Issues](https://github.com/tu-usuario/ElectronicHealthRecord/issues)
- **Discussions:** [GitHub Discussions](https://github.com/tu-usuario/ElectronicHealthRecord/discussions)
- **Wiki:** [GitHub Wiki](https://github.com/tu-usuario/ElectronicHealthRecord/wiki)

---

## 🙏 Agradecimientos

Gracias a todos los desarrolladores y al equipo médico que han contribuido a hacer este proyecto una realidad.

---

<div align="center">

**[⬆ Volver arriba](#-electronic-health-record-system)**

Hecho con ❤️ por el equipo de desarrollo EHR

</div>
