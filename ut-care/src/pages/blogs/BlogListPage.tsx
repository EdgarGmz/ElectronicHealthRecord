import { useEffect, useState } from 'react'
import {
  Rss,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  ThumbsUp,
  Search
} from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import {
  getAllBlogs,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogPost
} from '@/services/blog.service'

const CATEGORIES = ['Salud Mental', 'Salud Física', 'Evento', 'Día Especial']

export function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Form / Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const fetchBlogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllBlogs()
      setBlogs(data)
    } catch (err) {
      console.error(err)
      setError('Error al obtener las publicaciones del Mural.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleOpenCreate = () => {
    setEditingPost(null)
    setTitle('')
    setContent('')
    setCategory('Salud Mental')
    setImageUrl('')
    setModalOpen(true)
  }

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post)
    setTitle(post.title)
    setContent(post.content)
    setCategory(post.category)
    setImageUrl(post.imageUrl || '')
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !category) {
      alert('Por favor rellena los campos obligatorios.')
      return
    }

    setLoading(true)
    try {
      if (editingPost) {
        await updateBlogPost(editingPost.id, {
          title,
          content,
          category,
          imageUrl: imageUrl.trim() || undefined
        })
        alert('Publicación actualizada correctamente.')
      } else {
        await createBlogPost({
          title,
          content,
          category,
          imageUrl: imageUrl.trim() || undefined
        })
        alert('Publicación creada y publicada en el Mural con éxito.')
      }
      setModalOpen(false)
      fetchBlogs()
    } catch (err) {
      console.error(err)
      alert('Error al guardar la publicación.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación del Mural? Esta acción no se puede deshacer.')) {
      return
    }

    setLoading(true)
    try {
      await deleteBlogPost(id)
      alert('Publicación eliminada correctamente.')
      fetchBlogs()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar la publicación.')
    } finally {
      setLoading(false)
    }
  }

  const filteredBlogs = blogs.filter((post) => {
    const search = searchQuery.toLowerCase()
    return (
      post.title.toLowerCase().includes(search) ||
      post.content.toLowerCase().includes(search) ||
      post.category.toLowerCase().includes(search)
    )
  })

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message="Procesando..." />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Rss className="text-[var(--color-primary)]" />
            Gestión del Mural de Kiosko
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Crea, edita y publica artículos informativos, consejos de salud y eventos para la comunidad UTSC.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary)]/80 transition-colors shadow-md"
        >
          <Plus size={18} />
          Nueva Publicación
        </button>
      </div>

      {/* Search Bar */}
      <GlassCard className="p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar publicaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-8 pr-3 py-1.5 text-sm rounded-lg"
          />
          <Search size={16} className="absolute left-2.5 top-2.5 text-[var(--text-secondary)]" />
        </div>
      </GlassCard>

      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] text-[var(--color-error)] text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[var(--text-secondary)]">
            No se encontraron publicaciones en el Mural. ¡Crea una nueva!
          </div>
        ) : (
          filteredBlogs.map((post) => (
            <GlassCard key={post.id} className="flex flex-col h-full overflow-hidden hover:scale-[1.01] transition-transform duration-200">
              {post.imageUrl && (
                <div className="h-44 overflow-hidden relative border-b border-[var(--border)]">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/800/400'
                    }}
                  />
                  <span className="absolute top-2 right-2 px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {!post.imageUrl && (
                    <span className="inline-block px-2.5 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold rounded-full mb-1">
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-2" title={post.title}>
                    {post.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-4">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5" title="Reacciones de alumnos">
                    <ThumbsUp size={14} className="text-[var(--color-primary)]" />
                    <span>{post.likes} Me gusta</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-blue-500 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-xl p-6 bg-[var(--background-card)]">
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-3 mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {editingPost ? 'Editar Publicación' : 'Nueva Publicación de Mural'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Título de la Publicación *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Estrategias de estudio para evitar la ansiedad"
                  className="glass-input w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">Categoría *</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-lg"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-secondary)]">URL de Imagen (Opcional)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="glass-input w-full px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Contenido *</label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Redacta los detalles o artículo que verán los alumnos en el Kiosko..."
                  className="glass-input w-full px-3 py-2 rounded-lg resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 text-[var(--text-primary)] font-semibold rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary)]/80"
                >
                  {editingPost ? 'Guardar Cambios' : 'Publicar'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
