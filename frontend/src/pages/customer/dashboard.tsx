import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import StatCard from '@/components/ui/Cards/StatCard';
import DashboardChart from '@/components/ui/Charts/DashboardChart';
import FadeIn, { Stagger, ScaleIn } from '@/components/ui/Animations/FadeIn';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        router.push('/customer/login');
      } else {
        setError(t('customer.dashboard.error'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, t]);

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
        return t('customer.dashboard.status.pending');
      case 'processing':
        return t('customer.dashboard.status.processing');
      case 'shipped':
        return t('customer.dashboard.status.shipped');
      case 'in_transit':
        return t('customer.dashboard.status.in_transit');
      case 'at_port':
        return t('customer.dashboard.status.at_port');
      case 'customs_clearance':
        return t('customer.dashboard.status.customs_clearance');
      case 'delivered':
        return t('customer.dashboard.status.delivered');
      case 'delayed':
        return t('customer.dashboard.status.delayed');
      case 'cancelled':
        return t('customer.dashboard.status.cancelled');
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCardsData = useMemo(() => [
    {
      title: t('customer.dashboard.stats.totalShipments'),
      value: dashboardData?.statistics.totalShipments || 0,
      icon: Package,
      color: 'blue' as const,
      change: {
        value: 8,
        type: 'increase' as const
      }
    },
    {
      title: t('customer.dashboard.stats.activeShipments'),
      value: dashboardData?.statistics.activeShipments || 0,
      icon: Ship,
      color: 'gold' as const,
      change: {
        value: 5,
        type: 'increase' as const
      }
    },
    {
      title: t('customer.dashboard.stats.deliveredShipments'),
      value: dashboardData?.statistics.deliveredShipments || 0,
      icon: CheckCircle,
      color: 'green' as const,
      change: {
        value: 12,
        type: 'increase' as const
      }
    },
    {
      title: t('customer.dashboard.stats.totalPayments'),
      value: dashboardData?.statistics.totalPayments || 0,
      icon: CreditCard,
      color: 'purple' as const,
      change: {
        value: 3,
        type: 'decrease' as const
      }
    }
  ], [dashboardData, t]);

  const chartData = useMemo(() => [
    { name: 'يناير', value: 2400 },
    { name: 'فبراير', value: 1398 },
    { name: 'مارس', value: 9800 },
    { name: 'أبريل', value: 3908 },
    { name: 'مايو', value: 4800 },
    { name: 'يونيو', value: 3800 },
  ], []);

  const paymentMethodsData = useMemo(() => {
    if (!dashboardData?.statistics.paymentMethods) return [];
    return Object.entries(dashboardData.statistics.paymentMethods).map(([method, count]) => ({
      name: method,
      value: count as number
    }));
  }, [dashboardData]);

  if (isLoading) {
    return (
      <CustomerLayout>
        <LoadingSpinner text={t('customer.dashboard.loading')} />
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
            {t('customer.dashboard.retry')}
          </button>
        </div>
      </CustomerLayout>
    );
  }

  if (!dashboardData) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">{t('customer.dashboard.noData')}</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Head>
        <title>{t('customer.dashboard.title', { customerName: dashboardData.customer.customerName })}</title>
        <meta name="description" content="لوحة تحكم العميل لمتابعة الشحنات" />
      </Head>

      <div className="space-y-8">
        {/* Welcome Section */}
        <FadeIn direction="up" delay={100}>
          <div className="bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 rounded-2xl p-8 text-white shadow-2xl shadow-gold-200/50 border border-gold-300/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-3 drop-shadow-lg">
                مرحباً، {dashboardData.customer.customerName}
              </h1>
              <p className="text-gold-100 text-lg font-medium">
                {t('customer.dashboard.trackingNumber')}: {dashboardData.customer.trackingNumber}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Statistics Cards */}
        <FadeIn direction="up" delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stagger>
              {statCardsData.map((card, index) => (
                <ScaleIn key={card.title} delay={index * 100}>
                  <StatCard
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    color={card.color}
                    change={card.change}
                  />
                </ScaleIn>
              ))}
            </Stagger>
          </div>
        </FadeIn>

        {/* Charts Section */}
        <FadeIn direction="up" delay={400}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardChart
              title="الشحنات الشهرية"
              data={chartData}
              type="area"
              height={300}
              color="#3B82F6"
            />
            {paymentMethodsData.length > 0 && (
              <DashboardChart
                title={t('customer.dashboard.paymentMethods')}
                data={paymentMethodsData}
                type="pie"
                height={300}
              />
            )}
          </div>
        </FadeIn>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-green-100/50 border border-green-200/30 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-lg shadow-green-200/50 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-7 w-7 text-green-600 drop-shadow-sm" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-semibold text-green-600/80 mb-1">{t('customer.dashboard.financial.totalValue')}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                    ${dashboardData.statistics.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-sm text-green-600/70 font-medium relative z-10">
              قيمة جميع الشحنات
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-blue-100/50 border border-blue-200/30 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="h-7 w-7 text-blue-600 drop-shadow-sm" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-semibold text-blue-600/80 mb-1">{t('customer.dashboard.financial.paid')}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                    ${dashboardData.statistics.totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
              <CheckCircle className="h-6 w-6 text-blue-500 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-sm text-blue-600/70 font-medium relative z-10">
              {t('customer.dashboard.financial.actuallyPaid')}
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-red-100/50 border border-red-200/30 hover:shadow-2xl hover:shadow-red-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-lg shadow-red-200/50 group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-7 w-7 text-red-600 drop-shadow-sm" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-semibold text-red-600/80 mb-1">{t('customer.dashboard.financial.remaining')}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                    ${dashboardData.statistics.totalPending.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendingDown className="h-6 w-6 text-red-500 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-sm text-red-600/70 font-medium relative z-10">
              {t('customer.dashboard.financial.remainingToPay')}
            </div>
          </div>
        </div>

        {/* Payment Methods Overview */}
        {Object.keys(dashboardData.statistics.paymentMethods).length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-purple-100/50 border border-purple-200/30 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent mb-6 relative z-10">{t('customer.dashboard.paymentMethodsUsed')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {Object.entries(dashboardData.statistics.paymentMethods).map(([method, count]) => (
                <div key={method} className="text-center group/item hover:scale-105 transition-transform duration-300">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mb-3 shadow-lg shadow-purple-200/50 group-hover/item:scale-110 transition-transform duration-300">
                    <CreditCard className="h-7 w-7 text-purple-600 mx-auto drop-shadow-sm" />
                  </div>
                  <p className="text-lg font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">{count}</p>
                  <p className="text-sm text-purple-600/70 font-medium">
                    {method === 'cash' ? t('customer.dashboard.paymentMethod.cash') :
                     method === 'bank_transfer' ? t('customer.dashboard.paymentMethod.bankTransfer') :
                     method === 'credit_card' ? t('customer.dashboard.paymentMethod.creditCard') :
                     method === 'check' ? t('customer.dashboard.paymentMethod.check') : method}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Shipments */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-200/30 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-6 border-b border-indigo-200/30 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-7 w-7 text-indigo-600 drop-shadow-sm" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-600 bg-clip-text text-transparent mr-4">{t('customer.dashboard.recentShipments')}</h2>
              </div>
              <Link
                href="/customer/shipments"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-105 font-medium"
              >
                {t('customer.dashboard.viewAll')}
              </Link>
            </div>
          </div>

          <div className="p-6 relative z-10">
            {dashboardData.recentShipments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                <p className="text-indigo-600/70">{t('customer.dashboard.noShipments')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="border border-indigo-200/30 rounded-xl p-4 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 bg-gradient-to-r from-indigo-50/30 to-transparent group/item"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <h3 className="font-semibold text-indigo-700">
                          {shipment.trackingNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${getStatusColor(
                            shipment.status
                          )}`}
                        >
                          {getStatusText(shipment.status)}
                        </span>
                      </div>
                      <Link
                        href={`/customer/shipments/${shipment.id}`}
                        className="text-indigo-600 hover:text-indigo-700 group-hover/item:scale-110 transition-transform duration-300"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </div>

                    <p className="text-sm text-indigo-600/70 mb-2">{shipment.description}</p>

                    <div className="flex items-center text-sm text-indigo-600/60 space-x-4 space-x-reverse">
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
