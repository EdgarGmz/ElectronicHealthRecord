import { Request, Response } from 'express';

export const getAuditLogs = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Audit logs list (not implemented)' });
};
