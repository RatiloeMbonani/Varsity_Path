import React from 'react';

export interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  id: string;
  children?: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  id,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#243A5E]"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-xs text-[#5F86A6]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F86A6]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#243A5E] placeholder-[#5F86A6]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8FB6D8] focus:border-[#5F86A6] ${
            leftIcon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-[#CFE3F1] hover:border-[#8FB6D8]'
          } ${className}`}
          {...props}
        />
      </div>
    );

    if (label && inputId) {
      return (
        <FormField
          id={inputId}
          label={label}
          error={error}
          helperText={helperText}
          required={props.required}
        >
          {inputElement}
        </FormField>
      );
    }

    return inputElement;
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, id, className = '', ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const selectElement = (
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#243A5E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8FB6D8] focus:border-[#5F86A6] ${
          error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-[#CFE3F1] hover:border-[#8FB6D8]'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );

    if (label && selectId) {
      return (
        <FormField
          id={selectId}
          label={label}
          error={error}
          helperText={helperText}
          required={props.required}
        >
          {selectElement}
        </FormField>
      );
    }

    return selectElement;
  }
);
Select.displayName = 'Select';
