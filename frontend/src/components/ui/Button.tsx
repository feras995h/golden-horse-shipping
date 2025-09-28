import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'white' | 'luxury' | 'elegant';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
};

const variantMap: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'text-elegant-700 hover:text-gold-700 focus-ring transition-all duration-300 hover:bg-gradient-to-r hover:from-gold-50 hover:to-luxury-50',
  white: 'bg-white text-elegant-900 hover:bg-gradient-to-r hover:from-elegant-50 hover:to-luxury-50 rounded-xl px-6 py-3 focus-ring shadow-md hover:shadow-lg transition-all duration-300 border border-gold-200/50',
  luxury: 'bg-gradient-to-r from-luxury-500 to-gold-600 text-white hover:from-luxury-600 hover:to-gold-700 rounded-xl px-8 py-4 focus-ring shadow-lg hover:shadow-xl transition-all duration-300 font-bold relative overflow-hidden group',
  elegant: 'bg-gradient-to-r from-elegant-800 to-elegant-900 text-white hover:from-elegant-900 hover:to-elegant-800 rounded-xl px-6 py-3 focus-ring shadow-md hover:shadow-lg transition-all duration-300 font-semibold'
};

const sizeMap: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl'
};

export default function Button({ 
  variant = 'primary', 
  size = 'md',
  glow = false,
  className = '', 
  children,
  ...rest 
}: Props) {
  const baseClasses = variantMap[variant];
  const sizeClasses = variant === 'luxury' || variant === 'elegant' ? '' : sizeMap[size];
  const glowClasses = glow ? 'shadow-2xl shadow-gold-500/25 hover:shadow-gold-500/40' : '';
  
  const classes = `${baseClasses} ${sizeClasses} ${glowClasses} ${className}`.trim();
  
  return (
    <button className={classes} {...rest}>
      {variant === 'luxury' && (
        <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-luxury-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

