import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Pill } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getMedications } from '@/services/medication.service'
import type { Medication } from '@/types/medication'

export function MedicationListPage() {
  const { t } = useTranslation()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [page, setPage] = useState(1)
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
      limit: 10,
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
  }, [page, search, category, isActiveFilter, t])

  const activeLabel = t('medications.active')
  const inactiveLabel = t('medications.inactive')

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('medications.title')}</h1>
        <Link
          to="/medications/new"
          className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium"
        >
          <Plus size={18} />
          {t('medications.newMedication')}
        </Link>
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
          filters={[
            {
              key: 'search',
              label: t('common.search'),
              type: 'text',
              placeholder: t('medications.searchPlaceholder'),
            },
            {
              key: 'category',
              label: t('medications.category'),
              type: 'text',
              placeholder: t('medications.category'),
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
            <Link
              to={`/medications/${row.id}`}
              className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
            >
              <Pill size={16} />
              {t('medications.viewDetail')}
            </Link>
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
          }}
        />
      </GlassCard>
    </div>
  )
}
