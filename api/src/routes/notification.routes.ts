import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markNotificationAsRead);

export default router;
