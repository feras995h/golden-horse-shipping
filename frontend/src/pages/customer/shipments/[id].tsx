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
    createdAt: string;
    updatedAt: string;
  };
  paymentRecords: Array<{
    id: string;
    amount: number;
    currency: string;
    paymentDate: string;
    method: string;
    referenceNumber: string;
    notes: string;
    recordedBy: string;
    createdAt: string;
  }>;
  realTimeTracking?: {
    success: boolean;
    data?: any;
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
  const [isRefreshingTracking, setIsRefreshingTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShipmentDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }

      setIsLoading(true);
      const response = await axios.get(`/api/customer-portal/shipments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShipmentData(response.data);
    } catch (error: any) {
      console.error('Shipment details error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        router.push('/customer/login');
      } else if (error.response?.status === 404) {
        setError('الشحنة غير موجودة أو ليس لديك صلاحية للوصول إليها');
      } else {
        setError('فشل في تحميل تفاصيل الشحنة');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, id]);

  const refreshTracking = async () => {
    if (!shipmentData?.shipment.enableTracking) return;

    try {
      const token = localStorage.getItem('customerToken');
      if (!token) return;

      setIsRefreshingTracking(true);
      const response = await axios.get(`/api/customer-portal/shipments/${id}/tracking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShipmentData(prev => prev ? {
        ...prev,
        realTimeTracking: response.data.realTimeTracking,
        trackingError: response.data.trackingError,
      } : null);
    } catch (error: any) {
      console.error('Tracking refresh error:', error);
    } finally {
      setIsRefreshingTracking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'in_transit':
        return 'text-blue-600 bg-blue-100';
      case 'at_port':
        return 'text-yellow-600 bg-yellow-100';
      case 'customs_clearance':
        return 'text-purple-600 bg-purple-100';
      case 'delayed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    if (id) {
      fetchShipmentDetails();
    }
  }, [id, fetchShipmentDetails]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
        return 'تم الشحن';
      case 'in_transit':
        return 'في الطريق';
      case 'at_port':
        return 'في الميناء';
      case 'customs_clearance':
        return 'التخليص الجمركي';
      case 'delivered':
        return 'تم التسليم';
      case 'delayed':
        return 'متأخر';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'نقداً';
      case 'bank_transfer':
        return 'تحويل بنكي';
      case 'credit_card':
        return 'بطاقة ائتمان';
      case 'check':
        return 'شيك';
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/customer/shipments"
            className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700"
          >
            العودة إلى الشحنات
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  if (!shipmentData) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">لا توجد بيانات متاحة</p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              href="/customer/shipments"
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {shipment.trackingNumber}
              </h1>
              <p className="text-gray-600">{shipment.description}</p>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              shipment.status
            )}`}
          >
            {getStatusText(shipment.status)}
          </span>
        </div>

        {/* Real-time Tracking */}
        {shipment.enableTracking && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">التتبع المباشر</h2>
              <button
                onClick={refreshTracking}
                disabled={isRefreshingTracking}
                className="flex items-center text-gold-600 hover:text-gold-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingTracking ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>

            {trackingError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <p className="text-red-800 text-sm">{trackingError}</p>
                </div>
              </div>
            ) : realTimeTracking?.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <p className="text-green-800 font-medium">بيانات التتبع المباشر متاحة</p>
                </div>
                {realTimeTracking.data && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">الحاوية:</span> {realTimeTracking.data.container_number}
                      </div>
                      <div>
                        <span className="font-medium">السفينة:</span> {realTimeTracking.data.vessel_name}
                      </div>
                      <div>
                        <span className="font-medium">الحالة:</span> {realTimeTracking.data.status}
                      </div>
                      <div>
                        <span className="font-medium">آخر تحديث:</span> {new Date().toLocaleString('ar-SA')}
                      </div>
                    </div>
                    
                    {/* Last Known Location */}
                    {realTimeTracking.data.location && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          آخر موقع معروف
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">خط العرض:</span> {realTimeTracking.data.location.latitude}
                          </div>
                          <div>
                            <span className="font-medium">خط الطول:</span> {realTimeTracking.data.location.longitude}
                          </div>
                          <div>
                            <span className="font-medium">التوقيت:</span> {new Date(realTimeTracking.data.location.timestamp).toLocaleString('ar-SA')}
                          </div>
                          <div>
                            <span className="font-medium">السرعة:</span> {realTimeTracking.data.location.speed || 'غير متاح'} عقدة
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
          <div className="space-y-4">
            {shipment.estimatedDeparture && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">المغادرة المتوقعة</p>
                  <p className="text-sm text-gray-600">
                    {new Date(shipment.estimatedDeparture).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            )}
            {shipment.actualDeparture && (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium">المغادرة الفعلية</p>
                  <p className="text-sm text-gray-600">
                    {new Date(shipment.actualDeparture).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            )}
            {shipment.estimatedArrival && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">الوصول المتوقع</p>
                  <p className="text-sm text-gray-600">
                    {new Date(shipment.estimatedArrival).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            )}
            {shipment.actualArrival && (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium">الوصول الفعلي</p>
                  <p className="text-sm text-gray-600">
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
                    <p className="text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString('ar-SA')}
                    </p>
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

        {/* Notes and Instructions */}
        {(shipment.notes || shipment.specialInstructions) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ملاحظات وتعليمات</h2>
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
