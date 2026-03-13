import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { HelpCircle, LayoutDashboard, Users, Calendar, User, ArrowRight, Mail, Send, ClipboardList, FileText, Stethoscope } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'

export function HelpPage() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === ROLES.ADMIN

  const [feedbackSubject, setFeedbackSubject] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const supportEmail = 'edgar_gomez90@outlook.com'
  const mailtoHref = useMemo(() => {
    const subject = feedbackSubject.trim() || t('help.feedbackDefaultSubject')
    const body = feedbackMessage.trim() || t('help.feedbackDefaultBody')
    return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [feedbackSubject, feedbackMessage, supportEmail, t])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
        <HelpCircle size={28} />
        {t('help.title')}
      </h1>

      <p className="text-[var(--text-secondary)] max-w-2xl">{t('help.intro')}</p>

      {isAdmin && (
        <GlassCard>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('help.admin.title')}</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">{t('help.admin.intro')}</p>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><strong className="text-[var(--text-primary)]">{t('nav.dashboard')}:</strong> {t('help.admin.dashboard')}</li>
            <li><strong className="text-[var(--text-primary)]">{t('nav.interconsultations')}:</strong> {t('help.admin.interconsultations')}</li>
            <li><strong className="text-[var(--text-primary)]">{t('nav.reports')}:</strong> {t('help.admin.reports')}</li>
            <li><strong className="text-[var(--text-primary)]">{t('nav.notifications')}:</strong> {t('help.admin.notifications')}</li>
            <li><strong className="text-[var(--text-primary)]">{t('nav.users')}:</strong> {t('help.admin.users')}</li>
            <li><strong className="text-[var(--text-primary)]">{t('nav.auditLogs')}:</strong> {t('help.admin.auditLogs')}</li>
            <li><strong className="text-[var(--text-primary)]">{t('nav.settings')}:</strong> {t('help.admin.settings')}</li>
            <li><strong className="text-[var(--text-primary)]">{t('nav.profile')}:</strong> {t('help.admin.profile')}</li>
            <li><strong className="text-[var(--text-primary)]">{t('nav.help')}:</strong> {t('help.admin.help')}</li>
          </ul>
        </GlassCard>
      )}

      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('help.whatYouCanDo')}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{t('help.modulesIntro')}</p>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li><strong className="text-[var(--text-primary)]">{t('nav.dashboard')}:</strong> {t('help.dashboard')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.patients')}:</strong> {t('help.patients')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.appointments')}:</strong> {t('help.appointments')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.sessions')}:</strong> {t('help.sessions')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.medications')}:</strong> {t('help.medications')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.procedures')}:</strong> {t('help.procedures')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.interconsultations')}:</strong> {t('help.interconsultations')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.reports')}:</strong> {t('help.reports')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.evaluations')}:</strong> {t('help.evaluations')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.notifications')}:</strong> {t('help.notifications')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.profile')}:</strong> {t('help.profile')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.settings')}:</strong> {t('help.settings')}</li>
        </ul>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('help.quickLinks')}</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <LayoutDashboard size={18} />
            {t('help.goToDashboard')}
            <ArrowRight size={16} />
          </Link>
          {isAdmin ? (
            <>
              <Link
                to="/users"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
              >
                <Users size={18} />
                {t('nav.users')}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/reports"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
              >
                <FileText size={18} />
                {t('nav.reports')}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/audit-logs"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
              >
                <ClipboardList size={18} />
                {t('nav.auditLogs')}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/interconsultations"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
              >
                <Stethoscope size={18} />
                {t('nav.interconsultations')}
                <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/patients"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
              >
                <Users size={18} />
                {t('help.goToPatients')}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/appointments"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
              >
                <Calendar size={18} />
                {t('help.goToAppointments')}
                <ArrowRight size={16} />
              </Link>
            </>
          )}
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <User size={18} />
            {t('help.goToProfile')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('help.feedback.title')}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{t('help.feedback.intro', { email: supportEmail })}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('help.feedback.subject')}</label>
            <input
              className="glass-input w-full px-4 py-2.5"
              value={feedbackSubject}
              onChange={(e) => setFeedbackSubject(e.target.value)}
              placeholder={t('help.feedback.subjectPlaceholder')}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('help.feedback.message')}</label>
            <textarea
              className="glass-input w-full px-4 py-2.5 min-h-[120px]"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder={t('help.feedback.messagePlaceholder')}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90"
          >
            <Send size={18} />
            {t('help.feedback.sendEmail')}
            <ArrowRight size={16} />
          </a>
          <a
            href={`mailto:${supportEmail}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <Mail size={18} />
            {t('help.feedback.openEmail')}
          </a>
        </div>
      </GlassCard>
    </div>
  )
}
