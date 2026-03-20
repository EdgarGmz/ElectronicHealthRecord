import { Router } from 'express';
import * as auditLogController from '../controllers/audit-log.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ROLES_AUDIT_LOG } from '../constants/roles';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Solo admin y coordinadores pueden ver audit logs
router.get(
  '/',
  authorizeRoles(...ROLES_AUDIT_LOG),
  validate(auditLogController.getAuditLogsValidation),
  auditLogController.getAuditLogs
);

export default router;
