import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

type SelectVariant = 'default' | 'luxury' | 'elegant' | 'glass';
type SelectSize = 'sm' | 'md' | 'lg';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: SelectVariant;
  size?: SelectSize;
  error?: string;
  label?: string;
  glow?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

const variantMap: Record<SelectVariant, string> = {
  default: 'border-gray-300 bg-white focus:border-gold-500 focus:ring-gold-500',
  luxury: 'border-gold-200 bg-gradient-to-r from-white to-luxury-50 focus:border-gold-400 focus:ring-gold-400 focus:shadow-gold-500/20',
  elegant: 'border-elegant-300 bg-gradient-to-r from-elegant-50 to-white focus:border-elegant-500 focus:ring-elegant-500',
  glass: 'border-white/20 bg-white/80 backdrop-blur-md focus:border-gold-400 focus:ring-gold-400 focus:shadow-xl'
};

const sizeMap: Record<SelectSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  variant = 'default',
  size = 'md',
  error,
  label,
  glow = false,
  required = false,
  options,
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = [
    'w-full rounded-xl border transition-all duration-300 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-opacity-50',
    'text-gray-900 appearance-none cursor-pointer',
    'pr-12', // Space for chevron icon
    variantMap[variant],
    sizeMap[size],
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
    glow ? 'focus:shadow-lg' : '',
    props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={baseClasses}
          {...props}
        >
          {options ? (
            options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        
        {/* Chevron Icon */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
        
        {variant === 'luxury' && (
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-luxury-500/5 rounded-xl pointer-events-none" />
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

Select.displayName = 'Select';

export default Select;