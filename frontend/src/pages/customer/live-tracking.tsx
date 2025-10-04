import { useState, useEffect, useCallback } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import EnhancedTrackingCard from '@/components/Tracking/EnhancedTrackingCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Package, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

interface Shipment {
  id: string;
  trackingNumber: string;
  description: string;
  status: string;
  containerNumber?: string;
  blNumber?: string;
  bookingNumber?: string;
  enableTracking: boolean;
}

const LiveTrackingPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const fetchShipments = useCallback(async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }

      const response = await axios.get('/api/customer-portal/shipments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const activeShipments = response.data.filter((s: Shipment) => 
        s.enableTracking && 
        (s.containerNumber || s.blNumber || s.bookingNumber) &&
        s.status !== 'delivered' && 
        s.status !== 'cancelled'
      );

      setShipments(activeShipments);

      // Auto-select first shipment if none selected
      if (activeShipments.length > 0 && !selectedShipment) {
        setSelectedShipment(activeShipments[0]);
      }
    } catch (error: any) {
      console.error('Error fetching shipments:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        router.push('/customer/login');
      } else {
        setError('فشل في تحميل الشحنات');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, selectedShipment]);

  const fetchTrackingData = useCallback(async (shipment: Shipment) => {
    if (!shipment) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const token = localStorage.getItem('customerToken');
      const response = await axios.get(`/api/shipments/${shipment.id}/tracking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTrackingData(response.data);
    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      setError('فشل في تحميل بيانات التتبع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    if (selectedShipment) {
      fetchTrackingData(selectedShipment);
    }
  }, [selectedShipment, fetchTrackingData]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && selectedShipment) {
      const interval = setInterval(() => {
        fetchTrackingData(selectedShipment);
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedShipment, fetchTrackingData]);

  const handleRefresh = () => {
    if (selectedShipment) {
      fetchTrackingData(selectedShipment);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'at_port':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'customs_clearance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'في الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      in_transit: 'في الطريق',
      at_port: 'في الميناء',
      customs_clearance: 'التخليص الجمركي',
      delivered: 'تم التسليم',
      delayed: 'متأخر',
      cancelled: 'ملغي',
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <LoadingSpinner text="جاري تحميل بيانات التتبع..." />
      </CustomerLayout>
    );
  }

  if (shipments.length === 0) {
    return (
      <CustomerLayout>
        <Head>
          <title>التتبع المباشر - بوابة العملاء</title>
        </Head>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              لا توجد شحنات نشطة للتتبع
            </h2>
            <p className="text-gray-600 mb-6">
              لا توجد شحنات حالياً يمكن تتبعها في الوقت الفعلي
            </p>
            <button
              onClick={() => router.push('/customer/dashboard')}
              className="px-6 py-3 bg-gold-600 text-white rounded-xl hover:bg-gold-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              العودة إلى لوحة التحكم
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Head>
        <title>التتبع المباشر - بوابة العملاء</title>
        <meta name="description" content="تتبع شحناتك في الوقت الفعلي" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">التتبع المباشر للشحنات</h1>
              <p className="text-gold-100 text-lg">
                تتبع شحناتك لحظة بلحظة مع تحديثات تلقائية
              </p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-center">
                <div className="text-3xl font-bold">{shipments.length}</div>
                <div className="text-gold-100 text-sm">شحنة نشطة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            {/* Shipment Selector */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر الشحنة
              </label>
              <select
                value={selectedShipment?.id || ''}
                onChange={(e) => {
                  const shipment = shipments.find(s => s.id === e.target.value);
                  setSelectedShipment(shipment || null);
                }}
                className="w-full md:w-96 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
              >
                {shipments.map((shipment) => (
                  <option key={shipment.id} value={shipment.id}>
                    {shipment.trackingNumber} - {shipment.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-5 h-5 text-gold-600 border-gray-300 rounded focus:ring-gold-500"
                />
                <label htmlFor="autoRefresh" className="mr-2 text-sm font-medium text-gray-700">
                  تحديث تلقائي
                </label>
              </div>

              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-sm"
                >
                  <option value={15}>كل 15 ثانية</option>
                  <option value={30}>كل 30 ثانية</option>
                  <option value={60}>كل دقيقة</option>
                  <option value={300}>كل 5 دقائق</option>
                </select>
              )}

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-6 py-3 bg-gold-600 text-white rounded-xl hover:bg-gold-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        {selectedShipment && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(selectedShipment.status)}`}>
                  {getStatusText(selectedShipment.status)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">رقم التتبع</h3>
              <p className="text-2xl font-bold text-gray-900">{selectedShipment.trackingNumber}</p>
            </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-0 mr-3">الحاوية</h3>
            </div>
            {trackingData?.timestamp && (
              <span className="text-xs text-gray-500">آخر تحديث: {new Date(trackingData.timestamp).toLocaleTimeString('ar-EG')}</span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {selectedShipment.containerNumber || 'غير متوفر'}
          </p>
        </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">التحديث التلقائي</h3>
              <p className="text-2xl font-bold text-gray-900">
                {autoRefresh ? `${refreshInterval}ث` : 'متوقف'}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 ml-3" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Tracking Data */}
        {trackingData && trackingData.success && (
          <EnhancedTrackingCard
            trackingData={trackingData}
            autoRefresh={autoRefresh}
            refreshInterval={refreshInterval * 1000}
            onRefresh={handleRefresh}
          />
        )}

        {/* Loading State */}
        {isRefreshing && !trackingData && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12">
            <LoadingSpinner text="جاري تحميل بيانات التتبع..." />
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default LiveTrackingPage;
