import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Eye, Mail, KeyRound } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import type { User, CreateUserInput, UpdateUserInput } from '@/types/user'
import { createUser, deactivateUser, getUsers, updateUser, resendConfirmation, resetPasswordByAdmin } from '@/services/user.service'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { ROLES, ROLES_VISIBLE_IN_USERS } from '@/constants/roles'
import { EmailLink } from '@/components/atoms/EmailLink'
import { PasswordInput } from '@/components/atoms/PasswordInput'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
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
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [passwordPrompt, setPasswordPrompt] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    variant?: 'default' | 'danger'
    onConfirm: (password: string) => void
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {},
  })

  const [createForm, setCreateForm] = useState<CreateUserInput>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: ROLES.PSICOLOGO,
    enrollmentNumber: '',
  })
  const [editForm, setEditForm] = useState<UpdateUserInput>({})
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})

  // Initialize cooldowns from sessionStorage on mount
  useEffect(() => {
    const activeCooldowns: Record<string, number> = {}
    const now = Date.now()

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.startsWith('cooldown_resend_') || key.startsWith('cooldown_reset_'))) {
        const val = sessionStorage.getItem(key)
        if (val) {
          const expiresAt = parseInt(val, 10)
          const remaining = Math.ceil((expiresAt - now) / 1000)
          if (remaining > 0) {
            const shortKey = key.replace('cooldown_', '') // e.g. resend_uuid
            activeCooldowns[shortKey] = remaining
          } else {
            sessionStorage.removeItem(key)
          }
        }
      }
    }
    setCooldowns(activeCooldowns)
  }, [])

  // Timer interval to tick active cooldowns
  useEffect(() => {
    const activeKeys = Object.keys(cooldowns)
    if (activeKeys.length === 0) return

    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const next = { ...prev }
        const now = Date.now()
        let hasChanges = false

        for (const key of Object.keys(next)) {
          const storageKey = `cooldown_${key}`
          const val = sessionStorage.getItem(storageKey)
          if (val) {
            const expiresAt = parseInt(val, 10)
            const remaining = Math.ceil((expiresAt - now) / 1000)
            if (remaining > 0) {
              if (next[key] !== remaining) {
                next[key] = remaining
                hasChanges = true
              }
            } else {
              delete next[key]
              sessionStorage.removeItem(storageKey)
              hasChanges = true
            }
          } else {
            delete next[key]
            hasChanges = true
          }
        }

        return hasChanges ? next : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldowns])

  const startCooldown = (type: 'resend' | 'reset', userId: string) => {
    const key = `${type}_${userId}`
    const storageKey = `cooldown_${key}`
    const durationMs = 30000 // 30 seconds
    const expiresAt = Date.now() + durationMs

    sessionStorage.setItem(storageKey, String(expiresAt))
    setCooldowns((prev) => ({
      ...prev,
      [key]: 30,
    }))
  }

  const handleResendConfirmation = async (user: User) => {
    setBusy(true)
    setError(null)
    try {
      await resendConfirmation(user.id)
      startCooldown('resend', user.id)
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || 'Error al reenviar la confirmación.')
    } finally {
      setBusy(false)
    }
  }

  const handleResetPassword = async (user: User) => {
    setBusy(true)
    setError(null)
    try {
      await resetPasswordByAdmin(user.id)
      startCooldown('reset', user.id)
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || 'Error al restablecer la contraseña.')
    } finally {
      setBusy(false)
    }
  }

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
    { id: 'username', label: 'Usuario', getValue: (row) => row.username || '—', sortable: true },
    {
      id: 'email',
      label: t('auth.email'),
      getValue: (row) => row.email,
      sortable: true,
      render: (row) => (row.email ? <EmailLink email={row.email} /> : '—'),
    },
    {
      id: 'phone',
      label: 'Teléfono',
      getValue: (row) => row.phone || '—',
      sortable: true,
      render: (row) => {
        if (!row.phone) return '—'
        const cleanNumber = row.phone.replace(/\D/g, '')
        return (
          <a
            href={`https://wa.me/${cleanNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 font-medium"
            style={{ color: '#25D366' }}
          >
            {row.phone}
          </a>
        )
      },
    },
    { id: 'role', label: t('auditLogs.tableRole'), getValue: (row) => t(`roles.${row.role}`) || row.role, sortable: true },
    {
      id: 'status',
      label: 'Estado',
      getValue: (row) => {
        if (!row.isConfirmed) return 'No confirmado'
        return row.isActive ? 'Activo' : 'Desactivado'
      },
      sortable: true,
      type: 'status',
      statusMap: {
        'No confirmado': 'warning',
        'Activo': 'success',
        'Desactivado': 'error',
      },
    },
    { id: 'createdAt', label: 'Fecha de Creación', getValue: (row) => row.createdAt ? formatDate(row.createdAt) : '—', sortable: true },
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
      role: u.role,
      isActive: u.isActive,
    })
  }

  const submitCreate = async () => {
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
      setCreateForm({ email: '', firstName: '', lastName: '', phone: '', role: ROLES.PSICOLOGO, enrollmentNumber: '' })
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

  const submitEdit = async (password: string) => {
    if (!editing) return
    setBusy(true)
    setError(null)
    try {
      await updateUser(editing.id, {
        ...editForm,
        firstName: editForm.firstName?.trim(),
        lastName: editForm.lastName?.trim(),
        phone: editForm.phone?.trim() || undefined,
      }, password)
      setEditing(null)
      setEditForm({})
      setPasswordPrompt((p) => ({ ...p, open: false }))
      load()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setPasswordPrompt((p) => ({ ...p, open: false }))
      setError(msg || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const handleSaveEditClick = () => {
    if (!editing) return
    setPasswordPrompt({
      open: true,
      title: 'Confirmar cambios',
      message: `Ingrese su contraseña de administrador para guardar los cambios de ${fullName(editing)}.`,
      confirmLabel: 'Guardar cambios',
      variant: 'default',
      onConfirm: (pwd) => submitEdit(pwd),
    })
  }

  const doDeactivate = async (id: string, password: string) => {
    setBusy(true)
    setError(null)
    try {
      await deactivateUser(id, password)
      setPasswordPrompt((p) => ({ ...p, open: false }))
      load()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setPasswordPrompt((p) => ({ ...p, open: false }))
      setError(msg || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const handleDeactivateClick = (u: User) => {
    setPasswordPrompt({
      open: true,
      title: 'Confirmar desactivación',
      message: `Se desactivará a ${fullName(u)}. Ingrese su contraseña de administrador para confirmar:`,
      confirmLabel: 'Desactivar',
      variant: 'danger',
      onConfirm: (pwd) => doDeactivate(u.id, pwd),
    })
  }

  const doActivate = async (id: string, password: string) => {
    setBusy(true)
    setError(null)
    try {
      await updateUser(id, { isActive: true }, password)
      setPasswordPrompt((p) => ({ ...p, open: false }))
      load()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setPasswordPrompt((p) => ({ ...p, open: false }))
      setError(msg || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const handleActivateClick = (u: User) => {
    setPasswordPrompt({
      open: true,
      title: 'Confirmar reactivación',
      message: `Se reactivará a ${fullName(u)}. Ingrese su contraseña de administrador para confirmar:`,
      confirmLabel: 'Reactivar',
      variant: 'default',
      onConfirm: (pwd) => doActivate(u.id, pwd),
    })
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading || busy} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />

      <AdminPasswordModal
        open={passwordPrompt.open}
        onClose={() => setPasswordPrompt((p) => ({ ...p, open: false }))}
        onConfirm={passwordPrompt.onConfirm}
        title={passwordPrompt.title}
        message={passwordPrompt.message}
        confirmLabel={passwordPrompt.confirmLabel}
        variant={passwordPrompt.variant}
        busy={busy}
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
          onRowClick={(row) => setViewingUser(row)}
          emptyMessage="No hay usuarios."
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            { key: 'search', label: t('common.search'), type: 'text', placeholder: 'Buscar por email o nombre', searchIcon: true, debounceMs: 350 },
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
                onClick={() => setViewingUser(row)}
              >
                <Eye size={16} />
                Ver
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                onClick={() => openEdit(row)}
              >
                <Pencil size={16} />
                {t('common.edit')}
              </button>
              {!row.isConfirmed ? (
                <button
                  type="button"
                  disabled={cooldowns[`resend_${row.id}`] !== undefined}
                  onClick={() => handleResendConfirmation(row)}
                  className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline"
                  title="Reenviar correo de confirmación"
                >
                  <Mail size={16} />
                  {cooldowns[`resend_${row.id}`] !== undefined ? `${cooldowns[`resend_${row.id}`]}s` : 'Reenviar'}
                </button>
              ) : (
                row.role !== 'admin' && (
                  <button
                    type="button"
                    disabled={cooldowns[`reset_${row.id}`] !== undefined}
                    onClick={() => handleResetPassword(row)}
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline"
                    title="Restablecer contraseña"
                  >
                    <KeyRound size={16} />
                    {cooldowns[`reset_${row.id}`] !== undefined ? `${cooldowns[`reset_${row.id}`]}s` : 'Restablecer'}
                  </button>
                )
              )}
              {row.isConfirmed && (
                row.role !== 'admin' ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.isActive}
                    title={row.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                    onClick={() => (row.isActive ? handleDeactivateClick(row) : handleActivateClick(row))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 ${
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
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={true}
                    disabled
                    title="Los administradores no pueden ser desactivados"
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-[var(--color-primary)]/50 opacity-60"
                  >
                    <span
                      className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-5"
                      style={{ marginTop: '2px' }}
                    />
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('auth.email')}</label>
                  <input className="glass-input w-full px-4 py-2.5" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
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
              {/* Fecha de nacimiento no requerida */}
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
              <GlassButton type="button" onClick={() => { setCreatingOpen(false); setEditing(null); }}>
                {t('common.cancel')}
              </GlassButton>
              <GlassButton type="button" variant="primary" onClick={creatingOpen ? submitCreate : handleSaveEditClick} disabled={busy}>
                {t('common.save')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {viewingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewingUser(null)}>
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Eye className="text-[var(--color-primary)]" size={22} />
                Detalles del Usuario
              </h2>
              <button
                type="button"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg"
                onClick={() => setViewingUser(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">Nombre Completo</span>
                <span className="text-base font-medium text-[var(--text-primary)]">{fullName(viewingUser)}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">Nombre de Usuario</span>
                <span className="text-base font-medium text-[var(--text-primary)] font-mono bg-white/5 dark:bg-black/20 px-2 py-0.5 rounded border border-[var(--border)] inline-block">{viewingUser.username}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">Correo Electrónico</span>
                <span className="text-base font-medium text-[var(--text-primary)]">
                  {viewingUser.email ? <EmailLink email={viewingUser.email} /> : '—'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">Rol de Sistema</span>
                <span className="text-base font-medium text-[var(--text-primary)] capitalize">
                  {t(`roles.${viewingUser.role}`) || viewingUser.role}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">Estado de Cuenta</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  !viewingUser.isConfirmed
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : viewingUser.isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    !viewingUser.isConfirmed
                      ? 'bg-amber-500'
                      : viewingUser.isActive
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`} />
                  {!viewingUser.isConfirmed ? 'No confirmado' : viewingUser.isActive ? 'Activo' : 'Desactivado'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">Teléfono de Contacto</span>
                <span className="text-base font-medium text-[var(--text-primary)]">{viewingUser.phone || '—'}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">Cédula / Matrícula</span>
                <span className="text-base font-medium text-[var(--text-primary)]">{viewingUser.enrollmentNumber || '—'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">Fecha de Creación (Registro)</span>
                <span className="text-base font-medium text-[var(--text-primary)]">
                  {viewingUser.createdAt ? formatDate(viewingUser.createdAt) : '—'}
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <GlassButton type="button" variant="primary" onClick={() => setViewingUser(null)}>
                Cerrar
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AdminPasswordModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (password: string) => void
  title: string
  message: string
  confirmLabel: string
  variant?: 'default' | 'danger'
  busy?: boolean
}

function AdminPasswordModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  variant = 'default',
  busy = false,
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setPassword('')
      setError('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError('La contraseña es requerida')
      return
    }
    onConfirm(password)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="glass-card flex w-full max-w-md flex-col gap-5 rounded-2xl px-8 py-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1 text-center w-full">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            {message}
          </p>
          <div className="text-left w-full">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Contraseña del Administrador
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="••••••••"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="flex w-full gap-3 justify-center mt-2">
          <GlassButton type="button" onClick={onClose} disabled={busy}>
            Cancelar
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            disabled={busy}
            className={variant === 'danger' ? '!bg-[var(--color-error)] hover:!opacity-90' : ''}
          >
            {busy ? 'Confirmando...' : confirmLabel}
          </GlassButton>
        </div>
      </form>
    </div>
  )
}

