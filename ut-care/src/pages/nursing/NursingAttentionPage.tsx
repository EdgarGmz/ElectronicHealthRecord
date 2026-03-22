import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Search, FileText, Eye } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getPatients, createPatient } from '@/services/patient.service'
import type { Patient } from '@/types/patient'
import { getCareers } from '@/services/career.service'
import type { Career } from '@/types/career'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { GlassButton } from '@/components/atoms/GlassButton'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { createNursingAttention } from '@/services/nursing-attention.service'
import {
  getMyNursingAttentions,
  getNursingAttentionById,
  type NursingAttentionDetail,
} from '@/services/nursing-attention-list.service'

export function NursingAttentionPage() {
  const { t } = useTranslation()
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [patientSearching, setPatientSearching] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  void patientSearching
  const [careers, setCareers] = useState<Career[]>([])
  const [fastError, setFastError] = useState<string | null>(null)
  const [quickFirstName, setQuickFirstName] = useState('')
  const [quickLastName, setQuickLastName] = useState('')
  const [quickEnrollment, setQuickEnrollment] = useState('')
  const [quickCareerId, setQuickCareerId] = useState('')
  const [quickGroup, setQuickGroup] = useState('')
  const [quickBloodType, setQuickBloodType] = useState('')
  const [quickAllergies, setQuickAllergies] = useState('')
  const [quickChronicConditions, setQuickChronicConditions] = useState('')
  const [quickCurrentMedications, setQuickCurrentMedications] = useState('')
  const [quickFamilyHistory, setQuickFamilyHistory] = useState('')
  const [creatingPatient, setCreatingPatient] = useState(false)
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false)
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [observations, setObservations] = useState('')
  const [bloodPressureSys, setBloodPressureSys] = useState<string>('')
  const [bloodPressureDia, setBloodPressureDia] = useState<string>('')
  const [temperature, setTemperature] = useState<string>('')
  const [heartRate, setHeartRate] = useState<string>('')
  const [spo2, setSpo2] = useState<string>('')
  const [lightningDiagnosis, setLightningDiagnosis] = useState('')
  const [treatmentApplied, setTreatmentApplied] = useState('')
  const [derivation, setDerivation] = useState('')
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showEndSuccess, setShowEndSuccess] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [savingAttention, setSavingAttention] = useState(false)
  const [activeTab, setActiveTab] = useState<'quick' | 'list'>('quick')
  const [attentions, setAttentions] = useState<Awaited<ReturnType<typeof getMyNursingAttentions>>>([])
  const [loadingList, setLoadingList] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [listDateFrom, setListDateFrom] = useState('')
  const [listDateTo, setListDateTo] = useState('')
  const [listDisposition, setListDisposition] = useState('')
  const [detailAttention, setDetailAttention] = useState<NursingAttentionDetail | null>(null)
  const [detailAttentionLoading, setDetailAttentionLoading] = useState(false)
  const [showQuickCreateSuccess, setShowQuickCreateSuccess] = useState(false)
  const [quickCreateSuccessMessage, setQuickCreateSuccessMessage] = useState('')

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
    // Reset de campos médicos opcionales para no reutilizar valores de una creación previa
    setQuickBloodType('')
    setQuickAllergies('')
    setQuickChronicConditions('')
    setQuickCurrentMedications('')
    setQuickFamilyHistory('')
    setShowQuickCreateModal(true)
  }

  useEffect(() => {
    getCareers()
      .then((cs) => setCareers(cs))
      .catch(() => setCareers([]))
  }, [])

  useEffect(() => {
    if (activeTab !== 'list') return
    setLoadingList(true)
    void getMyNursingAttentions({
      search: listSearch || undefined,
      dateFrom: listDateFrom || undefined,
      dateTo: listDateTo || undefined,
      disposition: listDisposition || undefined,
    })
      .then(setAttentions)
      .finally(() => setLoadingList(false))
  }, [activeTab, listSearch, listDateFrom, listDateTo, listDisposition])

  // Búsqueda automática al escribir
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
      const matchesSelection =
        q.length > 0 &&
        (q.toLowerCase() === fullName.toLowerCase() ||
          (enrollment && q.toLowerCase() === enrollment.toLowerCase()))
      if (!matchesSelection) {
        setSelectedPatient(null)
        setChiefComplaint('')
        setObservations('')
      }
    }

    if (!q) {
      setPatientResults([])
      setFastError(null)
      return
    }

    const handle = window.setTimeout(() => {
      setPatientSearching(true)
      setFastError(null)
      getPatients({ page: 1, limit: 10, search: q, patientType: 'student' })
        .then((res) => {
          setPatientResults(res.patients)
        })
        .catch(() => {
          setFastError(t('common.error'))
          setPatientResults([])
        })
        .finally(() => setPatientSearching(false))
    }, 350)

    return () => window.clearTimeout(handle)
  }, [patientSearch, selectedPatient, t])

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p)
    setPatientSearch(`${p.user.firstName} ${p.user.lastName}`.trim())
    setChiefComplaint('')
    setObservations('')
    setBloodPressureSys('')
    setBloodPressureDia('')
    setTemperature('')
    setHeartRate('')
    setSpo2('')
    setLightningDiagnosis('')
    setTreatmentApplied('')
    setDerivation('')
    setFastError(null)
  }

  const resetAttentionForm = () => {
    setSelectedPatient(null)
    setPatientSearch('')
    setPatientResults([])
    setChiefComplaint('')
    setObservations('')
    setBloodPressureSys('')
    setBloodPressureDia('')
    setTemperature('')
    setHeartRate('')
    setSpo2('')
    setLightningDiagnosis('')
    setTreatmentApplied('')
    setDerivation('')
  }

  const handleCancelAttention = () => {
    resetAttentionForm()
    setShowCancelConfirm(false)
  }

  const quickCreateAndFocus = async () => {
    setFastError(null)
    if (!quickFirstName.trim() || !quickLastName.trim() || !quickEnrollment.trim() || !quickCareerId) {
      setFastError(t('common.missingRequiredFields'))
      return
    }
    try {
      setCreatingPatient(true)
      const todayIso = new Date().toISOString().slice(0, 10)
      const email =
        quickEnrollment.trim() !== ''
          ? `${quickEnrollment.trim()}@utcare.local`
          : `${quickFirstName.trim().toLowerCase().replace(/\\s+/g, '.')}@utcare.local`
      const newPatient = await createPatient({
        email,
        firstName: quickFirstName.trim(),
        lastName: quickLastName.trim(),
        dateOfBirth: todayIso,
        patientType: 'student',
        careerId: quickCareerId,
        enrollmentNumber: quickEnrollment.trim(),
        group: quickGroup.trim() || undefined,
        bloodType: quickBloodType.trim() || undefined,
        allergies: quickAllergies.trim() || undefined,
        chronicConditions: quickChronicConditions.trim() || undefined,
        currentMedications: quickCurrentMedications.trim() || undefined,
        familyHistory: quickFamilyHistory.trim() || undefined,
      })

      const fullName = `${newPatient.user.firstName} ${newPatient.user.lastName}`.trim()
      const dateTime = new Date().toLocaleString()
      setQuickCreateSuccessMessage(`Nuevo Paciente creado: ${fullName} · ${dateTime}.`)
      setShowQuickCreateSuccess(true)

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

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await quickCreateAndFocus()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('nav.nursingAttention', 'Atención de enfermería')}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t(
            'procedures.attentionFormIntro',
            'Busca al paciente y registra o consulta las atenciones de enfermería.'
          )}
        </p>
      </div>

      {/* Tabs */}
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
              : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg.white/5'
          }`}
        >
          {t('procedures.attentionListTab', 'Listado de atenciones')}
        </button>
      </div>

      {activeTab === 'quick' && (
        <>
          {/* Búsqueda y alta rápida de paciente */}
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
                <p className="text-sm text-[var(--text-secondary)]">
                  {t('procedures.fastTrackSelected', 'Paciente seleccionado')}:{' '}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {selectedPatient.user.firstName} {selectedPatient.user.lastName}
                  </span>
                  {selectedPatient.user.enrollmentNumber && (
                    <span className="ml-2 text-xs text-[var(--text-muted)]">
                      ({selectedPatient.user.enrollmentNumber})
                    </span>
                  )}
                </p>
              )}
            </div>
          </GlassCard>

          {selectedPatient && (
            <div className="space-y-3">
              <GlassCard className="border-l-4 border-l-[#06b6d4]">
                <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                  {t('procedures.fastTrackStartAttention', 'Inicio de atención de enfermería')}
                </h3>
                <p className="mb-2 text-xs text-[var(--text-secondary)]">
                  {t(
                    'procedures.fastTrackComplaintHint',
                    'Registra brevemente el padecimiento o problema principal que refiere el paciente.'
                  )}
                </p>
                <textarea
                  rows={3}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder={t('expedient.chiefComplaint', 'Padecimiento / motivo de consulta')}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
                />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {t('procedures.vitalSigns', 'Signos vitales (opcional)')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={bloodPressureSys}
                    onChange={(e) => setBloodPressureSys(e.target.value)}
                    placeholder={t('procedures.bpSys', 'PAS')}
                    className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={bloodPressureDia}
                    onChange={(e) => setBloodPressureDia(e.target.value)}
                    placeholder={t('procedures.bpDia', 'PAD')}
                    className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder={t('procedures.temperature', 'Temp °C')}
                    className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder={t('procedures.heartRate', 'FC')}
                    className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder={t('procedures.spo2', 'SpO₂ %')}
                    className="col-span-2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1.5 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                    {t('procedures.lightningDiagnosis', 'Diagnóstico relámpago')}
                  </label>
                  <textarea
                    rows={2}
                    value={lightningDiagnosis}
                    onChange={(e) => setLightningDiagnosis(e.target.value)}
                    placeholder={t(
                      'procedures.lightningDiagnosisPlaceholder',
                      'Impresión diagnóstica rápida'
                    )}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                    {t('procedures.treatmentApplied', 'Tratamiento aplicado')}
                  </label>
                  <textarea
                    rows={2}
                    value={treatmentApplied}
                    onChange={(e) => setTreatmentApplied(e.target.value)}
                    placeholder={t(
                      'procedures.treatmentAppliedPlaceholder',
                      'Medicamentos, reposo, curación rápida, etc.'
                    )}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                    {t('procedures.disposition', 'Derivación')}
                  </label>
                  <select
                    value={derivation}
                    onChange={(e) => setDerivation(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
                  >
                    <option value="">{t('procedures.dispositionSelect', 'Selecciona una opción')}</option>
                    <option value="clases">{t('procedures.dispositionClasses', 'Regresa a clases')}</option>
                    <option value="casa">{t('procedures.dispositionHome', 'Envío a casa')}</option>
                    <option value="urgencias">{t('procedures.dispositionEr', 'Envío a urgencias')}</option>
                  </select>
                </div>
              </div>
            </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                    {t('procedures.observations', 'Observaciones')}
                  </label>
                  <textarea
                    rows={3}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder=""
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                  <GlassButton
                    type="button"
                    variant="glass"
                    onClick={() => setShowCancelConfirm(true)}
                    className="inline-flex items-center gap-2"
                  >
                    {t('procedures.cancelAttention', 'Cancelar atención')}
                  </GlassButton>
                  <GlassButton
                    type="button"
                    variant="primary"
                    onClick={() => setShowEndConfirm(true)}
                    className="inline-flex items-center gap-2"
                  >
                    {t('procedures.endAttention', 'Terminar atención')}
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          )}
        </>
      )}

      {activeTab === 'list' && (
        <>
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] p-3">
            <div className="flex-1 min-w-[140px]">
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                {t('procedures.filterByPatient', 'Paciente o matrícula')}
              </label>
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder={t('procedures.searchPatientPlaceholder', 'Matrícula o nombre completo')}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                {t('procedures.filterDateFrom', 'Desde')}
              </label>
              <input
                type="date"
                value={listDateFrom}
                onChange={(e) => setListDateFrom(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                {t('procedures.filterDateTo', 'Hasta')}
              </label>
              <input
                type="date"
                value={listDateTo}
                onChange={(e) => setListDateTo(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                {t('procedures.disposition', 'Derivación')}
              </label>
              <select
                value={listDisposition}
                onChange={(e) => setListDisposition(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">{t('procedures.dispositionAll', 'Todas')}</option>
                <option value="clases">{t('procedures.dispositionClasses', 'Regresa a clases')}</option>
                <option value="casa">{t('procedures.dispositionHome', 'Envío a casa')}</option>
                <option value="urgencias">{t('procedures.dispositionEr', 'Envío a urgencias')}</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setListSearch('')
                setListDateFrom('')
                setListDateTo('')
                setListDisposition('')
              }}
              className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              {t('procedures.clearFilters', 'Limpiar filtros')}
            </button>
          </div>

          {loadingList && (
            <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
              {t('common.loading')}
            </p>
          )}
          {!loadingList && attentions.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
              {t('procedures.noAttentions', 'No hay atenciones registradas.')}
            </p>
          )}
          {!loadingList && attentions.length > 0 && (
            <GlassCard className="rounded-2xl">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                      <th className="px-3 py-2">{t('patients.patient', 'Paciente')}</th>
                      <th className="px-3 py-2">{t('procedures.motive', 'Motivo')}</th>
                      <th className="px-3 py-2">{t('procedures.disposition', 'Derivación')}</th>
                      <th className="px-3 py-2">{t('common.date', 'Fecha')}</th>
                      <th className="w-0 px-3 py-2 text-right">{t('procedures.viewDetail', 'Ver detalle')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attentions.map((a) => (
                      <tr
                        key={a.id}
                        className="cursor-pointer border-b border-[var(--border)] last:border-0 hover:bg-[var(--color-primary)]/5"
                        onClick={() => {
                          setDetailAttentionLoading(true)
                          setDetailAttention(null)
                          getNursingAttentionById(a.id)
                            .then(setDetailAttention)
                            .catch(() => setDetailAttention(null))
                            .finally(() => setDetailAttentionLoading(false))
                        }}
                      >
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="text-[var(--text-primary)]">
                              {a.patient.user.firstName} {a.patient.user.lastName}
                            </span>
                            {a.patient.user.enrollmentNumber && (
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {a.patient.user.enrollmentNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">{a.motive}</td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">
                          {a.disposition ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            title={t('procedures.viewDetail', 'Ver detalle')}
                            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                            onClick={() => {
                              setDetailAttentionLoading(true)
                              setDetailAttention(null)
                              getNursingAttentionById(a.id)
                                .then(setDetailAttention)
                                .catch(() => setDetailAttention(null))
                                .finally(() => setDetailAttentionLoading(false))
                            }}
                          >
                            <Eye size={18} />
                          </button>
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

      {/* Modal detalle atención */}
      {(detailAttention !== null || detailAttentionLoading) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="attention-detail-title"
          onClick={() => !detailAttentionLoading && setDetailAttention(null)}
        >
          <div
            className="glass-card w-full max-w-lg rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="attention-detail-title" className="text-lg font-semibold text-[var(--text-primary)]">
              {t('procedures.attentionDetail', 'Detalle de la atención')}
            </h2>
            {detailAttentionLoading && (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">{t('common.loading')}</p>
            )}
            {!detailAttentionLoading && detailAttention && (
              <div className="mt-4 space-y-3 text-sm">
                {detailAttention.patient && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t('patients.patient', 'Paciente')}
                    </span>
                    <p className="mt-0.5 text-[var(--text-primary)]">
                      {detailAttention.patient.user.firstName} {detailAttention.patient.user.lastName}
                      {detailAttention.patient.user.enrollmentNumber && (
                        <span className="ml-2 text-[var(--text-muted)]">
                          ({detailAttention.patient.user.enrollmentNumber})
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    {t('procedures.motive', 'Motivo')}
                  </span>
                  <p className="mt-0.5 whitespace-pre-wrap text-[var(--text-primary)]">{detailAttention.motive}</p>
                </div>
                {detailAttention.disposition && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t('procedures.disposition', 'Derivación')}
                    </span>
                    <p className="mt-0.5 text-[var(--text-primary)]">{detailAttention.disposition}</p>
                  </div>
                )}
                {detailAttention.vitalSigns && typeof detailAttention.vitalSigns === 'object' && Object.keys(detailAttention.vitalSigns).length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t('procedures.vitalSigns', 'Signos vitales')}
                    </span>
                    <p className="mt-0.5 text-[var(--text-primary)]">
                      {[
                        (detailAttention.vitalSigns as Record<string, number>).presionArterialSys != null &&
                          (detailAttention.vitalSigns as Record<string, number>).presionArterialDia != null
                          ? `PAS/PAD: ${(detailAttention.vitalSigns as Record<string, number>).presionArterialSys}/${(detailAttention.vitalSigns as Record<string, number>).presionArterialDia}`
                          : null,
                        (detailAttention.vitalSigns as Record<string, number>).temperatura != null
                          ? `Temp: ${(detailAttention.vitalSigns as Record<string, number>).temperatura} °C`
                          : null,
                        (detailAttention.vitalSigns as Record<string, number>).frecuenciaCardiaca != null
                          ? `FC: ${(detailAttention.vitalSigns as Record<string, number>).frecuenciaCardiaca}`
                          : null,
                        (detailAttention.vitalSigns as Record<string, number>).spo2 != null
                          ? `SpO₂: ${(detailAttention.vitalSigns as Record<string, number>).spo2}%`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                )}
                {detailAttention.lightningDiagnosis && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t('procedures.lightningDiagnosis', 'Diagnóstico relámpago')}
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap text-[var(--text-primary)]">
                      {detailAttention.lightningDiagnosis}
                    </p>
                  </div>
                )}
                {detailAttention.treatment && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t('procedures.treatmentApplied', 'Tratamiento aplicado')}
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap text-[var(--text-primary)]">
                      {detailAttention.treatment}
                    </p>
                  </div>
                )}
                {detailAttention.observations && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t('procedures.observations', 'Observaciones')}
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap text-[var(--text-primary)]">
                      {detailAttention.observations}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    {t('common.date', 'Fecha')}
                  </span>
                  <p className="mt-0.5 text-[var(--text-primary)]">
                    {new Date(detailAttention.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/patients/${detailAttention.patientId}/expedient`}
                    className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
                  >
                    <FileText size={16} />
                    {t('procedures.goToExpedient', 'Ir al expediente')}
                  </Link>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <GlassButton
                type="button"
                variant="glass"
                onClick={() => setDetailAttention(null)}
                disabled={detailAttentionLoading}
              >
                {t('common.close')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal de alta rápida de paciente */}
      <ConfirmModal
        open={showQuickCreateModal}
        onClose={() => !creatingPatient && setShowQuickCreateModal(false)}
        confirming={creatingPatient}
        title={t('procedures.fastTrackQuickCreate', 'Crear paciente rápido')}
        message=""
        detail={
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              void handleQuickCreate(e)
            }}
          >
            <p className="mb-1 text-xs text-[var(--text-secondary)]">
              {t(
                'procedures.fastTrackQuickCreateHint',
                'Completa solo los datos mínimos para no retrasar la atención.'
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickFirstName}
                onChange={(e) => setQuickFirstName(e.target.value)}
                placeholder={t('patients.firstName', 'Nombre(s)')}
                className="w-1/2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
              />
              <input
                type="text"
                value={quickLastName}
                onChange={(e) => setQuickLastName(e.target.value)}
                placeholder={t('patients.lastName', 'Apellidos')}
                className="w-1/2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
              />
            </div>
            <input
              type="text"
              value={quickEnrollment}
              onChange={(e) => setQuickEnrollment(e.target.value)}
              placeholder={t('patients.enrollmentNumber', 'Matrícula')}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
            />
            <select
              value={quickCareerId}
              onChange={(e) => setQuickCareerId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
            >
              <option value="">{t('dashboard.nurse.allCareers', 'Selecciona carrera')}</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={quickGroup}
              onChange={(e) => setQuickGroup(e.target.value)}
              placeholder={t('patients.group', 'Grupo (opcional)')}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
            />
            <div className="pt-1">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                {t('expedient.generalData', 'Datos médicos (opcionales)')}
              </p>
              <select
                value={quickBloodType}
                onChange={(e) => setQuickBloodType(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs"
              >
                <option value="">{t('common.selectOptional', 'Selecciona (opcional)')}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>

              <textarea
                rows={2}
                value={quickAllergies}
                onChange={(e) => setQuickAllergies(e.target.value)}
                placeholder={t('expedient.allergies', 'Alergias (opcional)')}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs resize-none"
              />
              <textarea
                rows={2}
                value={quickChronicConditions}
                onChange={(e) => setQuickChronicConditions(e.target.value)}
                placeholder={t('expedient.chronicConditions', 'Enfermedades crónicas (opcional)')}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs resize-none"
              />
              <textarea
                rows={2}
                value={quickCurrentMedications}
                onChange={(e) => setQuickCurrentMedications(e.target.value)}
                placeholder={t('expedient.currentMedications', 'Medicación actual (opcional)')}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs resize-none"
              />
              <textarea
                rows={2}
                value={quickFamilyHistory}
                onChange={(e) => setQuickFamilyHistory(e.target.value)}
                placeholder={t('expedient.familyHistory', 'Antecedentes familiares (opcional)')}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs resize-none"
              />
            </div>
          </form>
        }
        onConfirm={() => {
          void quickCreateAndFocus()
        }}
        confirmLabel={t('procedures.fastTrackCreateAndFocus', 'Crear y comenzar atención')}
        cancelLabel={t('common.close')}
      />

      <SuccessModal
        open={showQuickCreateSuccess}
        onClose={() => {
          setShowQuickCreateSuccess(false)
        }}
        message={quickCreateSuccessMessage}
      />

      {/* Confirmar cancelar atención */}
      <ConfirmModal
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelAttention}
        title={t('procedures.cancelAttention', 'Cancelar atención')}
        message={t('procedures.cancelAttentionConfirm', '¿Cancelar la atención actual? No se guardarán los datos.')}
        variant="default"
      />

      {/* Confirmar terminar atención */}
      <ConfirmModal
        open={showEndConfirm}
        onClose={() => !savingAttention && setShowEndConfirm(false)}
        onConfirm={() => {
          if (!selectedPatient) return
          setSavingAttention(true)
          void createNursingAttention({
            patientId: selectedPatient.id,
            motiveAtencion: chiefComplaint,
            signosVitales:
              bloodPressureSys ||
              bloodPressureDia ||
              temperature ||
              heartRate ||
              spo2
                ? {
                    presionArterialSys: bloodPressureSys ? Number(bloodPressureSys) : undefined,
                    presionArterialDia: bloodPressureDia ? Number(bloodPressureDia) : undefined,
                    temperatura: temperature ? Number(temperature) : undefined,
                    frecuenciaCardiaca: heartRate ? Number(heartRate) : undefined,
                    spo2: spo2 ? Number(spo2) : undefined,
                  }
                : undefined,
            diagnosticoRelampago: lightningDiagnosis || undefined,
            tratamientoAplicado: treatmentApplied || undefined,
            observaciones: observations || undefined,
            derivacion: derivation || undefined,
          })
            .then(() => {
              setShowEndConfirm(false)
              setShowEndSuccess(true)
            })
            .finally(() => setSavingAttention(false))
        }}
        title={t('procedures.endAttention', 'Terminar atención')}
        message={t(
          'procedures.endAttentionConfirm',
          '¿Deseas terminar la atención actual de enfermería?'
        )}
        variant="default"
        confirming={savingAttention}
      />

      {/* Mensaje de sesión terminada */}
      <SuccessModal
        open={showEndSuccess}
        onClose={() => {
          setShowEndSuccess(false)
          resetAttentionForm()
        }}
        title={t('procedures.endAttention', 'Terminar atención')}
        message={
          selectedPatient
            ? t(
                'procedures.endAttentionSuccess',
                'Sesión terminada para {{name}} el {{dateTime}}.',
                {
                  name: `${selectedPatient.user.firstName} ${selectedPatient.user.lastName}`.trim(),
                  dateTime: new Date().toLocaleString(),
                }
              )
            : new Date().toLocaleString()
        }
      />
    </div>
  )
}

