import { Request, Response } from 'express';

export const getInterconsultations = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Interconsultations list (not implemented)' });
};

export const createInterconsultation = (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Interconsultation created (not implemented)' });
};

export const respondToInterconsultation = (req: Request, res: Response) => {
  res.status(201).json({ success: true, message: `Response to interconsultation ${req.params.id} created (not implemented)` });
};
