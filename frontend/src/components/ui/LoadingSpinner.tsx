import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-gold-600',
    secondary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
      />
      {text && (
        <p className={`mt-2 text-sm ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

// Skeleton loader component for better loading states
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = false,
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${width} ${height} ${
        rounded ? 'rounded-full' : 'rounded'
      } ${className}`}
    />
  );
};

// Card skeleton for consistent loading states
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 space-x-reverse mb-4">
          <Skeleton width="w-12" height="h-12" rounded />
          <div className="flex-1">
            <Skeleton width="w-3/4" height="h-4" className="mb-2" />
            <Skeleton width="w-1/2" height="h-3" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton width="w-full" height="h-3" />
          <Skeleton width="w-5/6" height="h-3" />
          <Skeleton width="w-4/6" height="h-3" />
        </div>
        <div className="flex justify-between items-center mt-4">
          <Skeleton width="w-20" height="h-6" rounded />
          <Skeleton width="w-16" height="h-8" rounded />
        </div>
      </div>
    </div>
  );
};

// Table skeleton for data tables
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-4 space-x-reverse">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} width="w-24" height="h-4" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4 space-x-reverse">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  width={colIndex === 0 ? "w-32" : "w-20"} 
                  height="h-4" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;