import React from 'react';
import { useTranslation } from 'next-i18next';
import ProgressTimeline from './ProgressTimeline';
import {
  Ship,
  MapPin,
  Clock,
  Package,
  Anchor,
  Navigation,
  Leaf,
  Calendar,
  CheckCircle,
  AlertCircle,
  Circle,
  AlertTriangle
} from 'lucide-react';

interface ShipsGoMilestone {
  event: string;
  location: string;
  date: string;
  status: string;
  description?: string;
}

interface ShipsGoTrackingData {
  success: boolean;
  data: {
    container_number: string;
    bl_number?: string;
    booking_number?: string;
    shipping_line: string;
    vessel_name?: string;
    voyage?: string;
    port_of_loading?: string;
    port_of_discharge?: string;
    estimated_departure?: string;
    estimated_arrival?: string;
    actual_departure?: string;
    actual_arrival?: string;
    status: string;
    milestones: ShipsGoMilestone[];
    location?: {
      latitude: number;
      longitude: number;
      timestamp: string;
    };
    co2_emissions?: number;
    transit_time?: number;
  };
  shipmentInfo?: {
    trackingNumber: string;
    description: string;
    client: string;
  };
}

interface ShipsGoTrackingCardProps {
  trackingData: ShipsGoTrackingData;
}

const ShipsGoTrackingCard: React.FC<ShipsGoTrackingCardProps> = ({ trackingData }) => {
  const { t } = useTranslation('common');

  if (!trackingData.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">حدث خطأ في جلب بيانات التتبع</span>
        </div>
      </div>
    );
  }

  const { data } = trackingData;

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in progress':
      case 'in transit':
        return <Circle className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-yellow-500" />;
      case 'delayed':
        return <Circle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
      case 'in transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {trackingData.shipmentInfo?.trackingNumber || data.container_number}
            </h2>
            <p className="text-blue-100">
              {trackingData.shipmentInfo?.description || `${data.shipping_line} - ${data.vessel_name}`}
            </p>
          </div>
          <Ship className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* Status and Basic Info */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="flex items-center">
              {getStatusIcon(data.status)}
              <div className="mr-3">
                <p className="text-sm text-gray-600">الحالة</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
            </div>
          </div>
          
          {data.vessel_name && (
            <div className="flex items-center">
              <Ship className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">السفينة</p>
                <p className="font-semibold">{data.vessel_name}</p>
                {data.voyage && <p className="text-sm text-gray-500">{data.voyage}</p>}
              </div>
            </div>
          )}

          {data.shipping_line && (
            <div className="flex items-center">
              <Anchor className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">خط الشحن</p>
                <p className="font-semibold">{data.shipping_line}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route Information */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          المسار
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-green-500 mr-2 mt-1" />
              <div>
                <p className="font-semibold text-green-700">المنشأ</p>
                <p className="text-gray-700">{data.port_of_loading || 'N/A'}</p>
                {data.estimated_departure && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(data.estimated_departure)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-red-500 mr-2 mt-1" />
              <div>
                <p className="font-semibold text-red-700">الوجهة</p>
                <p className="text-gray-700">{data.port_of_discharge || 'N/A'}</p>
                {data.estimated_arrival && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(data.estimated_arrival)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Route Path Visualization */}
        <div className="bg-gray-50 rounded-lg p-4 mt-2 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-gray-700">خط السير الحالي</p>
            {data.location && data.location.latitude !== null && data.location.longitude !== null ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                تتبع نشط
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                بيانات التتبع غير متوفرة
              </span>
            )}
          </div>
          
          <div className="relative">
            {/* Route Progress Bar */}
            <div className="h-3 bg-gray-200 rounded-full w-full">
              <div 
                className="h-3 bg-blue-500 rounded-full relative" 
                style={{ 
                  width: data.location && data.location.latitude !== null ? 
                    `${Math.min(Math.max((data.milestones.filter(m => m.status?.toLowerCase() === 'completed').length / data.milestones.length) * 100, 10), 100)}%` : 
                    '0%' 
                }}
              >
                {/* Gradient overlay for better visual effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-75 rounded-full"></div>
              </div>
            </div>
            
            {/* Route Points */}
            <div className="flex justify-between mt-4 relative">
              {/* Origin Point */}
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-primary-600 rounded-full border-2 border-white shadow-md"></div>
                <div className="text-xs font-medium text-secondary-800 mt-1">{data.port_of_loading || 'المنشأ'}</div>
                {data.estimated_departure && (
                  <div className="text-xs text-secondary-500">{formatDate(data.estimated_departure).split(' ')[0]}</div>
                )}
              </div>
              
              {/* Current Location Point */}
              {data.location && data.location.latitude !== null && data.location.longitude !== null && (
                <div className="absolute" style={{ 
                  left: `${Math.min(Math.max((data.milestones.filter(m => m.status?.toLowerCase() === 'completed').length / data.milestones.length) * 100, 10), 95)}%`,
                  top: '-12px',
                  transform: 'translateX(-50%)'
                }}>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-primary-600 rounded-full animate-pulse border-2 border-white shadow-lg flex items-center justify-center">
                      <Navigation className="h-3 w-3 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-primary-700 mt-1 whitespace-nowrap bg-white px-2 py-0.5 rounded-full shadow-sm border border-primary-100">
                      الموقع الحالي
                    </div>
                  </div>
                </div>
              )}
              
              {/* Destination Point */}
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-secondary-800 rounded-full border-2 border-white shadow-md"></div>
                <div className="text-xs font-medium text-secondary-800 mt-1">{data.port_of_discharge || 'الوجهة'}</div>
                {data.estimated_arrival && (
                  <div className="text-xs text-secondary-500">{formatDate(data.estimated_arrival).split(' ')[0]}</div>
                )}
              </div>
            </div>
            
            {/* Last Updated Information */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              {data.location && data.location.latitude !== null && data.location.longitude !== null ? (
                <div className="flex justify-between items-center">
                  <div className="text-xs text-secondary-700 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-primary-600" />
                    <span>الإحداثيات: {data.location.latitude.toFixed(4)}, {data.location.longitude.toFixed(4)}</span>
                  </div>
                  <div className="text-xs text-secondary-700 flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-primary-600" />
                    <span>آخر تحديث: {formatDate(data.location.timestamp || new Date().toISOString())}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-secondary-700 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-primary-500" />
                  <span>لا تتوفر بيانات الموقع الحالي. سيتم التحديث عند توفر البيانات.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Environmental & Transit Info */}
      {(data.co2_emissions || data.transit_time) && (
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.co2_emissions && (
              <div className="flex items-center">
                <Leaf className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">انبعاثات الكربون</p>
                  <p className="font-semibold">{data.co2_emissions} kg CO₂</p>
                </div>
              </div>
            )}
            
            {data.transit_time && (
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">وقت العبور</p>
                  <p className="font-semibold">{data.transit_time} أيام</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Location */}
      {data.location && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            الموقع الحالي
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {data.location && data.location.latitude !== undefined && data.location.latitude !== null && 
             data.location.longitude !== undefined && data.location.longitude !== null ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">الإحداثيات</p>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">متصل</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                  <p className="font-mono text-sm flex items-center">
                    <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                    {Number(data.location.latitude).toFixed(4)}, {Number(data.location.longitude).toFixed(4)}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  آخر تحديث: {formatDate(data.location.timestamp || new Date().toISOString())}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">الموقع</p>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">غير متصل</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                  <p className="text-sm text-orange-600 flex items-center">
                    <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                    الإحداثيات غير متوفرة حالياً
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  سيتم تحديث الموقع عند توفر بيانات GPS من السفينة
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      {data.milestones && data.milestones.length > 0 && (
        <div className="p-6 border-b">
          <ProgressTimeline
            milestones={data.milestones}
            currentStatus={data.status}
          />
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-gray-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {data.container_number && (
            <div>
              <span className="text-gray-600">رقم الحاوية: </span>
              <span className="font-mono">{data.container_number}</span>
            </div>
          )}
          {data.bl_number && (
            <div>
              <span className="text-gray-600">رقم بوليصة الشحن: </span>
              <span className="font-mono">{data.bl_number}</span>
            </div>
          )}
          {data.booking_number && (
            <div>
              <span className="text-gray-600">رقم الحجز: </span>
              <span className="font-mono">{data.booking_number}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipsGoTrackingCard;
