import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export class CareerController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const careers = await prisma.career.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      res.status(200).json({
        success: true,
        message: 'Careers retrieved successfully',
        data: careers,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CareerController();
