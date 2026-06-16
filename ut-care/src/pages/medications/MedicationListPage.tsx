import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Pill, Pencil } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { getMedications } from '@/services/medication.service'
import type { Medication } from '@/types/medication'
import { useAuthStore } from '@/store/auth.store'
import { ROLES, ROLES_CAN_CREATE_MEDICATION } from '@/constants/roles'

/** Categorías de medicamentos (coinciden con el seed/API). */
const MEDICATION_CATEGORIES = [
  'Analgesic',
  'NSAID',
  'Antibiotic',
  'Proton Pump Inhibitor',
  'Antidiabetic',
  'Statin',
  'Antihypertensive',
  'SSRI',
  'Benzodiazepine',
  'Antihistamine',
  'Bronchodilator',
  'ACE Inhibitor',
  'Thyroid Hormone',
  'H2 Blocker',
  'Corticosteroid',
  'Insulin',
  'Antiplatelet',
  'Anticoagulant',
  'Antipsychotic',
  'Mood Stabilizer',
  'Anticonvulsant',
] as const

export function MedicationListPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const role = user?.role?.toLowerCase()?.trim() ?? ''
  const canCreate = role ? ROLES_CAN_CREATE_MEDICATION.includes(role) : false
  const isCoordinatorNursing = role === ROLES.COORDINADOR_ENFERMERIA
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(() => getDefaultTableLimit())
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: null,
    order: 'asc',
  })

  useEffect(() => {
    setLoading(true)
    setError(null)
    const isActive =
      isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined
    getMedications({
      page,
      limit,
      search: search || undefined,
      category: category || undefined,
      isActive,
    })
      .then((r) => {
        setMedications(r.medications)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, limit, search, category, isActiveFilter, t])

  const activeLabel = t('medications.active')
  const inactiveLabel = t('medications.inactive')

  /** Stock level: bajo 0-10, medio 11-30, alto 31+ */
  const getStockLevel = (stock: number): 'low' | 'medium' | 'high' => {
    if (stock <= 10) return 'low'
    if (stock <= 30) return 'medium'
    return 'high'
  }
  const stockLevelClasses: Record<'low' | 'medium' | 'high', string> = {
    low: 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40',
    medium: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40',
    high: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40',
  }
  const stockLevelLabels = {
    low: t('medications.stockLow'),
    medium: t('medications.stockMedium'),
    high: t('medications.stockHigh'),
  }

  const columns: DataTableColumn<Medication>[] = [
    {
      id: 'name',
      label: t('medications.name'),
      getValue: (row) => row.name,
      sortable: true,
    },
    {
      id: 'genericName',
      label: t('medications.genericName'),
      getValue: (row) => row.genericName,
      sortable: true,
    },
    {
      id: 'category',
      label: t('medications.category'),
      getValue: (row) => row.category ?? '—',
      sortable: true,
    },
    {
      id: 'stock',
      label: t('medications.stock'),
      getValue: (row) => row.stock ?? 0,
      sortable: true,
      render: (row) => {
        const stock = row.stock ?? 0
        const level = getStockLevel(stock)
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${stockLevelClasses[level]}`}>
            <span aria-hidden>{stock}</span>
            <span className="opacity-90">·</span>
            <span>{stockLevelLabels[level]}</span>
          </span>
        )
      },
    },
    {
      id: 'status',
      label: t('medications.status'),
      getValue: (row) => (row.isActive ? activeLabel : inactiveLabel),
      type: 'status',
      statusMap: {
        [activeLabel]: 'success',
        [inactiveLabel]: 'error',
      },
    },
  ]

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return medications
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return medications
    return [...medications].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [medications, sortState, columns])

  const filterValues = { search, category, isActive: isActiveFilter }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearch(value)
    else if (key === 'category') setCategory(value)
    else if (key === 'isActive') setIsActiveFilter(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setSearch('')
    setCategory('')
    setIsActiveFilter('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Pill className="text-[var(--color-primary)]" size={28} />
            {t('medications.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('medications.description')}
          </p>
        </div>
        {canCreate && (
          <div>
            <Link
              to="/medications/new"
              className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition-transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              {t('medications.newMedication')}
            </Link>
          </div>
        )}
      </div>
      <GlassCard>
        <DataTable
          columns={columns}
          data={sortedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage={t('medications.noMedications')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            {
              key: 'search',
              label: t('common.search'),
              type: 'text',
              placeholder: t('medications.searchPlaceholder'),
              searchIcon: true,
              debounceMs: 350,
            },
            {
              key: 'category',
              label: t('medications.category'),
              type: 'select',
              options: MEDICATION_CATEGORIES.map((value) => ({ value, label: value })),
            },
            {
              key: 'isActive',
              label: t('medications.status'),
              type: 'select',
              options: [
                { value: 'true', label: t('medications.active') },
                { value: 'false', label: t('medications.inactive') },
              ],
            },
          ]}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                to={`/medications/${row.id}`}
                className="inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                title={t('medications.viewDetail')}
                aria-label={t('medications.viewDetail')}
              >
                <Pill size={16} />
              </Link>
              {isCoordinatorNursing && (
                <Link
                  to={`/medications/${row.id}/edit`}
                  className="inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
                  title={t('common.edit', 'Editar')}
                  aria-label={t('common.edit', 'Editar')}
                >
                  <Pencil size={16} />
                </Link>
              )}
            </div>
          )}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="medicamentos"
          exportTitle={t('medications.title')}
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
    </div>
  )
}
