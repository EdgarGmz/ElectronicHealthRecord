import { api } from '@/lib/api'

export interface BlogPost {
  id: string
  title: string
  content: string
  category: string
  imageUrl?: string | null
  likes: number
  authorId: string
  createdAt: string
  updatedAt: string
  author?: {
    firstName: string
    lastName: string
  }
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const { data } = await api.get<BlogPost[]>('/blogs')
  return data
}

export async function getBlogById(id: string): Promise<BlogPost> {
  const { data } = await api.get<BlogPost>(`/blogs/${id}`)
  return data
}

export async function createBlogPost(blogData: {
  title: string
  content: string
  category: string
  imageUrl?: string
}): Promise<BlogPost> {
  const { data } = await api.post<BlogPost>('/blogs', blogData)
  return data
}

export async function updateBlogPost(
  id: string,
  blogData: {
    title?: string
    content?: string
    category?: string
    imageUrl?: string
  }
): Promise<BlogPost> {
  const { data } = await api.put<BlogPost>(`/blogs/${id}`, blogData)
  return data
}

export async function deleteBlogPost(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/blogs/${id}`)
  return data
}
