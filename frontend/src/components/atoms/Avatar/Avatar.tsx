import { type ImgHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ 
  fallback, 
  size = 'md', 
  className, 
  src, 
  alt = 'Avatar',
  ...props 
}: AvatarProps) {
  if (!src && fallback) {
    return (
      <div 
        className={cn(
          'rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold',
          sizeClasses[size],
          className
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
