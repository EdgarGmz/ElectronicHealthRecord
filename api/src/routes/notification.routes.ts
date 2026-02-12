import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import {
  createNotificationValidation,
} from '../controllers/notification.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// List notifications - all authenticated users can list their own notifications
router.get('/', notificationController.getNotifications);

// Get unread count - all authenticated users can get their unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Get specific notification - users can view their own notifications
router.get(
  '/:id',
  validate([param('id').isUUID()]),
  notificationController.getNotificationById
);

// Mark all as read - all authenticated users can mark all their notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Mark specific notification as read
router.put(
  '/:id/read',
  validate([param('id').isUUID()]),
  notificationController.markNotificationAsRead
);

// Create notification - only admins, nurses, and psychologists can create notifications
router.post(
  '/',
  authorizeRoles('admin', 'nurse', 'psychologist'),
  validate(createNotificationValidation),
  notificationController.createNotification
);

// Delete notification - users can delete their own notifications
router.delete(
  '/:id',
  validate([param('id').isUUID()]),
  notificationController.deleteNotification
);

export default router;
