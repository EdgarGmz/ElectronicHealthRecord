import { GlassCard } from '@/components/atoms/GlassCard'

export interface NursingAttentionFormProps {
  symptoms: string
  description: string
  suppliesUsed: string
  observations: string
  disabled?: boolean
  onChange: (field: keyof Omit<NursingAttentionFormProps, 'onChange'>, value: string) => void
}

export function NursingAttentionForm({
  symptoms,
  description,
  suppliesUsed,
  observations,
  disabled,
  onChange,
}: NursingAttentionFormProps) {
  return (
    <GlassCard className="space-y-4 rounded-2xl">
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          rows={3}
          value={symptoms}
          onChange={(e) => onChange('symptoms', e.target.value)}
          disabled={disabled}
          placeholder=""
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        />
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          disabled={disabled}
          placeholder=""
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          rows={3}
          value={suppliesUsed}
          onChange={(e) => onChange('suppliesUsed', e.target.value)}
          disabled={disabled}
          placeholder=""
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        />
        <textarea
          rows={3}
          value={observations}
          onChange={(e) => onChange('observations', e.target.value)}
          disabled={disabled}
          placeholder=""
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        />
      </div>
    </GlassCard>
  )
}

