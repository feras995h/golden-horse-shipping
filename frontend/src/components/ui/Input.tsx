import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

type InputVariant = 'default' | 'luxury' | 'elegant' | 'glass';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  error?: string;
  label?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
  required?: boolean;
}

const variantMap: Record<InputVariant, string> = {
  default: 'border-gray-300 bg-white focus:border-gold-500 focus:ring-gold-500',
  luxury: 'border-gold-200 bg-gradient-to-r from-white to-luxury-50 focus:border-gold-400 focus:ring-gold-400 focus:shadow-gold-500/20',
  elegant: 'border-elegant-300 bg-gradient-to-r from-elegant-50 to-white focus:border-elegant-500 focus:ring-elegant-500',
  glass: 'border-white/20 bg-white/80 backdrop-blur-md focus:border-gold-400 focus:ring-gold-400 focus:shadow-xl'
};

const sizeMap: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
};

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  error,
  label,
  icon: Icon,
  iconPosition = 'right',
  glow = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = [
    'w-full rounded-xl border transition-all duration-300 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-opacity-50',
    'placeholder-gray-400 text-gray-900',
    variantMap[variant],
    sizeMap[size],
    Icon && iconPosition === 'right' ? 'pr-12' : '',
    Icon && iconPosition === 'left' ? 'pl-12' : '',
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
        {Icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'right' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          className={baseClasses}
          {...props}
        />
        
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

Input.displayName = 'Input';

export default Input;