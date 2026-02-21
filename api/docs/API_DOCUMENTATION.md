# 📚 Documentación de la API - Electronic Health Record

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Especificación OpenAPI](#especificación-openapi)
- [Arquitectura de la API](#arquitectura-de-la-api)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Módulos y Endpoints](#módulos-y-endpoints)
- [Cómo Usar la Documentación](#cómo-usar-la-documentación)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Estado](#códigos-de-estado)
- [Versionamiento](#versionamiento)

---

## 🎯 Introducción

Esta documentación describe la API REST del sistema Electronic Health Record (EHR), diseñada para la gestión integral de registros de salud en departamentos de enfermería y psicología.

### Características Principales

- ✅ **RESTful API** - Arquitectura basada en estándares REST
- 🔐 **Seguridad JWT** - Autenticación y autorización con tokens
- 📊 **Documentación OpenAPI 3.0** - Especificación estándar de la industria
- 🔄 **Operaciones CRUD** - Para todos los recursos principales
- 📈 **Paginación** - En todos los endpoints de listado
- 🎯 **Filtros y Búsqueda** - Capacidades avanzadas de consulta
- 📝 **Validación** - Validación exhaustiva de datos de entrada
- 🚨 **Manejo de Errores** - Respuestas de error estandarizadas

---

## 📄 Especificación OpenAPI

La especificación completa de la API está disponible en formato OpenAPI 3.0:

- **Archivo:** [`openapi.yaml`](./openapi.yaml)
- **Versión:** 1.0.0
- **Formato:** YAML (OpenAPI 3.0.3)

### Visualizar la Documentación

Existen varias formas de visualizar y probar la API:

#### 1. Swagger UI (Recomendado para Desarrollo)

```bash
# Instalar dependencias
cd api
npm install

# Método 1: Servidor de desarrollo con endpoint /api-docs
npm run dev
# Acceder a: http://localhost:5000/api-docs

# Método 2: Swagger Editor online
# Visitar: https://editor.swagger.io/
# Importar el archivo openapi.yaml
```

#### 2. ReDoc (Recomendado para Documentación)

```bash
# Instalar redoc-cli globalmente
npm install -g redoc-cli

# Servir documentación interactiva
cd api
npm run docs:serve
# Acceder a: http://localhost:8080
```

#### 3. Herramientas de Terceros

- **Postman**: Importar `openapi.yaml` directamente
- **Insomnia**: Importar como OpenAPI 3.0
- **VS Code**: Usar extensión "OpenAPI (Swagger) Editor"

---

## 🏗️ Arquitectura de la API

### URL Base

```
Development:  http://localhost:5000/api
Staging:      https://staging-api.ehr-system.com/api
Production:   https://api.ehr-system.com/api
```

### Convenciones REST

| Método HTTP | Operación | Descripción |
|-------------|-----------|-------------|
| `GET` | Read | Obtener recurso(s) |
| `POST` | Create | Crear nuevo recurso |
| `PUT` | Update | Actualizar recurso completo |
| `PATCH` | Partial Update | Actualizar parcialmente |
| `DELETE` | Delete | Eliminar recurso |

### Estructura de Respuestas

Todas las respuestas siguen un formato consistente:

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    // Datos solicitados
  },
  "pagination": {  // Solo en listados
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 95,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": [
      // Detalles adicionales si aplica
    ]
  }
}
```

---

## 🔐 Autenticación y Autorización

### Sistema de Autenticación

La API utiliza **JSON Web Tokens (JWT)** para autenticación.

#### Flujo de Autenticación

1. **Login**: `POST /api/auth/login`
   ```json
   {
     "email": "doctor@hospital.com",
     "password": "SecurePass123!"
   }
   ```

2. **Respuesta con Tokens**:
   ```json
   {
     "success": true,
     "data": {
       "user": { /* datos del usuario */ },
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "expiresIn": 604800
     }
   }
   ```

3. **Uso del Token**: Incluir en todas las peticiones
   ```
   Authorization: Bearer <accessToken>
   ```

#### Refrescar Token

Cuando el `accessToken` expire, usar el `refreshToken`:

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador del sistema | Acceso completo |
| `psychologist` | Psicólogo | Expedientes, sesiones terapéuticas, evaluaciones |
| `nurse` | Enfermero/a | Medicamentos, procedimientos, citas |
| `doctor` | Médico general | Expedientes médicos, diagnósticos |
| `receptionist` | Recepcionista | Citas, datos básicos de pacientes |

---

## 📚 Módulos y Endpoints

### 1. 👤 Autenticación (`/auth`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/auth/login` | POST | Iniciar sesión |
| `/auth/logout` | POST | Cerrar sesión |
| `/auth/refresh` | POST | Refrescar token |
| `/auth/forgot-password` | POST | Recuperar contraseña |
| `/auth/reset-password` | POST | Resetear contraseña |

### 2. 👥 Pacientes (`/patients`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/patients` | GET | Listar pacientes |
| `/patients` | POST | Registrar nuevo paciente |
| `/patients/{id}` | GET | Obtener paciente |
| `/patients/{id}` | PUT | Actualizar paciente |
| `/patients/{id}` | DELETE | Eliminar paciente |

**Filtros disponibles**: `search`, `status`, `page`, `limit`, `sort`, `order`

### 3. 📋 Expedientes Médicos (`/medical-records`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/medical-records` | GET | Listar expedientes |
| `/medical-records` | POST | Crear expediente |
| `/medical-records/{id}` | GET | Obtener expediente |
| `/medical-records/{id}` | PUT | Actualizar expediente |
| `/medical-records/{id}/diagnoses` | POST | Agregar diagnóstico |

**Soporte para**: DSM-5, CIE-10, CIE-11

### 4. 📅 Citas (`/appointments`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/appointments` | GET | Listar citas |
| `/appointments` | POST | Agendar cita |
| `/appointments/{id}` | GET | Obtener cita |
| `/appointments/{id}` | PUT | Reprogramar cita |
| `/appointments/{id}` | DELETE | Cancelar cita |
| `/appointments/availability` | GET | Consultar disponibilidad |

**Tipos de consulta**: `psychology` (50 min), `nursing` (10-15 min), `general`

### 5. 💊 Medicamentos (`/medications`, `/prescriptions`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/medications` | GET | Catálogo de medicamentos |
| `/medications` | POST | Registrar medicamento |
| `/prescriptions` | GET | Listar prescripciones |
| `/prescriptions` | POST | Crear prescripción |
| `/prescriptions/{id}/administrations` | POST | Registrar administración |

**Verificaciones**: Las 5 normas correctas (paciente, medicamento, dosis, vía, hora)

### 6. 🧠 Sesiones Terapéuticas (`/therapy-sessions`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/therapy-sessions` | GET | Listar sesiones |
| `/therapy-sessions` | POST | Registrar sesión |
| `/therapy-sessions/{id}` | GET | Obtener sesión |
| `/therapy-sessions/{id}` | PUT | Actualizar sesión |

**Tipos**: Individual, Grupal, Familiar, Pareja

### 7. 🧪 Evaluaciones Psicométricas (`/psychometric-tests`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/psychometric-tests` | GET | Listar evaluaciones |
| `/psychometric-tests` | POST | Registrar evaluación |

**Tests soportados**: Wizz, Wazz, Escalas de Beck, y otros

### 8. 🔄 Interconsultas (`/interconsultations`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/interconsultations` | GET | Listar interconsultas |
| `/interconsultations` | POST | Crear interconsulta |
| `/interconsultations/{id}/response` | POST | Responder interconsulta |

**Departamentos**: Psicología, Enfermería, General

### 9. 📊 Reportes (`/reports`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/reports/statistics` | GET | Estadísticas generales |
| `/reports/consultations` | GET | Reporte de consultas |
| `/reports/diagnoses` | GET | Reporte de diagnósticos |

**Formatos de exportación**: JSON, PDF, Excel

### 10. 📝 Auditoría (`/audit-logs`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/audit-logs` | GET | Consultar logs |

**Acceso**: Solo administradores

### 11. 👨‍⚕️ Usuarios (`/users`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/users` | GET | Listar usuarios |
| `/users` | POST | Crear usuario |
| `/users/{id}` | GET | Obtener usuario |
| `/users/{id}` | PUT | Actualizar usuario |
| `/users/{id}` | DELETE | Desactivar usuario |

### 12. 🔔 Notificaciones (`/notifications`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/notifications` | GET | Listar notificaciones |
| `/notifications/{id}/read` | PUT | Marcar como leída |

---

## 💻 Cómo Usar la Documentación

### 1. Explorar con Swagger UI

```bash
# Iniciar el servidor de desarrollo
cd api
npm run dev

# Abrir en navegador
http://localhost:5000/api-docs
```

En Swagger UI podrás:
- ✅ Ver todos los endpoints disponibles
- ✅ Explorar esquemas de datos
- ✅ Probar endpoints interactivamente
- ✅ Ver ejemplos de request/response
- ✅ Copiar comandos cURL

### 2. Importar en Postman

1. Abrir Postman
2. Click en **Import**
3. Seleccionar `openapi.yaml`
4. Postman generará automáticamente:
   - Colección de endpoints
   - Variables de entorno
   - Ejemplos pre-configurados

### 3. Generar Cliente SDK

Usar herramientas como [OpenAPI Generator](https://openapi-generator.tech/):

```bash
# Generar cliente TypeScript
openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g typescript-axios \
  -o Kiosko/src/services/api-client

# Generar cliente Python
openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g python \
  -o python-client
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Registrar un Paciente

**Request:**
```bash
POST /api/patients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "registrationNumber": "20240001",
  "firstName": "Juan",
  "lastName": "Pérez García",
  "dateOfBirth": "2000-05-15",
  "gender": "male",
  "phone": "+52-555-1234567",
  "email": "juan.perez@university.edu",
  "emergencyContact": {
    "name": "María Pérez",
    "relationship": "madre",
    "phone": "+52-555-7654321"
  },
  "academicInfo": {
    "career": "Ingeniería en Sistemas",
    "group": "5A",
    "semester": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "registrationNumber": "20240001",
    "firstName": "Juan",
    "lastName": "Pérez García",
    "age": 23,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Ejemplo 2: Agendar Cita

**Request:**
```bash
POST /api/appointments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "professionalId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "type": "psychology",
  "date": "2024-01-20",
  "startTime": "10:00",
  "duration": 50,
  "reason": "Primera consulta - evaluación inicial"
}
```

### Ejemplo 3: Registrar Sesión Terapéutica

**Request:**
```bash
POST /api/therapy-sessions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "individual",
  "date": "2024-01-20T10:00:00Z",
  "duration": 50,
  "progressNotes": "El paciente muestra avances significativos en el manejo de ansiedad. Se trabajó con técnicas de respiración y reestructuración cognitiva.",
  "interventions": "Terapia Cognitivo-Conductual, técnicas de relajación",
  "homework": "Practicar ejercicios de respiración diafragmática 3 veces al día",
  "nextSessionDate": "2024-01-27"
}
```

### Ejemplo 4: Crear Prescripción y Administrar Medicamento

**Request 1: Crear Prescripción**
```bash
POST /api/prescriptions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "medicationId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "dosage": "500mg",
  "frequency": "Cada 8 horas",
  "route": "oral",
  "startDate": "2024-01-15",
  "duration": "7 días",
  "instructions": "Tomar con alimentos. No suspender tratamiento antes de tiempo."
}
```

**Request 2: Registrar Administración**
```bash
POST /api/prescriptions/{prescriptionId}/administrations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "administeredAt": "2024-01-15T08:00:00Z",
  "dosageAdministered": "500mg",
  "route": "oral",
  "adverseReaction": false,
  "notes": "Medicamento administrado según prescripción. Paciente tolera bien."
}
```

### Ejemplo 5: Obtener Estadísticas

**Request:**
```bash
GET /api/reports/statistics?startDate=2024-01-01&endDate=2024-01-31&department=all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "consultations": {
      "total": 245,
      "byType": {
        "psychology": 150,
        "nursing": 85,
        "general": 10
      },
      "byStatus": {
        "completed": 230,
        "cancelled": 10,
        "noShow": 5
      }
    },
    "patients": {
      "total": 180,
      "new": 25,
      "active": 155
    },
    "diagnoses": {
      "total": 120,
      "mostFrequent": [
        {
          "name": "Trastorno de Ansiedad Generalizada",
          "code": "F41.1",
          "count": 35,
          "percentage": 29.2
        },
        {
          "name": "Episodio Depresivo",
          "code": "F32.1",
          "count": 28,
          "percentage": 23.3
        }
      ]
    }
  }
}
```

---

## 🚦 Códigos de Estado HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **204** | No Content | Operación exitosa sin contenido |
| **400** | Bad Request | Solicitud malformada |
| **401** | Unauthorized | No autenticado |
| **403** | Forbidden | Sin permisos |
| **404** | Not Found | Recurso no encontrado |
| **422** | Unprocessable Entity | Error de validación |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Error del servidor |

---

## 🔄 Versionamiento

### Estrategia de Versiones

La API utiliza versionamiento semántico (SemVer):

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Correcciones de bugs compatibles

### Versión Actual: `v1.0.0`

```
URL Base: /api (versión actual implícita)
Futuras versiones: /api/v2, /api/v3, etc.
```

### Política de Deprecación

1. Las características deprecadas se marcarán con `deprecated: true` en OpenAPI
2. Se mantendrán por al menos 6 meses
3. Se notificará con headers de respuesta:
   ```
   X-API-Deprecated: true
   X-API-Deprecation-Date: 2024-12-31
   X-API-Sunset-Date: 2025-06-30
   ```

---

## 📞 Soporte y Contacto

### Recursos Adicionales

- 📖 **Especificación OpenAPI**: [`openapi.yaml`](./openapi.yaml)
- 📚 **README Backend**: [`README.md`](./README.md)
- 🏗️ **Estructura del Proyecto**: [`../PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md)
- 🔒 **Seguridad**: [`../documents/Analisis-Riesgos-Amenazas.md`](../documents/Analisis-Riesgos-Amenazas.md)

### Contacto

- **Email de Soporte**: support@ehr-system.com
- **Equipo de Desarrollo**: dev@ehr-system.com
- **Issues**: [GitHub Issues](https://github.com/EdgarGmz/ElectronicHealthRecord/issues)
- **Discussions**: [GitHub Discussions](https://github.com/EdgarGmz/ElectronicHealthRecord/discussions)

---

## ✅ Checklist de Implementación

Para el equipo de desarrollo backend:

### Fase 1: Setup Inicial
- [ ] Configurar Express server
- [ ] Implementar middleware de autenticación JWT
- [ ] Configurar TypeORM con MySQL
- [ ] Setup de variables de entorno
- [ ] Configurar CORS y seguridad (Helmet)
- [ ] Implementar rate limiting

### Fase 2: Autenticación
- [ ] Implementar `/auth/login`
- [ ] Implementar `/auth/logout`
- [ ] Implementar `/auth/refresh`
- [ ] Implementar recuperación de contraseña
- [ ] Sistema de roles y permisos

### Fase 3: Módulos Core
- [ ] CRUD de Pacientes
- [ ] CRUD de Expedientes Médicos
- [ ] Sistema de Diagnósticos
- [ ] Sistema de Citas
- [ ] Verificación de disponibilidad

### Fase 4: Módulos Especializados
- [ ] Gestión de Medicamentos
- [ ] Sistema de Prescripciones
- [ ] Administración de medicamentos
- [ ] Sesiones Terapéuticas
- [ ] Evaluaciones Psicométricas

### Fase 5: Funcionalidades Avanzadas
- [ ] Interconsultas
- [ ] Sistema de Reportes
- [ ] Generación de PDFs
- [ ] Logs de Auditoría
- [ ] Sistema de Notificaciones

### Fase 6: Integración Swagger
- [ ] Instalar swagger-ui-express
- [ ] Configurar endpoint `/api-docs`
- [ ] Validar especificación OpenAPI
- [ ] Probar endpoints desde Swagger UI

### Fase 7: Testing
- [ ] Tests unitarios (>80% coverage)
- [ ] Tests de integración
- [ ] Tests E2E de flujos críticos
- [ ] Pruebas de seguridad
- [ ] Pruebas de carga

### Fase 8: Documentación
- [ ] Comentarios JSDoc en código
- [ ] Actualizar README con instrucciones
- [ ] Ejemplos de uso en Postman
- [ ] Guía de deployment
- [ ] Troubleshooting común

---

**Última actualización**: 8 de Febrero, 2026  
**Versión de la API**: 1.0.0  
**Versión de OpenAPI**: 3.0.3

---

<div align="center">

**[⬆ Volver arriba](#-documentación-de-la-api---electronic-health-record)**

Desarrollado con ❤️ por el equipo EHR

</div>
