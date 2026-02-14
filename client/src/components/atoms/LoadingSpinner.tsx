import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  return (
    <div className={clsx('flex justify-center items-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-4 border-gray-200 border-t-primary-600',
          sizeClasses[size]
        )}
      />
    </div>
  );
};
