import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

interface Milestone {
  event: string;
  location: string;
  date: string;
  status: string;
  description?: string;
}

interface ProgressTimelineProps {
  milestones: Milestone[];
  currentStatus: string;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ milestones, currentStatus }) => {
  const getStatusIcon = (status: string, index: number) => {
  switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'in progress':
      case 'in_progress':
        return <Clock className="h-6 w-6 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Circle className="h-6 w-6 text-gray-400" />;
      case 'delayed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in progress':
      case 'in_progress':
        return 'border-blue-500 bg-blue-50';
      case 'pending':
        return 'border-gray-300 bg-gray-50';
      case 'delayed':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-LY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>لا توجد مراحل متاحة للعرض</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Clock className="h-6 w-6 mr-2 text-blue-600" />
        مراحل الشحنة
      </h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute right-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {milestones.map((milestone, index) => {
          const isCompleted = milestone.status?.toLowerCase() === 'completed';
  const isInProgress = milestone.status?.toLowerCase() === 'in progress' || 
                      milestone.status?.toLowerCase() === 'in_progress';
          const isLast = index === milestones.length - 1;
          
          return (
            <div key={index} className="relative flex items-start mb-8 last:mb-0">
              {/* Icon */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(milestone.status)}`}>
                {getStatusIcon(milestone.status, index)}
              </div>
              
              {/* Content */}
              <div className="mr-6 flex-1">
                <div className={`p-4 rounded-lg border-2 ${getStatusColor(milestone.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {milestone.event}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isCompleted ? 'bg-green-100 text-green-800' :
                      isInProgress ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {milestone.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">الموقع:</p>
                      <p className="font-medium text-gray-900">{milestone.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">التاريخ:</p>
                      <p className="font-medium text-gray-900">{formatDate(milestone.date)}</p>
                    </div>
                  </div>
                  
                  {milestone.description && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">التقدم الإجمالي:</span>
          <span className="font-medium text-gray-900">
            {milestones.filter(m => m.status?.toLowerCase() === 'completed').length} من {milestones.length} مراحل مكتملة
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(milestones.filter(m => m.status?.toLowerCase() === 'completed').length / milestones.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTimeline;
