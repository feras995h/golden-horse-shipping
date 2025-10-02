import { useState, useEffect } from 'react';
import { 
  Package, 
  Ship, 
  MapPin, 
  Calendar, 
  Clock,
  CheckCircle,
  Circle,
  Navigation,
  Anchor,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Truck,
  Plane,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackingData {
  success: boolean;
  data: {
    container_number: string;
    bl_number?: string;
    booking_number?: string;
    shipping_line: string;
    vessel_name?: string;
    vessel_imo?: string;
    voyage?: string;
    port_of_loading?: string;
    port_of_discharge?: string;
    loading_country?: string;
    discharge_country?: string;
    estimated_departure?: string;
    estimated_arrival?: string;
    actual_departure?: string;
    actual_arrival?: string;
    status: string;
    eta?: string;
    milestones: Array<{
      event: string;
      location: string;
      date: string;
      status: string;
      description?: string;
    }>;
    location?: {
      latitude: number;
      longitude: number;
      timestamp: string;
    };
    container_type?: string;
    transit_time?: string;
    co2_emissions?: number;
    live_map_url?: string;
  };
  shipmentInfo?: {
    trackingNumber: string;
    description: string;
    client: string;
  };
  message?: string;
  timestamp?: string;
}

interface EnhancedTrackingCardProps {
  trackingData: TrackingData;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
}

const EnhancedTrackingCard: React.FC<EnhancedTrackingCardProps> = ({
  trackingData,
  autoRefresh = false,
  refreshInterval = 30000,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('الآن');

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - lastUpdate.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) {
        setTimeAgo('الآن');
      } else if (minutes === 1) {
        setTimeAgo('منذ دقيقة');
      } else if (minutes < 60) {
        setTimeAgo(`منذ ${minutes} دقيقة`);
      } else {
        const hours = Math.floor(minutes / 60);
        setTimeAgo(`منذ ${hours} ساعة`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, onRefresh]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setLastUpdate(new Date());
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('تم التسليم')) {
      return 'from-green-500 to-emerald-600';
    }
    if (statusLower.includes('transit') || statusLower.includes('في الطريق')) {
      return 'from-blue-500 to-cyan-600';
    }
    if (statusLower.includes('port') || statusLower.includes('ميناء')) {
      return 'from-purple-500 to-indigo-600';
    }
    if (statusLower.includes('delayed') || statusLower.includes('متأخر')) {
      return 'from-red-500 to-rose-600';
    }
    return 'from-gray-500 to-slate-600';
  };

  const getMilestoneIcon = (event: string, status: string) => {
    const eventLower = event.toLowerCase();
    const statusLower = status.toLowerCase();
    
    const isCompleted = statusLower.includes('completed') || statusLower.includes('مكتمل');
    const iconClass = isCompleted ? 'text-green-600' : 'text-gray-400';
    
    if (eventLower.includes('loaded') || eventLower.includes('تحميل')) {
      return <Truck className={`h-5 w-5 ${iconClass}`} />;
    }
    if (eventLower.includes('departed') || eventLower.includes('مغادرة')) {
      return <Ship className={`h-5 w-5 ${iconClass}`} />;
    }
    if (eventLower.includes('transit') || eventLower.includes('عبور')) {
      return <Navigation className={`h-5 w-5 ${iconClass}`} />;
    }
    if (eventLower.includes('port') || eventLower.includes('ميناء')) {
      return <Anchor className={`h-5 w-5 ${iconClass}`} />;
    }
    if (eventLower.includes('arrival') || eventLower.includes('وصول')) {
      return <Home className={`h-5 w-5 ${iconClass}`} />;
    }
    return isCompleted ? <CheckCircle className={`h-5 w-5 ${iconClass}`} /> : <Circle className={`h-5 w-5 ${iconClass}`} />;
  };

  const { data } = trackingData;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Status Banner */}
        <div className={`bg-gradient-to-r ${getStatusColor(data.status)} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <Ship className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{data.container_number}</h2>
                <p className="text-white/90 text-lg">{data.status}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <RefreshCw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Info */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Shipping Line */}
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Ship className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">خط الشحن</p>
                <p className="font-semibold text-gray-900">{data.shipping_line}</p>
              </div>
            </div>

            {/* Vessel */}
            {data.vessel_name && (
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Anchor className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">السفينة</p>
                  <p className="font-semibold text-gray-900">{data.vessel_name}</p>
                  {data.voyage && (
                    <p className="text-xs text-gray-500">رحلة: {data.voyage}</p>
                  )}
                </div>
              </div>
            )}

            {/* Container Type */}
            {data.container_type && (
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">نوع الحاوية</p>
                  <p className="font-semibold text-gray-900">{data.container_type}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Route Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <MapPin className="h-6 w-6 ml-2 text-gold-600" />
          مسار الشحنة
        </h3>

        <div className="relative">
          {/* Route Line */}
          <div className="absolute right-8 top-12 bottom-12 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 rounded-full" />

          {/* Origin */}
          <div className="relative flex items-start mb-8">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg z-10">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div className="mr-6 flex-1">
              <p className="text-sm text-gray-500 mb-1">ميناء الشحن</p>
              <p className="text-xl font-bold text-gray-900">{data.port_of_loading}</p>
              {data.loading_country && (
                <p className="text-sm text-gray-600">{data.loading_country}</p>
              )}
              {data.actual_departure && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 ml-1" />
                  {new Date(data.actual_departure).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Current Position */}
          {data.location && (
            <div className="relative flex items-start mb-8">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg z-10 animate-pulse">
                <Navigation className="h-8 w-8 text-white" />
              </div>
              <div className="mr-6 flex-1">
                <p className="text-sm text-gray-500 mb-1">الموقع الحالي</p>
                <p className="text-xl font-bold text-gray-900">في الطريق</p>
                <p className="text-sm text-gray-600">
                  {data.location.latitude.toFixed(4)}°, {data.location.longitude.toFixed(4)}°
                </p>
                {data.transit_time && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 ml-1" />
                    وقت العبور: {data.transit_time}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Destination */}
          <div className="relative flex items-start">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg z-10">
              <Home className="h-8 w-8 text-white" />
            </div>
            <div className="mr-6 flex-1">
              <p className="text-sm text-gray-500 mb-1">ميناء الوصول</p>
              <p className="text-xl font-bold text-gray-900">{data.port_of_discharge}</p>
              {data.discharge_country && (
                <p className="text-sm text-gray-600">{data.discharge_country}</p>
              )}
              {data.estimated_arrival && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 ml-1" />
                  الوصول المتوقع: {new Date(data.estimated_arrival).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Milestones Timeline */}
      {data.milestones && data.milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 ml-2 text-gold-600" />
            مراحل الشحنة
          </h3>

          <div className="space-y-4">
            <AnimatePresence>
              {data.milestones.map((milestone, index) => {
                const isCompleted = milestone.status.toLowerCase().includes('completed') || 
                                   milestone.status.toLowerCase().includes('مكتمل');
                const isInProgress = milestone.status.toLowerCase().includes('progress') || 
                                    milestone.status.toLowerCase().includes('جاري');

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start space-x-4 space-x-reverse p-4 rounded-xl transition-all duration-300 ${
                      isCompleted ? 'bg-green-50 border-2 border-green-200' :
                      isInProgress ? 'bg-blue-50 border-2 border-blue-200' :
                      'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 p-3 rounded-xl ${
                      isCompleted ? 'bg-green-100' :
                      isInProgress ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {getMilestoneIcon(milestone.event, milestone.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{milestone.event}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isCompleted ? 'bg-green-200 text-green-800' :
                          isInProgress ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="h-4 w-4 ml-1" />
                        {milestone.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 ml-1" />
                        {new Date(milestone.date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Environmental Impact */}
        {data.co2_emissions && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mr-3">الأثر البيئي</h4>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">{data.co2_emissions} كجم</p>
            <p className="text-sm text-gray-600">انبعاثات ثاني أكسيد الكربون</p>
          </div>
        )}

        {/* Live Map */}
        {data.live_map_url && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg border border-blue-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mr-3">الخريطة المباشرة</h4>
            </div>
            <a
              href={data.live_map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="ml-2">عرض الخريطة</span>
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        )}
      </motion.div>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <Clock className="h-4 w-4" />
          <span>آخر تحديث: {timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTrackingCard;
