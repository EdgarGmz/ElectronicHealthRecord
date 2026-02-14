import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full h-12 px-4 border-2 rounded-lg text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:border-primary-500 focus:ring-0 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
          'transition-all duration-200',
          error
            ? 'border-error-500 focus:border-error-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
            : 'border-gray-300',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
