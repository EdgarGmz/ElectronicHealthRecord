# Validations Implementation Documentation

This document provides a comprehensive overview of all input validations implemented across the Electronic Health Record API using express-validator.

## Overview

All validations follow a consistent pattern:
1. Validation rules are defined in controller files as exported arrays
2. The `validate()` middleware from `/api/src/middleware/validation.ts` is used to apply validations
3. Invalid requests return a 400 Bad Request with clear error messages
4. All POST, PUT, and PATCH endpoints have proper validation

## Validation Middleware

Located at: `/api/src/middleware/validation.ts`

```typescript
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  };
};
```

## Controller Validations

### 1. Authentication Controller (`auth.controller.ts`)

#### Login Validation
**Endpoint:** `POST /api/auth/login`

Validates:
- `email`: Must be a valid email address
- `password`: Cannot be empty

#### Register Validation
**Endpoint:** `POST /api/auth/register`

Validates:
- `email`: Must be a valid email address
- `password`: Must be at least 8 characters long
- `firstName`: Cannot be empty
- `lastName`: Cannot be empty
- `dateOfBirth`: Must be a valid ISO 8601 date
- `role`: Cannot be empty

#### Refresh Token Validation
**Endpoint:** `POST /api/auth/refresh-token`

Validates:
- `refreshToken`: Cannot be empty

---

### 2. Appointment Controller (`appointment.controller.ts`)

#### Create Appointment Validation
**Endpoint:** `POST /api/appointments`

Validates:
- `patientId`: Must be a valid UUID
- `professionalId`: Must be a valid UUID
- `appointmentType`: Cannot be empty
- `department`: Cannot be empty
- `scheduledDate`: Must be a valid ISO 8601 date
- `durationMinutes`: Must be a positive integer
- `notes`: Optional string

**Authorization:** Requires admin, psychologist, or nurse role

#### Update Appointment Validation
**Endpoint:** `PUT /api/appointments/:id`

Validates:
- `id` (param): Must be a valid UUID
- `scheduledDate`: Optional, must be a valid ISO 8601 date
- `durationMinutes`: Optional, must be a positive integer
- `status`: Optional, must be one of the valid appointment statuses
- `notes`: Optional string

#### Cancel Appointment Validation
**Endpoint:** `DELETE /api/appointments/:id`

Validates:
- `id` (param): Must be a valid UUID
- `cancellationReason`: Cannot be empty

---

### 3. Patient Controller (`patient.controller.ts`)

#### Create Patient Validation
**Endpoint:** `POST /api/patients`

Validates patient data including personal information and medical details.

**Authorization:** Requires admin, nurse, or psychologist role

#### Update Patient Validation
**Endpoint:** `PUT /api/patients/:id`

Validates updatable patient fields.

**Authorization:** Requires admin, nurse, or psychologist role

---

### 4. Medical Record Controller (`medical-record.controller.ts`)

#### Create Medical Record Validation
**Endpoint:** `POST /api/medical-records`

Validates:
- `patientId`: Required
- Other medical record fields

**Authorization:** Requires admin, nurse, or psychologist role

#### Update Medical Record Validation
**Endpoint:** `PUT /api/medical-records/:id`

Validates updatable medical record fields.

**Authorization:** Requires admin, nurse, or psychologist role

---

### 5. Medication Controller (`medication.controller.ts`)

#### Create Medication Validation
**Endpoint:** `POST /api/medications`

Validates:
- `name`: Cannot be empty, trimmed
- `genericName`: Cannot be empty, trimmed
- `category`: Optional, trimmed
- `dosageForms`: Optional, trimmed
- `commonDosages`: Optional, trimmed
- `administrationRoutes`: Optional, trimmed
- `contraindications`: Optional, trimmed
- `sideEffects`: Optional, trimmed

**Authorization:** Requires admin or nurse role

#### Update Medication Validation
**Endpoint:** `PUT /api/medications/:id`

Validates:
- `id` (param): Must be a valid UUID
- `name`: Optional, cannot be empty if provided, trimmed
- `genericName`: Optional, cannot be empty if provided, trimmed
- `category`: Optional, trimmed
- `dosageForms`: Optional, trimmed
- `commonDosages`: Optional, trimmed
- `administrationRoutes`: Optional, trimmed
- `contraindications`: Optional, trimmed
- `sideEffects`: Optional, trimmed
- `isActive`: Optional, must be boolean

**Authorization:** Requires admin or nurse role

#### Create Prescription Validation
**Endpoint:** `POST /api/prescriptions`

Validates:
- `patientId`: Must be a valid UUID
- `medicationId`: Must be a valid UUID
- `dosage`: Cannot be empty, trimmed
- `frequency`: Cannot be empty, trimmed
- `route`: Cannot be empty, trimmed
- `duration`: Optional, trimmed
- `startDate`: Must be a valid ISO 8601 date
- `endDate`: Optional, must be a valid ISO 8601 date
- `instructions`: Optional, trimmed

**Authorization:** Requires doctor, psychologist, or nurse role

#### Update Prescription Status Validation
**Endpoint:** `PUT /api/prescriptions/:id/status`

Validates:
- `id` (param): Must be a valid UUID
- `status`: Must be one of the valid prescription status values

**Authorization:** Requires doctor, psychologist, or nurse role

#### Create Prescription Administration Validation
**Endpoint:** `POST /api/prescriptions/:id/administrations`

Validates:
- `id` (param): Must be a valid UUID
- `nursingConsultationId`: Must be a valid UUID
- `administrationDate`: Must be a valid ISO 8601 date
- `patientVerified`: Must be boolean
- `medicationVerified`: Must be boolean
- `dosageVerified`: Must be boolean
- `routeVerified`: Must be boolean
- `timeVerified`: Must be boolean
- `adverseReaction`: Optional, trimmed
- `observations`: Optional, trimmed

**Authorization:** Requires nurse role

---

### 6. Interconsultation Controller (`interconsultation.controller.ts`)

#### Create Interconsultation Validation
**Endpoint:** `POST /api/interconsultations`

Validates:
- `patientId`: Must be a valid UUID
- `fromDepartment`: Must be a valid department value
- `toDepartment`: Must be a valid department value
- `toProfessionalId`: Optional, must be a valid UUID
- `reason`: Cannot be empty
- `relevantInformation`: Optional string
- `urgency`: Must be a valid urgency level

**Authorization:** Requires authentication

#### Respond to Interconsultation Validation
**Endpoint:** `POST /api/interconsultations/:id/response`

Validates:
- `id` (param): Must be a valid UUID
- `response`: Cannot be empty

**Authorization:** Requires authentication

---

### 7. Psychometric Test Controller (`psychometric-test.controller.ts`)

#### Create Psychometric Test Validation
**Endpoint:** `POST /api/psychometric-tests`

Validates psychometric test data.

**Authorization:** Requires psychologist, coordinador_psicologia, or admin role

#### Update Psychometric Test Validation
**Endpoint:** `PUT /api/psychometric-tests/:id`

Validates updatable test fields.

**Authorization:** Requires psychologist, coordinador_psicologia, or admin role

---

### 8. Therapy Session Controller (`therapy-session.controller.ts`)

#### Create Therapy Session Validation
**Endpoint:** `POST /api/therapy-sessions`

Validates:
- `psychologyRecordId`: Must be a valid UUID
- `sessionNumber`: Must be a positive integer (min: 1)
- `sessionDate`: Must be a valid ISO 8601 date
- `sessionDuration`: Optional, must be a positive integer
- `mood`: Cannot be empty, max 30 characters
- `evolutionNotes`: Optional string
- `patientProgress`: Optional string
- `assignedTasks`: Optional string
- `observations`: Optional string
- `nextSessionPlan`: Optional string

**Authorization:** Requires authentication

#### Update Therapy Session Validation
**Endpoint:** `PUT /api/therapy-sessions/:id`

Validates:
- `id` (param): Must be a valid UUID
- `sessionDate`: Optional, must be a valid ISO 8601 date
- `sessionDuration`: Optional, must be a positive integer
- `mood`: Optional, cannot be empty if provided, max 30 characters
- `evolutionNotes`: Optional string
- `patientProgress`: Optional string
- `assignedTasks`: Optional string
- `observations`: Optional string
- `nextSessionPlan`: Optional string

**Authorization:** Requires authentication

---

### 9. User Controller (`user.controller.ts`)

#### Update User Validation
**Endpoint:** `PUT /api/users/:id`

Validates user update fields.

**Authorization:** Requires authentication

---

## Common Validation Patterns

### UUID Validation
Used extensively for IDs:
```typescript
param('id').isUUID().withMessage('Invalid ID')
body('patientId').isUUID().withMessage('Valid patient ID is required')
```

### Date Validation
Used for date fields:
```typescript
body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
```

### String Validation
Used for text fields:
```typescript
body('name').notEmpty().withMessage('Name is required')
body('description').optional().isString()
```

### Integer Validation
Used for numeric fields:
```typescript
body('sessionNumber').isInt({ min: 1 }).withMessage('Session number must be a positive integer')
```

### Email Validation
Used for email fields:
```typescript
body('email').isEmail().withMessage('Valid email is required')
```

### Enum Validation
Used for fields with predefined values:
```typescript
body('status').isIn(STATUS_VALUES).withMessage('Invalid status')
```

## Error Response Format

When validation fails, the API returns:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Testing Validations

To test validations:

1. Send a request with invalid data
2. Verify you receive a 400 Bad Request response
3. Check that the error messages clearly indicate what's wrong

Example with curl:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": ""}'
```

Expected response:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password is required",
      "param": "password",
      "location": "body"
    }
  ]
}
```

## Security Considerations

1. **Input Sanitization**: All string inputs are trimmed to remove leading/trailing whitespace
2. **Type Validation**: Strong type checking ensures data integrity
3. **Length Limits**: Maximum lengths are enforced where appropriate
4. **UUID Validation**: Prevents injection attacks through ID parameters
5. **Date Validation**: Ensures dates are in proper ISO 8601 format
6. **Enum Validation**: Restricts values to predefined allowed options

## Future Improvements

Potential enhancements:
1. Add custom validators for complex business rules
2. Implement sanitization for HTML content in text fields
3. Add rate limiting per endpoint
4. Consider using Zod or class-validator for more complex DTO validation
5. Add validation for file uploads
6. Implement cross-field validation (e.g., endDate must be after startDate)

## Maintenance

When adding new endpoints:
1. Define validation rules in the controller file
2. Export them as arrays of ValidationChain
3. Apply them in routes using `validate()` middleware
4. Update this documentation
5. Test thoroughly with invalid data

## References

- [express-validator Documentation](https://express-validator.github.io/docs/)
- [Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
