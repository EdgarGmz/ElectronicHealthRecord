import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export class MoodController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moods = await prisma.mood.findMany({
        orderBy: { displayOrder: 'asc' },
      });

      res.status(200).json({
        success: true,
        message: 'Moods retrieved successfully',
        data: moods,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MoodController();
