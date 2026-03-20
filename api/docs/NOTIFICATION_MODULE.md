# Notification Module Documentation

## Overview

The Notification module provides a complete system for creating, managing, and tracking notifications for all users in the Electronic Health Record system.

## Features

- **Create Notifications**: Create individual or bulk notifications
- **List Notifications**: Retrieve notifications with pagination and filtering
- **Mark as Read**: Mark individual or all notifications as read
- **Delete Notifications**: Remove notifications
- **Unread Count**: Get count of unread notifications
- **Role-Based Access**: Users can only access their own notifications
- **Entity Linking**: Link notifications to related entities (appointments, prescriptions, etc.)
- **Priority Levels**: Support for normal, high, and urgent priorities

## Database Schema

The `Notification` model includes:

```prisma
model Notification {
  id                String   @id @default(uuid())
  userId            String   // Recipient of the notification
  type              String   // Type of notification (see constants)
  title             String   // Short title
  message           String   // Full message
  relatedEntityType String?  // Type of related entity (optional)
  relatedEntityId   String?  // ID of related entity (optional)
  priority          String   // normal, high, urgent
  isRead            Boolean  // Read status
  readAt            DateTime? // When it was read
  createdAt         DateTime // When created
  updatedAt         DateTime // Auto-updated by Prisma
  
  user              User     @relation(...)
  
  // Indexes for performance
  @@index([userId, isRead])
  @@index([userId, createdAt])
}
```

## API Endpoints

### 1. List Notifications
```
GET /api/notifications
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `isRead` (optional): Filter by read status (true/false)
- `type` (optional): Filter by notification type
- `priority` (optional): Filter by priority

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "userId": "uuid",
        "type": "appointment_created",
        "title": "Nueva cita programada",
        "message": "Se ha programado una cita...",
        "relatedEntityType": "appointment",
        "relatedEntityId": "uuid",
        "priority": "normal",
        "isRead": false,
        "readAt": null,
        "createdAt": "2026-02-11T...",
        "updatedAt": "2026-02-11T...",
        "user": {
          "id": "uuid",
          "firstName": "Juan",
          "lastName": "Pérez",
          "email": "juan@example.com",
          "role": "patient"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 2. Get Notification by ID
```
GET /api/notifications/:id
```

**Response:** Same as single notification object above.

### 3. Get Unread Count
```
GET /api/notifications/unread-count
```

**Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "count": 5
  }
}
```

### 4. Mark Notification as Read
```
PUT /api/notifications/:id/read
```

**Response:** Updated notification object.

### 5. Mark All as Read
```
PUT /api/notifications/mark-all-read
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "count": 5
  }
}
```

### 6. Create Notification
```
POST /api/notifications
```

**Authorization:** admin, nurse, or psychologist only

**Request Body:**
```json
{
  "userId": "uuid",
  "type": "appointment_created",
  "title": "Nueva cita",
  "message": "Se ha creado una nueva cita",
  "relatedEntityType": "appointment",
  "relatedEntityId": "uuid",
  "priority": "normal"
}
```

**Response:** Created notification object.

### 7. Delete Notification
```
DELETE /api/notifications/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "success": true
  }
}
```

## Notification Types

Available notification types (from `src/constants/notification.ts`):

- **Appointments:**
  - `appointment_created`
  - `appointment_updated`
  - `appointment_cancelled`
  - `appointment_reminder`
  - `appointment_completed`

- **Prescriptions:**
  - `prescription_created`
  - `prescription_status_changed`
  - `medication_administered`

- **Interconsultations:**
  - `interconsultation_requested`
  - `interconsultation_responded`
  - `interconsultation_status_changed`

- **Medical Records:**
  - `medical_record_updated`
  - `therapy_session_scheduled`
  - `therapy_session_completed`
  - `psychometric_evaluation_completed`
  - `treatment_plan_created`
  - `treatment_plan_updated`

- **System:**
  - `system_alert`
  - `system_maintenance`

## Priority Levels

- `normal`: Standard notifications
- `high`: Important notifications
- `urgent`: Critical notifications requiring immediate attention

## Integration Examples

### Creating Notifications in Services

When implementing other services, you can create notifications using:

```typescript
import notificationService from './notification.service';
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../constants/notification';

// Single notification
await notificationService.create({
  userId: patientUserId,
  type: NOTIFICATION_TYPES.APPOINTMENT_CREATED,
  title: 'Nueva cita programada',
  message: 'Se ha programado una cita para el ...',
  relatedEntityType: 'appointment',
  relatedEntityId: appointment.id,
  priority: NOTIFICATION_PRIORITIES.NORMAL,
});

// Multiple notifications (more efficient)
await notificationService.createBulk([
  {
    userId: patientUserId,
    type: NOTIFICATION_TYPES.APPOINTMENT_CREATED,
    title: 'Nueva cita programada',
    message: 'Se ha programado una cita para el ...',
    relatedEntityType: 'appointment',
    relatedEntityId: appointment.id,
    priority: NOTIFICATION_PRIORITIES.NORMAL,
  },
  {
    userId: professionalUserId,
    type: NOTIFICATION_TYPES.APPOINTMENT_CREATED,
    title: 'Nueva cita asignada',
    message: 'Se ha asignado una cita con ...',
    relatedEntityType: 'appointment',
    relatedEntityId: appointment.id,
    priority: NOTIFICATION_PRIORITIES.NORMAL,
  },
]);
```

## Current Integrations

The notification system is currently integrated with:

### Appointment Service

1. **Appointment Created**: Notifies both patient and professional when an appointment is created
2. **Appointment Rescheduled**: Notifies both parties when an appointment date/time changes
3. **Appointment Cancelled**: Notifies both parties when an appointment is cancelled

## Security

- All endpoints require authentication
- Users can only access their own notifications (except admins)
- Only admins, nurses, and psychologists can create notifications
- All inputs are validated
- Proper authorization checks on all operations

## Performance Considerations

- Database indexes on `(userId, isRead)` and `(userId, createdAt)` for fast queries
- Pagination support to limit response sizes
- Bulk creation method for efficient multi-user notifications
- `@updatedAt` directive for automatic timestamp management

## Migration

To create the notifications table in the database:

```bash
npx prisma migrate dev --name add_notifications
```

Or for production:

```bash
npx prisma migrate deploy
```

## Future Enhancements

Potential improvements for the notification system:

1. **Email Notifications**: Integrate with Nodemailer to send email notifications
2. **Push Notifications**: Add support for web push notifications
3. **Real-time Updates**: Integrate with Socket.io for instant notification delivery
4. **Notification Preferences**: Allow users to configure which notifications they want to receive
5. **Notification Templates**: Create reusable templates for common notification types
6. **Notification Batching**: Group related notifications to reduce noise
7. **Expiration**: Automatically delete old notifications after a certain period
8. **Read Receipts**: Track when notifications are read
9. **Action Buttons**: Add quick action buttons to notifications (e.g., "View Appointment", "Confirm")

## Error Handling

All errors are handled through the global error handler middleware:

- `404 Not Found`: Notification doesn't exist
- `403 Forbidden`: User doesn't have access to the notification
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required

## Testing

To test the notification endpoints:

1. Start the server: `npm run dev`
2. Authenticate to get a JWT token
3. Use the token in the `Authorization` header: `Bearer <token>`
4. Test endpoints with tools like Postman or curl

Example:
```bash
# Get notifications
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark as read
curl -X PUT http://localhost:5000/api/notifications/{id}/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```
