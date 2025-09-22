import { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import ShipsGoTrackingCard from '@/components/Tracking/ShipsGoTrackingCard';
import TrackingNotifications from '@/components/Notifications/TrackingNotifications';
import { Search, Package, MapPin, Clock, DollarSign, Ship, AlertCircle, User } from 'lucide-react';
import { useQuery } from 'react-query';
import axios from 'axios';

interface TrackingResult {
  type: 'shipment' | 'client';
  data: any;
}

const TrackingPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState((router.query.q as string) || '');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setTrackingResult(null);

    try {
      // First, try to search as a tracking number
      if (searchQuery.match(/^GH[A-Z0-9]+$/)) {
        // Use the new real-time tracking API
        const response = await axios.get(`/api/shipments/track/${searchQuery}`);
        setTrackingResult({
          type: 'shipment',
          data: response.data,
        });
      }
      // Then try as a client ID
      else if (searchQuery.match(/^GH-\d{6}$/)) {
        const response = await axios.get(`/api/clients/${searchQuery}/shipments-with-tracking`);
        setTrackingResult({
          type: 'client',
          data: response.data,
        });
      }
      // Try container number, BL, or booking number
      else if (searchQuery.match(/^[A-Z]{4}[0-9]{7}$/) || // Container number pattern
               searchQuery.match(/^[A-Z0-9-]+$/) ||        // BL or booking pattern
               searchQuery.length >= 6) {
        try {
          // Try ShipsGo tracking first
          const shipsGoResponse = await axios.get('/api/shipsgo-tracking/track', {
            params: {
              container: searchQuery.match(/^[A-Z]{4}[0-9]{7}$/) ? searchQuery : undefined,
              bl: !searchQuery.match(/^[A-Z]{4}[0-9]{7}$/) ? searchQuery : undefined
            }
          });
          setTrackingResult({
            type: 'shipment',
            data: shipsGoResponse.data,
          });
        } catch (e) {
          throw e;
        }
      }
      // Generic search
      else {
        // Try both shipment and client searches
        try {
          const shipmentResponse = await axios.get(`/api/shipments/track/${searchQuery}`);
          setTrackingResult({
            type: 'shipment',
            data: shipmentResponse.data,
          });
        } catch {
          const clientResponse = await axios.get(`/api/clients/${searchQuery}/shipments-with-tracking`);
          setTrackingResult({
            type: 'client',
            data: clientResponse.data,
          });
        }
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 401 || status === 403) {
          setError(t('messages.unauthorized'));
        } else if (status === 429) {
          setError('تم إرسال عدد كبير من الطلبات. حاول لاحقًا.');
        } else if (status === 404) {
          setError(t('tracking.notFound'));
        } else {
          setError(t('messages.networkError'));
        }
      } else {
        setError(t('messages.networkError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-purple-100 text-purple-800',
      at_port: 'bg-cyan-100 text-cyan-800',
      customs_clearance: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: t('tracking.status.pending'),
      processing: t('tracking.status.processing'),
      shipped: t('tracking.status.shipped'),
      in_transit: t('tracking.status.in_transit'),
      at_port: t('tracking.status.at_port'),
      customs_clearance: t('tracking.status.customs_clearance'),
      delivered: t('tracking.status.delivered'),
      delayed: t('tracking.status.delayed'),
      cancelled: t('tracking.status.cancelled'),
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      unpaid: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderShipmentDetails = (shipment: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Package className="h-6 w-6 mr-3 text-gold-600" />
          {shipment.trackingNumber}
        </h2>
        <div className="flex space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
            {getStatusText(shipment.status)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(shipment.paymentStatus)}`}>
            {t(`tracking.payment.${shipment.paymentStatus}`)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">من</p>
            <p className="font-medium">{shipment.originPort}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">إلى</p>
            <p className="font-medium">{shipment.destinationPort}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Ship className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">نوع الشحن</p>
            <p className="font-medium">{shipment.type}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">تفاصيل الشحنة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">الوصف</p>
            <p className="font-medium">{shipment.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">الوزن</p>
            <p className="font-medium">{shipment.weight} كيلو</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">القيمة</p>
            <p className="font-medium">{shipment.totalCost} {shipment.currency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
            <p className="font-medium">{new Date(shipment.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
      </div>

      {shipment.vesselName && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">معلومات السفينة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">اسم السفينة</p>
              <p className="font-medium">{shipment.vesselName}</p>
            </div>
            {shipment.vesselMMSI && (
              <div>
                <p className="text-sm text-gray-500">MMSI</p>
                <p className="font-medium">{shipment.vesselMMSI}</p>
              </div>
            )}
            {shipment.containerNumber && (
              <div>
                <p className="text-sm text-gray-500">رقم الحاوية</p>
                <p className="font-medium">{shipment.containerNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {shipment.paymentRecords && shipment.paymentRecords.length > 0 && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">سجل المدفوعات</h3>
          <div className="space-y-3">
            {shipment.paymentRecords.map((payment: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{payment.amount} {payment.currency}</p>
                  <p className="text-sm text-gray-500">{payment.method} - {new Date(payment.paymentDate).toLocaleDateString('ar-EG')}</p>
                </div>
                {payment.referenceNumber && (
                  <p className="text-sm text-gray-500">#{payment.referenceNumber}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderClientShipments = (shipments: any[]) => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          شحنات العميل ({shipments.length})
        </h2>
        <p className="text-gray-600">رقم العميل: {searchQuery}</p>
      </div>

      {shipments.map((shipment) => (
        <div key={shipment.id} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-gold-600" />
              {shipment.trackingNumber}
            </h3>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                {getStatusText(shipment.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(shipment.paymentStatus)}`}>
                {t(`tracking.payment.${shipment.paymentStatus}`)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">الوصف</p>
              <p className="font-medium">{shipment.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">من - إلى</p>
              <p className="font-medium">{shipment.originPort} → {shipment.destinationPort}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">التكلفة</p>
              <p className="font-medium">{shipment.totalCost} {shipment.currency}</p>
            </div>
          </div>

          {/* Enhanced tracking information */}
          {shipment.trackingData && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-lg font-semibold mb-3">معلومات التتبع</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">رقم الحاوية</p>
                  <p className="font-medium">{shipment.trackingData.data?.container_number || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">اسم السفينة</p>
                  <p className="font-medium">{shipment.trackingData.data?.vessel_name || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">خط الشحن</p>
                  <p className="font-medium">{shipment.trackingData.data?.shipping_line || 'Golden Horse Shipping'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <p className="font-medium">{shipment.trackingData.data?.status || shipment.status}</p>
                </div>
              </div>
              
              {/* Milestones */}
              {shipment.trackingData.data?.milestones && shipment.trackingData.data.milestones.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-md font-semibold mb-2">مراحل الشحنة</h5>
                  <div className="space-y-2">
                    {shipment.trackingData.data.milestones.map((milestone: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === 'Completed' ? 'bg-green-500' : 
                          milestone.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium">{milestone.event}</p>
                          <p className="text-sm text-gray-500">{milestone.location} - {new Date(milestone.date).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => {
                // If shipment has tracking data, show it as ShipsGo data
                if (shipment.trackingData) {
                  setTrackingResult({ type: 'shipment', data: shipment.trackingData });
                } else {
                  setTrackingResult({ type: 'shipment', data: shipment });
                }
              }}
              className="text-gold-600 hover:text-gold-700 font-medium"
            >
              عرض التفاصيل الكاملة →
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>{t('tracking.title')} - {t('site.title')}</title>
        <meta name="description" content="تتبع شحنتك مع الحصان الذهبي للشحن" />
      </Head>

      <div className="min-h-screen bg-gray-50 section-tight">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 text-center flex-1">
                {t('tracking.title')}
              </h1>
              {trackingResult && (
                <TrackingNotifications
                  trackingNumber={
                    trackingResult.type === 'shipment' && trackingResult.data.trackingNumber
                      ? trackingResult.data.trackingNumber
                      : trackingResult.data.data?.container_number
                  }
                  currentStatus={
                    trackingResult.data.data?.status || trackingResult.data.status
                  }
                  milestones={trackingResult.data.data?.milestones || []}
                />
              )}
            </div>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('tracking.enterNumber')}
                    className="input-field"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    أدخل رقم التتبع (مثل: GH123ABC) أو رقم العميل (مثل: GH-123456)
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  <span>{t('tracking.search')}</span>
                </button>
              </div>
            </form>

            {/* Customer Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 mb-3">هل أنت عميل مسجل؟</p>
              <button
                onClick={() => router.push('/customer/login')}
                className="inline-flex items-center space-x-2 rtl:space-x-reverse text-gold-600 hover:text-gold-700 font-medium"
              >
                <User className="h-5 w-5" />
                <span>تسجيل دخول العملاء</span>
              </button>
            </div>
          </div>

          {/* Results Section */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {trackingResult && (
            <div className="animate-fade-in">
              {trackingResult.type === 'shipment' ? (
                // Check if this is ShipsGo data (has success field and milestones)
                trackingResult.data.success !== undefined && trackingResult.data.data?.milestones ? (
                  <ShipsGoTrackingCard trackingData={trackingResult.data} />
                ) : (
                  renderShipmentDetails(trackingResult.data)
                )
              ) : (
                renderClientShipments(trackingResult.data)
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              كيفية استخدام نظام التتبع
            </h3>
            <div className="space-y-2 text-blue-800">
              <p>• لتتبع شحنة واحدة: أدخل رقم التتبع (يبدأ بـ GH)</p>
              <p>• لعرض جميع شحنات العميل: أدخل رقم العميل (مثل: GH-123456)</p>
              <p>• يمكنك الحصول على رقم العميل من فريق خدمة العملاء</p>
            </div>
          </div>

          {/* Customer Portal Link */}
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gold-900 mb-2">
                  بوابة العملاء
                </h3>
                <p className="text-gold-800">
                  احصل على تجربة متقدمة مع حساب العميل الخاص بك
                </p>
                <ul className="text-sm text-gold-700 mt-2 space-y-1">
                  <li>• متابعة مفصلة لجميع شحناتك</li>
                  <li>• تتبع مباشر مع ShipsGo API</li>
                  <li>• معلومات مالية ومدفوعات</li>
                  <li>• إشعارات فورية</li>
                </ul>
              </div>
              <div className="flex flex-col space-y-2">
                <Link
                  href="/customer/login"
                  className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <User className="h-5 w-5" />
                  <span>تسجيل الدخول</span>
                </Link>
                <p className="text-xs text-gold-600 text-center">
                  للعملاء المسجلين
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default TrackingPage;
