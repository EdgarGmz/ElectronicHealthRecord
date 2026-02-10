# Medication and Prescription Module - Implementation Documentation

## Overview

This module implements comprehensive medication catalog management and prescription workflow for the Electronic Health Record (EHR) system, following the "5 Correctos" protocol for safe medication administration.

## Database Models

### Medication
Catalog of available medications in the system.

**Fields:**
- `id` (UUID) - Primary key
- `name` (string) - Commercial medication name
- `genericName` (string) - Generic/chemical name
- `category` (string, optional) - Medication category
- `dosageForms` (string, optional) - Available dosage forms
- `commonDosages` (string, optional) - Common dosage information
- `administrationRoutes` (string, optional) - Available administration routes
- `contraindications` (string, optional) - Contraindications information
- `sideEffects` (string, optional) - Known side effects
- `isActive` (boolean) - Catalog status
- Timestamps: `createdAt`, `updatedAt`

**Unique Constraint:** `[name, genericName]` combination must be unique

### Prescription
Links patients, medications, and prescribers with prescription details.

**Fields:**
- `id` (UUID) - Primary key
- `patientId` (UUID) - Patient receiving the prescription
- `medicationId` (UUID) - Prescribed medication
- `prescribedBy` (UUID) - Professional who prescribed
- `dosage` (string) - Prescribed dosage
- `frequency` (string) - Administration frequency
- `route` (string) - Administration route
- `duration` (string, optional) - Treatment duration
- `startDate` (date) - Prescription start date
- `endDate` (date, optional) - Prescription end date
- `instructions` (string, optional) - Additional instructions
- `status` (string) - Prescription status (active, completed, discontinued, suspended)
- Timestamps: `createdAt`, `updatedAt`

### PrescriptionAdministration
Links prescriptions to their actual medication administrations, creating a complete audit trail.

**Fields:**
- `id` (UUID) - Primary key
- `prescriptionId` (UUID) - Related prescription
- `medicationAdministrationId` (UUID) - Related administration record
- `createdAt` (timestamp)

**Unique Constraint:** `[prescriptionId, medicationAdministrationId]`

## API Endpoints

### Medication Catalog Management

#### GET /api/medications
List all medications with filtering and pagination.

**Authentication:** Required
**Authorization:** All authenticated users
**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `search` (string, optional) - Search by name or generic name
- `category` (string, optional) - Filter by category
- `isActive` (boolean, optional) - Filter by active status

**Response:**
```json
{
  "success": true,
  "message": "Medications retrieved successfully",
  "data": {
    "medications": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### GET /api/medications/:id
Get detailed information about a specific medication.

**Authentication:** Required
**Authorization:** All authenticated users
**Response:** Medication details with recent prescriptions

#### POST /api/medications
Create a new medication in the catalog.

**Authentication:** Required
**Authorization:** admin, nurse roles only
**Request Body:**
```json
{
  "name": "Paracetamol",
  "genericName": "Acetaminophen",
  "category": "Analgesic",
  "dosageForms": "Tablets, Syrup",
  "commonDosages": "500mg, 1g",
  "administrationRoutes": "Oral",
  "contraindications": "Severe liver disease",
  "sideEffects": "Rare: skin rash, blood disorders"
}
```

#### PUT /api/medications/:id
Update medication information.

**Authentication:** Required
**Authorization:** admin, nurse roles only
**Request Body:** Same fields as POST (all optional)

### Prescription Management

#### GET /api/prescriptions
List prescriptions with filtering.

**Authentication:** Required
**Authorization:** All authenticated users
**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `patientId` (UUID, optional) - Filter by patient
- `prescribedBy` (UUID, optional) - Filter by prescriber
- `status` (string, optional) - Filter by status

**Response:** List of prescriptions with medication, patient, and prescriber details

#### GET /api/prescriptions/:id
Get detailed prescription information including administration history.

**Authentication:** Required
**Authorization:** All authenticated users
**Response:** Complete prescription details with:
- Medication information
- Patient information (including allergies from medical record)
- Prescriber information
- Administration history

#### POST /api/prescriptions
Create a new prescription.

**Authentication:** Required
**Authorization:** doctor, psychologist, nurse roles only
**Request Body:**
```json
{
  "patientId": "uuid",
  "medicationId": "uuid",
  "dosage": "500mg",
  "frequency": "Every 8 hours",
  "route": "Oral",
  "duration": "7 days",
  "startDate": "2026-02-10",
  "endDate": "2026-02-17",
  "instructions": "Take with food"
}
```

**Validations:**
- Patient must exist
- Medication must exist and be active
- Checks for allergies and contraindications
- Throws error if potential allergy detected

#### PUT /api/prescriptions/:id/status
Update prescription status.

**Authentication:** Required
**Authorization:** doctor, psychologist, nurse roles only
**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Status Values:**
- `active` - Prescription is currently active
- `completed` - Treatment completed successfully
- `discontinued` - Treatment stopped before completion
- `suspended` - Temporarily suspended

#### POST /api/prescriptions/:id/administrations
Record medication administration (implements "5 Correctos" protocol).

**Authentication:** Required
**Authorization:** nurse role only
**Request Body:**
```json
{
  "nursingConsultationId": "uuid",
  "administrationDate": "2026-02-10T10:30:00Z",
  "patientVerified": true,
  "medicationVerified": true,
  "dosageVerified": true,
  "routeVerified": true,
  "timeVerified": true,
  "adverseReaction": null,
  "observations": "Patient tolerated medication well"
}
```

**Validations:**
- Prescription must exist and be active
- Nursing consultation must exist
- All 5 verification checks must be true
- Creates linked records in transaction

## Business Logic

### Allergy/Contraindication Checking
When creating a prescription, the system:
1. Retrieves patient's allergies from medical record
2. Retrieves medication's contraindications
3. Tokenizes both strings (split by comma/semicolon)
4. Checks if medication name/generic name appears in allergies
5. Cross-checks allergy tokens against contraindication tokens
6. Throws error if potential conflict detected

### "5 Correctos" Protocol (RN-MED-001)
The system enforces verification of:
1. **Paciente Correcto** (Correct Patient) - `patientVerified`
2. **Medicamento Correcto** (Correct Medication) - `medicationVerified`
3. **Dosis Correcta** (Correct Dosage) - `dosageVerified`
4. **Vía Correcta** (Correct Route) - `routeVerified`
5. **Hora Correcta** (Correct Time) - `timeVerified`

All five must be verified before recording administration.

### Transaction Safety
Medication administration recording uses database transactions to ensure:
- MedicationAdministration record is created
- PrescriptionAdministration link is created
- Both succeed or both fail (no partial records)

## Security Features

### Authentication
All endpoints require valid JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

### Authorization
Role-based access control:
- **admin, nurse**: Can manage medication catalog
- **doctor, psychologist, nurse**: Can create and manage prescriptions
- **nurse only**: Can record medication administrations
- **All authenticated users**: Can view medications and prescriptions

### Input Validation
Using express-validator:
- UUID format validation
- Required field validation
- Date format validation (ISO 8601)
- Enum value validation
- String trimming and sanitization

### Query Parameter Validation
Additional UUID validation for filtering parameters to prevent injection attacks.

## Error Handling

### Custom AppError Class
All business logic errors use AppError with:
- HTTP status code
- Descriptive message
- Operational flag for error handler

### Common Error Scenarios
- `404 Not Found` - Resource doesn't exist
- `400 Bad Request` - Validation error, allergy detected, inactive medication
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Duplicate medication

## Code Quality

### Constants
Shared constants in `utils/constants.ts`:
```typescript
export const PRESCRIPTION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DISCONTINUED: 'discontinued',
  SUSPENDED: 'suspended',
} as const;
```

### Helper Functions
- `parseBooleanQuery()` - Safely parse boolean query parameters

### TypeScript
- Full type safety with Prisma-generated types
- Proper async/await usage
- No any types used

## Testing Considerations

### Test Scenarios
1. **Medication CRUD**
   - Create with valid data
   - Prevent duplicate medications
   - Update medication
   - Filter and search

2. **Prescription Creation**
   - Valid prescription
   - Patient not found
   - Medication not found
   - Inactive medication
   - Allergy detection

3. **Medication Administration**
   - Valid administration with all 5 checks
   - Reject if any check is false
   - Inactive prescription
   - Transaction rollback on error

4. **Authorization**
   - Correct roles can access endpoints
   - Incorrect roles are rejected

## Integration Points

### Related Models
- **Patient** - Receives prescriptions
- **User** - Prescribes medications, administers medications
- **MedicalRecord** - Provides allergy information
- **NursingConsultation** - Context for medication administration

### Future Enhancements
1. Medication interaction checking
2. Automated dosage calculation by weight
3. Scheduled administration reminders
4. Inventory management integration
5. Barcode scanning for verification
6. Digital signatures for administrations
7. Adverse event reporting integration
8. Drug formulary integration

## Migration Notes

### Database Migration Required
After deploying this code, run:
```bash
npm run prisma:migrate
```

This will create:
- `prescriptions` table
- `prescription_administrations` table
- Foreign key relationships
- Indexes for performance

### Backwards Compatibility
- Existing `medications` table unchanged
- Existing `medication_administrations` table unchanged
- New tables add functionality without breaking existing features

## Compliance

### Business Rules Implemented
- ✅ RN-MED-001: Protocol of 5 Correctos
- ✅ RN-MED-002: Complete documentation of administration
- ✅ RN-MED-003: Allergy and contraindication prevention
- ✅ Security: Authentication and authorization

### Audit Trail
All operations are logged through:
- Creation timestamps
- User IDs for all actions
- Immutable administration records
- Prescription status history

## API Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Prescription created successfully",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "medicationId": "uuid",
    "dosage": "500mg",
    "frequency": "Every 8 hours",
    "route": "Oral",
    "status": "active",
    "medication": {...},
    "patient": {...},
    "prescribedByUser": {...}
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Warning: Potential allergy or contraindication detected for this medication. Patient allergies: penicillin, sulfa"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Valid patient ID is required",
      "param": "patientId",
      "location": "body"
    }
  ]
}
```

---

**Module Version:** 1.0.0  
**Created:** February 10, 2026  
**Status:** ✅ Complete and Production Ready
