# 🔗 Guía de Integración de Audit Logs

Este documento proporciona ejemplos prácticos de cómo integrar el módulo de Audit Logs en los servicios existentes.

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Ejemplo: Autenticación](#ejemplo-autenticación)
3. [Ejemplo: Expedientes Médicos](#ejemplo-expedientes-médicos)
4. [Ejemplo: Prescripciones](#ejemplo-prescripciones)
5. [Mejores Prácticas](#mejores-prácticas)

---

## 🚀 Preparación

### 1. Importar Utilidades

```typescript
import { createAuditLog, AUDIT_ACTIONS, AUDIT_TABLES } from '../utils/audit';
import { AuthRequest } from '../middleware/auth';
```

### 2. Asegurarse de que el Request tenga tipo AuthRequest

Para servicios que requieren autenticación, usa `AuthRequest` en lugar de `Request`:

```typescript
import { AuthRequest } from '../middleware/auth';

async myMethod(req: AuthRequest, res: Response) {
  // req.user contiene el usuario autenticado
  const userId = req.user!.id;
}
```

---

## 🔐 Ejemplo: Autenticación

### Login Exitoso

```typescript
// api/src/services/auth.service.ts
import { createAuditLog, AUDIT_ACTIONS, AUDIT_TABLES } from '../utils/audit';

export class AuthService {
  async login(email: string, password: string, req: Request) {
    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Registrar intento fallido
      await createAuditLog({
        userId: user?.id || 'unknown',
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        tableName: AUDIT_TABLES.USER,
        recordId: user?.id || '00000000-0000-0000-0000-000000000000',
        newValues: { email, reason: 'User not found' },
        req,
      });
      throw new AppError('Invalid credentials', 401);
    }

    // Verificar contraseña
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      // Registrar intento fallido
      await createAuditLog({
        userId: user.id,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        tableName: AUDIT_TABLES.USER,
        recordId: user.id,
        newValues: { email, reason: 'Invalid password' },
        req,
      });
      throw new AppError('Invalid credentials', 401);
    }

    // Generar tokens
    const tokens = generateTokens(user);

    // Registrar login exitoso
    await createAuditLog({
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN,
      tableName: AUDIT_TABLES.USER,
      recordId: user.id,
      newValues: { email },
      req,
    });

    return { user, tokens };
  }
}
```

### Logout

```typescript
async logout(req: AuthRequest) {
  const userId = req.user!.id;
  
  // Invalidar token (tu lógica aquí)
  await invalidateToken(req.headers.authorization!);

  // Registrar logout
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.LOGOUT,
    tableName: AUDIT_TABLES.USER,
    recordId: userId,
    req,
  });
}
```

### Cambio de Contraseña

```typescript
async changePassword(userId: string, oldPassword: string, newPassword: string, req: AuthRequest) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Verificar contraseña antigua...
  // Hashear nueva contraseña...
  
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  // Registrar cambio de contraseña
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.PASSWORD_CHANGE,
    tableName: AUDIT_TABLES.USER,
    recordId: userId,
    // NO incluir contraseñas en los valores
    newValues: { changedAt: new Date() },
    req,
  });
}
```

---

## 🏥 Ejemplo: Expedientes Médicos

### Crear Expediente

```typescript
// api/src/services/medical-record.service.ts
import { createAuditLog, AUDIT_ACTIONS, AUDIT_TABLES } from '../utils/audit';

export class MedicalRecordService {
  async create(data: CreateMedicalRecordDto, req: AuthRequest) {
    const userId = req.user!.id;
    
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Registrar creación
    await createAuditLog({
      userId,
      action: AUDIT_ACTIONS.CREATE,
      tableName: AUDIT_TABLES.MEDICAL_RECORD,
      recordId: medicalRecord.id,
      newValues: {
        patientId: data.patientId,
        bloodType: data.bloodType,
        allergies: data.allergies,
        // Solo incluir campos relevantes, no sensibles
      },
      req,
    });

    return medicalRecord;
  }
}
```

### Actualizar Expediente

```typescript
async update(id: string, data: UpdateMedicalRecordDto, req: AuthRequest) {
  const userId = req.user!.id;
  
  // Obtener valores actuales
  const oldRecord = await prisma.medicalRecord.findUnique({ where: { id } });
  
  if (!oldRecord) {
    throw new AppError('Medical record not found', 404);
  }

  // Actualizar
  const updatedRecord = await prisma.medicalRecord.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
    },
  });

  // Registrar actualización con valores antiguos y nuevos
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.UPDATE,
    tableName: AUDIT_TABLES.MEDICAL_RECORD,
    recordId: id,
    oldValues: {
      bloodType: oldRecord.bloodType,
      allergies: oldRecord.allergies,
      chronicConditions: oldRecord.chronicConditions,
    },
    newValues: {
      bloodType: data.bloodType,
      allergies: data.allergies,
      chronicConditions: data.chronicConditions,
    },
    req,
  });

  return updatedRecord;
}
```

### Ver Expediente (Lectura)

```typescript
async getById(id: string, req: AuthRequest) {
  const userId = req.user!.id;
  
  const medicalRecord = await prisma.medicalRecord.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!medicalRecord) {
    throw new AppError('Medical record not found', 404);
  }

  // Registrar acceso a expediente sensible
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.VIEW_RECORD,
    tableName: AUDIT_TABLES.MEDICAL_RECORD,
    recordId: id,
    newValues: {
      patientId: medicalRecord.patientId,
      // No incluir el contenido completo, solo metadata
    },
    req,
  });

  return medicalRecord;
}
```

---

## 💊 Ejemplo: Prescripciones

### Crear Prescripción

```typescript
// api/src/services/medication.service.ts
async createPrescription(data: CreatePrescriptionDto, req: AuthRequest) {
  const userId = req.user!.id;
  
  const prescription = await prisma.prescription.create({
    data: {
      ...data,
      prescribedBy: userId,
    },
  });

  // Registrar prescripción (evento crítico)
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
    tableName: AUDIT_TABLES.PRESCRIPTION,
    recordId: prescription.id,
    newValues: {
      patientId: data.patientId,
      medicationId: data.medicationId,
      dosage: data.dosage,
      frequency: data.frequency,
      route: data.route,
    },
    req,
  });

  return prescription;
}
```

### Administrar Medicamento

```typescript
async administerMedication(data: AdministerMedicationDto, req: AuthRequest) {
  const userId = req.user!.id;
  
  const administration = await prisma.medicationAdministration.create({
    data: {
      ...data,
      administeredBy: userId,
    },
  });

  // Registrar administración (5 correctos verificados)
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.MEDICATION_ADMIN,
    tableName: AUDIT_TABLES.MEDICATION_ADMINISTRATION,
    recordId: administration.id,
    newValues: {
      medicationId: data.medicationId,
      patientId: data.patientId,
      dosage: data.dosage,
      route: data.route,
      verifications: {
        patient: data.patientVerified,
        medication: data.medicationVerified,
        dosage: data.dosageVerified,
        route: data.routeVerified,
        time: data.timeVerified,
      },
    },
    req,
  });

  return administration;
}
```

---

## 👥 Ejemplo: Gestión de Usuarios

### Crear Usuario

```typescript
// api/src/services/user.service.ts
async create(data: CreateUserDto, req: AuthRequest) {
  const adminUserId = req.user!.id;
  
  const user = await prisma.user.create({
    data: {
      ...data,
      passwordHash: await hashPassword(data.password),
    },
  });

  // Registrar creación de usuario
  await createAuditLog({
    userId: adminUserId,
    action: AUDIT_ACTIONS.USER_CREATE,
    tableName: AUDIT_TABLES.USER,
    recordId: user.id,
    newValues: {
      email: user.email,
      role: user.role,
      // NO incluir passwordHash
    },
    req,
  });

  return user;
}
```

### Cambiar Rol de Usuario

```typescript
async changeRole(userId: string, newRole: string, req: AuthRequest) {
  const adminUserId = req.user!.id;
  
  // Obtener rol actual
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const oldRole = user?.role;

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // Registrar cambio de rol (acción crítica)
  await createAuditLog({
    userId: adminUserId,
    action: AUDIT_ACTIONS.ROLE_CHANGE,
    tableName: AUDIT_TABLES.USER,
    recordId: userId,
    oldValues: { role: oldRole },
    newValues: { role: newRole },
    req,
  });
}
```

### Eliminar Usuario (Soft Delete)

```typescript
async delete(userId: string, req: AuthRequest) {
  const adminUserId = req.user!.id;
  
  // Obtener usuario antes de eliminar
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Soft delete
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  // Registrar eliminación
  await createAuditLog({
    userId: adminUserId,
    action: AUDIT_ACTIONS.USER_DELETE,
    tableName: AUDIT_TABLES.USER,
    recordId: userId,
    oldValues: {
      email: user?.email,
      role: user?.role,
      isActive: true,
    },
    newValues: {
      isActive: false,
    },
    req,
  });
}
```

---

## ✅ Mejores Prácticas

### 1. **Siempre registrar eventos críticos**

Eventos que DEBEN auditarse:
- ✅ Login/Logout
- ✅ Cambios de contraseña
- ✅ Acceso a expedientes médicos
- ✅ Creación/modificación de diagnósticos
- ✅ Prescripción/administración de medicamentos
- ✅ Cambios de roles/permisos
- ✅ Eliminación de registros

### 2. **No incluir datos sensibles**

❌ **Nunca incluir:**
- Contraseñas (ni hasheadas)
- Tokens completos
- Números de tarjetas de crédito
- SSN completos

✅ **Sí incluir:**
- Metadatos (quién, qué, cuándo, dónde)
- Cambios en campos no sensibles
- IDs de referencias

### 3. **Usar constantes predefinidas**

```typescript
// ✅ CORRECTO
action: AUDIT_ACTIONS.CREATE

// ❌ INCORRECTO
action: 'create'  // Typos, inconsistencia
```

### 4. **Manejar errores gracefully**

La función `createAuditLog` ya maneja errores internamente, pero asegúrate de que los errores de auditoría no rompan el flujo principal:

```typescript
try {
  const result = await someOperation();
  await createAuditLog({ /* ... */ });
  return result;
} catch (error) {
  // El error de la operación principal se propaga
  // Los errores de audit log se loggean pero no se propagan
  throw error;
}
```

### 5. **Incluir Request cuando sea posible**

```typescript
// ✅ CORRECTO - Extrae IP y User-Agent automáticamente
await createAuditLog({
  userId,
  action: AUDIT_ACTIONS.CREATE,
  tableName: AUDIT_TABLES.PATIENT,
  recordId: patient.id,
  req, // <-- Incluir request
});

// ⚠️ ACEPTABLE - Cuando no tienes acceso al request
await createAuditLog({
  userId,
  action: AUDIT_ACTIONS.CREATE,
  tableName: AUDIT_TABLES.PATIENT,
  recordId: patient.id,
  ipAddress: '192.168.1.100',
  userAgent: 'System Process',
});
```

### 6. **Auditar búsquedas masivas**

Para búsquedas o exportaciones de datos sensibles:

```typescript
async searchPatients(query: string, req: AuthRequest) {
  const results = await prisma.patient.findMany({ /* ... */ });
  
  // Registrar búsqueda sensible
  await createAuditLog({
    userId: req.user!.id,
    action: AUDIT_ACTIONS.SEARCH,
    tableName: AUDIT_TABLES.PATIENT,
    recordId: '00000000-0000-0000-0000-000000000000', // Búsqueda general
    newValues: {
      query,
      resultsCount: results.length,
    },
    req,
  });
  
  return results;
}
```

### 7. **Contexto adicional en oldValues/newValues**

Incluye contexto útil para investigaciones:

```typescript
await createAuditLog({
  userId,
  action: AUDIT_ACTIONS.UPDATE,
  tableName: AUDIT_TABLES.PRESCRIPTION,
  recordId: prescription.id,
  oldValues: {
    status: 'active',
    endDate: null,
  },
  newValues: {
    status: 'discontinued',
    endDate: new Date(),
    reason: 'Adverse reaction', // Contexto adicional
  },
  req,
});
```

---

## 🔍 Verificar Registros

Después de implementar, verifica que los logs se crean correctamente:

```bash
# En desarrollo, consulta directamente la base de datos
npx prisma studio

# O usa el endpoint API
curl -X GET "http://localhost:5000/api/audit-logs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Referencias

- **Módulo Principal**: `api/AUDIT_LOG_MODULE.md`
- **Utilidades**: `api/src/utils/audit.ts`
- **Servicio**: `api/src/services/audit-log.service.ts`
- **Requisitos**: `documents/Req-Seguridad.md` (REQ-AUD-001)

---

**Última actualización**: 2024-02-11  
**Estado**: 📖 Guía de integración completa
