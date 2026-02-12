# Notification Module Migration Guide

## Overview

This guide provides step-by-step instructions for deploying the notification module to your environment.

## Prerequisites

- Database access with migration privileges
- Node.js environment configured
- Prisma CLI installed (`npm install` should have it)
- Access to the database connection string

## Migration Steps

### Step 1: Review the Schema Changes

The notification module adds a new `notifications` table with the following structure:

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  priority VARCHAR(20) DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);
```

### Step 2: Generate Prisma Client

Before running migrations, ensure the Prisma client is up to date:

```bash
cd api
npx prisma generate
```

### Step 3: Create and Apply Migration

#### Development Environment

```bash
# Create migration
npx prisma migrate dev --name add_notifications

# This will:
# 1. Create a new migration file
# 2. Apply the migration to the database
# 3. Regenerate Prisma Client
```

#### Production Environment

```bash
# Apply migrations (does not create new ones)
npx prisma migrate deploy
```

### Step 4: Verify Migration

After running the migration, verify it was successful:

```bash
# Check migration status
npx prisma migrate status

# Open Prisma Studio to verify the table exists
npx prisma studio
```

You should see:
- A new `notifications` table
- The table should have all the columns defined in the schema
- The indexes should be created

### Step 5: Test the Endpoints

1. Start the server:
```bash
npm run dev
```

2. Authenticate and get a JWT token (use existing auth endpoints)

3. Test notification endpoints:

```bash
# Get notifications (should return empty array initially)
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get unread count (should return 0 initially)
curl -X GET http://localhost:5000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 6: Trigger Notifications

Notifications will be automatically created when:

1. **Creating an Appointment**: Create a new appointment through the API
   - Two notifications will be created (one for patient, one for professional)

2. **Updating an Appointment**: Update an appointment's date/time
   - Two notifications will be created if the date changed

3. **Cancelling an Appointment**: Cancel an appointment
   - Two notifications will be created

Test by creating an appointment:

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_UUID",
    "professionalId": "PROFESSIONAL_UUID",
    "appointmentType": "consultation",
    "department": "psychology",
    "scheduledDate": "2026-02-15T10:00:00Z",
    "durationMinutes": 50
  }'
```

Then check notifications again - you should see the newly created notifications.

## Rollback Procedure

If you need to rollback the migration:

```bash
# Development: Undo the last migration
npx prisma migrate resolve --rolled-back add_notifications

# Manually drop the table if needed
# Connect to your database and run:
# DROP TABLE notifications;
# Then reset migrations:
npx prisma migrate resolve --rolled-back add_notifications
```

**Warning**: Rolling back will delete all notification data. Make sure to backup if needed.

## Troubleshooting

### Migration Fails

**Error**: "Relation already exists"
- The table might already exist from a previous attempt
- Solution: Drop the table manually and try again

**Error**: "Foreign key constraint fails"
- The `users` table might not exist or have a different name
- Solution: Verify your schema is up to date with all tables

**Error**: "Permission denied"
- Database user doesn't have CREATE TABLE privileges
- Solution: Grant necessary permissions or run with a privileged user

### Prisma Client Not Updated

If you're getting TypeScript errors about `Notification` not existing:

```bash
# Regenerate Prisma Client
npx prisma generate

# Rebuild TypeScript
npm run build
```

### Notifications Not Being Created

If appointments are created but notifications aren't:

1. Check server logs for errors
2. Verify the notification service is properly imported
3. Check that users exist in the database
4. Verify the appointment service integration is working

### Performance Issues

If you experience slow queries:

1. Verify indexes were created:
```sql
SELECT * FROM pg_indexes WHERE tablename = 'notifications';
```

2. Check query execution plans:
```sql
EXPLAIN ANALYZE 
SELECT * FROM notifications 
WHERE user_id = 'UUID' AND is_read = false 
ORDER BY created_at DESC;
```

## Production Deployment Checklist

- [ ] Backup database before migration
- [ ] Test migration in staging environment first
- [ ] Verify Prisma client is generated: `npx prisma generate`
- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Verify table and indexes created
- [ ] Test notification endpoints
- [ ] Trigger a test notification (create appointment)
- [ ] Monitor server logs for errors
- [ ] Test notification retrieval
- [ ] Test marking notifications as read
- [ ] Verify performance with indexes

## Post-Migration Steps

1. **Monitor Performance**: 
   - Watch query performance on the notifications table
   - Monitor database size growth
   - Set up alerts for slow queries

2. **Plan Cleanup**:
   - Consider implementing automatic cleanup of old read notifications
   - Set up a cron job to delete notifications older than X days

3. **Document for Team**:
   - Share API documentation with frontend team
   - Update any API documentation sites
   - Train staff on new notification features

## Support

If you encounter issues during migration:

1. Check the server logs: `tail -f logs/error.log`
2. Check Prisma logs: Set `DEBUG=prisma:*` environment variable
3. Review the schema: `npx prisma format`
4. Validate the schema: `npx prisma validate`

## Additional Resources

- Prisma Migration Documentation: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Notification Module API Documentation: `docs/NOTIFICATION_MODULE.md`
- Main API Documentation: `docs/API_DOCUMENTATION.md`
