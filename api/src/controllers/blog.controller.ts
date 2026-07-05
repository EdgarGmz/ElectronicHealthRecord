import { Request, Response, NextFunction } from 'express';
import blogService from '../services/blog.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class BlogController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const blogs = await blogService.getAllBlogs();
      res.json(blogs);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await blogService.getBlogById(id);
      res.json(blog);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, content, category, imageUrl } = req.body;
      const authorId = req.user?.userId;

      if (!authorId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      if (!title || !content || !category) {
        throw new AppError('Título, contenido y categoría son obligatorios', 400);
      }

      const blog = await blogService.createBlog({
        title,
        content,
        category,
        imageUrl,
        authorId,
      });

      res.status(201).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, content, category, imageUrl } = req.body;

      const blog = await blogService.updateBlog(id, {
        title,
        content,
        category,
        imageUrl,
      });

      res.json(blog);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await blogService.deleteBlog(id);
      res.json({ message: 'Publicación eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async like(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await blogService.incrementLikes(id);
      res.json(blog);
    } catch (error) {
      next(error);
    }
  }
}

export default new BlogController();
