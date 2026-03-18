import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import {
  createNotificationValidation,
} from '../controllers/notification.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param, query } from 'express-validator';
import { ROLES_CAN_CREATE_NOTIFICATIONS } from '../constants/roles';
import { ROLES } from '../constants/roles';

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

// Create notification - admin, enfermero, psicólogo
router.post(
  '/',
  authorizeRoles(...ROLES_CAN_CREATE_NOTIFICATIONS),
  validate(createNotificationValidation),
  notificationController.createNotification
);

// Destinatarios filtrados por entidad relacionada (p.ej. appointment)
router.get(
  '/recipients',
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.COORDINADOR_ENFERMERIA,
    ROLES.COORDINADOR_PSICOLOGIA,
    ROLES.ENFERMERO,
    ROLES.PSICOLOGO
  ),
  validate([
    query('relatedEntityType').notEmpty().withMessage('relatedEntityType is required').isString(),
    query('relatedEntityId').isUUID().withMessage('Valid relatedEntityId is required'),
  ]),
  notificationController.getRecipients
);

// Todos los usuarios activos del sistema (sin filtrar por entidad relacionada)
router.get(
  '/recipients/all',
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.COORDINADOR_ENFERMERIA,
    ROLES.COORDINADOR_PSICOLOGIA,
    ROLES.ENFERMERO,
    ROLES.PSICOLOGO
  ),
  validate([
    query('limit')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Invalid limit')
      .toInt(),
    query('search').optional().isString().withMessage('search must be a string'),
  ]),
  notificationController.getAllRecipients
);

// Prescripciones recientes para poblar el dropdown de “Entidad relacionada (ID)”
router.get(
  '/prescriptions/recent',
  authorizeRoles(ROLES.ADMIN, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO, ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO),
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Invalid limit'),
  ]),
  notificationController.getRecentPrescriptions
);

// Delete notification - users can delete their own notifications
router.delete(
  '/:id',
  validate([param('id').isUUID()]),
  notificationController.deleteNotification
);

export default router;
