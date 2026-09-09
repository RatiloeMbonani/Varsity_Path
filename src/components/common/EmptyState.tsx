import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  hint?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  hint,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-[#CFE3F1] bg-white p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#EDF4FA] border border-[#CFE3F1] text-[#243A5E] flex items-center justify-center mb-6 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-xl md:text-2xl font-bold text-[#243A5E] tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-base text-[#5F86A6] max-w-lg mb-8 leading-relaxed">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          {primaryAction}
          {secondaryAction}
        </div>
      )}

      {hint && (
        <div className="mt-6 pt-6 border-t border-[#EDF4FA] w-full">
          <p className="text-xs text-[#5F86A6] uppercase tracking-wider font-medium">
            {hint}
          </p>
        </div>
      )}
    </div>
  );
};
