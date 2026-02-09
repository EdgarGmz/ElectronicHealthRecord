import { Router } from 'express';
import * as auditLogController from '../controllers/audit-log.controller';

const router = Router();

router.get('/', auditLogController.getAuditLogs);

export default router;
