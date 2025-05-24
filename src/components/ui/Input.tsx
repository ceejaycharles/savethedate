import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'input' | 'textarea';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, leftIcon, rightIcon, id, as = 'input', ...props }, ref) => {
    const inputClasses = cn(
      'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
      'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-error-500' : 'border-gray-300',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    );

    const renderInput = () => {
      if (as === 'textarea') {
        return (
          <textarea
            id={id}
            className={cn(inputClasses, 'min-h-[80px] h-auto py-2')}
            {...props as any}
          />
        );
      }

      return (
        <input
          ref={ref}
          id={id}
          className={inputClasses}
          {...props}
        />
      );
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          {renderInput()}
          {rightIcon && (
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="mt-1 text-sm text-error-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;