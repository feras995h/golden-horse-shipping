import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { reportsAPI, shipmentsAPI, clientsAPI, adsAPI } from '@/lib/api';
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Ship,
  Megaphone,
  Eye,
  MousePointer
} from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalShipments: number;
  shipmentsInTransit: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  delayedShipments: number;
  activeAds: number;
  totalAdViews: number;
  totalAdClicks: number;
}

const AdminDashboard = () => {
  const { t } = useTranslation('common');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>(
    'dashboard-stats',
    async () => {
      const response = await reportsAPI.getDashboardStats();
      return response.data;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch recent shipments
  const { data: recentShipments, isLoading: shipmentsLoading, error: shipmentsError } = useQuery(
    'recent-shipments',
    async () => {
      const response = await shipmentsAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' });
      return response.data;
    },
    {
      retry: 2,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch delayed shipments
  const { data: delayedShipments, isLoading: delayedLoading, error: delayedError } = useQuery(
    'delayed-shipments',
    async () => {
      const response = await reportsAPI.getDelayedShipments();
      return response.data;
    },
    {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch unpaid shipments
  const { data: unpaidShipments, isLoading: unpaidLoading, error: unpaidError } = useQuery(
    'unpaid-shipments',
    async () => {
      const response = await reportsAPI.getUnpaidShipments();
      return response.data;
    },
    {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

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

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      unpaid: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const statCards = [
    {
      title: 'إجمالي العملاء',
      value: stats?.totalClients || 0,
      change: `${stats?.activeClients || 0} نشط`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/clients'
    },
    {
      title: 'إجمالي الشحنات',
      value: stats?.totalShipments || 0,
      change: `${stats?.shipmentsInTransit || 0} في الطريق`,
      icon: Package,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/shipments'
    },
    {
      title: 'الإيرادات الشهرية',
      value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      change: `$${stats?.totalRevenue?.toLocaleString() || 0} إجمالي`,
      icon: DollarSign,
      color: 'from-gold-500 to-gold-600',
      bgColor: 'bg-gold-50',
      link: '/admin/reports'
    },
    {
      title: 'الإعلانات النشطة',
      value: stats?.activeAds || 0,
      change: `${stats?.totalAdViews || 0} مشاهدة`,
      icon: Megaphone,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/ads'
    }
  ];

  const alertCards = [
    {
      title: 'شحنات متأخرة',
      count: stats?.delayedShipments || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      link: '/admin/shipments?status=delayed'
    },
    {
      title: 'مدفوعات معلقة',
      count: stats?.pendingPayments || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      link: '/admin/shipments?paymentStatus=unpaid'
    }
  ];

  // Error component
  const ErrorMessage = ({ error, title }: { error: any; title: string }): JSX.Element => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-600 ml-2 rtl:ml-0 rtl:mr-2" />
        <h3 className="text-sm font-medium text-red-800">{title}</h3>
      </div>
      <p className="text-sm text-red-600 mt-1">
        {error?.response?.data?.message || error?.message || 'حدث خطأ في تحميل البيانات'}
      </p>
    </div>
  );

  return (
    <AdminLayout title="لوحة التحكم">
      <Head>
        <title>لوحة التحكم - {t('site.title')}</title>
      </Head>

      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            // Skeleton loading for stats cards
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between rtl:flex-row-reverse">
                  <div className="flex-1 min-w-0">
                    <div className="skeleton h-4 w-24 mb-2"></div>
                    <div className="skeleton h-8 w-16 mb-1"></div>
                    <div className="skeleton h-4 w-20"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 rtl:ml-0 rtl:mr-4">
                    <div className="skeleton h-6 w-6"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            statCards.map((card, index) => (
              <Link key={index} href={card.link} className="block">
                <div className={`${card.bgColor} rounded-2xl p-6 hover:scale-105 transition-transform duration-200 cursor-pointer shadow-sm hover:shadow-md border border-gray-100`}>
                  <div className="flex items-center justify-between rtl:flex-row-reverse">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-2 truncate">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {card.value}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {card.change}
                      </p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center flex-shrink-0 ml-4 rtl:ml-0 rtl:mr-4`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alertCards.map((alert, index) => (
            <Link key={index} href={alert.link} className="block">
              <div className={`${alert.bgColor} border ${alert.borderColor} rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer`}>
                <div className="flex items-center rtl:flex-row-reverse">
                  <alert.icon className={`h-8 w-8 ${alert.color} ml-4 rtl:ml-0 rtl:mr-4 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {alert.title}
                    </h3>
                    <div className={`text-2xl font-bold ${alert.color}`}>
                      {statsLoading ? (
                        <div className="skeleton h-8 w-12"></div>
                      ) : (
                        alert.count
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Shipments */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
              <h2 className="text-xl font-bold text-gray-900 flex items-center rtl:flex-row-reverse">
                <Package className="h-6 w-6 ml-3 rtl:ml-0 rtl:mr-3 text-gold-600" />
                أحدث الشحنات
              </h2>
              <Link
                href="/admin/shipments"
                className="text-gold-600 hover:text-gold-700 font-medium text-sm hover:underline"
              >
                عرض الكل ←
              </Link>
            </div>

            {shipmentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="skeleton h-5 w-32 mb-2"></div>
                      <div className="skeleton h-4 w-48"></div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4 rtl:ml-0 rtl:mr-4">
                      <div className="skeleton h-6 w-16 rounded-full"></div>
                      <div className="skeleton h-6 w-16 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : shipmentsError ? (
              <ErrorMessage error={shipmentsError as any} title="خطأ في تحميل الشحنات الحديثة" />
            ) : (
              <div className="space-y-4">
                {recentShipments?.shipments?.slice(0, 5).map((shipment: any) => (
                  <div key={shipment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {shipment.trackingNumber}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {shipment.client?.fullName} - {shipment.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4 rtl:ml-0 rtl:mr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)} whitespace-nowrap`}>
                        {shipment.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(shipment.paymentStatus)} whitespace-nowrap`}>
                        {shipment.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {(!recentShipments?.shipments || recentShipments.shipments.length === 0) && !shipmentsLoading && (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>لا توجد شحنات حديثة</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center rtl:flex-row-reverse">
              <TrendingUp className="h-6 w-6 ml-3 rtl:ml-0 rtl:mr-3 text-gold-600" />
              إجراءات سريعة
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/admin/clients/new"
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900 text-sm">عميل جديد</p>
              </Link>

              <Link
                href="/admin/shipments/new"
                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900 text-sm">شحنة جديدة</p>
              </Link>

              <Link
                href="/admin/ads/new"
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <Megaphone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900 text-sm">إعلان جديد</p>
              </Link>

              <Link
                href="/admin/reports"
                className="bg-gold-50 hover:bg-gold-100 border border-gold-200 rounded-lg p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <TrendingUp className="h-8 w-8 text-gold-600 mx-auto mb-2" />
                <p className="font-medium text-gold-900 text-sm">التقارير</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Issues Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delayed Shipments */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
              <h2 className="text-xl font-bold text-gray-900 flex items-center rtl:flex-row-reverse">
                <AlertTriangle className="h-6 w-6 ml-3 rtl:ml-0 rtl:mr-3 text-red-600" />
                شحنات متأخرة
              </h2>
              <Link
                href="/admin/shipments?status=delayed"
                className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
              >
                عرض الكل ←
              </Link>
            </div>

            {delayedLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner" />
              </div>
            ) : (
              <div className="space-y-3">
                {delayedShipments?.slice(0, 3).map((shipment: any) => (
                  <div key={shipment.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">
                        {shipment.trackingNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {shipment.client?.fullName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        متأخر {Math.ceil((new Date().getTime() - new Date(shipment.expectedDelivery).getTime()) / (1000 * 60 * 60 * 24))} يوم
                      </p>
                    </div>
                  </div>
                ))}
                {(!delayedShipments || delayedShipments.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">
                      لا توجد شحنات متأخرة
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unpaid Shipments */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
              <h2 className="text-xl font-bold text-gray-900 flex items-center rtl:flex-row-reverse">
                <Clock className="h-6 w-6 ml-3 rtl:ml-0 rtl:mr-3 text-yellow-600" />
                مدفوعات معلقة
              </h2>
              <Link
                href="/admin/shipments?paymentStatus=unpaid"
                className="text-yellow-600 hover:text-yellow-700 font-medium text-sm hover:underline"
              >
                عرض الكل ←
              </Link>
            </div>

            {unpaidLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner" />
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidShipments?.slice(0, 3).map((shipment: any) => (
                  <div key={shipment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">
                        {shipment.trackingNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {shipment.client?.fullName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">
                        ${shipment.totalCost}
                      </p>
                      <p className="text-xs text-gray-500">
                        {shipment.paymentStatus}
                      </p>
                    </div>
                  </div>
                ))}
                {(!unpaidShipments || unpaidShipments.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">
                      جميع المدفوعات محدثة
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default withAuth(AdminDashboard);
