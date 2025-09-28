import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

type CheckboxVariant = 'default' | 'luxury' | 'elegant';
type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  label?: string;
  description?: string;
  error?: string;
  glow?: boolean;
}

const variantMap: Record<CheckboxVariant, string> = {
  default: 'border-gray-300 text-gold-600 focus:ring-gold-500',
  luxury: 'border-gold-300 text-gold-600 focus:ring-gold-500 focus:ring-opacity-50',
  elegant: 'border-elegant-400 text-elegant-600 focus:ring-elegant-500'
};

const sizeMap: Record<CheckboxSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  variant = 'default',
  size = 'md',
  label,
  description,
  error,
  glow = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = [
    'rounded-md border transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    variantMap[variant],
    sizeMap[size],
    error ? 'border-red-300 focus:ring-red-500' : '',
    glow ? 'focus:shadow-lg' : '',
    props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-2">
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={baseClasses}
            {...props}
          />
          
          {/* Custom checkmark for luxury variant */}
          {variant === 'luxury' && props.checked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Check className="h-3 w-3 text-gold-600" strokeWidth={3} />
            </div>
          )}
        </div>
        
        {(label || description) && (
          <div className="mr-3 flex-1">
            {label && (
              <label 
                className={`block text-sm font-medium cursor-pointer ${
                  error ? 'text-red-700' : 'text-gray-700'
                } ${props.disabled ? 'opacity-50' : ''}`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={`text-sm ${
                error ? 'text-red-600' : 'text-gray-500'
              } ${props.disabled ? 'opacity-50' : ''}`}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;