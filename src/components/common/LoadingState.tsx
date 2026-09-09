import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'text-[#243A5E]',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={`animate-spin ${sizeMap[size]} ${color} ${className}`}
      aria-label="Loading"
    />
  );
};

export interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading student session...',
  description,
  className = '',
}) => {
  return (
    <div
      className={`min-h-[280px] flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#CFE3F1]/60 flex items-center justify-center mb-4 text-[#243A5E]">
        <LoadingSpinner size="lg" />
      </div>
      <h4 className="text-base font-semibold text-[#243A5E]">{message}</h4>
      {description && (
        <p className="text-sm text-[#5F86A6] mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
};
