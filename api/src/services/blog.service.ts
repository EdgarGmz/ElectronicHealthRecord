import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface CreateBlogDto {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  authorId?: string;
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  category?: string;
  imageUrl?: string;
}

export class BlogService {
  async getAllBlogs() {
    return prisma.blogPost.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async getBlogById(id: string) {
    const blog = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!blog) {
      throw new AppError('Publicación no encontrada', 404);
    }

    return blog;
  }

  async createBlog(data: CreateBlogDto) {
    return prisma.blogPost.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        imageUrl: data.imageUrl || null,
        authorId: data.authorId || null,
      },
    });
  }

  async updateBlog(id: string, data: UpdateBlogDto) {
    await this.getBlogById(id); // Valida existencia

    return prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async deleteBlog(id: string) {
    await this.getBlogById(id); // Valida existencia

    return prisma.blogPost.delete({
      where: { id },
    });
  }

  async incrementLikes(id: string) {
    await this.getBlogById(id); // Valida existencia

    return prisma.blogPost.update({
      where: { id },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
  }
}

export default new BlogService();
