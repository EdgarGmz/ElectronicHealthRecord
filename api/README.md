# ⚙️ EHR System Backend - API & Database

> **Navegación Rápida:**
> *   **[🏥 Regresar al README Principal](../README.md)**
> *   **[💻 Cliente Web (ut-care)](../ut-care/README.md)**
> *   **[📱 Cliente Móvil (AppEHR)](../AppEHR/README.md)**

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

Una vez que el contenedor de Docker de PostgreSQL esté activo (ejecutando `docker compose up -d` en la raíz del proyecto):

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
   El seed soporta dos entornos según el valor de la variable de entorno `SEED_TARGET`:
   
   *   **Seed de Desarrollo (Recomendado en local):**
       Crea carreras, personal médico de prueba, historiales médicos completos y 500 alumnos ficticios para pruebas de rendimiento.
       ```bash
       SEED_TARGET=dev npx prisma db seed
       ```
   *   **Seed de Producción Mínima:**
       Crea únicamente las carreras universitarias y el personal médico y administrativo inicial sin datos de pacientes.
       ```bash
       SEED_TARGET=prod npx prisma db seed
       ```

---

## 👤 Cuentas de Prueba (Seed DEV)

Para realizar pruebas locales, puedes iniciar sesión en cualquier cliente utilizando las siguientes credenciales de prueba precargadas por el seed. **El inicio de sesión se realiza de forma exclusiva con el Nombre de Usuario (Username)**. La contraseña de acceso para todas las cuentas es: `Password123!`

| Nombre Completo | Nombre de Usuario (Username) | Correo Electrónico | Rol del Sistema | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| Xochilt Clara Villar Diego | `XochiltVLL` | `admin@ehr-system.com` | `admin` | Administrador / Auditor del sistema |
| Orlando de Jesus Casas Davila | `OrlandoCSS` | `orlando.casas@ehr-system.com` | `coordinador_psicologia` | Coordinador de Psicología |
| Edgar Tiburcio Gomez Moran | `EdgarGMZ` | `edgar.tiburcio@ehr-system.com` | `coordinador_enfermeria` | Coordinador de Enfermería |
| Carlos Alexis Rodriguez Garcia | `CarlosRDR` | `carlos.rodriguez@ehr-system.com` | `psicologo` | Psicólogo Clínico Operativo |
| Daniela Mayte Guevara Castillo | `DanielaGVR` | `daniela.guevara@ehr-system.com` | `enfermero` | Personal de Enfermería |

---

## 🔐 Matriz de Roles y Permisos (RBAC)

La API cuenta con un Middleware de autorización estricto que restringe el acceso a cada endpoint según el rol definido en `api/src/constants/roles.ts`:

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

*   **Leyenda:** ✅ Acceso Total | ❌ Acceso Denegado | 👁️ Solo Lectura.
*   `*` Restringido a pacientes que tengan al menos una atención en enfermería.
*   `**` Solo ve historial de enfermería (no psicológico).
*   `***` Solo ve sus citas asignadas en el módulo.

---

## 📖 Documentación interactiva de la API

El servidor incluye la especificación OpenAPI documentada de forma visual mediante **Swagger UI**.
Con la API ejecutándose, puedes acceder a la documentación interactiva en:

👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

---

## 🛠️ Scripts Disponibles en la API

*   `npm run dev`: Inicia el servidor con hot-reload (desarrollo).
*   `npm run setup`: Realiza la instalación inicial, corre migraciones y ejecuta el seed de desarrollo.
*   `npm run build`: Compila el código de TypeScript a JavaScript.
*   `npm test`: Ejecuta la suite de pruebas unitarias integradas con **Jest**.
