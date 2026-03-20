# 📋 Módulo de Registros de Auditoría (Audit Logs)

## 📖 Descripción General

El módulo de Registros de Auditoría proporciona un sistema completo de trazabilidad y registro de todas las acciones críticas realizadas en el sistema EHR. Este módulo es fundamental para:

- **Cumplimiento Normativo**: Satisface requisitos HIPAA de auditoría (§164.312(b))
- **Seguridad**: Permite detectar accesos no autorizados y comportamientos anómalos
- **Investigación**: Facilita la investigación de incidentes y análisis forense
- **Transparencia**: Proporciona visibilidad completa de las operaciones del sistema

## 🎯 Características Principales

- ✅ Registro automático de acciones críticas
- ✅ Filtrado avanzado por usuario, acción, entidad y fecha
- ✅ Logs inmutables (solo escritura)
- ✅ Retención por 7 años según HIPAA
- ✅ Captura de metadatos (IP, User-Agent, valores anteriores/nuevos)
- ✅ Integración simple para otros servicios

## 🏗️ Arquitectura

### Estructura de Archivos

```
api/src/
├── services/
│   └── audit-log.service.ts      # Lógica de negocio
├── controllers/
│   └── audit-log.controller.ts   # Controlador HTTP
├── routes/
│   └── audit-log.routes.ts       # Definición de rutas
└── utils/
    └── audit.ts                  # Utilidades y constantes
```

### Modelo de Datos

El modelo `AuditLog` en Prisma contiene:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `userId` | UUID | Usuario que realizó la acción |
| `action` | String | Tipo de acción (CREATE, UPDATE, etc.) |
| `tableName` | String | Tabla/entidad afectada |
| `recordId` | UUID | ID del registro afectado |
| `oldValues` | JSON | Valores anteriores (para UPDATE) |
| `newValues` | JSON | Valores nuevos (para CREATE/UPDATE) |
| `ipAddress` | String | Dirección IP de origen |
| `userAgent` | String | Información del cliente |
| `createdAt` | DateTime | Timestamp de la acción |

## ✅ Registro automático por acción

Cada mutación (create/update/delete) que pase por Prisma se registra en audit log si la petición está autenticada:

1. **Contexto por request** (`app.ts`): Todas las peticiones ejecutan `runWithAuditContext(req, next)`, que guarda IP y User-Agent en AsyncLocalStorage.
2. **Usuario autenticado** (`middleware/auth.ts`): Las rutas que usan `authenticateToken` llaman a `setAuditUserId(payload.userId)` y dejan el `userId` en el mismo contexto.
3. **Middleware de Prisma** (`config/database.ts`): En cada `create`, `update`, `delete`, `upsert`, `createMany`, `updateMany`, `deleteMany`:
   - Si existe `userId` en el contexto, se crea una entrada en `AuditLog` con acción CREATE/UPDATE/DELETE, `tableName` = modelo de Prisma, `recordId`, `oldValues` (en update/delete) y `newValues` (resultado).
   - Las escrituras en la tabla `AuditLog` se excluyen para evitar recursión.

**Rutas que ya registran acciones** (usan `authenticateToken` y por tanto contexto de auditoría):

- **Pacientes**: crear, editar, desactivar (delete) → CREATE/UPDATE en Patient y User.
- **Expedientes médicos**: crear, actualizar, diagnósticos.
- **Citas, sesiones de terapia, evaluaciones psicométricas**: CRUD.
- **Atenciones y procedimientos de enfermería**: CRUD.
- **Usuarios, medicamentos, notificaciones, interconsultas**: CRUD.

**Auth (registro explícito en controlador):**

- **LOGIN**: se registra en `auth.controller` con `createAuditLog` (acción LOGIN, tabla users).
- **LOGOUT**: si el cliente envía el token, se usa `optionalAuthenticateToken` y se registra LOGOUT en el controlador.
- **LOGIN_FAILED**: no se guarda en AuditLog (userId es obligatorio por FK); solo queda en logger.

Para acciones que no sean un create/update/delete de Prisma (por ejemplo VIEW_RECORD o EXPORT), usar `createAuditLog` manualmente en el servicio o controlador (ver `AUDIT_LOG_INTEGRATION.md`).

## 🔌 API Endpoints

### GET /api/audit-logs

Consulta los registros de auditoría con filtrado avanzado.

**Autenticación:** Requerida (Bearer Token)

**Autorización:** `admin`, `coordinador_psicologia`, `coordinador_enfermeria`

#### Parámetros de Query

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | Integer | No | Número de página (default: 1) |
| `limit` | Integer | No | Registros por página (1-100, default: 10) |
| `userId` | UUID | No | Filtrar por ID de usuario |
| `action` | String | No | Filtrar por tipo de acción |
| `tableName` | String | No | Filtrar por tabla afectada |
| `startDate` | ISO 8601 | No | Fecha de inicio (inclusive) |
| `endDate` | ISO 8601 | No | Fecha de fin (inclusive) |

#### Ejemplo de Solicitud

```bash
curl -X GET "http://localhost:5000/api/audit-logs?userId=550e8400-e29b-41d4-a716-446655440000&action=CREATE&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Ejemplo de Respuesta (200 OK)

```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "auditLogs": [
      {
        "id": "a1b2c3d4-e5f6-4789-0abc-def012345678",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "action": "CREATE",
        "tableName": "medical_records",
        "recordId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "oldValues": null,
        "newValues": {
          "patientId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
          "bloodType": "O+",
          "allergies": "Penicillin"
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "createdAt": "2024-02-11T10:30:00Z",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "email": "doctor@hospital.com",
          "firstName": "John",
          "lastName": "Smith",
          "role": "doctor"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

## 💻 Uso Programático

### Desde Otros Servicios

Para registrar eventos de auditoría desde otros servicios, utiliza la función helper:

```typescript
import { createAuditLog, AUDIT_ACTIONS, AUDIT_TABLES } from '../utils/audit';
import { AuthRequest } from '../middleware/auth';

// Ejemplo: Registrar creación de expediente médico
export class MedicalRecordService {
  async create(data: any, req: AuthRequest) {
    const medicalRecord = await prisma.medicalRecord.create({ data });
    
    // Registrar en audit log
    await createAuditLog({
      userId: req.user!.id,
      action: AUDIT_ACTIONS.CREATE,
      tableName: AUDIT_TABLES.MEDICAL_RECORD,
      recordId: medicalRecord.id,
      newValues: data,
      req, // Extrae automáticamente IP y User-Agent
    });
    
    return medicalRecord;
  }
}
```

### Acciones Disponibles (Constantes)

```typescript
// Autenticación
AUDIT_ACTIONS.LOGIN
AUDIT_ACTIONS.LOGOUT
AUDIT_ACTIONS.LOGIN_FAILED
AUDIT_ACTIONS.PASSWORD_CHANGE
AUDIT_ACTIONS.MFA_ENABLE
AUDIT_ACTIONS.MFA_DISABLE

// CRUD
AUDIT_ACTIONS.CREATE
AUDIT_ACTIONS.READ
AUDIT_ACTIONS.UPDATE
AUDIT_ACTIONS.DELETE

// Acceso a datos
AUDIT_ACTIONS.VIEW_RECORD
AUDIT_ACTIONS.SEARCH
AUDIT_ACTIONS.EXPORT
AUDIT_ACTIONS.PRINT

// Administración
AUDIT_ACTIONS.USER_CREATE
AUDIT_ACTIONS.USER_UPDATE
AUDIT_ACTIONS.USER_DELETE
AUDIT_ACTIONS.ROLE_CHANGE
AUDIT_ACTIONS.PERMISSION_GRANT
AUDIT_ACTIONS.PERMISSION_REVOKE
AUDIT_ACTIONS.CONFIG_CHANGE

// Operaciones médicas
AUDIT_ACTIONS.PRESCRIPTION_CREATE
AUDIT_ACTIONS.MEDICATION_ADMIN
AUDIT_ACTIONS.DIAGNOSIS_UPDATE
AUDIT_ACTIONS.NOTE_CREATE
AUDIT_ACTIONS.NOTE_UPDATE
```

### Tablas Disponibles (Constantes)

```typescript
AUDIT_TABLES.USER
AUDIT_TABLES.PATIENT
AUDIT_TABLES.MEDICAL_RECORD
AUDIT_TABLES.PSYCHOLOGY_RECORD
AUDIT_TABLES.NURSING_CONSULTATION
AUDIT_TABLES.PRESCRIPTION
AUDIT_TABLES.MEDICATION_ADMINISTRATION
AUDIT_TABLES.APPOINTMENT
AUDIT_TABLES.THERAPY_SESSION
AUDIT_TABLES.TREATMENT_PLAN
AUDIT_TABLES.INTERCONSULTATION
AUDIT_TABLES.MEDICATION
AUDIT_TABLES.SYSTEM_SETTING
```

## 🔒 Seguridad

### Control de Acceso

- **Lectura de logs**: Solo usuarios con roles `admin`, `coordinador_psicologia`, o `coordinador_enfermeria`
- **Creación de logs**: Automática desde otros servicios (no expuesta como endpoint público)
- **Modificación/Eliminación**: No permitida (logs inmutables)

### Protección de Datos

- Los valores `oldValues` y `newValues` deben sanitizarse para evitar incluir contraseñas u otros datos sensibles
- Los logs están cifrados en reposo según REQ-CONF-001
- Acceso registrado y monitoreado

## 📊 Casos de Uso

### 1. Investigar Cambios en un Expediente

```bash
GET /api/audit-logs?tableName=medical_records&recordId=3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### 2. Revisar Actividad de un Usuario

```bash
GET /api/audit-logs?userId=550e8400-e29b-41d4-a716-446655440000&startDate=2024-02-01T00:00:00Z
```

### 3. Auditar Intentos de Login Fallidos

```bash
GET /api/audit-logs?action=LOGIN_FAILED&startDate=2024-02-11T00:00:00Z
```

### 4. Monitorear Prescripciones de Medicamentos

```bash
GET /api/audit-logs?action=PRESCRIPTION_CREATE&tableName=prescriptions
```

## 🧪 Testing

### Pruebas Manuales con cURL

```bash
# 1. Obtener token de autenticación
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"password123"}' \
  | jq -r '.data.accessToken')

# 2. Consultar audit logs
curl -X GET "http://localhost:5000/api/audit-logs?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

### Crear Log de Auditoría Manualmente (para testing)

```typescript
import auditLogService from './services/audit-log.service';

const log = await auditLogService.createAuditLog({
  userId: '550e8400-e29b-41d4-a716-446655440000',
  action: 'CREATE',
  tableName: 'medical_records',
  recordId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  newValues: { bloodType: 'O+' },
  ipAddress: '192.168.1.100',
  userAgent: 'Test Client',
});
```

## 📋 Cumplimiento Normativo

### HIPAA (§164.312(b) - Audit Controls)

✅ **Implementado:**
- Registro de todas las acciones de acceso y modificación de PHI
- Información completa de quién, qué, cuándo, dónde
- Retención de 7 años
- Logs inmutables

### Alineación con Reglas de Negocio

✅ **RN-AUD-001**: Eventos que deben auditarse
- Todos los eventos críticos definidos están soportados

✅ **RN-AUD-002**: Información del log de auditoría
- Timestamp, usuario, acción, recurso, valores, IP, resultado

✅ **RN-AUD-003**: Retención de logs
- Estructura lista para política de retención de 7 años

## 🚀 Próximos Pasos

### Mejoras Planificadas

1. **Dashboard de Auditoría**: Interfaz visual para coordinadores
2. **Alertas Automáticas**: Notificaciones para eventos sospechosos
3. **Exportación de Reportes**: Generación de reportes de cumplimiento
4. **Búsqueda Avanzada**: Filtros más granulares y búsqueda de texto completo
5. **Retención Automática**: Implementar políticas de archivado/eliminación según normativa

### Integración Pendiente

Los siguientes servicios deben integrarse para registrar eventos:
- [ ] Auth Service (login, logout, cambios de contraseña)
- [ ] Patient Service (crear, actualizar pacientes)
- [ ] Medical Record Service (crear, actualizar expedientes)
- [ ] Prescription Service (crear, administrar medicamentos)
- [ ] User Service (crear, actualizar, eliminar usuarios)
- [ ] Appointment Service (crear, cancelar citas)

## 📚 Referencias

- **Prisma Schema**: `api/prisma/schema.prisma` (modelo AuditLog)
- **OpenAPI**: `api/openapi.yaml` (especificación completa)
- **Seguridad**: `documents/Req-Seguridad.md` (REQ-AUD-001 a REQ-AUD-006)
- **Reglas de Negocio**: `documents/docs/requisitos/Reglas-Negocio.md` (RN-AUD-001 a RN-AUD-003)

## 📞 Soporte

Para preguntas o problemas con el módulo de Auditoría:
- **Desarrollo**: Revisar código en `api/src/services/audit-log.service.ts`
- **Documentación**: Este archivo y `openapi.yaml`
- **Cumplimiento**: Consultar `Req-Seguridad.md`

---

**Última actualización**: 2024-02-11  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado y Documentado
