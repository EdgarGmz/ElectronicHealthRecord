import { Request, Response } from 'express';

export const getTherapySessions = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Therapy sessions list (not implemented)' });
};

export const createTherapySession = (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Therapy session created (not implemented)' });
};

export const getTherapySessionById = (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Therapy session with id ${req.params.id} (not implemented)` });
};

export const updateTherapySession = (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Therapy session with id ${req.params.id} updated (not implemented)` });
};
