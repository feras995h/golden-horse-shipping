import React from 'react';

type CardVariant = 'default' | 'luxury' | 'elegant' | 'glass' | 'gradient';
type CardSize = 'sm' | 'md' | 'lg' | 'xl';

type Props = React.PropsWithChildren<{
  className?: string;
  hover?: boolean;
  variant?: CardVariant;
  size?: CardSize;
  glow?: boolean;
  border?: boolean;
}>;

const variantMap: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200 shadow-sm',
  luxury: 'bg-gradient-to-br from-white via-luxury-50 to-gold-50 border border-gold-200 shadow-lg',
  elegant: 'bg-gradient-to-br from-elegant-50 to-white border border-elegant-200 shadow-md',
  glass: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl',
  gradient: 'bg-gradient-to-br from-gold-50 via-white to-luxury-50 border border-gold-300 shadow-lg'
};

const sizeMap: Record<CardSize, string> = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-xl',
  xl: 'p-8 rounded-2xl'
};

export default function Card({ 
  children, 
  className = '', 
  hover = true, 
  variant = 'default',
  size = 'md',
  glow = false,
  border = true
}: Props) {
  const baseClasses = [
    variantMap[variant],
    sizeMap[size],
    'transition-all duration-300 ease-in-out',
    hover && 'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1',
    glow && 'hover:shadow-gold-500/20',
    !border && 'border-0',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses}>
      {variant === 'luxury' && (
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-luxury-500/5 rounded-xl pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

