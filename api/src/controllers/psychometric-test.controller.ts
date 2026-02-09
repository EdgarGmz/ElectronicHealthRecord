import { Request, Response } from 'express';

export const getPsychometricTests = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Psychometric tests list (not implemented)' });
};

export const createPsychometricTest = (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Psychometric test created (not implemented)' });
};
