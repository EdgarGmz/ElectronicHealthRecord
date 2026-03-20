import { useTranslation, Trans } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { LayoutDashboard, Users, Calendar, User, ArrowRight, Mail, Send, ClipboardList, FileText, Stethoscope, UserCog, HelpCircle, Pill } from 'lucide-react'
import { EmailLink } from '@/components/atoms/EmailLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { useAuthStore } from '@/store/auth.store'
import { ROLES, canSeeNavItem } from '@/constants/roles'

const linkButtonClass =
  'group inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-all duration-200 hover:bg-[var(--color-primary)]/20 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] border border-transparent hover:border-[var(--color-primary)]/20'
const linkButtonClassPrimary =
  'group inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'

const MODULES_WITH_HELP: { to: string; key: string; helpKey: string }[] = [
  { to: '/', key: 'nav.dashboard', helpKey: 'help.dashboard' },
  { to: '/supervision', key: 'nav.supervision', helpKey: 'help.supervision' },
  { to: '/patients', key: 'nav.patients', helpKey: 'help.patients' },
  { to: '/appointments', key: 'nav.appointments', helpKey: 'help.appointments' },
  { to: '/sessions', key: 'nav.sessions', helpKey: 'help.sessions' },
  { to: '/nursing-attention', key: 'nav.nursingAttention', helpKey: 'help.nursingAttention' },
  { to: '/medications', key: 'nav.medications', helpKey: 'help.medications' },
  { to: '/procedures', key: 'nav.procedures', helpKey: 'help.procedures' },
  { to: '/interconsultations', key: 'nav.interconsultations', helpKey: 'help.interconsultations' },
  { to: '/reports', key: 'nav.reports', helpKey: 'help.reports' },
  { to: '/evaluations', key: 'nav.evaluations', helpKey: 'help.evaluations' },
  { to: '/notifications', key: 'nav.notifications', helpKey: 'help.notifications' },
]

export function HelpPage() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === ROLES.ADMIN
  const isCoordinatorPsychology = role === ROLES.COORDINADOR_PSICOLOGIA
  const isCoordinatorNursing = role === ROLES.COORDINADOR_ENFERMERIA
  const isPsychologist = role === ROLES.PSICOLOGO
  const isNurse = role === ROLES.ENFERMERO

  const visibleModules = useMemo(
    () => MODULES_WITH_HELP.filter((m) => canSeeNavItem(m.to, role)),
    [role]
  )

  const [feedbackSubject, setFeedbackSubject] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const supportEmail = 'edgar_gomez90@outlook.com'
  const mailtoHref = useMemo(() => {
    const subject = feedbackSubject.trim() || t('help.feedbackDefaultSubject')
    const body = feedbackMessage.trim() || t('help.feedbackDefaultBody')
    return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [feedbackSubject, feedbackMessage, supportEmail, t])

  const listItemStyle = (i: number) => ({
    animationDelay: `${i * 0.05}s`,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      {/* Hero intro */}
      <div className="opacity-0 help-animate-in help-stagger-0 flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--mesh-3)] p-6 transition-shadow hover:shadow-lg">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/15">
          <HelpCircle className="text-[var(--color-primary)]" size={28} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('help.title')}</h1>
          <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">{t('help.intro')}</p>
        </div>
      </div>

      {isAdmin && (
        <GlassCard className="opacity-0 help-animate-in help-stagger-1 rounded-2xl border-l-4 border-l-[var(--color-primary)] transition-all duration-300 hover:shadow-xl">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <ClipboardList size={20} className="text-[var(--color-primary)]" />
            {t('help.admin.title')}
          </h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">{t('help.admin.intro')}</p>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {[
              { key: 'nav.dashboard', help: 'help.admin.dashboard' },
              { key: 'nav.interconsultations', help: 'help.admin.interconsultations' },
              { key: 'nav.reports', help: 'help.admin.reports' },
              { key: 'nav.notifications', help: 'help.admin.notifications' },
              { key: 'nav.users', help: 'help.admin.users' },
              { key: 'nav.auditLogs', help: 'help.admin.auditLogs' },
              { key: 'nav.settings', help: 'help.admin.settings' },
              { key: 'nav.profile', help: 'help.admin.profile' },
              { key: 'nav.help', help: 'help.admin.help' },
            ].map((item, i) => (
              <li
                key={item.key}
                className="help-list-item rounded-lg border border-transparent bg-[var(--bg)]/30 px-3 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg)]/50"
                style={listItemStyle(i)}
              >
                <strong className="text-[var(--text-primary)]">{t(item.key)}:</strong> {t(item.help)}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {isCoordinatorPsychology && (
        <GlassCard className="opacity-0 help-animate-in help-stagger-1 rounded-2xl border-l-4 border-l-[#8b5cf6] transition-all duration-300 hover:shadow-xl">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <UserCog size={20} className="text-[#8b5cf6]" />
            {t('help.coordinatorPsychology.title')}
          </h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">{t('help.coordinatorPsychology.intro')}</p>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {[
              { key: 'nav.dashboard', help: 'help.coordinatorPsychology.dashboard' },
              { key: 'nav.supervision', help: 'help.coordinatorPsychology.supervision' },
              { key: 'nav.patients', help: 'help.coordinatorPsychology.patients' },
              { key: 'nav.reports', help: 'help.coordinatorPsychology.reports' },
              { key: 'nav.interconsultations', help: 'help.coordinatorPsychology.interconsultations' },
              { key: 'nav.notifications', help: 'help.coordinatorPsychology.notifications' },
              { key: 'nav.profile', help: 'help.coordinatorPsychology.profile' },
              { key: 'nav.help', help: 'help.coordinatorPsychology.help' },
            ].map((item, i) => (
              <li
                key={item.key}
                className="help-list-item rounded-lg border border-transparent bg-[var(--bg)]/30 px-3 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg)]/50"
                style={listItemStyle(i)}
              >
                <strong className="text-[var(--text-primary)]">{t(item.key)}:</strong> {t(item.help)}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {isCoordinatorNursing && (
        <GlassCard className="opacity-0 help-animate-in help-stagger-1 rounded-2xl border-l-4 border-l-[#059669] transition-all duration-300 hover:shadow-xl">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <Stethoscope size={20} className="text-[#059669]" />
            {t('help.coordinatorNursing.title')}
          </h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">{t('help.coordinatorNursing.intro')}</p>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {[
              { key: 'nav.dashboard', help: 'help.coordinatorNursing.dashboard' },
              { key: 'nav.patients', help: 'help.coordinatorNursing.patients' },
              { key: 'nav.sessions', help: 'help.coordinatorNursing.sessions' },
              { key: 'nav.medications', help: 'help.coordinatorNursing.medications' },
              { key: 'nav.procedures', help: 'help.coordinatorNursing.procedures' },
              { key: 'nav.evaluations', help: 'help.coordinatorNursing.evaluations' },
              { key: 'nav.interconsultations', help: 'help.coordinatorNursing.interconsultations' },
              { key: 'nav.reports', help: 'help.coordinatorNursing.reports' },
              { key: 'nav.notifications', help: 'help.coordinatorNursing.notifications' },
              { key: 'nav.profile', help: 'help.coordinatorNursing.profile' },
              { key: 'nav.help', help: 'help.coordinatorNursing.help' },
            ].map((item, i) => (
              <li
                key={item.key}
                className="help-list-item rounded-lg border border-transparent bg-[var(--bg)]/30 px-3 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg)]/50"
                style={listItemStyle(i)}
              >
                <strong className="text-[var(--text-primary)]">{t(item.key)}:</strong> {t(item.help)}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {isNurse && (
        <GlassCard className="opacity-0 help-animate-in help-stagger-1 rounded-2xl border-l-4 border-l-[#0d9488] transition-all duration-300 hover:shadow-xl">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <Stethoscope size={20} className="text-[#0d9488]" />
            {t('help.nurse.title')}
          </h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">{t('help.nurse.intro')}</p>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {[
              { key: 'nav.dashboard', help: 'help.nurse.dashboard' },
              { key: 'nav.patients', help: 'help.nurse.patients' },
              { key: 'nav.nursingAttention', help: 'help.nurse.nursingAttention' },
              { key: 'nav.medications', help: 'help.nurse.medications' },
              { key: 'nav.procedures', help: 'help.nurse.procedures' },
              { key: 'nav.interconsultations', help: 'help.nurse.interconsultations' },
              { key: 'nav.reports', help: 'help.nurse.reports' },
              { key: 'nav.notifications', help: 'help.nurse.notifications' },
              { key: 'nav.profile', help: 'help.nurse.profile' },
              { key: 'nav.help', help: 'help.nurse.help' },
            ].map((item, i) => (
              <li
                key={item.key}
                className="help-list-item rounded-lg border border-transparent bg-[var(--bg)]/30 px-3 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg)]/50"
                style={listItemStyle(i)}
              >
                <strong className="text-[var(--text-primary)]">{t(item.key)}:</strong> {t(item.help)}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {isPsychologist && (
        <GlassCard className="opacity-0 help-animate-in help-stagger-1 rounded-2xl border-l-4 border-l-[#0ea5e9] transition-all duration-300 hover:shadow-xl">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <FileText size={20} className="text-[#0ea5e9]" />
            {t('help.psychologist.title')}
          </h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">{t('help.psychologist.intro')}</p>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {[
              { key: 'nav.dashboard', help: 'help.psychologist.dashboard' },
              { key: 'nav.patients', help: 'help.psychologist.patients' },
              { key: 'nav.appointments', help: 'help.psychologist.appointments' },
              { key: 'nav.sessions', help: 'help.psychologist.sessions' },
              { key: 'nav.evaluations', help: 'help.psychologist.evaluations' },
              { key: 'nav.profile', help: 'help.psychologist.profile' },
              { key: 'nav.help', help: 'help.psychologist.help' },
            ].map((item, i) => (
              <li
                key={item.key}
                className="help-list-item rounded-lg border border-transparent bg-[var(--bg)]/30 px-3 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg)]/50"
                style={listItemStyle(i)}
              >
                <strong className="text-[var(--text-primary)]">{t(item.key)}:</strong> {t(item.help)}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <GlassCard className="opacity-0 help-animate-in help-stagger-2 rounded-2xl transition-all duration-300 hover:shadow-xl">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <LayoutDashboard size={20} className="text-[var(--color-primary)]" />
          {t('help.whatYouCanDo')}
        </h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">{t('help.modulesIntro')}</p>
        <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
          {visibleModules.map((m, i) => (
            <li
              key={m.to}
              className="help-list-item rounded-lg border border-transparent bg-[var(--bg)]/30 px-3 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg)]/50"
              style={listItemStyle(i)}
            >
              <strong className="text-[var(--text-primary)]">{t(m.key)}:</strong> {t(m.helpKey)}
            </li>
          ))}
          <li
            className="help-list-item rounded-lg border border-transparent bg-[var(--bg)]/30 px-3 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg)]/50"
            style={listItemStyle(visibleModules.length)}
          >
            <strong className="text-[var(--text-primary)]">{t('nav.profile')}:</strong> {t('help.profile')}
          </li>
          <li
            className="help-list-item rounded-lg border border-transparent bg-[var(--bg)]/30 px-3 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--bg)]/50"
            style={listItemStyle(visibleModules.length + 1)}
          >
            <strong className="text-[var(--text-primary)]">{t('nav.settings')}:</strong> {t('help.settings')}
          </li>
        </ul>
      </GlassCard>

      <GlassCard className="opacity-0 help-animate-in help-stagger-3 rounded-2xl transition-all duration-300 hover:shadow-xl">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <ArrowRight size={20} className="text-[var(--color-primary)]" />
          {t('help.quickLinks')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className={linkButtonClass}>
            <LayoutDashboard size={18} className="transition-transform group-hover:scale-110" />
            {t('help.goToDashboard')}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          {isAdmin ? (
            <>
              <Link to="/users" className={linkButtonClass}>
                <Users size={18} className="transition-transform group-hover:scale-110" />
                {t('nav.users')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/reports" className={linkButtonClass}>
                <FileText size={18} className="transition-transform group-hover:scale-110" />
                {t('nav.reports')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/audit-logs" className={linkButtonClass}>
                <ClipboardList size={18} className="transition-transform group-hover:scale-110" />
                {t('nav.auditLogs')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/interconsultations" className={linkButtonClass}>
                <Stethoscope size={18} className="transition-transform group-hover:scale-110" />
                {t('nav.interconsultations')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          ) : (
            <>
              {isCoordinatorPsychology ? (
                <>
                  <Link to="/supervision" className={linkButtonClass}>
                    <UserCog size={18} className="transition-transform group-hover:scale-110" />
                    {t('nav.supervision')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/patients" className={linkButtonClass}>
                    <Users size={18} className="transition-transform group-hover:scale-110" />
                    {t('help.goToPatients')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              ) : isCoordinatorNursing ? (
                <>
                  <Link to="/patients" className={linkButtonClass}>
                    <Users size={18} className="transition-transform group-hover:scale-110" />
                    {t('help.goToPatients')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/medications" className={linkButtonClass}>
                    <Pill size={18} className="transition-transform group-hover:scale-110" />
                    {t('nav.medications')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/procedures" className={linkButtonClass}>
                    <Stethoscope size={18} className="transition-transform group-hover:scale-110" />
                    {t('nav.procedures')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              ) : isNurse ? (
                <>
                  <Link to="/patients" className={linkButtonClass}>
                    <Users size={18} className="transition-transform group-hover:scale-110" />
                    {t('help.goToPatients')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/nursing-attention" className={linkButtonClass}>
                    <Stethoscope size={18} className="transition-transform group-hover:scale-110" />
                    {t('nav.nursingAttention')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/medications" className={linkButtonClass}>
                    <Pill size={18} className="transition-transform group-hover:scale-110" />
                    {t('nav.medications')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/procedures" className={linkButtonClass}>
                    <Stethoscope size={18} className="transition-transform group-hover:scale-110" />
                    {t('nav.procedures')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/reports" className={linkButtonClass}>
                    <FileText size={18} className="transition-transform group-hover:scale-110" />
                    {t('nav.reports')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/patients" className={linkButtonClass}>
                    <Users size={18} className="transition-transform group-hover:scale-110" />
                    {t('help.goToPatients')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  {canSeeNavItem('/appointments', role) && (
                    <Link to="/appointments" className={linkButtonClass}>
                      <Calendar size={18} className="transition-transform group-hover:scale-110" />
                      {t('help.goToAppointments')}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                  {canSeeNavItem('/sessions', role) && (
                    <Link to="/sessions" className={linkButtonClass}>
                      <FileText size={18} className="transition-transform group-hover:scale-110" />
                      {t('nav.sessions')}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                  {canSeeNavItem('/evaluations', role) && (
                    <Link to="/evaluations" className={linkButtonClass}>
                      <ClipboardList size={18} className="transition-transform group-hover:scale-110" />
                      {t('nav.evaluations')}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </>
              )}
            </>
          )}
          <Link to="/profile" className={linkButtonClass}>
            <User size={18} className="transition-transform group-hover:scale-110" />
            {t('help.goToProfile')}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </GlassCard>

      <GlassCard className="opacity-0 help-animate-in help-stagger-4 rounded-2xl transition-all duration-300 hover:shadow-xl">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <Mail size={20} className="text-[var(--color-primary)]" />
          {t('help.feedback.title')}
        </h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          <Trans
            i18nKey="help.feedback.intro"
            values={{ email: supportEmail }}
            components={[<EmailLink key="0" email={supportEmail} />]}
          />
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('help.feedback.subject')}</label>
            <input
              className="glass-input w-full rounded-lg px-4 py-2.5 transition-shadow focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
              value={feedbackSubject}
              onChange={(e) => setFeedbackSubject(e.target.value)}
              placeholder={t('help.feedback.subjectPlaceholder')}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('help.feedback.message')}</label>
            <textarea
              className="glass-input w-full min-h-[120px] rounded-lg px-4 py-2.5 transition-shadow focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder={t('help.feedback.messagePlaceholder')}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a href={mailtoHref} className={linkButtonClassPrimary}>
            <Send size={18} className="transition-transform group-hover:scale-110" />
            {t('help.feedback.sendEmail')}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href={`mailto:${supportEmail}`} className={linkButtonClass}>
            <Mail size={18} className="transition-transform group-hover:scale-110" />
            {t('help.feedback.openEmail')}
          </a>
        </div>
      </GlassCard>
    </div>
  )
}
