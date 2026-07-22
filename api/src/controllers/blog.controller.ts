import { Request, Response, NextFunction } from 'express';
import blogService from '../services/blog.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog, AUDIT_ACTIONS } from '../utils/audit';

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

      if (req.user?.userId) {
        await createAuditLog({
          userId: req.user.userId,
          action: AUDIT_ACTIONS.CREATE,
          tableName: 'blog_posts',
          recordId: blog.id,
          newValues: { title: blog.title, category: blog.category },
          req: req as Request,
        });
      }

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

      if (req.user?.userId) {
        await createAuditLog({
          userId: req.user.userId,
          action: AUDIT_ACTIONS.UPDATE,
          tableName: 'blog_posts',
          recordId: blog.id,
          newValues: { title: blog.title, category: blog.category, ...req.body },
          req: req as Request,
        });
      }

      res.json(blog);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const blog = await blogService.getBlogById(id);
      await blogService.deleteBlog(id);

      if (req.user?.userId && blog) {
        await createAuditLog({
          userId: req.user.userId,
          action: AUDIT_ACTIONS.DELETE,
          tableName: 'blog_posts',
          recordId: id,
          oldValues: { title: blog.title },
          req: req as Request,
        });
      }

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
