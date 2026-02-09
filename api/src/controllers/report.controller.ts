import { Request, Response } from 'express';

export const getStatistics = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'General statistics report (not implemented)' });
};

export const getConsultationsReport = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Consultations report (not implemented)' });
};

export const getDiagnosesReport = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Diagnoses report (not implemented)' });
};
