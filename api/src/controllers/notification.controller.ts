import { Request, Response } from 'express';

export const getNotifications = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Notifications list (not implemented)' });
};

export const markNotificationAsRead = (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Notification with id ${req.params.id} marked as read (not implemented)` });
};
