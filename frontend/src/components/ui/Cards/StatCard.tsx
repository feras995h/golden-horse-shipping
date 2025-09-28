import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: 'gold' | 'blue' | 'green' | 'red' | 'purple' | 'orange';
  className?: string;
  loading?: boolean;
}

const colorVariants = {
  gold: {
    bg: 'from-gold-400 to-gold-600',
    text: 'text-gold-600',
    lightBg: 'from-gold-50 to-gold-100',
    border: 'border-gold-200',
    shadow: 'shadow-gold-500/20'
  },
  blue: {
    bg: 'from-blue-400 to-blue-600',
    text: 'text-blue-600',
    lightBg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    shadow: 'shadow-blue-500/20'
  },
  green: {
    bg: 'from-green-400 to-green-600',
    text: 'text-green-600',
    lightBg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    shadow: 'shadow-green-500/20'
  },
  red: {
    bg: 'from-red-400 to-red-600',
    text: 'text-red-600',
    lightBg: 'from-red-50 to-red-100',
    border: 'border-red-200',
    shadow: 'shadow-red-500/20'
  },
  purple: {
    bg: 'from-purple-400 to-purple-600',
    text: 'text-purple-600',
    lightBg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    shadow: 'shadow-purple-500/20'
  },
  orange: {
    bg: 'from-orange-400 to-orange-600',
    text: 'text-orange-600',
    lightBg: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    shadow: 'shadow-orange-500/20'
  }
};

const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  icon: Icon,
  change,
  color = 'gold',
  className = '',
  loading = false
}) => {
  const colorScheme = colorVariants[color];

  if (loading) {
    return (
      <div className={`bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/30 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      group relative bg-white/95 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl 
      border ${colorScheme.border}/30 hover:${colorScheme.border}/50 
      p-6 transition-all duration-300 hover:-translate-y-1 ${className}
    `}>
      {/* Background gradient overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${colorScheme.lightBg} 
        opacity-0 group-hover:opacity-30 rounded-xl transition-opacity duration-300
      `}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 truncate">
            {title}
          </h3>
          <div className={`
            p-2 rounded-lg bg-gradient-to-r ${colorScheme.bg} 
            shadow-lg ${colorScheme.shadow} group-hover:scale-110 transition-transform duration-300
          `}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className={`text-2xl font-bold ${colorScheme.text} group-hover:scale-105 transition-transform duration-300`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>

        {/* Change indicator */}
        {change && (
          <div className="flex items-center">
            <span className={`
              text-xs font-medium px-2 py-1 rounded-full
              ${change.type === 'increase' 
                ? 'text-green-700 bg-green-100' 
                : 'text-red-700 bg-red-100'
              }
            `}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </span>
            <span className="text-xs text-gray-500 mr-2">
              مقارنة بالشهر الماضي
            </span>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className={`
        absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorScheme.bg} 
        opacity-5 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-10 
        transition-opacity duration-300
      `}></div>
      <div className={`
        absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${colorScheme.bg} 
        opacity-5 rounded-full translate-y-8 -translate-x-8 group-hover:opacity-10 
        transition-opacity duration-300
      `}></div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;