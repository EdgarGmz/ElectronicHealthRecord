# 📊 Módulo de Reportes - Electronic Health Record

## Descripción General

El módulo de Reportes proporciona tres tipos de reportes analíticos para el sistema EHR, permitiendo a los profesionales de salud y administradores obtener estadísticas y análisis de datos del sistema.

## Tipos de Reportes Implementados

### 1. 📈 Reporte de Estadísticas (`/reports/statistics`)

Genera estadísticas agregadas sobre:
- **Citas**: Total, completadas, canceladas, por tipo
- **Pacientes**: Total de pacientes, nuevos pacientes en el período
- **Sesiones de terapia**: Cantidad de sesiones realizadas (departamento de psicología)
- **Consultas de enfermería**: Estadísticas de consultas, medicamentos administrados, procedimientos (departamento de enfermería)

**Parámetros:**
- `periodStart` (requerido): Fecha de inicio (ISO 8601)
- `periodEnd` (requerido): Fecha de fin (ISO 8601)
- `department` (opcional): `psychology`, `nursing`, o vacío para todos

**Ejemplo de solicitud:**
```bash
GET /api/reports/statistics?periodStart=2024-01-01&periodEnd=2024-12-31&department=psychology
Authorization: Bearer <token>
```

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "message": "Statistics report generated successfully",
  "data": {
    "report": {
      "id": "uuid",
      "reportType": "statistics",
      "department": "psychology",
      "periodStart": "2024-01-01T00:00:00.000Z",
      "periodEnd": "2024-12-31T23:59:59.000Z"
    },
    "data": {
      "appointments": {
        "total": 150,
        "completed": 130,
        "cancelled": 20,
        "byType": [...]
      },
      "patients": {
        "total": 200,
        "newPatients": 45
      },
      "therapySessions": 120
    }
  }
}
```

### 2. 🔄 Reporte de Interconsultas (`/reports/consultations`)

Genera análisis de interconsultas entre departamentos:
- **Resumen**: Total de interconsultas, por estatus, por urgencia
- **Por departamento**: Flujo de interconsultas entre departamentos
- **Lista detallada**: Información completa de las interconsultas (limitado a 100 registros)

**Parámetros:**
- `periodStart` (requerido): Fecha de inicio (ISO 8601)
- `periodEnd` (requerido): Fecha de fin (ISO 8601)
- `department` (opcional): Filtrar por departamento origen o destino

**Ejemplo de solicitud:**
```bash
GET /api/reports/consultations?periodStart=2024-01-01&periodEnd=2024-12-31
Authorization: Bearer <token>
```

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "message": "Consultations report generated successfully",
  "data": {
    "report": { ... },
    "data": {
      "summary": {
        "total": 45,
        "byStatus": [
          { "status": "pending", "count": 10 },
          { "status": "completed", "count": 30 }
        ],
        "byUrgency": [...],
        "byDepartments": [
          { "from": "psychology", "to": "nursing", "count": 15 }
        ]
      },
      "consultations": [...]
    }
  }
}
```

### 3. 🧠 Reporte de Diagnósticos (`/reports/diagnoses`)

Genera análisis de diagnósticos psicológicos:
- **Resumen**: Total de registros, diagnósticos más comunes
- **Diagnósticos DSM-5**: Top 10 diagnósticos más frecuentes según DSM-5
- **Diagnósticos CIE-10**: Top 10 diagnósticos más frecuentes según CIE-10
- **Lista detallada**: Información de pacientes con diagnósticos

**Parámetros:**
- `periodStart` (requerido): Fecha de inicio (ISO 8601)
- `periodEnd` (requerido): Fecha de fin (ISO 8601)

**Nota:** Este reporte solo está disponible para el departamento de psicología.

**Ejemplo de solicitud:**
```bash
GET /api/reports/diagnoses?periodStart=2024-01-01&periodEnd=2024-12-31
Authorization: Bearer <token>
```

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "message": "Diagnoses report generated successfully",
  "data": {
    "report": { ... },
    "data": {
      "department": "psychology",
      "summary": {
        "totalRecords": 85,
        "totalDiagnosesDsm5": 12,
        "totalDiagnosesCie10": 10,
        "mostCommonDsm5": [
          { "diagnosis": "F41.1 - Trastorno de ansiedad generalizada", "count": 15 }
        ],
        "mostCommonCie10": [...]
      },
      "records": [...]
    }
  }
}
```

## Características Técnicas

### Arquitectura

El módulo sigue el patrón de arquitectura en capas utilizado en el resto del sistema:

```
Routes (report.routes.ts)
  ↓
Controllers (report.controller.ts)
  ↓
Services (report.service.ts)
  ↓
Prisma (Database)
```

### Seguridad

- ✅ **Autenticación JWT**: Todos los endpoints requieren un token JWT válido
- ✅ **Validación de entrada**: Validación exhaustiva con `express-validator`
- ✅ **Control de accesos**: Los usuarios autenticados pueden generar reportes
- ✅ **Auditoría**: Cada reporte generado se guarda en la base de datos con información del usuario que lo generó

### Validación

Todos los endpoints validan:
- Formato de fechas (ISO 8601)
- Rango de fechas válido
- Departamento válido (si se proporciona)

### Rendimiento

- **Consultas paralelas**: Uso de `Promise.all()` para optimizar consultas a la base de datos
- **Límites de datos**: Los reportes de interconsultas están limitados a 100 registros para evitar sobrecarga
- **Índices de base de datos**: Las consultas utilizan índices existentes en fecha y departamento

### Base de Datos

Cada reporte generado crea un registro en la tabla `reports`:

```typescript
{
  id: string;              // UUID del reporte
  reportType: string;      // 'statistics' | 'consultations' | 'diagnoses'
  department: string;      // Departamento filtrado o 'all'
  periodStart: Date;       // Fecha inicial del período
  periodEnd: Date;         // Fecha final del período
  filters: JSON;           // Filtros aplicados
  generatedBy: string;     // UUID del usuario que generó el reporte
  fileUrl: string | null;  // URL del archivo (reservado para futura implementación)
  createdAt: Date;         // Fecha de creación
}
```

## Manejo de Errores

El módulo maneja los siguientes errores:

| Código | Error | Descripción |
|--------|-------|-------------|
| 400 | Bad Request | Parámetros de validación incorrectos |
| 401 | Unauthorized | Token JWT no válido o ausente |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

**Ejemplo de respuesta de error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "periodStart",
      "message": "Valid start date is required (ISO 8601 format)"
    }
  ]
}
```

## Casos de Uso

### Caso 1: Reporte Mensual de Actividades
Un coordinador necesita un reporte de todas las actividades del mes pasado:

```bash
curl -X GET "http://localhost:5000/api/reports/statistics?periodStart=2024-11-01&periodEnd=2024-11-30" \
  -H "Authorization: Bearer <token>"
```

### Caso 2: Análisis de Interconsultas entre Departamentos
Un administrador quiere analizar la colaboración entre departamentos:

```bash
curl -X GET "http://localhost:5000/api/reports/consultations?periodStart=2024-01-01&periodEnd=2024-12-31" \
  -H "Authorization: Bearer <token>"
```

### Caso 3: Reporte de Diagnósticos para Investigación
Un psicólogo necesita estadísticas de diagnósticos para un estudio:

```bash
curl -X GET "http://localhost:5000/api/reports/diagnoses?periodStart=2024-01-01&periodEnd=2024-12-31" \
  -H "Authorization: Bearer <token>"
```

## Futuras Mejoras

- [ ] **Exportación a PDF/Excel**: Generar archivos descargables
- [ ] **Reportes programados**: Generación automática de reportes periódicos
- [ ] **Gráficos y visualizaciones**: Incluir gráficos en formato imagen
- [ ] **Filtros avanzados**: Más opciones de filtrado (por profesional, por tipo de terapia, etc.)
- [ ] **Reportes personalizados**: Permitir a los usuarios crear reportes a medida
- [ ] **Comparación de períodos**: Comparar datos entre diferentes períodos
- [ ] **Envío por correo**: Enviar reportes automáticamente por email

## Pruebas

### Pruebas Manuales

Para probar los endpoints:

1. Autenticarse y obtener un token JWT
2. Usar Postman, Insomnia o curl para llamar a los endpoints
3. Verificar las respuestas y los datos generados

### Ejemplo con curl:

```bash
# 1. Autenticarse
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Generar reporte de estadísticas
curl -X GET "http://localhost:5000/api/reports/statistics?periodStart=2024-01-01&periodEnd=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

## Soporte

Para problemas o preguntas sobre el módulo de reportes:
- Revisar la documentación de la API
- Consultar los logs del servidor
- Verificar los permisos del usuario
- Contactar al equipo de desarrollo

---

**Última actualización**: 2024-12-31  
**Versión del módulo**: 1.0.0  
**Autor**: EHR Development Team
