import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

export interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  iconBgColor?: string;
  iconColor?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  change,
  changeType = 'neutral',
  iconBgColor = 'bg-primary-100',
  iconColor = 'text-primary-500',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4', iconBgColor, iconColor)}>
        {icon}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        
        {change && (
          <p
            className={cn(
              'text-xs font-medium',
              changeType === 'positive' && 'text-success-600',
              changeType === 'negative' && 'text-error-600',
              changeType === 'neutral' && 'text-gray-500'
            )}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
