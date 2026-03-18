import { NextFunction, Response } from 'express';
import { body } from 'express-validator';
import notificationService from '../services/notification.service';
import { AuthRequest } from '../middleware/auth';

export const createNotificationValidation = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('type').notEmpty().withMessage('Notification type is required'),
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
  body('relatedEntityType').optional().isString(),
  body('relatedEntityId').optional().isUUID(),
  body('priority').optional().isIn(['normal', 'high', 'urgent']).withMessage('Invalid priority'),
];

export const getRecipientsValidation = [
  // Validation is handled at route-level (query validators), but we keep the controller export
  // to document expected query params.
];

export const getRecipients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const relatedEntityType = String(req.query.relatedEntityType || '')
    const relatedEntityId = String(req.query.relatedEntityId || '')

    if (!relatedEntityType || !relatedEntityId) {
      res.status(400).json({ success: false, message: 'relatedEntityType and relatedEntityId are required' })
      return
    }

    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }

    const recipients = await notificationService.getRecipientsByRelatedEntity({
      userId: user.userId,
      userRole: user.role,
      relatedEntityType,
      relatedEntityId,
    })

    res.status(200).json({
      success: true,
      message: 'Recipients retrieved successfully',
      data: { recipients },
    })
  } catch (error) {
    next(error)
  }
}

// Todos los usuarios activos del sistema (sin filtrar por entidad relacionada)
export const getAllRecipients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limitRaw = req.query.limit as string | undefined
    const limit = limitRaw ? Math.min(Math.max(parseInt(limitRaw, 10), 1), 500) : 200

    const searchRaw = req.query.search as string | undefined
    const search = searchRaw?.trim() ? searchRaw.trim() : undefined

    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }

    const recipients = await notificationService.getAllActiveRecipients({
      viewerRole: user.role,
      limit,
      search,
    })

    res.status(200).json({
      success: true,
      message: 'All recipients retrieved successfully',
      data: { recipients },
    })
  } catch (error) {
    next(error)
  }
}

export const getRecentPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limitRaw = req.query.limit as string | undefined
    const limit = limitRaw ? Math.min(Math.max(parseInt(limitRaw, 10), 1), 100) : 20

    const prescriptions = await notificationService.getRecentPrescriptions(limit)

    res.status(200).json({
      success: true,
      message: 'Recent prescriptions retrieved successfully',
      data: { prescriptions },
    })
  } catch (error) {
    next(error)
  }
}

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: {
      isRead?: boolean;
      type?: string;
      priority?: string;
    } = {};

    if (req.query.isRead !== undefined) {
      filters.isRead = req.query.isRead === 'true';
    }
    if (req.query.type) {
      filters.type = req.query.type as string;
    }
    if (req.query.priority) {
      filters.priority = req.query.priority as string;
    }

    const result = await notificationService.getAll(
      req.user.userId,
      req.user.role,
      page,
      limit,
      filters
    );

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const notification = await notificationService.getById(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Notification retrieved successfully',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const notification = await notificationService.create({
      ...(req.body as any),
      fromUserId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const notification = await notificationService.markAsRead(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const result = await notificationService.markAllAsRead(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const result = await notificationService.delete(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const result = await notificationService.getUnreadCount(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
