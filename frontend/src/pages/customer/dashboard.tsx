import { useState, useEffect, useCallback } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { 
  Package, 
  Ship, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar,
  TrendingUp,
  Eye,
  DollarSign,
  CreditCard,
  Wallet,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import axios from 'axios';

interface DashboardData {
  customer: {
    id: string;
    trackingNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  statistics: {
    totalShipments: number;
    activeShipments: number;
    deliveredShipments: number;
    totalValue: number;
    totalPaid: number;
    totalPending: number;
    paymentMethods: Record<string, number>;
    totalPayments: number;
  };
  recentShipments: Array<{
    id: string;
    trackingNumber: string;
    description: string;
    status: string;
    originPort: string;
    destinationPort: string;
    estimatedArrival: string;
    createdAt: string;
  }>;
}

const CustomerDashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }

      const response = await axios.get('/api/customer-portal/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Dashboard error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        router.push('/customer/login');
      } else {
        setError('فشل في تحميل بيانات لوحة التحكم');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </CustomerLayout>
    );
  }

  if (!dashboardData) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">لا توجد بيانات متاحة</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Head>
        <title>لوحة التحكم - {dashboardData.customer.customerName}</title>
        <meta name="description" content="لوحة تحكم العميل لمتابعة الشحنات" />
      </Head>

      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            مرحباً، {dashboardData.customer.customerName}
          </h1>
          <p className="text-gold-100">
            رقم التتبع الخاص بك: {dashboardData.customer.trackingNumber}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الشحنات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.statistics.totalShipments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Ship className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الشحنات النشطة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.statistics.activeShipments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الشحنات المسلمة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.statistics.deliveredShipments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.statistics.totalPayments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي القيمة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData.statistics.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-sm text-gray-500">
              قيمة جميع الشحنات
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">المدفوع</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData.statistics.totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-sm text-gray-500">
              المبلغ المدفوع فعلياً
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">المتبقي</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData.statistics.totalPending.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-sm text-gray-500">
              المبلغ المتبقي للدفع
            </div>
          </div>
        </div>

        {/* Payment Methods Overview */}
        {Object.keys(dashboardData.statistics.paymentMethods).length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">طرق الدفع المستخدمة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboardData.statistics.paymentMethods).map(([method, count]) => (
                <div key={method} className="text-center">
                  <div className="p-3 bg-gray-100 rounded-lg mb-2">
                    <CreditCard className="h-6 w-6 text-gray-600 mx-auto" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">
                    {method === 'cash' ? 'نقداً' :
                     method === 'bank_transfer' ? 'تحويل بنكي' :
                     method === 'credit_card' ? 'بطاقة ائتمان' :
                     method === 'check' ? 'شيك' : method}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Shipments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">الشحنات الأخيرة</h2>
              <Link
                href="/customer/shipments"
                className="text-gold-600 hover:text-gold-700 text-sm font-medium"
              >
                عرض الكل
              </Link>
            </div>
          </div>

          <div className="p-6">
            {dashboardData.recentShipments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد شحنات حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <h3 className="font-medium text-gray-900">
                          {shipment.trackingNumber}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            shipment.status
                          )}`}
                        >
                          {getStatusText(shipment.status)}
                        </span>
                      </div>
                      <Link
                        href={`/customer/shipments/${shipment.id}`}
                        className="text-gold-600 hover:text-gold-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{shipment.description}</p>

                    <div className="flex items-center text-sm text-gray-500 space-x-4 space-x-reverse">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {shipment.originPort} → {shipment.destinationPort}
                      </div>
                      {shipment.estimatedArrival && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(shipment.estimatedArrival).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

export default CustomerDashboard;
