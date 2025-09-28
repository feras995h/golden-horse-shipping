import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { 
  ArrowLeft,
  Package, 
  MapPin, 
  Calendar, 
  Ship,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';

interface ShipmentDetails {
  shipment: {
    id: string;
    trackingNumber: string;
    description: string;
    status: string;
    originPort: string;
    destinationPort: string;
    weight: number;
    volume: number;
    value: number;
    currency: string;
    estimatedDeparture: string;
    actualDeparture: string;
    estimatedArrival: string;
    actualArrival: string;
    vesselName: string;
    vesselMmsi: string;
    vesselImo: string;
    containerNumber: string;
    blNumber: string;
    bookingNumber: string;
    shippingLine: string;
    voyage: string;
    enableTracking: boolean;
    notes: string;
    specialInstructions: string;
  };
  paymentRecords: Array<{
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    paymentDate: string;
    referenceNumber: string;
    notes: string;
  }>;
  realTimeTracking?: {
    success: boolean;
    data: any;
    error?: string;
  };
  trackingError?: string;
}

const ShipmentDetails = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const [shipmentData, setShipmentData] = useState<ShipmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshingTracking, setIsRefreshingTracking] = useState(false);

  const fetchShipmentDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }

      const response = await axios.get(`/api/customer-portal/shipments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShipmentData(response.data);
    } catch (error: any) {
      console.error('Error fetching shipment details:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        router.push('/customer/login');
      } else if (error.response?.status === 404) {
        setError('الشحنة غير موجودة');
      } else {
        setError('حدث خطأ في تحميل تفاصيل الشحنة');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, id]);

  const refreshTracking = async () => {
    const token = localStorage.getItem('customerToken');
    setIsRefreshingTracking(true);
    try {
      if (!token) {
        router.push('/customer/login');
        return;
      }

      const response = await axios.get(`/api/customer-portal/shipments/${id}/tracking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShipmentData(prev => prev ? {
        ...prev,
        realTimeTracking: response.data,
        trackingError: undefined
      } : null);
    } catch (error: any) {
      console.error('Error refreshing tracking:', error);
    } finally {
      setIsRefreshingTracking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300';
      case 'in_transit': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      case 'delivered': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
      case 'delayed': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
      case 'cancelled': return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    }
  };

  useEffect(() => {
    if (id) {
      fetchShipmentDetails();
    }
  }, [id, fetchShipmentDetails]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكدة';
      case 'picked_up': return 'تم الاستلام';
      case 'in_transit': return 'في الطريق';
      case 'customs_clearance': return 'التخليص الجمركي';
      case 'out_for_delivery': return 'خارج للتسليم';
      case 'delivered': return 'تم التسليم';
      case 'delayed': return 'متأخرة';
      case 'cancelled': return 'ملغية';
      case 'returned': return 'مرتجعة';
      case 'lost': return 'مفقودة';
      case 'damaged': return 'تالفة';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'نقداً';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'credit_card': return 'بطاقة ائتمان';
      case 'check': return 'شيك';
      case 'cod': return 'الدفع عند الاستلام';
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gradient-to-r from-indigo-200 to-purple-200 rounded-full animate-spin border-t-transparent shadow-lg"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-pulse opacity-75"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center shadow-xl">
          <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <p className="text-red-600 mb-6 text-lg font-medium">{error}</p>
          <button
            onClick={fetchShipmentDetails}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105"
          >
            إعادة المحاولة
          </button>
        </div>
      </CustomerLayout>
    );
  }

  if (!shipmentData) {
    return (
      <CustomerLayout>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8 text-center shadow-xl">
          <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Package className="h-10 w-10 text-gray-600" />
          </div>
          <p className="text-gray-600 text-lg font-medium">لا توجد بيانات للشحنة</p>
        </div>
      </CustomerLayout>
    );
  }

  const { shipment, paymentRecords, realTimeTracking, trackingError } = shipmentData;

  return (
    <CustomerLayout>
      <Head>
        <title>تفاصيل الشحنة {shipment.trackingNumber} - Golden Horse Shipping</title>
        <meta name="description" content={`تفاصيل الشحنة ${shipment.trackingNumber}`} />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-200/30 p-6 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/customer/shipments"
                className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl shadow-md hover:shadow-lg hover:from-indigo-200 hover:to-indigo-300 transition-all duration-300 hover:scale-110 group/back"
              >
                <ArrowLeft className="h-6 w-6 text-indigo-600 group-hover/back:text-indigo-700 transition-colors duration-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {shipment.trackingNumber}
                </h1>
                <p className="text-indigo-600/70 font-medium mt-1">{shipment.description}</p>
              </div>
            </div>
            <div
              className={`px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105 ${getStatusColor(
                shipment.status
              )}`}
            >
              {getStatusText(shipment.status)}
            </div>
          </div>
        </div>

        {/* Real-time Tracking */}
        {shipment.enableTracking && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-200/30 p-6 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg mr-3 shadow-sm">
                  <ExternalLink className="h-5 w-5 text-indigo-600" />
                </div>
                التتبع المباشر
              </h2>
              <button
                onClick={refreshTracking}
                disabled={isRefreshingTracking}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${isRefreshingTracking ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>

            {trackingError ? (
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200/50 rounded-xl p-6 shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg mr-3 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-red-800 font-medium">{trackingError}</p>
                </div>
              </div>
            ) : realTimeTracking ? (
              <div className="space-y-6 relative z-10">
                {realTimeTracking.data && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200/50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-green-700">رقم الحاوية</p>
                          <span className="text-green-800 mr-2 font-semibold">{realTimeTracking.data.container_number}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center">
                        <Ship className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">اسم السفينة</p>
                          <span className="text-blue-800 mr-2 font-semibold">{realTimeTracking.data.vessel_name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200/50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-purple-700">الحالة</p>
                          <span className="text-purple-800 mr-2 font-semibold">{realTimeTracking.data.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200/50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-orange-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-orange-700">آخر تحديث</p>
                          <span className="text-orange-800 mr-2 font-semibold">{new Date().toLocaleString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                      
                {/* Last Known Location */}
                {realTimeTracking.data.location && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50 rounded-xl p-6 shadow-md">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center text-lg">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mr-3 shadow-sm">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      آخر موقع معروف
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center p-3 bg-white/50 rounded-lg border border-blue-200/30">
                        <span className="font-medium text-blue-700">خط العرض:</span>
                        <span className="text-blue-800 mr-2 font-semibold">{realTimeTracking.data.location.latitude}</span>
                      </div>
                      <div className="flex items-center p-3 bg-white/50 rounded-lg border border-blue-200/30">
                        <span className="font-medium text-blue-700">خط الطول:</span>
                        <span className="text-blue-800 mr-2 font-semibold">{realTimeTracking.data.location.longitude}</span>
                      </div>
                      <div className="flex items-center p-3 bg-white/50 rounded-lg border border-blue-200/30">
                        <Clock className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-700">التوقيت:</span>
                        <span className="text-blue-800 mr-2 font-semibold">{new Date(realTimeTracking.data.location.timestamp).toLocaleString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center p-3 bg-white/50 rounded-lg border border-blue-200/30">
                        <span className="font-medium text-blue-700">السرعة:</span>
                        <span className="text-blue-800 mr-2 font-semibold">{realTimeTracking.data.location.speed || 'غير متاح'} عقدة</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {realTimeTracking.data.milestones && realTimeTracking.data.milestones.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">مراحل التتبع</h4>
                    <div className="space-y-2">
                      {realTimeTracking.data.milestones.map((milestone: any, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-gold-500 rounded-full mr-3"></div>
                          <div className="flex-1">
                            <span className="font-medium">{milestone.event}</span>
                            {milestone.location && (
                              <span className="text-gray-600 mr-2"> - {milestone.location}</span>
                            )}
                          </div>
                          <div className="text-gray-500">
                            {milestone.timestamp ? new Date(milestone.timestamp).toLocaleDateString('ar-SA') : 'غير محدد'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                  <p className="text-yellow-800 text-sm">جاري تحميل بيانات التتبع المباشر...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shipment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الشحنة</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم التتبع:</span>
                <span className="font-medium">{shipment.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الوزن:</span>
                <span className="font-medium">{shipment.weight} كجم</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الحجم:</span>
                <span className="font-medium">{shipment.volume} م³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">القيمة:</span>
                <span className="font-medium">{shipment.value} {shipment.currency}</span>
              </div>
              {shipment.containerNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الحاوية:</span>
                  <span className="font-medium">{shipment.containerNumber}</span>
                </div>
              )}
              {shipment.blNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم بوليصة الشحن:</span>
                  <span className="font-medium">{shipment.blNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الشحن</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ميناء المغادرة:</span>
                <span className="font-medium">{shipment.originPort}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ميناء الوصول:</span>
                <span className="font-medium">{shipment.destinationPort}</span>
              </div>
              {shipment.vesselName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">اسم السفينة:</span>
                  <span className="font-medium">{shipment.vesselName}</span>
                </div>
              )}
              {shipment.shippingLine && (
                <div className="flex justify-between">
                  <span className="text-gray-600">خط الشحن:</span>
                  <span className="font-medium">{shipment.shippingLine}</span>
                </div>
              )}
              {shipment.voyage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الرحلة:</span>
                  <span className="font-medium">{shipment.voyage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الجدول الزمني</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shipment.estimatedDeparture && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">المغادرة المتوقعة</p>
                  <p className="text-blue-700">
                    {new Date(shipment.estimatedDeparture).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            )}
            {shipment.actualDeparture && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">المغادرة الفعلية</p>
                  <p className="text-green-700">
                    {new Date(shipment.actualDeparture).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            )}
            {shipment.estimatedArrival && (
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">الوصول المتوقع</p>
                  <p className="text-yellow-700">
                    {new Date(shipment.estimatedArrival).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            )}
            {shipment.actualArrival && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">الوصول الفعلي</p>
                  <p className="text-green-700">
                    {new Date(shipment.actualArrival).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Records */}
        {paymentRecords.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">سجل المدفوعات</h2>
            <div className="space-y-4">
              {paymentRecords.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{payment.amount} {payment.currency}</p>
                      <p className="text-sm text-gray-600">
                        {getPaymentMethodText(payment.method)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(payment.paymentDate).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  {payment.referenceNumber && (
                    <p className="text-sm text-gray-600">
                      رقم المرجع: {payment.referenceNumber}
                    </p>
                  )}
                  {payment.notes && (
                    <p className="text-sm text-gray-600 mt-2">{payment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {(shipment.notes || shipment.specialInstructions) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h2>
            {shipment.notes && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">ملاحظات:</h3>
                <p className="text-gray-600">{shipment.notes}</p>
              </div>
            )}
            {shipment.specialInstructions && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">تعليمات خاصة:</h3>
                <p className="text-gray-600">{shipment.specialInstructions}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default ShipmentDetails;
