import { Request, Response } from 'express';

export const getAppointments = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Appointments list (not implemented)' });
};

export const createAppointment = (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Appointment created (not implemented)' });
};

export const getAppointmentById = (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Appointment with id ${req.params.id} (not implemented)` });
};

export const updateAppointment = (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Appointment with id ${req.params.id} updated (not implemented)` });
};

export const cancelAppointment = (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Appointment with id ${req.params.id} canceled (not implemented)` });
};

export const getAvailability = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Availability check (not implemented)' });
};
