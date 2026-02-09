import { Request, Response } from 'express';

// Medication handlers
export const getMedications = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Medications list (not implemented)' });
};

export const createMedication = (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Medication created (not implemented)' });
};

// Prescription handlers
export const getPrescriptions = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Prescriptions list (not implemented)' });
};

export const createPrescription = (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Prescription created (not implemented)' });
};

export const createPrescriptionAdministration = (req: Request, res: Response) => {
  res.status(201).json({ success: true, message: `Administration for prescription ${req.params.id} created (not implemented)` });
};
