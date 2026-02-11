import { Router } from 'express';
import * as auditLogController from '../controllers/audit-log.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Only admin and coordinators can view audit logs
router.get(
  '/',
  authorizeRoles('admin', 'coordinador_psicologia', 'coordinador_enfermeria'),
  validate(auditLogController.getAuditLogsValidation),
  auditLogController.getAuditLogs
);

export default router;
