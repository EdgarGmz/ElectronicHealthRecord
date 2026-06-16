import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, FileText, Activity } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { getPatients, createPatient } from '@/services/patient.service'
import type { Patient } from '@/types/patient'
import { getCareers } from '@/services/career.service'
import type { Career } from '@/types/career'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import {
  getNursingProcedures,
  getNursingProcedureById,
  createNursingProcedureFromPatient,
} from '@/services/nursing-procedure.service'
import type { NursingProcedure } from '@/types/nursing-procedure'
import { ensureExpedientForPatient } from '@/services/medical-record.service'

/** Valores que usa el API para procedureType. */
const PROCEDURE_TYPE_OPTIONS = [
  { value: '', labelKey: 'procedures.allTypes' },
  { value: 'Wound Dressing', labelKey: 'procedures.types.woundDressing' },
  { value: 'Blood Draw', labelKey: 'procedures.types.bloodDraw' },
  { value: 'Injection', labelKey: 'procedures.types.injection' },
  { value: 'Vital Signs', labelKey: 'procedures.types.vitalSigns' },
  { value: 'Catheterization', labelKey: 'procedures.types.catheterization' },
  { value: 'IV Administration', labelKey: 'procedures.types.ivAdministration' },
] as const

function patientName(p: NursingProcedure): string {
  const patient = p.consultation?.medicalRecord?.patient
  if (!patient?.user) return '—'
  return `${patient.user.firstName} ${patient.user.lastName}`.trim()
}

function getPatientId(p: NursingProcedure): string | null {
  return p.consultation?.medicalRecord?.patient?.id ?? null
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <p className="mt-0.5 text-[var(--text-primary)] whitespace-pre-wrap">{value}</p>
    </div>
  )
}

/** Procedure type option for the form select */
type ProcedureTypeOption = { value: string; labelKey: string }

function ProcedureForm({
  procedureTypeOptions,
  formProcedureType,
  setFormProcedureType,
  formProcedureDate,
  setFormProcedureDate,
  formDescription,
  setFormDescription,
  formMaterialsUsed,
  setFormMaterialsUsed,
  formObservations,
  setFormObservations,
  submitting,
  submitError,
  submitSuccess,
  onRegister,
  onCancel,
  t,
}: {
  procedureTypeOptions: ProcedureTypeOption[]
  formProcedureType: string
  setFormProcedureType: (v: string) => void
  formProcedureDate: string
  setFormProcedureDate: (v: string) => void
  formDescription: string
  setFormDescription: (v: string) => void
  formMaterialsUsed: string
  setFormMaterialsUsed: (v: string) => void
  formObservations: string
  setFormObservations: (v: string) => void
  submitting: boolean
  submitError: string | null
  submitSuccess: boolean
  onRegister: () => void | Promise<void>
  onCancel: () => void
  t: (key: string) => string
}) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
        {t('procedures.formTitle')}
      </h3>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            {t('procedures.procedureType')} *
          </label>
          <select
            value={formProcedureType}
            onChange={(e) => setFormProcedureType(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">{t('procedures.allTypes')}</option>
            {procedureTypeOptions.map(({ value, labelKey }) => (
              <option key={value} value={value}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            {t('procedures.procedureDate')} *
          </label>
          <input
            type="datetime-local"
            value={formProcedureDate}
            onChange={(e) => setFormProcedureDate(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            {t('procedures.descriptionLabel')} *
          </label>
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder={t('procedures.descriptionLabel')}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            {t('procedures.materialsUsed')}
          </label>
          <textarea
            value={formMaterialsUsed}
            onChange={(e) => setFormMaterialsUsed(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            {t('procedures.observations')}
          </label>
          <textarea
            value={formObservations}
            onChange={(e) => setFormObservations(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        {submitError && (
          <p className="text-sm text-[var(--color-error)]">{submitError}</p>
        )}
        {submitSuccess && (
          <p className="text-sm text-[var(--color-success)]">{t('procedures.procedureRegistered')}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <GlassButton
            type="button"
            variant="primary"
            disabled={submitting}
            onClick={() => void onRegister()}
          >
            {submitting ? t('procedures.creatingProcedure') : t('procedures.registerProcedure')}
          </GlassButton>
          <GlassButton type="button" variant="glass" disabled={submitting} onClick={onCancel}>
            {t('procedures.cancelProcedure')}
          </GlassButton>
        </div>
      </div>
    </div>
  )
}

export function ProcedureListPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'quick' | 'list'>('quick')

  // Quick tab: patient search
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [careers, setCareers] = useState<Career[]>([])
  const [fastError, setFastError] = useState<string | null>(null)
  const [quickFirstName, setQuickFirstName] = useState('')
  const [quickLastName, setQuickLastName] = useState('')
  const [quickEnrollment, setQuickEnrollment] = useState('')
  const [quickCareerId, setQuickCareerId] = useState('')
  const [quickGroup, setQuickGroup] = useState('')
  const [creatingPatient, setCreatingPatient] = useState(false)
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false)

  // Procedure form (when patient selected)
  const [expedientReady, setExpedientReady] = useState(false)
  const [expedientError, setExpedientError] = useState<string | null>(null)
  const [formProcedureType, setFormProcedureType] = useState('')
  const [formProcedureDate, setFormProcedureDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  )
  const [formDescription, setFormDescription] = useState('')
  const [formMaterialsUsed, setFormMaterialsUsed] = useState('')
  const [formObservations, setFormObservations] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Procedure detail modal (list tab)
  const [detailProcedure, setDetailProcedure] = useState<NursingProcedure | null>(null)
  const [detailProcedureLoading, setDetailProcedureLoading] = useState(false)

  // List tab
  const [procedures, setProcedures] = useState<NursingProcedure[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [listProcedureType, setListProcedureType] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })

  useEffect(() => {
    getCareers()
      .then((cs) => setCareers(cs))
      .catch(() => setCareers([]))
  }, [])

  // Ensure expedient when patient is selected so we can register procedures
  useEffect(() => {
    if (!selectedPatient) {
      setExpedientReady(false)
      setExpedientError(null)
      return
    }
    setSubmitError(null)
    setSubmitSuccess(false)
    setExpedientReady(false)
    setExpedientError(null)
    ensureExpedientForPatient(selectedPatient.id)
      .then(() => setExpedientReady(true))
      .catch((err) => {
        const msg = err.response?.data?.message ?? t('common.error')
        setExpedientError(typeof msg === 'string' ? msg : t('common.error'))
      })
  }, [selectedPatient?.id, t])

  useEffect(() => {
    if (activeTab !== 'list') return
    setLoadingList(true)
    getNursingProcedures({
      page: pagination.page,
      limit: pagination.limit,
      search: listSearch || undefined,
      procedureType: listProcedureType || undefined,
    })
      .then((r) => {
        setProcedures(r.procedures)
        setPagination(r.pagination)
      })
      .catch(() => setProcedures([]))
      .finally(() => setLoadingList(false))
  }, [activeTab, listSearch, listProcedureType, pagination.page, pagination.limit])

  // Debounced patient search
  useEffect(() => {
    const q = patientSearch.trim()
    if (selectedPatient) {
      if (!q) {
        setPatientResults([])
        setFastError(null)
        return
      }
      const fullName = `${selectedPatient.user.firstName} ${selectedPatient.user.lastName}`.trim()
      const enrollment = selectedPatient.user.enrollmentNumber?.trim() ?? ''
      const matches =
        q.toLowerCase() === fullName.toLowerCase() || (enrollment && q.toLowerCase() === enrollment.toLowerCase())
      if (!matches) {
        setSelectedPatient(null)
      }
    }
    if (!q) {
      setPatientResults([])
      setFastError(null)
      return
    }
    const handle = window.setTimeout(() => {
      setFastError(null)
      getPatients({ page: 1, limit: 10, search: q, patientType: 'student' })
        .then((res) => setPatientResults(res.patients))
        .catch(() => {
          setFastError(t('common.error'))
          setPatientResults([])
        })
    }, 350)
    return () => window.clearTimeout(handle)
  }, [patientSearch, selectedPatient, t])

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p)
    setPatientSearch(`${p.user.firstName} ${p.user.lastName}`.trim())
    setFastError(null)
  }

  const openQuickCreateFromSearch = () => {
    const raw = patientSearch.trim()
    if (raw) {
      const parts = raw.split(/\s+/)
      if (parts.length === 1) {
        setQuickFirstName(parts[0])
        setQuickLastName('')
      } else {
        setQuickLastName(parts[parts.length - 1])
        setQuickFirstName(parts.slice(0, -1).join(' '))
      }
    }
    setShowQuickCreateModal(true)
  }

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFastError(null)
    if (!quickFirstName.trim() || !quickLastName.trim() || !quickEnrollment.trim() || !quickCareerId) {
      setFastError(t('common.missingRequiredFields'))
      return
    }
    try {
      setCreatingPatient(true)
      const email = `${quickEnrollment.trim()}@utcare.local`
      const newPatient = await createPatient({
        email,
        firstName: quickFirstName.trim(),
        lastName: quickLastName.trim(),
        dateOfBirth: new Date().toISOString().slice(0, 10),
        patientType: 'student',
        careerId: quickCareerId,
        enrollmentNumber: quickEnrollment.trim(),
        group: quickGroup.trim() || undefined,
      })
      setSelectedPatient(newPatient)
      setPatientSearch(`${newPatient.user.firstName} ${newPatient.user.lastName}`.trim())
      setPatientResults([newPatient])
      setShowQuickCreateModal(false)
    } catch {
      setFastError(t('common.error'))
    } finally {
      setCreatingPatient(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Activity className="text-[var(--color-primary)]" size={28} />
            {t('procedures.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('procedures.description')}
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] p-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('quick')}
          className={`rounded-lg px-3 py-1.5 font-medium ${
            activeTab === 'quick'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          {t('procedures.fastTrackTab', 'Atención rápida')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`ml-1 rounded-lg px-3 py-1.5 font-medium ${
            activeTab === 'list'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          {t('procedures.listProceduresTab', 'Listado de procedimientos')}
        </button>
      </div>

      {activeTab === 'quick' && (
        <>
          <GlassCard className="border-l-4 border-l-[var(--color-primary)]">
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                <Search size={18} className="text-[var(--color-primary)]" />
                {t('procedures.fastTrackTitle', 'Atención al momento')}
              </h2>
              {!selectedPatient ? (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      />
                      <input
                        type="text"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder={t('procedures.searchPatientPlaceholder', 'Matrícula o nombre completo')}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    {patientResults.length === 0 && patientSearch.trim() && (
                      <button
                        type="button"
                        onClick={openQuickCreateFromSearch}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)] bg-[var(--glass-bg)] px-4 py-2 text-xs font-medium text-[var(--color-primary)] shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--color-primary)]/10 hover:shadow-md animate-[fadeIn_0.2s_ease-out]"
                      >
                        {t('procedures.fastTrackOpenCreate', 'Crear nuevo paciente')}
                      </button>
                    )}
                  </div>
                  {fastError && <p className="text-sm text-[var(--color-error)]">{fastError}</p>}
                  {patientResults.length > 0 && (
                    <ul className="mt-2 max-h-40 space-y-1 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1 text-sm">
                      {patientResults.map((p) => (
                        <li
                          key={p.id}
                          className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-[var(--color-primary)]/10"
                          onClick={() => handleSelectPatient(p)}
                        >
                          <span className="truncate text-[var(--text-primary)]">
                            {p.user.firstName} {p.user.lastName}
                          </span>
                          {p.user.enrollmentNumber && (
                            <span className="ml-2 text-xs text-[var(--text-muted)]">{p.user.enrollmentNumber}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {t('procedures.fastTrackSelected')}:{' '}
                      <span className="font-semibold text-[var(--text-primary)]">
                        {selectedPatient.user.firstName} {selectedPatient.user.lastName}
                      </span>
                      {selectedPatient.user.enrollmentNumber && (
                        <span className="ml-2 text-xs text-[var(--text-muted)]">
                          ({selectedPatient.user.enrollmentNumber})
                        </span>
                      )}
                    </p>
                    <Link to={`/patients/${selectedPatient.id}/expedient`}>
                      <GlassButton variant="primary" className="inline-flex items-center gap-2">
                        <FileText size={18} />
                        {t('procedures.goToExpedient')}
                      </GlassButton>
                    </Link>
                  </div>
                  {expedientError && (
                    <p className="text-sm text-[var(--color-error)]">{expedientError}</p>
                  )}
                  {!expedientReady && !expedientError && (
                    <p className="text-sm text-[var(--text-muted)]">{t('common.loading')}</p>
                  )}
                  {expedientReady && (
                    <ProcedureForm
                      procedureTypeOptions={PROCEDURE_TYPE_OPTIONS.filter((o) => o.value !== '')}
                      formProcedureType={formProcedureType}
                      setFormProcedureType={setFormProcedureType}
                      formProcedureDate={formProcedureDate}
                      setFormProcedureDate={setFormProcedureDate}
                      formDescription={formDescription}
                      setFormDescription={setFormDescription}
                      formMaterialsUsed={formMaterialsUsed}
                      setFormMaterialsUsed={setFormMaterialsUsed}
                      formObservations={formObservations}
                      setFormObservations={setFormObservations}
                      submitting={submitting}
                      submitError={submitError}
                      submitSuccess={submitSuccess}
                      onRegister={async () => {
                        if (!selectedPatient) return
                        if (!formProcedureType.trim() || !formDescription.trim()) {
                          setSubmitError(t('common.missingRequiredFields'))
                          return
                        }
                        setSubmitError(null)
                        setSubmitting(true)
                        try {
                          await createNursingProcedureFromPatient(selectedPatient.id, {
                            procedureType: formProcedureType.trim(),
                            procedureDate: new Date(formProcedureDate).toISOString(),
                            description: formDescription.trim(),
                            materialsUsed: formMaterialsUsed.trim() || undefined,
                            observations: formObservations.trim() || undefined,
                          })
                          setSubmitSuccess(true)
                          setFormDescription('')
                          setFormMaterialsUsed('')
                          setFormObservations('')
                          // Reset completo tras registrar: mostrar éxito y volver al estado inicial
                          window.setTimeout(() => {
                            setSelectedPatient(null)
                            setPatientSearch('')
                            setSubmitError(null)
                            setSubmitSuccess(false)
                            setFormProcedureType('')
                            setFormProcedureDate(new Date().toISOString().slice(0, 16))
                          }, 1500)
                        } catch {
                          setSubmitError(t('procedures.procedureError'))
                        } finally {
                          setSubmitting(false)
                        }
                      }}
                      onCancel={() => {
                        setSelectedPatient(null)
                        setPatientSearch('')
                        setSubmitError(null)
                        setSubmitSuccess(false)
                        setFormProcedureType('')
                        setFormProcedureDate(new Date().toISOString().slice(0, 16))
                        setFormDescription('')
                        setFormMaterialsUsed('')
                        setFormObservations('')
                      }}
                      t={t}
                    />
                  )}
                </>
              )}
            </div>
          </GlassCard>
        </>
      )}

      {activeTab === 'list' && (
        <>
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] p-3">
            <div className="min-w-[140px] flex-1">
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                {t('procedures.filterByPatient', 'Paciente o búsqueda')}
              </label>
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder={t('procedures.searchPlaceholder')}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                {t('procedures.procedureType')}
              </label>
              <select
                value={listProcedureType}
                onChange={(e) => setListProcedureType(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {PROCEDURE_TYPE_OPTIONS.map(({ value, labelKey }) => (
                  <option key={value || 'all'} value={value}>
                    {value ? t(labelKey) : t('procedures.allTypes')}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setListSearch('')
                setListProcedureType('')
              }}
              className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              {t('procedures.clearFilters', 'Limpiar filtros')}
            </button>
          </div>

          {loadingList && (
            <p className="py-6 text-center text-sm text-[var(--text-secondary)]">{t('common.loading')}</p>
          )}
          {!loadingList && procedures.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
              {t('procedures.noProcedures')}
            </p>
          )}
          {!loadingList && procedures.length > 0 && (
            <GlassCard className="rounded-2xl">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                      <th className="px-3 py-2">{t('procedures.patient')}</th>
                      <th className="px-3 py-2">{t('procedures.procedureType')}</th>
                      <th className="px-3 py-2">{t('procedures.procedureDate')}</th>
                      <th className="w-0 px-3 py-2 text-right">{t('procedures.goToExpedient')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procedures.map((p) => (
                      <tr
                        key={p.id}
                        className="cursor-pointer border-b border-[var(--border)] last:border-0 hover:bg-[var(--color-primary)]/5"
                        onClick={() => {
                          setDetailProcedureLoading(true)
                          setDetailProcedure(null)
                          getNursingProcedureById(p.id)
                            .then(setDetailProcedure)
                            .catch(() => setDetailProcedure(null))
                            .finally(() => setDetailProcedureLoading(false))
                        }}
                      >
                        <td className="px-3 py-2 text-[var(--text-primary)]">{patientName(p)}</td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">{p.procedureType}</td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">
                          {new Date(p.procedureDate).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </td>
                        <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                          {getPatientId(p) ? (
                            <Link
                              to={`/patients/${getPatientId(p)}/expedient`}
                              title={t('procedures.goToExpedient')}
                              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                            >
                              <FileText size={18} />
                            </Link>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* Modal detalle procedimiento */}
      {(detailProcedure !== null || detailProcedureLoading) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="procedure-detail-title"
          onClick={() => !detailProcedureLoading && setDetailProcedure(null)}
        >
          <div
            className="glass-card w-full max-w-lg rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="procedure-detail-title" className="text-lg font-semibold text-[var(--text-primary)]">
              {t('procedures.viewDetail')}
            </h2>
            {detailProcedureLoading && (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">{t('common.loading')}</p>
            )}
            {!detailProcedureLoading && detailProcedure && (
              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label={t('procedures.patient')} value={patientName(detailProcedure)} />
                <DetailRow label={t('procedures.procedureType')} value={detailProcedure.procedureType} />
                <DetailRow
                  label={t('procedures.procedureDate')}
                  value={new Date(detailProcedure.procedureDate).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                />
                <DetailRow label={t('procedures.descriptionLabel')} value={detailProcedure.description} />
                {detailProcedure.materialsUsed && (
                  <DetailRow label={t('procedures.materialsUsed')} value={detailProcedure.materialsUsed} />
                )}
                {detailProcedure.observations && (
                  <DetailRow label={t('procedures.observations')} value={detailProcedure.observations} />
                )}
                {detailProcedure.performedByUser && (
                  <DetailRow
                    label={t('procedures.performedBy')}
                    value={`${detailProcedure.performedByUser.firstName} ${detailProcedure.performedByUser.lastName}`.trim()}
                  />
                )}
                {getPatientId(detailProcedure) && (
                  <div className="pt-2">
                    <Link
                      to={`/patients/${getPatientId(detailProcedure)}/expedient`}
                      className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
                    >
                      <FileText size={16} />
                      {t('procedures.goToExpedient')}
                    </Link>
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <GlassButton
                type="button"
                variant="glass"
                onClick={() => setDetailProcedure(null)}
                disabled={detailProcedureLoading}
              >
                {t('common.close')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showQuickCreateModal}
        onClose={() => !creatingPatient && setShowQuickCreateModal(false)}
        onConfirm={() => {}}
        confirming={creatingPatient}
        title={t('procedures.fastTrackQuickCreate', 'Crear paciente rápido')}
        message=""
        detail={
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); void handleQuickCreate(e) }}>
            <p className="mb-1 text-xs text-[var(--text-secondary)]">
              {t('procedures.fastTrackQuickCreateHint', 'Completa solo los datos mínimos.')}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickFirstName}
                onChange={(e) => setQuickFirstName(e.target.value)}
                placeholder={t('patients.firstName')}
                className="w-1/2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
              />
              <input
                type="text"
                value={quickLastName}
                onChange={(e) => setQuickLastName(e.target.value)}
                placeholder={t('patients.lastName')}
                className="w-1/2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
              />
            </div>
            <input
              type="text"
              value={quickEnrollment}
              onChange={(e) => setQuickEnrollment(e.target.value)}
              placeholder={t('patients.enrollmentNumber')}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
            />
            <select
              value={quickCareerId}
              onChange={(e) => setQuickCareerId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
            >
              <option value="">{t('dashboard.nurse.allCareers', 'Selecciona carrera')}</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={quickGroup}
              onChange={(e) => setQuickGroup(e.target.value)}
              placeholder={t('patients.group')}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
            />
            <div className="mt-2 flex justify-end">
              <GlassButton type="submit" variant="primary" disabled={creatingPatient}>
                {creatingPatient ? t('common.loading') : t('procedures.fastTrackCreateAndFocus', 'Crear y continuar')}
              </GlassButton>
            </div>
          </form>
        }
        confirmLabel=""
        cancelLabel={t('common.close')}
      />
    </div>
  )
}
