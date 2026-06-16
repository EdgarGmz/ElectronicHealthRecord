import { Request, Response, NextFunction } from 'express';
import blogService from '../services/blog.service';
import { AppError } from '../middleware/errorHandler';

const validatePasscode = (req: Request) => {
  const inputPasscode = req.headers['x-admin-passcode'] || req.body.passcode;
  const masterPasscode = process.env.BLOG_ADMIN_PASSCODE || 'utsc-care-master-2026';

  if (!inputPasscode || inputPasscode !== masterPasscode) {
    throw new AppError('Acceso no autorizado. Contraseña maestra inválida.', 401);
  }
};

export class BlogController {
  async getAll(req: Request, res: Response, next: NextFunction) {
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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      validatePasscode(req);
      const { title, content, category, imageUrl, authorId } = req.body;

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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      validatePasscode(req);
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

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      validatePasscode(req);
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
