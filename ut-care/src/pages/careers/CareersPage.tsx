import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GraduationCap, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { getCareersAdmin, createCareer, updateCareer, deleteCareer } from '@/services/career.service'
import type { Career } from '@/types/career'
import { DataTable, type DataTableColumn } from '@/components/organisms/DataTable'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'

export function CareersPage() {
  const { t } = useTranslation()

  // Estados locales
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros y Paginación
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: 'name',
    order: 'asc',
  })

  // Modales
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCareer, setEditingCareer] = useState<Career | null>(null)
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null)
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Cargar carreras desde el backend
  const loadCareers = () => {
    setLoading(true)
    setError(null)
    getCareersAdmin()
      .then((data) => {
        setCareers(data)
      })
      .catch((err) => {
        const msg =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : null
        setError(msg || t('common.error'))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadCareers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filtrado y ordenamiento en cliente
  const filteredData = useMemo(() => {
    return careers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && c.isActive) ||
        (statusFilter === 'inactive' && !c.isActive)

      return matchesSearch && matchesStatus
    })
  }, [careers, search, statusFilter])

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return filteredData

    return [...filteredData].sort((a, b) => {
      let va: any = ''
      let vb: any = ''

      if (sortState.columnId === 'code') {
        va = a.code || ''
        vb = b.code || ''
      } else if (sortState.columnId === 'name') {
        va = a.name
        vb = b.name
      } else if (sortState.columnId === 'patients') {
        va = a._count?.patients ?? 0
        vb = b._count?.patients ?? 0
      } else if (sortState.columnId === 'status') {
        va = a.isActive ? 1 : 0
        vb = b.isActive ? 1 : 0
      }

      if (typeof va === 'number' && typeof vb === 'number') {
        return sortState.order === 'asc' ? va - vb : vb - va
      }

      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [filteredData, sortState])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit
    return sortedData.slice(start, start + limit)
  }, [sortedData, page, limit])

  const totalPages = Math.ceil(sortedData.length / limit) || 1

  // Manejar cambio de página al cambiar filtros
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  // Columnas de la tabla
  const columns: DataTableColumn<Career>[] = [
    {
      id: 'code',
      label: t('careers.code'),
      getValue: (row) => row.code || '—',
      sortable: true,
      render: (row) => (
        <span className="font-mono bg-white/5 dark:bg-black/20 px-2 py-0.5 rounded border border-[var(--border)] inline-block">
          {row.code}
        </span>
      ),
    },
    {
      id: 'name',
      label: t('careers.name'),
      getValue: (row) => row.name,
      sortable: true,
      render: (row) => <span className="font-medium text-[var(--text-primary)]">{row.name}</span>,
    },
    {
      id: 'patients',
      label: t('careers.studentCount'),
      getValue: (row) => row._count?.patients ?? 0,
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/20">
          {row._count?.patients ?? 0}
        </span>
      ),
    },
    {
      id: 'status',
      label: t('careers.status'),
      getValue: (row) => (row.isActive ? t('careers.active') : t('careers.inactive')),
      sortable: true,
      type: 'status',
      statusMap: {
        [t('careers.active')]: 'success',
        [t('careers.inactive')]: 'error',
      },
    },
  ]

  // Abrir modal de creación
  const handleAddClick = () => {
    setEditingCareer(null)
    setFormCode('')
    setFormName('')
    setFormError(null)
    setModalOpen(true)
  }

  // Abrir modal de edición
  const handleEditClick = (career: Career) => {
    setEditingCareer(career)
    setFormCode(career.code || '')
    setFormName(career.name)
    setFormError(null)
    setModalOpen(true)
  }

  // Guardar creación o edición
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formCode.trim()) {
      setFormError(t('careers.codeRequired', 'Las siglas son obligatorias'))
      return
    }
    if (!formName.trim()) {
      setFormError(t('careers.nameRequired', 'El nombre es obligatorio'))
      return
    }

    setBusy(true)
    try {
      if (editingCareer) {
        await updateCareer(editingCareer.id, {
          code: formCode.trim(),
          name: formName.trim(),
        })
      } else {
        await createCareer({
          code: formCode.trim(),
          name: formName.trim(),
        })
      }
      setModalOpen(false)
      loadCareers()
    } catch (err: any) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setFormError(msg || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  // Desactivación/Activación directa
  const handleStatusToggle = async (career: Career) => {
    if (career.isActive) {
      setSelectedCareer(career)
      setDeactivateConfirmOpen(true)
    } else {
      setBusy(true)
      try {
        await updateCareer(career.id, { isActive: true })
        loadCareers()
      } catch (err: any) {
        const msg =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : null
        setError(msg || t('common.error'))
      } finally {
        setBusy(false)
      }
    }
  }

  const confirmDeactivate = async () => {
    if (!selectedCareer) return
    setDeactivateConfirmOpen(false)
    setBusy(true)
    try {
      await updateCareer(selectedCareer.id, { isActive: false })
      loadCareers()
    } catch (err: any) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || t('common.error'))
    } finally {
      setBusy(false)
      setSelectedCareer(null)
    }
  }

  // Eliminación física
  const handleDeleteClick = (career: Career) => {
    if ((career._count?.patients ?? 0) > 0) {
      setError(t('careers.cannotDeleteWithStudents', 'No se puede eliminar la carrera porque tiene alumnos registrados.'))
      return
    }
    setSelectedCareer(career)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCareer) return
    setDeleteConfirmOpen(false)
    setBusy(true)
    try {
      await deleteCareer(selectedCareer.id)
      loadCareers()
    } catch (err: any) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || t('common.error'))
    } finally {
      setBusy(false)
      setSelectedCareer(null)
    }
  }

  // Acciones en cada fila
  const renderRowActions = (row: Career) => {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleEditClick(row)}
          className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--color-primary)] dark:hover:bg-white/5 transition-colors"
          title={t('common.edit')}
        >
          <Pencil size={18} />
        </button>

        <button
          type="button"
          onClick={() => handleStatusToggle(row)}
          className={`rounded-lg p-1.5 transition-colors ${
            row.isActive
              ? 'text-emerald-500 hover:bg-emerald-500/10'
              : 'text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
          }`}
          title={row.isActive ? t('careers.deactivateSuccess', 'Desactivar') : t('careers.activateSuccess', 'Activar')}
        >
          {row.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
        </button>

        <button
          type="button"
          onClick={() => handleDeleteClick(row)}
          disabled={(row._count?.patients ?? 0) > 0}
          className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-[var(--color-error)] dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={t('careers.deleteCareer')}
        >
          <Trash2 size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <LoadingModal open={loading || busy} message={t('common.loading')} />

      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <GraduationCap className="text-[var(--color-primary)]" size={28} />
            {t('careers.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('careers.description')}
          </p>
        </div>
        <div>
          <GlassButton type="button" variant="primary" onClick={handleAddClick} className="flex items-center gap-1">
            <Plus size={18} />
            {t('careers.addNew')}
          </GlassButton>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500 flex justify-between items-center">
          <span>{error}</span>
          <button type="button" className="text-red-500 hover:font-bold ml-2" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Tabla de Carreras */}
      <div className="glass-card rounded-2xl p-4 shadow-lg border border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-md">
        <DataTable
          columns={columns}
          data={paginatedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={null}
          emptyMessage="No se encontraron carreras universitarias."
          pagination={{
            page,
            limit,
            total: sortedData.length,
            totalPages,
          }}
          onPageChange={setPage}
          onLimitChange={setLimit}
          filterValues={{
            search,
            status: statusFilter,
          }}
          onFilterChange={(key, value) => {
            if (key === 'search') setSearch(value)
            if (key === 'status') setStatusFilter(value as any)
          }}
          onClearFilters={() => {
            setSearch('')
            setStatusFilter('all')
          }}
          filters={[
            {
              key: 'search',
              label: t('common.search'),
              type: 'text',
              placeholder: t('careers.searchPlaceholder'),
              searchIcon: true,
            },
            {
              key: 'status',
              label: t('careers.status'),
              type: 'select',
              options: [
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: t('careers.active') },
                { value: 'inactive', label: t('careers.inactive') },
              ],
            },
          ]}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={renderRowActions}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="carreras_universitarias"
          exportTitle={t('careers.title')}
          i18n={{
            actions: t('table.actions'),
            clearFilters: t('table.clearFilters'),
            export: t('table.export'),
            exportPdf: t('table.exportPdf'),
            exportCsv: t('table.exportCsv'),
            exportExcel: t('table.exportExcel'),
            previous: t('table.previous'),
            next: t('table.next'),
            page: t('table.page'),
            of: t('table.of'),
            all: t('table.all'),
            rowsPerPage: t('table.rowsPerPage'),
          }}
        />
      </div>

      {/* Modal Agregar / Editar Carrera */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <form
            onSubmit={handleSaveForm}
            className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <GraduationCap className="text-[var(--color-primary)]" size={22} />
                {editingCareer ? t('careers.editCareer') : t('careers.addNew')}
              </h2>
              <button
                type="button"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="formCode" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('careers.code')} <span className="text-red-500">*</span>
              </label>
              <input
                id="formCode"
                type="text"
                maxLength={30}
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="Ej. TSU-DGS"
                className="w-full rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 focus:outline-none dark:bg-black/20"
              />
            </div>

            <div>
              <label htmlFor="formName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('careers.name')} <span className="text-red-500">*</span>
              </label>
              <input
                id="formName"
                type="text"
                maxLength={150}
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej. TSU en Desarrollo y Gestión de Software"
                className="w-full rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 focus:outline-none dark:bg-black/20"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <GlassButton type="button" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </GlassButton>
              <GlassButton type="submit" variant="primary" disabled={busy}>
                {t('common.save')}
              </GlassButton>
            </div>
          </form>
        </div>
      )}

      {/* Confirmación Desactivación */}
      <ConfirmModal
        open={deactivateConfirmOpen}
        onClose={() => {
          setDeactivateConfirmOpen(false)
          setSelectedCareer(null)
        }}
        onConfirm={confirmDeactivate}
        title={t('careers.deactivateConfirmTitle', '¿Desactivar carrera?')}
        message={t(
          'careers.deactivateConfirmMessage',
          '¿Estás seguro de que deseas desactivar la carrera "{{name}}"? Los estudiantes existentes se mantendrán, pero no se podrán registrar nuevos estudiantes en esta carrera.',
          { name: selectedCareer?.name }
        )}
        confirmLabel={t('careers.deactivateSuccess', 'Desactivar')}
        variant="danger"
        confirming={busy}
      />

      {/* Confirmación Eliminación */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setSelectedCareer(null)
        }}
        onConfirm={confirmDelete}
        title={t('careers.deleteConfirmTitle', '¿Eliminar carrera?')}
        message={t(
          'careers.deleteConfirmMessage',
          '¿Estás seguro de que deseas eliminar la carrera "{{name}}"? Esta acción no se puede deshacer.',
          { name: selectedCareer?.name }
        )}
        confirmLabel={t('common.delete', 'Eliminar')}
        variant="danger"
        confirming={busy}
      />
    </div>
  )
}
