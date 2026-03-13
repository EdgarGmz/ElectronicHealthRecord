import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Power, PowerOff } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import type { User, CreateUserInput, UpdateUserInput } from '@/types/user'
import { createUser, deactivateUser, getUsers, updateUser } from '@/services/user.service'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { ROLES, ROLES_VISIBLE_IN_USERS } from '@/constants/roles'
import { PasswordInput } from '@/components/atoms/PasswordInput'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

function fullName(u: User): string {
  return `${u.firstName} ${u.lastName}`.trim()
}

export function UsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(() => getDefaultTableLimit())
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('') // active|inactive|''
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({ columnId: null, order: 'asc' })

  const [editing, setEditing] = useState<User | null>(null)
  const [creatingOpen, setCreatingOpen] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null)
  const [confirmActivate, setConfirmActivate] = useState<User | null>(null)

  const [createForm, setCreateForm] = useState<CreateUserInput>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    role: ROLES.PSICOLOGO,
    enrollmentNumber: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [editForm, setEditForm] = useState<UpdateUserInput>({})

  const load = () => {
    setLoading(true)
    setError(null)
    getUsers({ page, limit, search: search || undefined })
      .then((r) => {
        let list = r.users
        if (role) list = list.filter((u) => u.role === role)
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
  }, [page, search, role, status, t])

  const columns: DataTableColumn<User>[] = [
    { id: 'name', label: t('auditLogs.tableUser'), getValue: (row) => fullName(row), sortable: true },
    { id: 'email', label: t('auth.email'), getValue: (row) => row.email, sortable: true },
    { id: 'role', label: t('auditLogs.tableRole'), getValue: (row) => t(`roles.${row.role}`) || row.role, sortable: true },
    {
      id: 'status',
      label: 'Estado',
      getValue: (row) => (row.isActive ? 'Activo' : 'Inactivo'),
      sortable: true,
      type: 'status',
      statusMap: { Activo: 'success', Inactivo: 'error' },
    },
    { id: 'dob', label: t('profilePage.dateOfBirth'), getValue: (row) => formatDate(row.dateOfBirth), sortable: true },
    { id: 'createdAt', label: t('auditLogs.tableDate'), getValue: (row) => row.createdAt ? formatDate(row.createdAt) : '—', sortable: true },
  ]

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

  const filterValues = { search, role, status }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearch(value)
    else if (key === 'role') setRole(value)
    else if (key === 'status') setStatus(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setSearch('')
    setRole('')
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
      role: u.role,
      isActive: u.isActive,
    })
  }

  const submitCreate = async () => {
    if (createForm.password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await createUser({
        ...createForm,
        email: createForm.email.trim(),
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        phone: createForm.phone?.trim() || undefined,
        enrollmentNumber: createForm.enrollmentNumber?.trim() || undefined,
      })
      setCreatingOpen(false)
      setCreateForm({ email: '', password: '', firstName: '', lastName: '', dateOfBirth: '', phone: '', role: ROLES.PSICOLOGO, enrollmentNumber: '' })
      setConfirmPassword('')
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

  const submitEdit = async () => {
    if (!editing) return
    setBusy(true)
    setError(null)
    try {
      await updateUser(editing.id, {
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
      await deactivateUser(confirmDeactivate.id)
      setConfirmDeactivate(null)
      load()
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const doActivate = async () => {
    if (!confirmActivate) return
    setBusy(true)
    setError(null)
    try {
      await updateUser(confirmActivate.id, { isActive: true })
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
        title="Desactivar usuario"
        message={`Se desactivará a ${confirmDeactivate ? fullName(confirmDeactivate) : ''}.`}
        confirmLabel="Desactivar"
      />
      <ConfirmModal
        open={!!confirmActivate}
        onClose={() => setConfirmActivate(null)}
        onConfirm={doActivate}
        confirming={busy}
        title="Reactivar usuario"
        message={`Se reactivará a ${confirmActivate ? fullName(confirmActivate) : ''}.`}
        confirmLabel="Reactivar"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <GlassButton
          type="button"
          variant="primary"
          className="inline-flex items-center gap-2"
          onClick={() => setCreatingOpen(true)}
        >
          <Plus size={18} />
          Crear usuario
        </GlassButton>
      </div>

      <GlassCard>
        <DataTable
          columns={columns}
          data={sortedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage="No hay usuarios."
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            { key: 'search', label: t('common.search'), type: 'text', placeholder: 'Buscar por email o nombre' },
            {
              key: 'role',
              label: t('auditLogs.filterRole'),
              type: 'select',
              options: ROLES_VISIBLE_IN_USERS.map((v) => ({ value: v, label: t(`roles.${v}`) })),
            },
            {
              key: 'status',
              label: 'Estado',
              type: 'select',
              options: [
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
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
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                onClick={() => openEdit(row)}
              >
                <Pencil size={16} />
                {t('common.edit')}
              </button>
              {row.role !== 'admin' && (
                row.isActive ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[var(--color-error)] hover:underline"
                    onClick={() => setConfirmDeactivate(row)}
                  >
                    <PowerOff size={16} />
                    Desactivar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                    onClick={() => setConfirmActivate(row)}
                  >
                    <Power size={16} />
                    Reactivar
                  </button>
                )
              )}
            </div>
          )}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="usuarios"
          exportTitle={t('nav.users')}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {creatingOpen ? 'Crear usuario' : 'Editar usuario'}
              </h2>
              <button
                type="button"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => { setCreatingOpen(false); setEditing(null); setConfirmPassword(''); }}
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {creatingOpen && (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('auth.email')}</label>
                    <input className="glass-input w-full px-4 py-2.5" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('auth.password')}</label>
                    <PasswordInput
                      className=""
                      value={createForm.password}
                      onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      showStrength
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('auth.confirmPassword')}</label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('profilePage.firstName')}</label>
                <input
                  className="glass-input w-full px-4 py-2.5"
                  value={creatingOpen ? createForm.firstName : (editForm.firstName ?? '')}
                  onChange={(e) => creatingOpen
                    ? setCreateForm((p) => ({ ...p, firstName: e.target.value }))
                    : setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('profilePage.lastName')}</label>
                <input
                  className="glass-input w-full px-4 py-2.5"
                  value={creatingOpen ? createForm.lastName : (editForm.lastName ?? '')}
                  onChange={(e) => creatingOpen
                    ? setCreateForm((p) => ({ ...p, lastName: e.target.value }))
                    : setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('profilePage.dateOfBirth')}</label>
                <input
                  type="date"
                  className="glass-input w-full px-4 py-2.5"
                  value={creatingOpen ? createForm.dateOfBirth : (editForm.dateOfBirth ?? '')}
                  onChange={(e) => creatingOpen
                    ? setCreateForm((p) => ({ ...p, dateOfBirth: e.target.value }))
                    : setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('profilePage.phone')}</label>
                <input
                  className="glass-input w-full px-4 py-2.5"
                  value={creatingOpen ? (createForm.phone ?? '') : (editForm.phone ?? '')}
                  onChange={(e) => creatingOpen
                    ? setCreateForm((p) => ({ ...p, phone: e.target.value }))
                    : setEditForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('profilePage.role')}</label>
                <select
                  className="glass-input w-full px-4 py-2.5"
                  value={creatingOpen ? createForm.role : String(editForm.role ?? '')}
                  onChange={(e) => creatingOpen
                    ? setCreateForm((p) => ({ ...p, role: e.target.value }))
                    : setEditForm((p) => ({ ...p, role: e.target.value }))}
                  disabled={!creatingOpen && editing?.role === 'admin'}
                >
                  {ROLES_VISIBLE_IN_USERS.map((r) => (
                    <option key={r} value={r}>{t(`roles.${r}`)}</option>
                  ))}
                </select>
              </div>
              {creatingOpen && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('profilePage.enrollmentNumber')}</label>
                  <input className="glass-input w-full px-4 py-2.5" value={createForm.enrollmentNumber ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, enrollmentNumber: e.target.value }))} />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <GlassButton type="button" onClick={() => { setCreatingOpen(false); setEditing(null); setConfirmPassword(''); }}>
                {t('common.cancel')}
              </GlassButton>
              <GlassButton type="button" variant="primary" onClick={creatingOpen ? submitCreate : submitEdit} disabled={busy}>
                {t('common.save')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

