import { Request, Response } from 'express';

export const checkHealth = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is up and running',
    timestamp: new Date().toISOString()
  });
};
