# ⚙️ EHR System Backend - API & Database

> **Navegación Rápida:**
> *   **[🏥 Regresar al README Principal](../README.md)**
> *   **[💻 Cliente Web (ut-care)](../ut-care/README.md)**
> *   **[📱 Cliente Móvil (AppEHR)](../AppEHR/README.md)**

---

## 🗺️ Índice de Contenidos

*   [📋 Descripción](#-descripción)
*   [⚙️ Variables de Entorno (.env)](#%EF%B8%8F-variables-de-entorno-env)
*   [🐘 Configuración y Migraciones de Base de Datos](#-configuración-y-migraciones-de-base-de-datos)
*   [🌱 Catálogo de Siembra de Datos (Seeds)](#-catálogo-de-siembra-de-datos-seeds)
    *   [1. Seed `clean` (Inicialización Limpia)](#1-seed-clean-inicialización-limpia)
    *   [2. Seed `dev` (Datos de Prueba Completo - Desarrollo Local)](#2-seed-dev-datos-de-prueba-completo---desarrollo-local)
    *   [3. Seed `prod` (Datos Limpios de Producción)](#3-seed-prod-datos-limpios-de-producción)
    *   [4. Seed `robust` (Carga Masiva de Datos)](#4-seed-robust-carga-masiva-de-datos)
*   [🔐 Matriz de Roles y Permisos (RBAC)](#-matriz-de-roles-y-permisos-rbac)
*   [📡 Documentación de Endpoints de la API](#-documentación-de-endpoints-de-la-api)
    *   [🔑 Módulo de Autenticación (`/api/auth`)](#-módulo-de-autenticación-apiauth)
    *   [👥 Módulo de Usuarios (`/api/users`)](#-módulo-de-usuarios-apiusers)
    *   [👥 Módulo de Pacientes (`/api/patients`)](#-módulo-de-pacientes-apipatients)
    *   [📋 Módulo de Expedientes Clínicos (`/api/medical-records`)](#-módulo-de-expedientes-clínicos-apimedical-records)
    *   [📅 Módulo de Citas (`/api/appointments`)](#-módulo-de-citas-apiappointments)
    *   [💊 Módulo de Medicamentos (`/api/medications`)](#-módulo-de-medicamentos-apimedications)
    *   [🩺 Módulo de Atención de Enfermería (`/api/nursing-attentions`)](#-módulo-de-atención-de-enfermería-apinursing-attentions)
    *   [💉 Módulo de Procedimientos de Enfermería (`/api/nursing-procedures`)](#-módulo-de-procedimientos-de-enfermería-apinursing-procedures)
    *   [💬 Módulo de Sesiones de Psicología (`/api/therapy-sessions`)](#-módulo-de-sesiones-de-psicología-apitherapy-sessions)
    *   [📈 Módulo de Evaluaciones (`/api/psychometric-tests`)](#-módulo-de-evaluaciones-apipsychometric-tests)
    *   [📤 Módulo de Interconsultas (`/api/interconsultations`)](#-módulo-de-interconsultas-apiinterconsultations)
    *   [📊 Módulo de Reportes (`/api/reports`)](#-módulo-de-reportes-apireports)
    *   [📋 Módulo de Bitácora de Auditoría (`/api/audit-logs`)](#-módulo-de-bitácora-de-auditoría-apiaudit-logs)
    *   [🔔 Módulo de Notificaciones (`/api/notifications`)](#-módulo-de-notificaciones-apinotifications)
*   [🛠️ Scripts Disponibles en la API](#%EF%B8%8F-scripts-disponibles-en-la-api)

---

## 📋 Descripción

Este módulo contiene la **API REST** centralizada del sistema EHR, desarrollada en **Node.js con Express y TypeScript**, utilizando **Prisma ORM** como motor de mapeo de base de datos relacional para **PostgreSQL**.

La API gestiona la lógica de autenticación segura (JWT), control de acceso basado en roles (RBAC), expedientes clínicos compartidos, inventario de farmacia, control de citas, e interconsultas.

---

## ⚙️ Variables de Entorno (.env)

El servidor requiere que crees un archivo `.env` en la carpeta `/api` para configurar la conexión y seguridad. A continuación se detallan las variables requeridas:

```env
# Configuración del Servidor
NODE_ENV=development
PORT=5000
HOST=localhost

# Conexión a la Base de Datos (PostgreSQL via Docker)
DATABASE_URL="postgresql://admin:admin1234@localhost:5432/ehr_db?schema=public"

# Secretos JWT para Autenticación
JWT_SECRET=tu-secreto-jwt-muy-seguro
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=otro-secreto-refresh-muy-seguro
JWT_REFRESH_EXPIRES_IN=30d

# Configuración de Correo (Nodemailer - Opcional en local)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app_google
SMTP_FROM=noreply@ehr-system.com

# Control de Peticiones (Rate Limiting)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=2000  # Peticiones máximas por IP en la ventana
```

---

## 🐘 Configuración y Migraciones de Base de Datos

Una vez que el contenedor de Docker de PostgreSQL esté activo (ejecutando `npm run db:up` o `docker compose up -d db` desde la raíz del proyecto):

1. **Instalar dependencias de Node.js:**
   ```bash
   npm install
   ```
2. **Ejecutar migraciones de Prisma:**
   Genera las tablas correspondientes en PostgreSQL según el esquema declarado en `prisma/schema.prisma`:
   ```bash
   npm run prisma:migrate
   ```
3. **Poblar la base de datos (Seeds):**
   El script de siembra (`api/prisma/seed.ts`) lee la variable de entorno `SEED_TARGET` para determinar qué datos cargar. Hemos integrado comandos simplificados con `cross-env` para facilitar esto.

---

## 🌱 Catálogo de Siembra de Datos (Seeds)

La contraseña por defecto para todas las cuentas generadas mediante los seeds es **`Password123!`**. El inicio de sesión se realiza usando de forma exclusiva el **Nombre de Usuario (Username)**.

### 1. Seed `clean` (Inicialización Limpia)
Crea las carreras universitarias de la institución y el personal de salud mínimo requerido sin registros de pacientes.

| Nombre Completo | Nombre de Usuario | Correo Electrónico | Rol del Sistema | Descripción / Función |
| :--- | :--- | :--- | :--- | :--- |
| Edgar Tiburcio Gomez Moran | `EdgarGMZ` | `22038@virtual.utsc.edu.mx` | `admin` | Administrador general y auditor |
| Carlos Alexis Rodriguez Garcia | `CarlosRDR` | `22051@virtual.utsc.edu.mx` | `coordinador_psicologia` | Coordinador de Psicología |
| Orlando De Jesus Casas Davila | `OrlandoCSS` | `22034@virtual.utsc.edu.mx` | `coordinador_enfermeria` | Coordinador de Enfermería |
| Daniela Mayte Guevara Castillo | `DanielaGVR` | `20651@virtual.utsc.edu.mx` | `psicologo` | Psicólogo Clínico |
| Juan Enrique Castillo Ontiveros | `JuanCST` | `22035@virtual.utsc.edu.mx` | `enfermero` | Enfermero Operativo |

> **Comando de ejecución:**
> * Solo siembra: `npm run prisma:seed:clean`
> * Reinicio base + siembra: `npm run prisma:reset:seed:clean`

---

### 2. Seed `dev` (Datos de Prueba Completo - Desarrollo Local)
Crea carreras, personal de salud administrativo, historiales clínicos y **500 alumnos ficticios** (de la matrícula `1000` a `1499`) para pruebas de rendimiento y paginación. Además, pre-carga la fila virtual (lista de espera de psicología) con exactamente **5 alumnos en espera por cada carrera** (60 registros de fila virtual en total) para facilitar las pruebas del dashboard.

| Nombre Completo | Nombre de Usuario | Correo Electrónico | Rol del Sistema | Descripción / Función |
| :--- | :--- | :--- | :--- | :--- |
| Edgar Tiburcio Gomez Moran | `EdgarGMZ` | `22038@virtual.utsc.edu.mx` | `admin` | Administrador / Auditor |
| Carlos Alexis Rodriguez Garcia | `CarlosRDR` | `22051@virtual.utsc.edu.mx` | `coordinador_psicologia` | Coordinador de Psicología |
| Orlando De Jesus Casas Davila | `OrlandoCSS` | `22034@virtual.utsc.edu.mx` | `coordinador_enfermeria` | Coordinador de Enfermería |
| Daniela Mayte Guevara Castillo | `DanielaGVR` | `20651@virtual.utsc.edu.mx` | `psicologo` | Psicólogo Clínico |
| Juan Enrique Castillo Ontiveros | `JuanCST` | `22035@virtual.utsc.edu.mx` | `enfermero` | Enfermero Operativo |
| Alumnos Genéricos | `Alumno[N]` | `alumno.[Matrícula]@utcare.local` | `patient` | Pacientes (Matrículas 1000-1499) |

> **Comando de ejecución:**
> * Solo siembra: `npm run prisma:seed:dev`
> * Reinicio base + siembra: `npm run prisma:reset:seed:dev`

---

### 3. Seed `prod` (Datos Limpios de Producción)
Crea las carreras y los profesionales del personal clínico real de la institución listos para iniciar operaciones en producción.

| Nombre Completo | Nombre de Usuario | Correo Electrónico | Rol del Sistema |
| :--- | :--- | :--- | :--- |
| Edgar Tiburcio Gomez Moran | `EdgarGMZ` | `22038@virtual.utsc.edu.mx` | `admin` |
| Carlos Alexis Rodriguez Garcia | `CarlosRDR` | `22051@virtual.utsc.edu.mx` | `coordinador_psicologia` |
| Orlando De Jesus Casas Davila | `OrlandoCSS` | `22034@virtual.utsc.edu.mx` | `coordinador_enfermeria` |
| Daniela Mayte Guevara Castillo | `DanielaGVR` | `20651@virtual.utsc.edu.mx` | `psicologo` |
| Juan Enrique Castillo Ontiveros | `JuanCST` | `22035@virtual.utsc.edu.mx` | `enfermero` |

> **Comando de ejecución:**
> * Solo siembra: `npm run prisma:seed:prod`
> * Reinicio base + siembra: `npm run prisma:reset:seed:prod`

---

### 4. Seed `robust` (Carga Masiva de Datos)
Genera más de **100 registros por tabla** (pacientes, consultas, expedientes, bitácoras) para auditar paginación y optimizaciones de consultas de base de datos.

El seed `robust` incluye la misma base de usuarios del entorno `dev`, sumando psicólogos y enfermeros creados de forma dinámica para alcanzar el volumen de pruebas requerido:

| Categoría de Usuario | Cantidad | Prefijo / Email | Nombre de Usuario | Rol del Sistema | Descripción |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Personal Fijo (Dev)** | 1 | (Ver tabla de `seed dev`) | (Ver tabla de `seed dev`) | `admin` | Administrador de desarrollo |
| **Psicólogos Adicionales** | 12 | `psicologo.[001-012]@utcare.local` | Dinámico (según nombre ficticio) | `psicologo` | Psicólogos de apoyo para carga masiva |
| **Enfermeros Adicionales** | 12 | `enfermero.[001-012]@utcare.local` | Dinámico (según nombre ficticio) | `enfermero` | Enfermeros de apoyo para carga masiva |
| **Alumnos (Pacientes)** | 500 | `alumno.[1000-1499]@utcare.local` | Dinámico (según nombre ficticio) | `patient` | Expedientes de alumnos cargados |

> **Comando de ejecución:**
> * Solo siembra: `npm run prisma:seed:robust`
> * Reinicio base + siembra: `npm run prisma:reset:seed:robust`

---

## 🔐 Matriz de Roles y Permisos (RBAC)

| Recurso / Acción | 👨‍💼 Admin | 🧠 Psicología (Coord) | 🏥 Enfermería (Coord) | 👨‍⚕️ Psicólogo | 👩‍⚕️ Enfermero |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **👥 Pacientes** | | | | | |
| Listar / Ver | 👁️ | ✅ | ✅ | ✅ | ✅ |
| Crear / Editar | ❌ | ✅ | ❌ | ✅ | ✅ |
| Eliminar | ❌ | ✅ | ❌ | ✅ | ❌ |
| **📋 Expedientes Clínicos** | ❌ | ✅ | ✅* | ✅ | ✅** |
| Agregar diagnóstico (CIE/DSM) | ❌ | ❌ | ❌ | ✅ | ❌ |
| **📅 Citas** | | | | | |
| Ver | ✅ | ✅ | ✅ | ✅ | ✅*** |
| Crear / Editar / Cancelar | ❌ | ✅ | ❌ | ✅ | ❌ |
| **💬 Sesiones de Terapia** | ❌ | ✅ | 👁️ | ✅ | ❌ |
| **📊 Evaluaciones** | ❌ | ✅ | ❌ | ✅ | ❌ |
| **💊 Medicamentos (Inventario)**| | | | | |
| Ver | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear nuevo / Editar stock | ❌ | ❌ | ✅ | ❌ | ✅ |

*   `*` Restringido a pacientes que tengan al menos una atención en enfermería.
*   `**` Solo ve historial de enfermería (no psicológico).
*   `***` Solo ve sus citas asignadas en el módulo.

---

## 📡 Documentación de Endpoints de la API

La API cuenta con una especificación OpenAPI completa expuesta a través de **Swagger UI** en:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)** (con el servidor corriendo).

A continuación, se detalla un resumen estructurado de los endpoints disponibles:

### 🔑 Módulo de Autenticación (`/api/auth`)
Rutas públicas para control de accesos, recuperación de contraseña y confirmaciones.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Autenticación con username y contraseña. Retorna tokens JWT. |
| `POST` | `/api/auth/register` | Público | Registro inicial de usuarios en el sistema. |
| `POST` | `/api/auth/refresh-token` | Público | Emisión de nuevo access token usando un refresh token válido. |
| `POST` | `/api/auth/logout` | Autenticado | Invalida el token del usuario y cierra la sesión. |
| `POST` | `/api/auth/confirm-account` | Público | Activa y confirma una cuenta nueva mediante un token enviado por correo. |
| `POST` | `/api/auth/confirm-email` | Público | **[Fase 2]** Consolida el cambio de correo electrónico validando el token de confirmación de 2h. |
| `POST` | `/api/auth/forgot-password` | Público | Envía enlace seguro de recuperación de contraseña por correo. |
| `POST` | `/api/auth/reset-password` | Público | Restablece la contraseña de usuario validando el token de recuperación. |

### 👥 Módulo de Usuarios (`/api/users`)
Gestión de cuentas de personal de salud y perfiles personales.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Autenticado | Obtiene los detalles de perfil del usuario logueado. |
| `PUT` | `/api/users/me` | Autenticado | **[Fase 1 y 2]** Actualiza información del usuario (Username con cooldown, email con doble confirmación). |
| `POST` | `/api/users/change-password` | Autenticado | Permite al usuario cambiar su propia contraseña. |
| `GET` | `/api/users/me/careers` | `psicologo` | Obtiene las carreras que tiene asignadas el psicólogo logueado. |
| `GET` | `/api/users` | `admin`, `coordinador_*` | Lista los usuarios del sistema (con filtros). |
| `GET` | `/api/users/:id` | `admin`, `coordinador_*` | Obtiene la información detallada de un usuario por su ID. |
| `POST` | `/api/users` | `admin` | Crea un nuevo usuario en la base de datos. |
| `PUT` | `/api/users/:id` | `admin`, `coordinador_*` | Edita los datos de un usuario por su ID. |
| `DELETE`| `/api/users/:id` | `admin`, `coordinador_*` | Eliminación lógica (desactivación) de un usuario. |
| `DELETE`| `/api/users/:id/permanent` | `admin` | Eliminación física definitiva de la base de datos. |
| `POST` | `/api/users/:id/resend-confirmation` | `admin` | Reenvía el correo de confirmación de cuenta. |
| `POST` | `/api/users/:id/reset-password-admin` | `admin` | Restablece la contraseña de un usuario directamente desde consola admin. |

### 👥 Módulo de Pacientes (`/api/patients`)
Registro de alumnos atendidos.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patients` | Clínicos | Obtiene la lista completa de alumnos/pacientes. |
| `GET` | `/api/patients/:id` | Clínicos | Obtiene detalles de un paciente específico. |
| `GET` | `/api/patients/by-enrollment/:number` | Clínicos | Busca un paciente por su matrícula o número de empleado. |
| `POST` | `/api/patients` | Psicólogo, Enfermeros | Registra un nuevo paciente en la institución. |
| `PUT` | `/api/patients/:id` | Personal Clínico | Modifica la información del paciente. |
| `DELETE`| `/api/patients/:id` | Psicólogo, Coordinadores | Elimina un paciente del sistema. |

### 📋 Módulo de Expedientes Clínicos (`/api/medical-records`)
Historias clínicas compartidas.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medical-records` | Personal Clínico | Lista los expedientes clínicos del sistema. |
| `GET` | `/api/medical-records/patient/:patientId` | Personal Clínico | Obtiene el expediente de un paciente. |
| `POST` | `/api/medical-records/ensure-for-patient` | Clínicos Autorizados | Asegura que un paciente cuente con expediente clínico base. |
| `POST` | `/api/medical-records` | Clínicos Autorizados | Crea un nuevo historial clínico para un paciente. |
| `GET` | `/api/medical-records/:id` | Personal Clínico | Obtiene el detalle de un expediente clínico por ID. |
| `PUT` | `/api/medical-records/:id` | Personal Clínico | Modifica antecedentes u observaciones del expediente. |
| `POST` | `/api/medical-records/:id/diagnoses` | `psicologo` | Añade diagnósticos clínicos codificados (CIE-10 o DSM-5). |

### 📅 Módulo de Citas (`/api/appointments`)
Control y agenda de consultas, incluyendo el control de la fila virtual (lista de espera).

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments` | Todos (RBAC interno) | Lista las citas programadas (el enfermero solo ve las suyas). |
| `POST` | `/api/appointments` | `psicologo`, `coordinador_psicologia` | Programa una nueva cita clínica. |
| `GET` | `/api/appointments/:id` | Personal Clínico | Obtiene el detalle de un cita específica. |
| `PUT` | `/api/appointments/:id` | `psicologo`, `coordinador_psicologia` | Modifica la fecha, hora, estado o detalles de la cita. |
| `DELETE`| `/api/appointments/:id` | `psicologo`, `coordinador_psicologia` | Cancela y elimina una cita médica. |
| `GET` | `/api/appointments/queue` | Personal Clínico | Obtiene el listado de alumnos/pacientes en la fila virtual. |
| `PUT` | `/api/appointments/queue/:id/status` | `psicologo`, `coordinador_psicologia` | Actualiza el estado de un registro de la fila virtual (ej. a `'programada'`). |
| `POST` | `/api/appointments/queue/join` | Público | Registra a un alumno/paciente en la fila virtual (Kiosko). |

### 💊 Módulo de Medicamentos (`/api/medications`)
Control de stock y farmacia interna.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medications` | Todos | Lista el inventario de medicamentos disponibles. |
| `POST` | `/api/medications` | `enfermero`, `coordinador_enfermeria` | Registra un nuevo medicamento en farmacia. |
| `GET` | `/api/medications/:id` | Todos | Obtiene detalles y stock de un medicamento. |
| `PUT` | `/api/medications/:id` | `enfermero`, `coordinador_enfermeria` | Edita el stock o propiedades del medicamento. |
| `DELETE`| `/api/medications/:id` | `enfermero`, `coordinador_enfermeria` | Da de baja lógica un medicamento en el inventario. |

### 🩺 Módulo de Atención de Enfermería (`/api/nursing-attentions`)
Atenciones básicas de salud y somatometría.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/nursing-attentions` | Clínicos | Obtiene la bitácora de atenciones de enfermería. |
| `POST` | `/api/nursing-attentions` | `enfermero`, `coordinador_enfermeria` | Registra signos vitales y motivo de consulta de una atención. |
| `GET` | `/api/nursing-attentions/:id` | Clínicos | Detalle de la atención de enfermería por ID. |
| `PUT` | `/api/nursing-attentions/:id` | Enfermeros | Modifica los datos clínicos de la consulta de enfermería. |
| `DELETE`| `/api/nursing-attentions/:id` | `coordinador_enfermeria` | Elimina una consulta de enfermería. |

### 💉 Módulo de Procedimientos de Enfermería (`/api/nursing-procedures`)
Aplicación de inyecciones, curaciones u otros.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/nursing-procedures` | Clínicos | Lista los procedimientos aplicados. |
| `POST` | `/api/nursing-procedures` | `enfermero`, `coordinador_enfermeria` | Registra un procedimiento clínico ejecutado. |

### 💬 Módulo de Sesiones de Psicología (`/api/therapy-sessions`)
Notas de evolución terapéutica y estado de ánimo.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/therapy-sessions` | Psicólogos, `coordinador_enfermeria` (lectura) | Lista las sesiones de psicoterapia. |
| `POST` | `/api/therapy-sessions` | `psicologo`, `coordinador_psicologia` | Registra una nota de evolución de sesión de terapia. |
| `GET` | `/api/therapy-sessions/:id` | Psicólogos, Coordinadora Enfermería | Detalle de la sesión psicológica. |
| `PUT` | `/api/therapy-sessions/:id` | `psicologo`, `coordinador_psicologia` | Edita las notas de evolución de la sesión. |
| `DELETE`| `/api/therapy-sessions/:id` | `coordinador_psicologia` | Elimina una sesión terapéutica. |

### 📈 Módulo de Evaluaciones (`/api/psychometric-tests`)
Pruebas psicométricas aplicadas a los alumnos.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/psychometric-tests` | Psicólogos | Lista las evaluaciones psicométricas aplicadas. |
| `POST` | `/api/psychometric-tests` | `psicologo`, `coordinador_psicologia` | Registra el resultado de una prueba psicométrica. |

### 📤 Módulo de Interconsultas (`/api/interconsultations`)
Canalización a instancias médicas externas.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/interconsultations` | Todos | Lista las solicitudes de interconsulta. |
| `POST` | `/api/interconsultations` | Clínicos | Crea una hoja de envío a interconsulta. |

### 📊 Módulo de Reportes (`/api/reports`)
Reportes estadísticos y demográficos.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports` | Todos | Generación y exportación de reportes clínicos del sistema. |

### 📋 Módulo de Bitácora de Auditoría (`/api/audit-logs`)
Trazabilidad de cambios críticos del sistema.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/audit-logs` | `admin` | Obtiene el historial de eventos críticos de auditoría. |

### 🔔 Módulo de Notificaciones (`/api/notifications`)
Centro de avisos del sistema.

| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Autenticado | Obtiene las alertas de interés del usuario logueado. |

---

## 🛠️ Scripts Disponibles en la API

*   `npm run dev`: Inicia el servidor con hot-reload (desarrollo).
*   `npm run setup`: Realiza la instalación inicial, corre las migraciones y ejecuta el seed de desarrollo.
*   `npm run build`: Compila el código de TypeScript a JavaScript (`/dist`).
*   `npm run start`: Inicia la API compilada en producción (requiere previo build).
*   `npm test`: Ejecuta la suite de pruebas unitarias integradas con **Jest**.
*   `npm run db:up`: Levanta la base de datos PostgreSQL local en Docker.
*   `npm run db:down`: Detiene y apaga el contenedor de base de datos local.
