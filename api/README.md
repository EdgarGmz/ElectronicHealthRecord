<div align="center">

# 🏥 EHR System Backend - Nursing & Psychology

### Sistema de Registro de Salud Electrónico Institucional

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 🚀 Implementation Status

✅ **Core API Implementation Complete!**

The backend API has been successfully implemented with:
- ✅ Express.js server with TypeScript
- ✅ Prisma ORM for PostgreSQL
- ✅ JWT Authentication & Authorization
- ✅ Users, Patients, and Auth modules
- ✅ Comprehensive security measures
- ✅ API documentation with Swagger
- ✅ Zero security vulnerabilities

**Quick Links:**
- 📚 [Getting Started Guide](./GETTING_STARTED.md)
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- 📄 [OpenAPI Specification](./openapi.yaml)
- 📖 [API Documentation](./API_DOCUMENTATION.md)

---

## 🚀 Inicio Rápido

Sigue estos pasos para tener la API de EHR funcionando en tu máquina local.

### 📋 Prerrequisitos

*   Node.js (v18 o superior)
*   npm (v9 o superior)
*   Docker & Docker Compose (para la base de datos)

### 📦 1. Clonar el Repositorio

```bash
git clone https://github.com/EdgarGmz/ElectronicHealthRecord.git
cd ElectronicHealthRecord/api
```

### ⚙️ 2. Instalar Dependencias

```bash
npm install
```

### 🔑 3. Configurar Variables de Entorno

Crea un archivo `.env` en el directorio `api/` copiando el archivo de ejemplo:

```bash
cp .env.example .env
```

Ahora, abre el archivo `.env` y actualiza las siguientes variables. La URL de la base de datos debe apuntar al contenedor de Docker (localhost si corres la API fuera de Docker).

```env
# Conexión a la Base de Datos (PostgreSQL via Docker)
DATABASE_URL="postgresql://admin:admin1234@localhost:5432/ehr_db?schema=public"

# Secretos JWT para Autenticación
JWT_SECRET=tu-secreto-jwt-aqui
JWT_REFRESH_SECRET=tu-secreto-refresh-jwt-aqui
```

### 🐘 4. Levantar la Base de Datos con Docker

Desde la **raíz del proyecto**, levanta únicamente el servicio de base de datos:

```bash
# Regresa a la raíz si estás en /api
cd ..

# Levanta PostgreSQL
docker compose up -d
```

### ⬆️ 5. Ejecutar Migraciones y Seed

Una vez que el contenedor `ehr-postgres` esté corriendo:

```bash
cd api

# Ejecutar migraciones de Prisma
npm run prisma:migrate

# Poblar con datos de prueba
npx prisma db seed
```
*   Cuando se te solicite, ingresa un nombre para la migración (ej., `initial_setup`).

### 🌱 5.1. Poblar la Base de Datos con Datos de Prueba (Opcional pero Recomendado)

Para facilitar el desarrollo y pruebas, puedes poblar la base de datos con datos realistas de prueba utilizando el script de seed:

```bash
npx prisma db seed
```

Este comando ejecutará el script `prisma/seed.ts` que creará:
- **10 carreras** universitarias
- **50+ usuarios** con diferentes roles:
  - ~80% pacientes/estudiantes
  - ~10% psicólogos
  - ~5% enfermeras
  - 1 coordinador de psicología
  - 1 coordinador de enfermería
  - 1 administrador del sistema
- **Datos relacionados** para cada entidad del sistema:
  - Registros médicos y psicológicos
  - Sesiones de terapia
  - Consultas de enfermería
  - Medicamentos y prescripciones
  - Citas médicas
  - Notificaciones
  - Y mucho más...

**Roles del sistema (5):** Solo el personal tiene acceso. El **admin** actúa como **auditor**: usuario único, no se puede borrar; solo lectura en pacientes, citas e inventario de medicamentos; sin acceso a expedientes, terapia ni evaluaciones psicométricas; acceso total a interconsultas, notificaciones, reportes, audit logs, usuarios y carreras. Definidos en `api/src/constants/roles.ts`. El paciente no es usuario del sistema.

#### Expediente único y flujo de registro (enfermería y psicología)

Hay **un solo expediente médico por persona** (estudiante, docente o personal administrativo), compartido por **ambos departamentos** (psicología y enfermería).

- **Al llegar a enfermería o a psicología:** la enfermera o el personal captura la **matrícula** (estudiantes) o el **número de empleado** (docentes/administrativos). Si la persona **no estaba registrada**, se crea un **nuevo expediente** (y paciente); si **ya estaba registrada**, se **abre el expediente** existente.
- **Búsqueda para abrir expediente:** `GET /api/patients/by-enrollment/:number` — devuelve el paciente (y su expediente) si existe alguien con esa matrícula o número de empleado; si no existe, responde 404 y en frontend se puede mostrar el formulario para “registro nuevo”.
- **Uso del expediente:**
  - **Psicología** puede ver **todo el historial** del paciente (incluidas atenciones de enfermería) para tener contexto general, detectar problemas o soluciones ante adversidades.
  - **Enfermería** utiliza el mismo expediente sobre todo para **registrar la actividad** del paciente en el momento (por ejemplo, cuando se siente mal o tuvo un accidente), sin necesidad de ver todo el historial psicológico con el mismo nivel de detalle.
  #### Tabla de roles y permisos

  | Recurso / Acción | 👨‍💼 Admin | 🧠 Psicología | 🏥 Enfermería | 👨‍⚕️ Psicólogo | 👩‍⚕️ Enfermero |
  |---|:---:|:---:|:---:|:---:|:---:|
  | **👥 Pacientes** |
  | Listar / Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
  | Crear / Editar | ❌ | ✅ | ❌ | ✅ | ✅ |
  | Eliminar | ❌ | ✅ | ❌ | ✅ | ❌ |
  | **📋 Expedientes médicos** | ❌ | ✅ | ✅* | ✅ | ✅** |
  | Agregar diagnóstico (CIE/DSM) | ❌ | ❌ | ❌ | ✅ | ❌ |
  | **📅 Citas** |
  | Ver | ✅ | ✅ | ✅ | ✅ | ✅*** |
  | Crear / Editar / Cancelar | ❌ | ✅ | ❌ | ✅ | ❌ |
  | **💬 Sesiones de terapia** | ❌ | ✅ | 👁️ | ✅ | ❌ |
  | **📊 Evaluaciones psicométricas** |
  | Ver / Crear / Editar | ❌ | ✅ | 👁️ | ✅ | ❌ |
  | Eliminar | ❌ | ✅ | ❌ | ❌ | ❌ |
  | **💊 Medicamentos (inventario)** |
  | Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
  | Crear | ❌ | ❌ | ✅ | ❌ | ❌ |
  | Editar (stock) | ❌ | ❌ | ✅ | ❌ | ✅ |
  | **🔄 Interconsultas** | ✅ | ✅ | ✅ | ✅ | ✅ |
  | **🔔 Notificaciones** | ✅ | ✅ | ✅ | ✅ | ✅ |
  | **📈 Reportes** | ✅ | ✅ | ✅ | ✅ | ✅ |
  | **🔐 Auditoría (logs)** | ✅ | ✅ | ✅ | ❌ | ❌ |
  | **👤 Usuarios** | ✅ | ✅* | ✅* | ❌ | ❌ |
  | **🎓 Carreras** | ✅ | 👁️ | 👁️ | 👁️ | 👁️ |

  **Leyenda:** ✅ Permitido | ❌ No permitido | 👁️ Solo lectura | \* Restringido al departamento | \*\* Enfermero: solo historial de enfermería (no psicología) | \*\*\* Enfermero: solo sus citas asignadas

\* Las carreras se listan para todos (p. ej. en formularios); crear/editar/eliminar solo admin.

**Notas:** El administrador no puede ser eliminado. El **coordinador de psicología** solo puede generar reportes del departamento de psicología, ver audit logs de ese departamento y crear nuevos usuarios con rol psicólogo; no tiene acceso al CRUD de carreras ni a crear/editar medicamentos. El **coordinador de enfermería** solo ve pacientes y expedientes registrados en enfermería (con al menos una consulta de enfermería), no genera citas (solo atiende ambulatorio/accidentes), tiene acceso restringido a sesiones de terapia y evaluaciones psicométricas (solo lectura, filtrado por pacientes de enfermería), CRUD completo de medicamentos, reportes y audit solo del departamento de enfermería, y solo puede crear usuarios con rol enfermero; carreras en solo lectura (listar). El **psicólogo** tiene **carreras asignadas**: solo puede atender a **estudiantes de esas carreras** o a **personal docente y administrativo** (estos últimos de forma general). Ese mismo alcance aplica a pacientes, expedientes, citas, sesiones de terapia y evaluaciones psicométricas; puede generar reportes pero solo con datos de sus carreras asignadas; acceso restringido a auditoría y usuarios; solo puede consultar carreras (listar). La **enfermera** tiene acceso total a pacientes (crear/editar, no eliminar); solo al **historial clínico de enfermería** (no de psicología); acceso restringido a citas (solo ver sus citas asignadas, no crear/editar/cancelar); sin acceso a sesiones de terapia ni evaluaciones psicométricas; medicamentos: solo consulta y editar stock (no crear nuevos); acceso total a interconsultas y notificaciones; acceso restringido a logs y usuarios; carreras solo consulta.

**Leyenda:** ✅ Permitido | ❌ No permitido | 👁️ Solo lectura

**Cuentas de prueba (solo personal; el paciente no inicia sesión):**
| Email | Rol | Password |
|-------|-----|----------|
| `admin@ehr-system.com` | admin | `Password123!` |
| `coord.psicologia@ehr-system.com` | coordinador_psicologia | `Password123!` |
| `coord.enfermeria@ehr-system.com` | coordinador_enfermeria | `Password123!` |
| `psicologo1@ehr-system.com` | psicologo | `Password123!` |
| `enfermera1@ehr-system.com` | enfermero | `Password123!` |

**Nota:** El script de seed es **idempotente**. Si ya existen datos en la base de datos, el script detectará esto y no creará registros duplicados. Para volver a poblar la base de datos desde cero, primero ejecuta:

```bash
npx prisma migrate reset
```

Este comando eliminará todos los datos, aplicará todas las migraciones y ejecutará automáticamente el script de seed.

### 🚀 6. Iniciar el Servidor de la API

Puedes iniciar la API de dos formas:

**Opción A: Solo API (si la DB ya está corriendo)**
```bash
npm run dev
```

**Opción B: DB + API (levanta la DB y luego la API)**
```bash
npm run dev:all
```

La API estará disponible en `http://localhost:5000/api`.

### 🛠️ Scripts Útiles de Node

He añadido varios scripts para facilitar el desarrollo:

*   `npm run setup`: Realiza la instalación completa (npm install, levanta DB, corre migraciones y seeds).
*   `npm run db:up`: Levanta solo el contenedor de la base de datos.
*   `npm run db:down`: Detiene el contenedor de la base de datos.
*   `npm run db:status`: Muestra el estado del contenedor de la DB.
*   `npm run prisma:migrate`: Ejecuta las migraciones de Prisma.
*   `npm run prisma:seed`: Puebla la base de datos con datos iniciales.

### 📚 7. Acceder a la Documentación de la API

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva de la API (Swagger UI) en:

[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 🛠️ Stack Tecnológico

<div align="center">

| Categoría | Tecnología | Propósito |
|:---------:|:----------:|:---------:|
| 💻 **Lenguaje** | [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) | Tipado fuerte para reducir errores |
| 🚀 **Framework** | [![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/) | Servidor HTTP ligero y flexible |
| 🔄 **ORM** | [![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/) | Type-safe database client |
| 🗄️ **Base de Datos** | [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/) | Motor relacional de alta consistencia |
| 🏗️ **Arquitectura** | [![Service Layer](https://img.shields.io/badge/Service_Layer-4CAF50?logo=github&logoColor=white)](https://martinfowler.com/eaaCatalog/serviceLayer.html) | Separación de lógica de negocio |

</div>

### 🔐 Seguridad

<div align="center">

| Herramienta | Uso | Versión |
|:-----------:|:---:|:-------:|
| 🔑 **JWT** | Manejo de sesiones y autorización | ![npm](https://img.shields.io/npm/v/jsonwebtoken?label=) |
| 🔒 **Bcrypt** | Hasheo seguro de contraseñas | ![npm](https://img.shields.io/npm/v/bcrypt?label=) |
| 🛡️ **Helmet** | Protección de headers HTTP | ![npm](https://img.shields.io/npm/v/helmet?label=) |
| 🌍 **CORS** | Control de acceso entre orígenes | ![npm](https://img.shields.io/npm/v/cors?label=) |
| ⏱️ **express-rate-limit** | Protección contra DDoS/brute-force | ![npm](https://img.shields.io/npm/v/express-rate-limit?label=) |
| ✅ **express-validator** | Validación y sanitización de inputs | ![npm](https://img.shields.io/npm/v/express-validator?label=) |

</div>

### ✅ Validación de Datos

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![class-validator](https://img.shields.io/badge/class--validator-FF6B6B?logo=typescript&logoColor=white)](https://github.com/typestack/class-validator) | Validación declarativa con decoradores | ![npm](https://img.shields.io/npm/v/class-validator?label=) | [Docs](https://github.com/typestack/class-validator) • [NPM](https://www.npmjs.com/package/class-validator) |
| [![class-transformer](https://img.shields.io/badge/class--transformer-4A90E2?logo=typescript&logoColor=white)](https://github.com/typestack/class-transformer) | Transformación de objetos planos a instancias | ![npm](https://img.shields.io/npm/v/class-transformer?label=) | [Docs](https://github.com/typestack/class-transformer) • [NPM](https://www.npmjs.com/package/class-transformer) |
| [![Joi](https://img.shields.io/badge/Joi-0080C0?logo=joi&logoColor=white)](https://joi.dev/) | Validación de esquemas para JavaScript | ![npm](https://img.shields.io/npm/v/joi?label=) | [Docs](https://joi.dev/) • [NPM](https://www.npmjs.com/package/joi) |
| [![Zod](https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=white)](https://zod.dev/) | Validación TypeScript-first | ![npm](https://img.shields.io/npm/v/zod?label=) | [Docs](https://zod.dev/) • [NPM](https://www.npmjs.com/package/zod) |

</div>

### 📚 Documentación API

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/) | Documentación interactiva de API REST | ![npm](https://img.shields.io/npm/v/swagger-ui-express?label=) | [Docs](https://swagger.io/) • [NPM](https://www.npmjs.com/package/swagger-ui-express) |
| [![OpenAPI](https://img.shields.io/badge/OpenAPI-6BA539?logo=openapiinitiative&logoColor=white)](https://www.openapis.org/) | Especificación estándar de APIs | - | [Docs](https://www.openapis.org/) • [Spec](https://spec.openapis.org/oas/latest.html) |
| [![TypeDoc](https://img.shields.io/badge/TypeDoc-007ACC?logo=typescript&logoColor=white)](https://typedoc.org/) | Generación de docs desde código TS | ![npm](https://img.shields.io/npm/v/typedoc?label=) | [Docs](https://typedoc.org/) • [NPM](https://www.npmjs.com/package/typedoc) |
| [![YAMLJS](https://img.shields.io/badge/YAMLJS-CB3837?logo=yaml&logoColor=white)](https://github.com/jeremyfa/yaml.js) | Parser y serializador de archivos YAML | ![npm](https://img.shields.io/npm/v/yamljs?label=) | [Docs](https://github.com/jeremyfa/yaml.js) • [NPM](https://www.npmjs.com/package/yamljs) |
| [![ReDoc](https://img.shields.io/badge/ReDoc-8BC34A?logo=readme&logoColor=white)](https://redocly.com/redoc/) | Generador de documentación OpenAPI | ![npm](https://img.shields.io/npm/v/redoc-cli?label=) | [Docs](https://redocly.com/redoc/) • [NPM](https://www.npmjs.com/package/redoc-cli) |

</div>

#### 📄 Documentación Disponible

- **[📚 Guía Completa de la API](./API_DOCUMENTATION.md)** - Documentación detallada de endpoints, ejemplos y guías de uso
- **[📄 Especificación OpenAPI 3.0](./openapi.yaml)** - Definición completa de la API REST
- **[🚀 Swagger UI](http://localhost:5000/api-docs)** - Interfaz interactiva para probar endpoints (cuando el servidor esté corriendo)

### 📝 Logging y Monitoreo

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![Winston](https://img.shields.io/badge/Winston-1C1C1C?logo=winston&logoColor=white)](https://github.com/winstonjs/winston) | Sistema de logging estructurado | ![npm](https://img.shields.io/npm/v/winston?label=) | [Docs](https://github.com/winstonjs/winston) • [NPM](https://www.npmjs.com/package/winston) |
| [![Morgan](https://img.shields.io/badge/Morgan-000000?logo=express&logoColor=white)](https://github.com/expressjs/morgan) | Logger de peticiones HTTP | ![npm](https://img.shields.io/npm/v/morgan?label=) | [Docs](https://github.com/expressjs/morgan) • [NPM](https://www.npmjs.com/package/morgan) |
| [![winston-daily-rotate](https://img.shields.io/badge/winston--rotate-4A4A4A?logo=winston&logoColor=white)](https://github.com/winstonjs/winston-daily-rotate-file) | Rotación automática de archivos de log | ![npm](https://img.shields.io/npm/v/winston-daily-rotate-file?label=) | [Docs](https://github.com/winstonjs/winston-daily-rotate-file) • [NPM](https://www.npmjs.com/package/winston-daily-rotate-file) |

</div>

### 🧪 Testing

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io/) | Framework de testing completo | ![npm](https://img.shields.io/npm/v/jest?label=) | [Docs](https://jestjs.io/) • [NPM](https://www.npmjs.com/package/jest) |
| [![Supertest](https://img.shields.io/badge/Supertest-07BA82?logo=testing-library&logoColor=white)](https://github.com/visionmedia/supertest) | Testing de endpoints HTTP | ![npm](https://img.shields.io/npm/v/supertest?label=) | [Docs](https://github.com/visionmedia/supertest) • [NPM](https://www.npmjs.com/package/supertest) |
| [![ts-jest](https://img.shields.io/badge/ts--jest-007ACC?logo=typescript&logoColor=white)](https://kulshekhar.github.io/ts-jest/) | Soporte TypeScript para Jest | ![npm](https://img.shields.io/npm/v/ts-jest?label=) | [Docs](https://kulshekhar.github.io/ts-jest/) • [NPM](https://www.npmjs.com/package/ts-jest) |

</div>

### ⚙️ Variables de Entorno

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![dotenv](https://img.shields.io/badge/dotenv-ECD53F?logo=dotenv&logoColor=black)](https://github.com/motdotla/dotenv) | Carga de variables de entorno desde .env | ![npm](https://img.shields.io/npm/v/dotenv?label=) | [Docs](https://github.com/motdotla/dotenv) • [NPM](https://www.npmjs.com/package/dotenv) |
| [![cross-env](https://img.shields.io/badge/cross--env-5DBE9B?logo=node.js&logoColor=white)](https://github.com/kentcdodds/cross-env) | Variables de entorno multiplataforma | ![npm](https://img.shields.io/npm/v/cross-env?label=) | [Docs](https://github.com/kentcdodds/cross-env) • [NPM](https://www.npmjs.com/package/cross-env) |

</div>

### 📁 Manejo de Archivos

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![Multer](https://img.shields.io/badge/Multer-FF6600?logo=node.js&logoColor=white)](https://github.com/expressjs/multer) | Middleware para subida de archivos | ![npm](https://img.shields.io/npm/v/multer?label=) | [Docs](https://github.com/expressjs/multer) • [NPM](https://www.npmjs.com/package/multer) |
| [![Sharp](https://img.shields.io/badge/Sharp-99CC00?logo=sharp&logoColor=white)](https://sharp.pixelplumbing.com/) | Procesamiento de imágenes de alto rendimiento | ![npm](https://img.shields.io/npm/v/sharp?label=) | [Docs](https://sharp.pixelplumbing.com/) • [NPM](https://www.npmjs.com/package/sharp) |
| [![PDFKit](https://img.shields.io/badge/PDFKit-D0021B?logo=adobe-acrobat-reader&logoColor=white)](https://pdfkit.org/) | Generación de documentos PDF | ![npm](https://img.shields.io/npm/v/pdfkit?label=) | [Docs](https://pdfkit.org/) • [NPM](https://www.npmjs.com/package/pdfkit) |
| [![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?logo=puppeteer&logoColor=white)](https://pptr.dev/) | Automatización de navegador (PDFs, screenshots) | ![npm](https://img.shields.io/npm/v/puppeteer?label=) | [Docs](https://pptr.dev/) • [NPM](https://www.npmjs.com/package/puppeteer) |

</div>

### ⚡ Cache y Performance

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)](https://redis.io/) | Cache en memoria de alto rendimiento | - | [Docs](https://redis.io/) • [Descargar](https://redis.io/download) |
| [![ioredis](https://img.shields.io/badge/ioredis-DC382D?logo=redis&logoColor=white)](https://github.com/luin/ioredis) | Cliente Redis robusto para Node.js | ![npm](https://img.shields.io/npm/v/ioredis?label=) | [Docs](https://github.com/luin/ioredis) • [NPM](https://www.npmjs.com/package/ioredis) |
| [![Compression](https://img.shields.io/badge/Compression-4A4A4A?logo=node.js&logoColor=white)](https://github.com/expressjs/compression) | Compresión gzip/deflate de responses | ![npm](https://img.shields.io/npm/v/compression?label=) | [Docs](https://github.com/expressjs/compression) • [NPM](https://www.npmjs.com/package/compression) |

</div>

### 🛠️ Manejo de Errores

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![http-errors](https://img.shields.io/badge/http--errors-FF6347?logo=node.js&logoColor=white)](https://github.com/jshttp/http-errors) | Creación estandarizada de errores HTTP | ![npm](https://img.shields.io/npm/v/http-errors?label=) | [Docs](https://github.com/jshttp/http-errors) • [NPM](https://www.npmjs.com/package/http-errors) |
| [![express-async-errors](https://img.shields.io/badge/async--errors-000000?logo=express&logoColor=white)](https://github.com/davidbanham/express-async-errors) | Captura automática de errores asíncronos | ![npm](https://img.shields.io/npm/v/express-async-errors?label=) | [Docs](https://github.com/davidbanham/express-async-errors) • [NPM](https://www.npmjs.com/package/express-async-errors) |

</div>

### 🔧 Utilidades

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![date-fns](https://img.shields.io/badge/date--fns-770C56?logo=date-fns&logoColor=white)](https://date-fns.org/) | Librería moderna para manejo de fechas | ![npm](https://img.shields.io/npm/v/date-fns?label=) | [Docs](https://date-fns.org/) • [NPM](https://www.npmjs.com/package/date-fns) |
| [![uuid](https://img.shields.io/badge/uuid-00D1B2?logo=node.js&logoColor=white)](https://github.com/uuidjs/uuid) | Generación de identificadores únicos (RFC4122) | ![npm](https://img.shields.io/npm/v/uuid?label=) | [Docs](https://github.com/uuidjs/uuid) • [NPM](https://www.npmjs.com/package/uuid) |
| [![validator.js](https://img.shields.io/badge/validator.js-5DADE2?logo=javascript&logoColor=white)](https://github.com/validatorjs/validator.js) | Validación y sanitización de strings | ![npm](https://img.shields.io/npm/v/validator?label=) | [Docs](https://github.com/validatorjs/validator.js) • [NPM](https://www.npmjs.com/package/validator) |

</div>

### 📧 Comunicación

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![Nodemailer](https://img.shields.io/badge/Nodemailer-0F9DCE?logo=mail.ru&logoColor=white)](https://nodemailer.com/) | Envío de emails (notificaciones, reportes) | ![npm](https://img.shields.io/npm/v/nodemailer?label=) | [Docs](https://nodemailer.com/) • [NPM](https://www.npmjs.com/package/nodemailer) |
| [![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white)](https://socket.io/) | Comunicación bidireccional en tiempo real | ![npm](https://img.shields.io/npm/v/socket.io?label=) | [Docs](https://socket.io/) • [NPM](https://www.npmjs.com/package/socket.io) |

</div>

### 🔄 Migraciones y Tareas Programadas

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![TypeORM Migrations](https://img.shields.io/badge/TypeORM_Migrations-FE0803?logo=typeorm&logoColor=white)](https://typeorm.io/migrations) | Versionado y control de cambios en BD | - | [Docs](https://typeorm.io/migrations) |
| [![node-cron](https://img.shields.io/badge/node--cron-4CAF50?logo=node.js&logoColor=white)](https://github.com/node-cron/node-cron) | Tareas programadas con sintaxis cron | ![npm](https://img.shields.io/npm/v/node-cron?label=) | [Docs](https://github.com/node-cron/node-cron) • [NPM](https://www.npmjs.com/package/node-cron) |
| [![node-schedule](https://img.shields.io/badge/node--schedule-FF6B6B?logo=node.js&logoColor=white)](https://github.com/node-schedule/node-schedule) | Programación flexible de tareas | ![npm](https://img.shields.io/npm/v/node-schedule?label=) | [Docs](https://github.com/node-schedule/node-schedule) • [NPM](https://www.npmjs.com/package/node-schedule) |
| [![Faker.js](https://img.shields.io/badge/Faker.js-FF6347?logo=javascript&logoColor=white)](https://fakerjs.dev/) | Generación de datos de prueba | ![npm](https://img.shields.io/npm/v/@faker-js/faker?label=) | [Docs](https://fakerjs.dev/) • [NPM](https://www.npmjs.com/package/@faker-js/faker) |

</div>

### 🛠️ Herramientas de Desarrollo

<div align="center">

| Tecnología | Descripción | Versión | Enlaces |
|:----------:|:-----------:|:-------:|:-------:|
| [![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?logo=nodemon&logoColor=white)](https://nodemon.io/) | Auto-reload en desarrollo | ![npm](https://img.shields.io/npm/v/nodemon?label=) | [Docs](https://nodemon.io/) • [NPM](https://www.npmjs.com/package/nodemon) |
| [![ts-node-dev](https://img.shields.io/badge/ts--node--dev-3178C6?logo=typescript&logoColor=white)](https://github.com/wclr/ts-node-dev) | Desarrollo TypeScript con hot-reload | ![npm](https://img.shields.io/npm/v/ts-node-dev?label=) | [Docs](https://github.com/wclr/ts-node-dev) • [NPM](https://www.npmjs.com/package/ts-node-dev) |
| [![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/) | Linter de código JavaScript/TypeScript | ![npm](https://img.shields.io/npm/v/eslint?label=) | [Docs](https://eslint.org/) • [NPM](https://www.npmjs.com/package/eslint) |
| [![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/) | Formateador de código | ![npm](https://img.shields.io/npm/v/prettier?label=) | [Docs](https://prettier.io/) • [NPM](https://www.npmjs.com/package/prettier) |
| [![Husky](https://img.shields.io/badge/Husky-42B983?logo=git&logoColor=white)](https://typicode.github.io/husky/) | Git hooks para calidad de código | ![npm](https://img.shields.io/npm/v/husky?label=) | [Docs](https://typicode.github.io/husky/) • [NPM](https://www.npmjs.com/package/husky) |

</div>

### 📊 Auditoría y Compliance

<div align="center">

| Componente | Descripción | Estándar |
|:----------:|:-----------:|:--------:|
| 📋 **Audit Logs** | Registro detallado de acciones críticas | HIPAA Compliance |
| 🔐 **Data Encryption** | Cifrado de datos sensibles en reposo y tránsito | AES-256 |
| 🕒 **Backup Automático** | Respaldos programados de base de datos | Daily/Weekly |

</div>


