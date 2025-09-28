import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import ProgressTimeline from './ProgressTimeline';
import ShipsGoLiveMap from './ShipsGoLiveMap';
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
  AlertTriangle,
  Map,
  Eye,
  EyeOff,
  FileText
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
  data?: {
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
  error?: string;
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
  const [showMap, setShowMap] = useState(false);

  // Early return if no data
  if (!trackingData.success || !trackingData.data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد بيانات تتبع متاحة
            </h3>
            <p className="text-gray-600">
              {trackingData.error || 'لم يتم العثور على معلومات التتبع للرقم المطلوب'}
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 نصيحة: تأكد من صحة رقم الحاوية أو رقم بوليصة الشحن
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data = trackingData.data;

  // Enhanced status determination
  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered') || statusLower.includes('تم التسليم')) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (statusLower.includes('transit') || statusLower.includes('في الطريق')) {
      return <Ship className="h-5 w-5 text-blue-600" />;
    } else if (statusLower.includes('port') || statusLower.includes('ميناء')) {
      return <Anchor className="h-5 w-5 text-orange-600" />;
    } else if (statusLower.includes('customs') || statusLower.includes('جمارك')) {
      return <FileText className="h-5 w-5 text-purple-600" />;
    } else if (statusLower.includes('delayed') || statusLower.includes('متأخر')) {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered') || statusLower.includes('تم التسليم')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower.includes('transit') || statusLower.includes('في الطريق')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (statusLower.includes('port') || statusLower.includes('ميناء')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    } else if (statusLower.includes('customs') || statusLower.includes('جمارك')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    } else if (statusLower.includes('delayed') || statusLower.includes('متأخر')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Calculate progress based on milestones
  const getProgressPercentage = () => {
    if (!data.milestones || data.milestones.length === 0) return 0;
    const completedMilestones = data.milestones.filter(m => 
      m.status?.toLowerCase() === 'completed' || 
      m.status?.toLowerCase() === 'مكتمل'
    ).length;
    return Math.min(Math.max((completedMilestones / data.milestones.length) * 100, 5), 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Package className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">
                {data.container_number || data.bl_number || 'غير محدد'}
              </h2>
              <p className="text-blue-100">
                {data.shipping_line || 'Golden Horse Shipping'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(data.status)}`}>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {getStatusIcon(data.status)}
                <span>{data.status || 'غير محدد'}</span>
              </div>
            </div>
            
            {data.container_number && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {showMap ? <EyeOff className="h-4 w-4" /> : <Map className="h-4 w-4" />}
                <span>{showMap ? 'إخفاء الخريطة' : 'عرض الخريطة'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-blue-100 mt-2">
          <span>البداية</span>
          <span>{Math.round(getProgressPercentage())}% مكتمل</span>
          <span>الوصول</span>
        </div>
      </div>

      {/* Live Map Section */}
      {showMap && data.container_number && (
        <div className="border-b">
          <ShipsGoLiveMap
            containerNumber={data.container_number}
            height="500px"
            showControls={true}
            onContainerChange={(newContainer) => {
              console.log('Container changed to:', newContainer);
            }}
          />
        </div>
      )}

      {/* Enhanced Route Information */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          معلومات المسار
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Origin */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-green-600 mr-2 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-green-800 mb-1">ميناء المنشأ</p>
                <p className="text-gray-700 font-medium">{data.port_of_loading || 'غير محدد'}</p>
                <div className="mt-2 space-y-1">
                  {data.estimated_departure && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="font-medium">المغادرة المتوقعة:</span>
                      <span className="mr-2">{formatDate(data.estimated_departure)}</span>
                    </p>
                  )}
                  {data.actual_departure && (
                    <p className="text-sm text-green-700 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="font-medium">المغادرة الفعلية:</span>
                      <span className="mr-2">{formatDate(data.actual_departure)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-red-600 mr-2 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-red-800 mb-1">ميناء الوجهة</p>
                <p className="text-gray-700 font-medium">{data.port_of_discharge || 'غير محدد'}</p>
                <div className="mt-2 space-y-1">
                  {data.estimated_arrival && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="font-medium">الوصول المتوقع:</span>
                      <span className="mr-2">{formatDate(data.estimated_arrival)}</span>
                    </p>
                  )}
                  {data.actual_arrival && (
                    <p className="text-sm text-green-700 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="font-medium">الوصول الفعلي:</span>
                      <span className="mr-2">{formatDate(data.actual_arrival)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Location Status */}
      {data.location && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            الموقع الحالي
          </h3>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            {data.location.latitude !== null && data.location.longitude !== null ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">حالة التتبع</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    نشط
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">خط العرض</p>
                    <p className="font-mono text-blue-800 font-semibold">{data.location.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">خط الطول</p>
                    <p className="font-mono text-blue-800 font-semibold">{data.location.longitude.toFixed(6)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-700 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    آخر تحديث: {formatDate(data.location.timestamp || new Date().toISOString())}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-orange-800 font-medium">بيانات الموقع غير متوفرة حالياً</p>
                <p className="text-sm text-orange-600 mt-1">سيتم التحديث عند توفر إشارة GPS</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Environmental & Transit Info */}
      {(data.co2_emissions || data.transit_time) && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">معلومات إضافية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.co2_emissions && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <Leaf className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-green-700 font-medium">انبعاثات الكربون</p>
                    <p className="text-lg font-bold text-green-800">{data.co2_emissions} kg CO₂</p>
                  </div>
                </div>
              </div>
            )}
            
            {data.transit_time && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">مدة العبور</p>
                    <p className="text-lg font-bold text-blue-800">{data.transit_time} يوم</p>
                  </div>
                </div>
              </div>
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

      {/* Additional Info Footer */}
      <div className="bg-gray-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {data.container_number && (
            <div className="flex items-center">
              <Package className="h-4 w-4 text-gray-500 mr-2" />
              <div>
                <span className="text-gray-600">رقم الحاوية: </span>
                <span className="font-mono font-semibold">{data.container_number}</span>
              </div>
            </div>
          )}
          {data.bl_number && (
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-gray-500 mr-2" />
              <div>
                <span className="text-gray-600">رقم بوليصة الشحن: </span>
                <span className="font-mono font-semibold">{data.bl_number}</span>
              </div>
            </div>
          )}
          {data.booking_number && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <div>
                <span className="text-gray-600">رقم الحجز: </span>
                <span className="font-mono font-semibold">{data.booking_number}</span>
              </div>
            </div>
          )}
        </div>
        
        {data.vessel_name && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center text-sm">
              <Ship className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-600">السفينة: </span>
              <span className="font-semibold mr-2">{data.vessel_name}</span>
              {data.voyage && (
                <>
                  <span className="text-gray-600">| الرحلة: </span>
                  <span className="font-semibold">{data.voyage}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipsGoTrackingCard;
