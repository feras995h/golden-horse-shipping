import { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useQuery } from 'react-query';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { reportsAPI } from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  FileText,
  DollarSign,
  Package,
  Users,
  Ship
} from 'lucide-react';

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  clientId?: string;
}

const ReportsPage = () => {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    async () => {
      const response = await reportsAPI.getDashboardStats();
      return response.data;
    }
  );

  const reportTabs = [
    {
      id: 'dashboard',
      name: 'لوحة المعلومات',
      icon: BarChart3,
    },
    {
      id: 'shipments',
      name: 'تقارير الشحنات',
      icon: Package,
    },
    {
      id: 'payments',
      name: 'تقارير المدفوعات',
      icon: DollarSign,
    },
    {
      id: 'clients',
      name: 'تقارير العملاء',
      icon: Users,
    },
  ];

  const quickStats = [
    {
      title: 'إجمالي الشحنات',
      value: dashboardStats?.totalShipments || 0,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'إجمالي العملاء',
      value: dashboardStats?.totalClients || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'الشحنات النشطة',
      value: dashboardStats?.activeShipments || 0,
      icon: Ship,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${(dashboardStats?.totalRevenue || 0).toLocaleString()} دينار ليبي (LYD)`,
      icon: DollarSign,
      color: 'from-gold-500 to-gold-600',
      bgColor: 'bg-gold-50',
    },
  ];

  const handleExport = (type: string) => {
    // Handle export functionality
    console.log(`Exporting ${type} report`);
  };

  return (
    <AdminLayout title="التقارير">
      <Head>
        <title>التقارير - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
            <p className="text-gray-600 mt-1">عرض وتحليل بيانات النظام</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => handleExport('all')}
              className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              تصدير التقارير
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <div className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="skeleton h-8 w-16"></div>
                    ) : (
                      stat.value
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 space-x-reverse px-6">
              {reportTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-gold-500 text-gold-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">نظرة عامة على النظام</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">الشحنات حسب الحالة</h4>
                    <div className="space-y-2">
                      {dashboardStats?.shipmentsByStatus?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{item.status}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">أفضل العملاء</h4>
                    <div className="space-y-2">
                      {dashboardStats?.topClients?.slice(0, 5).map((client: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{client.name}</span>
                          <span className="font-medium">{client.shipmentCount} شحنة</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipments' && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">تقارير الشحنات</h3>
                <p className="text-gray-600 mb-4">عرض تفصيلي لجميع الشحنات والإحصائيات المتعلقة بها</p>
                <button
                  onClick={() => handleExport('shipments')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تصدير تقرير الشحنات
                </button>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">تقارير المدفوعات</h3>
                <p className="text-gray-600 mb-4">تتبع المدفوعات والإيرادات والمستحقات</p>
                <button
                  onClick={() => handleExport('payments')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  تصدير تقرير المدفوعات
                </button>
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">تقارير العملاء</h3>
                <p className="text-gray-600 mb-4">إحصائيات العملاء وأنشطتهم</p>
                <button
                  onClick={() => handleExport('clients')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  تصدير تقرير العملاء
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
