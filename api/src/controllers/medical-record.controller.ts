import { Request, Response } from 'express';

export const getMedicalRecords = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Medical records list (not implemented)' });
};

export const createMedicalRecord = (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Medical record created (not implemented)' });
};

export const getMedicalRecordById = (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Medical record with id ${req.params.id} (not implemented)` });
};

export const updateMedicalRecord = (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Medical record with id ${req.params.id} updated (not implemented)` });
};

export const addDiagnosis = (req: Request, res: Response) => {
  res.status(201).json({ success: true, message: `Diagnosis added to medical record with id ${req.params.id} (not implemented)` });
};
