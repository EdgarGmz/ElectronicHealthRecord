import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Users, GraduationCap, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import type { User } from '@/types/user'
import type {
  CreatePsychologistInput,
  UpdatePsychologistInput,
  PsychologistWithCareers,
} from '@/services/supervision-psychologists.service'
import {
  getPsychologists,
  createPsychologist,
  updatePsychologist,
  deactivatePsychologist,
  deletePsychologistPermanently,
  getPsychologistCareers,
  setPsychologistCareers,
  getCareersWithAssignments,
  type CareerWithAssignment,
} from '@/services/supervision-psychologists.service'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { PasswordInput } from '@/components/atoms/PasswordInput'

function fullName(u: User): string {
  return `${u.firstName} ${u.lastName}`.trim()
}

export function SupervisionPsychologistsPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<PsychologistWithCareers[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(() => getDefaultTableLimit())
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: null,
    order: 'asc',
  })

  const [editing, setEditing] = useState<User | null>(null)
  const [creatingOpen, setCreatingOpen] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null)
  const [confirmDeletePermanent, setConfirmDeletePermanent] = useState<User | null>(null)
  const [confirmActivate, setConfirmActivate] = useState<User | null>(null)

  const [createForm, setCreateForm] = useState<CreatePsychologistInput>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    enrollmentNumber: '',
  })
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [confirmPassword, setConfirmPassword] = useState('')
  const [editForm, setEditForm] = useState<UpdatePsychologistInput>({})

  const [careersModalUser, setCareersModalUser] = useState<User | null>(null)
  const [careersList, setCareersList] = useState<CareerWithAssignment[]>([])
  const [careerIdsSelected, setCareerIdsSelected] = useState<string[]>([])
  const [careersLoading, setCareersLoading] = useState(false)
  const [careersSaving, setCareersSaving] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    getPsychologists({ page, limit, search: search || undefined })
      .then((r) => {
        let list = r.users
        if (status === 'active') list = list.filter((u) => u.isActive)
        if (status === 'inactive') list = list.filter((u) => !u.isActive)
        setUsers(list)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, status])

  const openCareersModal = useCallback(
    (u: User) => {
      setCareersModalUser(u)
      setCareerIdsSelected([])
      setCareersList([])
      setCareersLoading(true)
      Promise.all([getCareersWithAssignments(), getPsychologistCareers(u.id)])
        .then(([careerList, ids]) => {
          setCareersList(careerList)
          setCareerIdsSelected(ids)
        })
        .catch(() => setError(t('common.error')))
        .finally(() => setCareersLoading(false))
    },
    [t]
  )

  const columns = useMemo<DataTableColumn<PsychologistWithCareers>[]>(
    () => [
      {
        id: 'name',
        label: t('supervision.psychologists.tableName'),
        getValue: (row) => fullName(row),
        sortable: true,
      },
    {
      id: 'email',
      label: t('auth.email'),
      getValue: (row) => row.email,
      sortable: true,
      render: (row) => (
        <a
          href={`mailto:${row.email}`}
          className="text-[var(--color-primary)] hover:underline"
        >
          {row.email}
        </a>
      ),
    },
    {
      id: 'careers',
      label: t('supervision.psychologists.tableCareers'),
      getValue: (row) =>
        row.careers?.length ? row.careers.map((c) => c.name).join(', ') : '—',
      sortable: false,
      render: (row) =>
        row.careers?.length ? (
          <button
            type="button"
            onClick={() => openCareersModal(row)}
            className="w-full text-left text-[var(--color-primary)] hover:underline focus:outline-none focus:underline"
            title={t('supervision.psychologists.careersButtonTitle')}
          >
            <ul className="list-inside list-disc text-left">
              {row.careers.map((c) => (
                <li key={c.id} className="text-sm">
                  {c.name}
                </li>
              ))}
            </ul>
          </button>
        ) : (
          <div className="flex justify-center">
            <GlassButton
              type="button"
              variant="primary"
              onClick={() => openCareersModal(row)}
              className="inline-flex items-center gap-1.5 text-sm"
              title={t('supervision.psychologists.careersButtonTitle')}
            >
              <GraduationCap size={16} />
              {t('supervision.psychologists.careersAssignButton')}
            </GlassButton>
          </div>
        ),
    },
    {
      id: 'contact',
      label: t('supervision.psychologists.tableContact'),
      getValue: (row) => row.phone ?? '—',
      sortable: false,
      render: (row) => {
        const raw = (row.phone ?? '').replace(/\D/g, '')
        const waNumber = raw.length === 10 ? `52${raw}` : raw.length > 0 ? raw : null
        const href = waNumber ? `https://wa.me/${waNumber}` : undefined
        if (!href) return <span className="text-[var(--text-muted)]">—</span>
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#25D366] hover:opacity-90"
            title="Abrir WhatsApp"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-[var(--text-primary)] hover:underline">{row.phone}</span>
          </a>
        )
      },
    },
    {
      id: 'status',
      label: t('supervision.psychologists.tableStatus'),
      getValue: (row) =>
        row.isActive
          ? t('supervision.psychologists.statusActive')
          : t('supervision.psychologists.statusInactive'),
      sortable: true,
      type: 'status',
      statusMap: {
        [t('supervision.psychologists.statusActive')]: 'success',
        [t('supervision.psychologists.statusInactive')]: 'error',
      },
    },
    ],
    [t, openCareersModal]
  )

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return users
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return users
    return [...users].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [users, sortState, columns])

  const filterValues = { search, status }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearch(value)
    else if (key === 'status') setStatus(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setSearch('')
    setStatus('')
    setPage(1)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone ?? '',
      dateOfBirth: u.dateOfBirth.slice(0, 10),
      isActive: u.isActive,
    })
  }

  const closeCareersModal = () => {
    setCareersModalUser(null)
    setCareersList([])
    setCareerIdsSelected([])
  }

  const toggleCareerInModal = (careerId: string) => {
    setCareerIdsSelected((prev) =>
      prev.includes(careerId) ? prev.filter((id) => id !== careerId) : [...prev, careerId]
    )
  }

  const saveCareers = async () => {
    if (!careersModalUser) return
    setCareersSaving(true)
    setError(null)
    try {
      await setPsychologistCareers(careersModalUser.id, careerIdsSelected)
      closeCareersModal()
      load()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || t('common.error'))
    } finally {
      setCareersSaving(false)
    }
  }

  const submitCreate = async () => {
    setCreateErrors({})
    const err: Record<string, string> = {}
    const email = createForm.email.trim()
    if (!email) err.email = t('common.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = t('auth.invalidEmail')
    if (!createForm.password) err.password = t('common.required')
    else if (createForm.password.length < 8) err.password = t('auth.passwordMinLength')
    if (createForm.password !== confirmPassword) err.confirmPassword = t('auth.passwordMismatch')
    if (!createForm.firstName.trim()) err.firstName = t('common.required')
    if (!createForm.lastName.trim()) err.lastName = t('common.required')
    if (!createForm.dateOfBirth) err.dateOfBirth = t('common.required')
    if (Object.keys(err).length > 0) {
      setCreateErrors(err)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await createPsychologist({
        ...createForm,
        email,
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        phone: createForm.phone?.trim() || undefined,
        enrollmentNumber: createForm.enrollmentNumber?.trim() || undefined,
      })
      setCreatingOpen(false)
      setCreateForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phone: '',
        enrollmentNumber: '',
      })
      setConfirmPassword('')
      setCreateErrors({})
      load()
    } catch (e: unknown) {
      const response = e && typeof e === 'object' && 'response' in e ? (e as { response?: { status?: number; data?: { errors?: Array<{ path?: string; param?: string; msg?: string }>; message?: string } } }).response : null
      const res = response?.data
      const status = response?.status
      const isEmailConflict = status === 409 || /email|correo|registrado|already registered/i.test(res?.message ?? '')
      if (res?.errors && Array.isArray(res.errors) && res.errors.length > 0) {
        const byField: Record<string, string> = {}
        for (const item of res.errors) {
          const field = item.path ?? item.param ?? 'form'
          byField[field] = item.msg ?? res.message ?? t('common.error')
        }
        setCreateErrors(byField)
      } else if (isEmailConflict) {
        setCreateErrors({ email: t('patients.emailAlreadyRegistered') })
      } else {
        setError(res?.message ?? t('common.error'))
      }
    } finally {
      setBusy(false)
    }
  }

  const submitEdit = async () => {
    if (!editing) return
    setBusy(true)
    setError(null)
    try {
      await updatePsychologist(editing.id, {
        ...editForm,
        firstName: editForm.firstName?.trim(),
        lastName: editForm.lastName?.trim(),
        phone: editForm.phone?.trim() || undefined,
      })
      setEditing(null)
      setEditForm({})
      load()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const doDeactivate = async () => {
    if (!confirmDeactivate) return
    setBusy(true)
    setError(null)
    try {
      await deactivatePsychologist(confirmDeactivate.id)
      setConfirmDeactivate(null)
      load()
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const doDeletePermanent = async () => {
    if (!confirmDeletePermanent) return
    setBusy(true)
    setError(null)
    try {
      await deletePsychologistPermanently(confirmDeletePermanent.id)
      setConfirmDeletePermanent(null)
      load()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const doActivate = async () => {
    if (!confirmActivate) return
    setBusy(true)
    setError(null)
    try {
      await updatePsychologist(confirmActivate.id, { isActive: true })
      setConfirmActivate(null)
      load()
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading || busy} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />

      <ConfirmModal
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={doDeactivate}
        confirming={busy}
        variant="danger"
        title={t('supervision.psychologists.deactivateTitle')}
        message={t('supervision.psychologists.deactivateMessage', { name: confirmDeactivate ? fullName(confirmDeactivate) : '' })}
        confirmLabel={t('supervision.psychologists.deactivateConfirm')}
      />
      <ConfirmModal
        open={!!confirmDeletePermanent}
        onClose={() => setConfirmDeletePermanent(null)}
        onConfirm={doDeletePermanent}
        confirming={busy}
        variant="danger"
        title={t('supervision.psychologists.deletePermanentTitle')}
        message={t('supervision.psychologists.deletePermanentMessage', { name: confirmDeletePermanent ? fullName(confirmDeletePermanent) : '' })}
        confirmLabel={t('supervision.psychologists.deletePermanentConfirm')}
      />
      <ConfirmModal
        open={!!confirmActivate}
        onClose={() => setConfirmActivate(null)}
        onConfirm={doActivate}
        confirming={busy}
        title={t('supervision.psychologists.activateTitle')}
        message={t('supervision.psychologists.activateMessage', { name: confirmActivate ? fullName(confirmActivate) : '' })}
        confirmLabel={t('supervision.psychologists.activateConfirm')}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <Users size={28} className="text-[var(--color-primary)]" />
          <div>
            <h2 className="text-lg font-semibold">{t('supervision.psychologists.title')}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('supervision.psychologists.description')}</p>
          </div>
        </div>
        <GlassButton
          type="button"
          variant="primary"
          className="inline-flex items-center gap-2"
          onClick={() => setCreatingOpen(true)}
        >
          <Plus size={18} />
          {t('supervision.psychologists.createButton')}
        </GlassButton>
      </div>

      <GlassCard>
        <DataTable
          columns={columns}
          data={sortedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage={t('supervision.psychologists.emptyList')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l)
            setPage(1)
          }}
          filters={[
            {
              key: 'search',
              label: t('common.search'),
              type: 'text',
              placeholder: t('supervision.psychologists.searchPlaceholder'),
              searchIcon: true,
              debounceMs: 350,
            },
            {
              key: 'status',
              label: t('supervision.psychologists.tableStatus'),
              type: 'select',
              options: [
                { value: 'active', label: t('supervision.psychologists.statusActive') },
                { value: 'inactive', label: t('supervision.psychologists.statusInactive') },
              ],
            },
          ]}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={(row) => (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center text-[var(--color-primary)] hover:opacity-80"
                onClick={() => openEdit(row)}
                title={t('common.edit')}
              >
                <Pencil size={16} />
              </button>
              {row.isActive && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center text-[var(--color-error)] hover:opacity-80"
                  onClick={() => setConfirmDeletePermanent(row)}
                  title={t('supervision.psychologists.deletePermanentConfirm')}
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                type="button"
                role="switch"
                aria-checked={row.isActive}
                title={row.isActive ? t('supervision.psychologists.deactivateConfirm') : t('supervision.psychologists.activateConfirm')}
                onClick={() => (row.isActive ? setConfirmDeactivate(row) : setConfirmActivate(row))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${
                  row.isActive ? 'bg-[var(--color-primary)]' : 'bg-[var(--text-muted)]/40'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    row.isActive ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                  style={{ marginTop: '2px' }}
                />
              </button>
            </div>
          )}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="psicologos"
          exportTitle={t('supervision.psychologists.title')}
          i18n={{
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
      </GlassCard>

      {(creatingOpen || editing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="glass-card w-full max-w-xl rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {creatingOpen ? t('supervision.psychologists.createTitle') : t('supervision.psychologists.editTitle')}
              </h2>
              <button
                type="button"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => {
                  setCreatingOpen(false)
                  setEditing(null)
                  setConfirmPassword('')
                  setCreateErrors({})
                }}
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {creatingOpen && (
                <>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('auth.email')}</label>
                    <input
                      className={`glass-input w-full px-4 py-2.5 ${createErrors.email ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                      value={createForm.email}
                      onChange={(e) => {
                        setCreateForm((p) => ({ ...p, email: e.target.value }))
                        if (createErrors.email) setCreateErrors((prev) => ({ ...prev, email: '' }))
                      }}
                    />
                    {createErrors.email && (
                      <p className="mt-1 text-sm text-[var(--color-error)]">{createErrors.email}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('auth.password')}</label>
                    <PasswordInput
                      value={createForm.password}
                      onChange={(e) => {
                        setCreateForm((p) => ({ ...p, password: e.target.value }))
                        if (createErrors.password) setCreateErrors((prev) => ({ ...prev, password: '' }))
                      }}
                      placeholder="••••••••"
                      showStrength
                      className={createErrors.password ? 'ring-2 ring-[var(--color-error)]' : ''}
                    />
                    {createErrors.password && (
                      <p className="mt-1 text-sm text-[var(--color-error)]">{createErrors.password}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('auth.confirmPassword')}</label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (createErrors.confirmPassword) setCreateErrors((prev) => ({ ...prev, confirmPassword: '' }))
                      }}
                      placeholder="••••••••"
                      className={createErrors.confirmPassword ? 'ring-2 ring-[var(--color-error)]' : ''}
                    />
                    {createErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-[var(--color-error)]">{createErrors.confirmPassword}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('profilePage.enrollmentNumber')}</label>
                    <input
                      className={`glass-input w-full px-4 py-2.5 ${createErrors.enrollmentNumber ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                      value={createForm.enrollmentNumber ?? ''}
                      onChange={(e) => {
                        setCreateForm((p) => ({ ...p, enrollmentNumber: e.target.value }))
                        if (createErrors.enrollmentNumber) setCreateErrors((prev) => ({ ...prev, enrollmentNumber: '' }))
                      }}
                    />
                    {createErrors.enrollmentNumber && (
                      <p className="mt-1 text-sm text-[var(--color-error)]">{createErrors.enrollmentNumber}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('profilePage.firstName')}</label>
                <input
                  className={`glass-input w-full px-4 py-2.5 ${creatingOpen && createErrors.firstName ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  value={creatingOpen ? createForm.firstName : editForm.firstName ?? ''}
                  onChange={(e) => {
                    if (creatingOpen) {
                      setCreateForm((p) => ({ ...p, firstName: e.target.value }))
                      if (createErrors.firstName) setCreateErrors((prev) => ({ ...prev, firstName: '' }))
                    } else setEditForm((p) => ({ ...p, firstName: e.target.value }))
                  }}
                />
                {creatingOpen && createErrors.firstName && (
                  <p className="mt-1 text-sm text-[var(--color-error)]">{createErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('profilePage.lastName')}</label>
                <input
                  className={`glass-input w-full px-4 py-2.5 ${creatingOpen && createErrors.lastName ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  value={creatingOpen ? createForm.lastName : editForm.lastName ?? ''}
                  onChange={(e) => {
                    if (creatingOpen) {
                      setCreateForm((p) => ({ ...p, lastName: e.target.value }))
                      if (createErrors.lastName) setCreateErrors((prev) => ({ ...prev, lastName: '' }))
                    } else setEditForm((p) => ({ ...p, lastName: e.target.value }))
                  }}
                />
                {creatingOpen && createErrors.lastName && (
                  <p className="mt-1 text-sm text-[var(--color-error)]">{createErrors.lastName}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('profilePage.dateOfBirth')}</label>
                <input
                  type="date"
                  className={`glass-input w-full px-4 py-2.5 ${creatingOpen && createErrors.dateOfBirth ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  value={creatingOpen ? createForm.dateOfBirth : editForm.dateOfBirth ?? ''}
                  onChange={(e) => {
                    if (creatingOpen) {
                      setCreateForm((p) => ({ ...p, dateOfBirth: e.target.value }))
                      if (createErrors.dateOfBirth) setCreateErrors((prev) => ({ ...prev, dateOfBirth: '' }))
                    } else setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))
                  }}
                />
                {creatingOpen && createErrors.dateOfBirth && (
                  <p className="mt-1 text-sm text-[var(--color-error)]">{createErrors.dateOfBirth}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('profilePage.phone')}</label>
                <input
                  className={`glass-input w-full px-4 py-2.5 ${creatingOpen && createErrors.phone ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  value={creatingOpen ? createForm.phone ?? '' : editForm.phone ?? ''}
                  onChange={(e) => {
                    if (creatingOpen) {
                      setCreateForm((p) => ({ ...p, phone: e.target.value }))
                      if (createErrors.phone) setCreateErrors((prev) => ({ ...prev, phone: '' }))
                    } else setEditForm((p) => ({ ...p, phone: e.target.value }))
                  }}
                />
                {creatingOpen && createErrors.phone && (
                  <p className="mt-1 text-sm text-[var(--color-error)]">{createErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <GlassButton
                type="button"
                onClick={() => {
                  setCreatingOpen(false)
                  setEditing(null)
                  setConfirmPassword('')
                  setCreateErrors({})
                }}
              >
                {t('common.cancel')}
              </GlassButton>
              <GlassButton
                type="button"
                variant="primary"
                onClick={creatingOpen ? submitCreate : submitEdit}
                disabled={busy}
              >
                {t('common.save')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {careersModalUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)] shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
                  <GraduationCap size={22} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {t('supervision.psychologists.careersModalTitle', { name: fullName(careersModalUser) })}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t('supervision.psychologists.careersModalDescription')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
                onClick={closeCareersModal}
                aria-label={t('common.close')}
              >
                ✕
              </button>
            </div>

            {careersLoading ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <Loader2 size={36} className="animate-spin text-[var(--color-primary)]" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {careerIdsSelected.length === 0
                      ? t('supervision.psychologists.careersNoneSelected')
                      : t('supervision.psychologists.careersSelectedCount', { count: careerIdsSelected.length })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCareerIdsSelected([])}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                  >
                    {t('supervision.psychologists.careersUncheckAll')}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {careersList.map((c) => {
                      const isChecked = careerIdsSelected.includes(c.id)
                      const isAssignedToOther =
                        c.assignedToPsychologistId != null &&
                        c.assignedToPsychologistId !== careersModalUser?.id
                      return (
                        <label
                          key={c.id}
                          className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all ${
                            isAssignedToOther
                              ? 'cursor-not-allowed border-[var(--border)] bg-black/5 opacity-70 dark:bg-white/5'
                              : isChecked
                                ? 'cursor-pointer border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10'
                                : 'cursor-pointer border-[var(--border)] hover:border-[var(--color-primary)]/30 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isAssignedToOther}
                            onChange={() => !isAssignedToOther && toggleCareerInModal(c.id)}
                            className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0 disabled:opacity-50"
                          />
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {c.name}
                            {c.code && (
                              <span className="ml-1.5 font-normal text-[var(--text-muted)]">({c.code})</span>
                            )}
                            {isAssignedToOther && (
                              <span className="ml-1.5 block font-normal italic text-[var(--text-muted)]">
                                {t('supervision.psychologists.careersAssignedToOther')}
                              </span>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  {careersList.length === 0 && (
                    <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                      {t('supervision.assignments.noCareers')}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 border-t border-[var(--border)] bg-black/5 px-5 py-4 dark:bg-white/5">
              <GlassButton type="button" onClick={closeCareersModal}>
                {t('common.cancel')}
              </GlassButton>
              <GlassButton
                type="button"
                variant="primary"
                onClick={saveCareers}
                disabled={careersLoading || careersSaving}
                className="inline-flex items-center gap-2"
              >
                {careersSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {t('common.save')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
