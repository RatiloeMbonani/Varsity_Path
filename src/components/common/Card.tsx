import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'tinted' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-[#CFE3F1] shadow-xs',
    elevated: 'bg-white border border-[#CFE3F1] shadow-sm',
    tinted: 'bg-[#CFE3F1]/50 border border-[#8FB6D8]/50 shadow-xs',
    interactive:
      'bg-white border border-[#CFE3F1] hover:border-[#8FB6D8] transition-all duration-150 cursor-pointer shadow-xs hover:shadow-sm',
  };

  return (
    <div
      className={`rounded-xl p-6 text-[#243A5E] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-lg bg-[#CFE3F1] text-[#243A5E] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-[#243A5E] tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm text-[#5F86A6] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
