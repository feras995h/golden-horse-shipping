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
  Ship,
  PieChart,
  LineChart,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Globe,
  Truck,
  CreditCard,
  Eye,
  MousePointer,
  Zap,
  TrendingDown
} from 'lucide-react';

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  clientId?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category?: string;
}

interface AdvancedStats {
  totalShipments: number;
  totalClients: number;
  activeShipments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageShipmentValue: number;
  deliverySuccessRate: number;
  customerSatisfactionRate: number;
  topRoutes: Array<{ route: string; count: number; revenue: number }>;
  shipmentsByStatus: Array<{ status: string; count: number; percentage: number }>;
  monthlyTrends: Array<{ month: string; shipments: number; revenue: number }>;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
  delayedShipments: number;
  onTimeDeliveries: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
  processingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  cityDistribution: Array<{ city: string; count: number; percentage: number }>;
  monthlyGrowth: Array<{ month: string; growth: number; percentage: number }>;
  dailyPerformance: Array<{ date: string; shipments: number; revenue: number }>;
  shipmentTypes: Array<{ type: string; count: number; percentage: number }>;
  priorityLevels: Array<{ priority: string; count: number; percentage: number }>;
  newCustomers: number | Array<{ month: string; newCustomers: number; totalCustomers: number }>;
  activeCustomers: number;
  totalCustomers: number;
  retentionRate: number;
  successRate: number;
  averageProcessingTime: number;
  customerSatisfaction: number;
  revenueGrowth: number;
  netProfit: number;
  profitMargin: number;
  averageOrderValue: number;
  revenueChart: Array<{ month: string; revenue: number; profit: number }>;
  serviceTypes: Array<{ type: string; count: number; revenue: number }>;
  customerGrowth: Array<{ month: string; newCustomers: number; totalCustomers: number }>;
  revenueByRegion: Array<{ region: string; revenue: number; percentage: number }>;
}

const ReportsPage = () => {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'monthly'
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery(
    ['dashboard-stats', filters],
    async () => {
      const response = await reportsAPI.getDashboardStats();
      return response.data;
    },
    {
      refetchInterval: 60000, // Refresh every minute
      staleTime: 30000, // 30 seconds
    }
  );

  // Fetch advanced analytics
  const { data: advancedStats, isLoading: advancedLoading } = useQuery<AdvancedStats>(
    ['advanced-stats', filters, dateRange],
    async () => {
      // This would be a new API endpoint for advanced statistics
      const response = await reportsAPI.getAdvancedStats({
        ...filters,
        ...dateRange
      });
      return response.data;
    },
    {
      enabled: activeTab === 'advanced',
      staleTime: 60000, // 1 minute
    }
  );

  const reportTabs = [
    {
      id: 'dashboard',
      name: 'لوحة المعلومات',
      icon: BarChart3,
      description: 'نظرة عامة سريعة على الإحصائيات الأساسية'
    },
    {
      id: 'advanced',
      name: 'التحليلات المتقدمة',
      icon: Activity,
      description: 'تحليلات تفصيلية ورسوم بيانية متقدمة'
    },
    {
      id: 'shipments',
      name: 'تقارير الشحنات',
      icon: Package,
      description: 'تحليل مفصل لجميع الشحنات والأداء'
    },
    {
      id: 'payments',
      name: 'تقارير المدفوعات',
      icon: DollarSign,
      description: 'تتبع الإيرادات والمدفوعات والمستحقات'
    },
    {
      id: 'clients',
      name: 'تقارير العملاء',
      icon: Users,
      description: 'إحصائيات العملاء وسلوكياتهم'
    },
    {
      id: 'performance',
      name: 'تقارير الأداء',
      icon: Target,
      description: 'مؤشرات الأداء الرئيسية والكفاءة'
    },
  ];

  const quickStats = [
    {
      title: 'إجمالي الشحنات',
      value: dashboardStats?.totalShipments || 0,
      change: `+${((dashboardStats?.totalShipments || 0) * 0.12).toFixed(0)}`,
      changeType: 'increase',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'إجمالي العملاء',
      value: dashboardStats?.totalClients || 0,
      change: `+${((dashboardStats?.totalClients || 0) * 0.08).toFixed(0)}`,
      changeType: 'increase',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'الشحنات النشطة',
      value: dashboardStats?.activeShipments || 0,
      change: `${((dashboardStats?.activeShipments || 0) / (dashboardStats?.totalShipments || 1) * 100).toFixed(1)}%`,
      changeType: 'neutral',
      icon: Ship,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${(dashboardStats?.totalRevenue || 0).toLocaleString()} د.ل`,
      change: `+${((dashboardStats?.monthlyRevenue || 0) / (dashboardStats?.totalRevenue || 1) * 100).toFixed(1)}%`,
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-gold-500 to-gold-600',
      bgColor: 'bg-gold-50',
      textColor: 'text-gold-600',
    },
    {
      title: 'معدل التسليم في الوقت',
      value: `${((dashboardStats?.deliveredShipments || 0) / (dashboardStats?.totalShipments || 1) * 100).toFixed(1)}%`,
      change: '+2.3%',
      changeType: 'increase',
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'الشحنات المتأخرة',
      value: dashboardStats?.delayedShipments || 0,
      change: '-15%',
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  const handleExport = (type: string) => {
    // Handle export functionality
    console.log(`Exporting ${type} report`);
    // This would trigger a download of the report
    const exportData = {
      type,
      filters,
      dateRange,
      timestamp: new Date().toISOString()
    };
    
    // Create and download file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AdminLayout title="التقارير">
      <Head>
        <title>التقارير - {t('site.title')}</title>
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير والإحصائيات المتقدمة</h1>
            <p className="text-gray-600">تحليل شامل لبيانات النظام مع رؤى تفصيلية ومؤشرات أداء</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="text-sm border-none outline-none"
              />
              <span className="text-gray-400">إلى</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="text-sm border-none outline-none"
              />
            </div>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
              <option value="yearly">سنوي</option>
            </select>
            <button
              onClick={() => handleExport('comprehensive')}
              className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-6 py-2 rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Download className="h-4 w-4" />
              تصدير شامل
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(stat.changeType)}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 
                      stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <div className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <nav className="flex overflow-x-auto">
              {reportTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-gold-500 text-gold-600 bg-gold-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5" />
                  <div className="text-right">
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">نظرة عامة على النظام</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    آخر تحديث: {new Date().toLocaleString('ar-SA')}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {/* Shipments by Status Chart */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <PieChart className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">الشحنات حسب الحالة</h4>
                    </div>
                    <div className="space-y-4">
                      {dashboardStats?.shipmentsByStatus?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                              index === 0 ? 'from-green-400 to-green-600' :
                              index === 1 ? 'from-yellow-400 to-yellow-600' :
                              index === 2 ? 'from-blue-400 to-blue-600' :
                              'from-gray-400 to-gray-600'
                            }`} />
                            <span className="text-gray-700 font-medium">{item.status}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{item.count}</div>
                            <div className="text-xs text-gray-500">{((item.count / (dashboardStats?.totalShipments || 1)) * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Clients */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">أفضل العملاء</h4>
                    </div>
                    <div className="space-y-4">
                      {dashboardStats?.topClients?.slice(0, 5).map((client: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                              index === 0 ? 'from-gold-400 to-gold-600' :
                              index === 1 ? 'from-silver-400 to-gray-500' :
                              index === 2 ? 'from-amber-600 to-orange-600' :
                              'from-blue-400 to-blue-600'
                            } flex items-center justify-center text-white font-bold text-sm`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{client.name}</div>
                              <div className="text-xs text-gray-500">{client.totalValue?.toLocaleString()} د.ل</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{client.shipmentCount}</div>
                            <div className="text-xs text-gray-500">شحنة</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Trends */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                        <LineChart className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">الاتجاهات الشهرية</h4>
                    </div>
                    <div className="space-y-4">
                      {dashboardStats?.monthlyShipments?.slice(-6).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                          <span className="text-gray-700 font-medium">{item.month}</span>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{item.count}</div>
                            <div className="text-xs text-gray-500">شحنة</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipments' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">تقارير الشحنات المتقدمة</h3>
                  <div className="flex items-center gap-4">
                    <select 
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      value={filters.period}
                      onChange={(e) => handleFilterChange('period', e.target.value)}
                    >
                      <option value="daily">يومي</option>
                      <option value="weekly">أسبوعي</option>
                      <option value="monthly">شهري</option>
                      <option value="yearly">سنوي</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  {/* Delivery Performance */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">أداء التسليم</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">في الوقت المحدد</span>
                        <span className="font-bold text-green-600">{advancedStats?.onTimeDeliveryRate || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">متأخرة</span>
                        <span className="font-bold text-red-600">{advancedStats?.delayedShipments || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">متوسط وقت التسليم</span>
                        <span className="font-bold text-blue-600">{advancedStats?.averageDeliveryTime || 0} يوم</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Status Distribution */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">توزيع الحالات</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">قيد المعالجة</span>
                        <span className="font-bold text-yellow-600">{advancedStats?.processingShipments || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">في الطريق</span>
                        <span className="font-bold text-blue-600">{advancedStats?.inTransitShipments || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">تم التسليم</span>
                        <span className="font-bold text-green-600">{advancedStats?.deliveredShipments || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Geographic Distribution */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">التوزيع الجغرافي</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">طرابلس</span>
                        <span className="font-bold text-purple-600">
                          {advancedStats?.cityDistribution?.find(city => city.city === 'طرابلس')?.count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">بنغازي</span>
                        <span className="font-bold text-purple-600">
                          {advancedStats?.cityDistribution?.find(city => city.city === 'بنغازي')?.count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">مصراتة</span>
                        <span className="font-bold text-purple-600">
                          {advancedStats?.cityDistribution?.find(city => city.city === 'مصراتة')?.count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Analysis */}
                  <div className="bg-gradient-to-br from-gold-50 to-yellow-50 rounded-2xl p-6 border border-gold-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-gold-500 to-yellow-600 rounded-xl flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">تحليل الإيرادات</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">إجمالي الإيرادات</span>
                        <span className="font-bold text-gold-600">{advancedStats?.totalRevenue?.toLocaleString() || 0} د.ل</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">متوسط قيمة الشحنة</span>
                        <span className="font-bold text-gold-600">{advancedStats?.averageShipmentValue?.toLocaleString() || 0} د.ل</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">النمو الشهري</span>
                        <span className="font-bold text-green-600">
                          +{Array.isArray(advancedStats?.monthlyGrowth) 
                            ? advancedStats.monthlyGrowth[advancedStats.monthlyGrowth.length - 1]?.percentage || 0
                            : advancedStats?.monthlyGrowth || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Shipment Analytics */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-6">تحليل مفصل للشحنات</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800">الأداء اليومي</h5>
                      <div className="space-y-3">
                        {advancedStats?.dailyPerformance?.slice(-7).map((day: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">{day.date}</span>
                            <span className="font-bold text-gray-900">{day.shipments} شحنة</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800">أنواع الشحنات</h5>
                      <div className="space-y-3">
                        {advancedStats?.shipmentTypes?.map((type: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">{type.type}</span>
                            <span className="font-bold text-gray-900">{type.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800">مستويات الأولوية</h5>
                      <div className="space-y-3">
                        {advancedStats?.priorityLevels?.map((priority: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">{priority.level}</span>
                            <span className="font-bold text-gray-900">{priority.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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

            {activeTab === 'advanced' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">التحليلات المتقدمة</h3>
                  <div className="flex items-center gap-4">
                    <select 
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="all">جميع الفئات</option>
                      <option value="performance">الأداء</option>
                      <option value="customer">العملاء</option>
                      <option value="financial">المالية</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {/* Customer Analytics */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">تحليل العملاء</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">عملاء جدد</span>
                        <div className="text-right">
                          <div className="font-bold text-indigo-600">
                            {Array.isArray(advancedStats?.newCustomers) 
                              ? advancedStats.newCustomers.reduce((sum, item) => sum + item.newCustomers, 0)
                              : advancedStats?.newCustomers || 0}
                          </div>
                          <div className="text-xs text-green-500">+{Array.isArray(advancedStats?.customerGrowth) ? advancedStats.customerGrowth.length : advancedStats?.customerGrowth || 0}%</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">عملاء نشطون</span>
                        <div className="text-right">
                          <div className="font-bold text-indigo-600">{advancedStats?.activeCustomers || 0}</div>
                          <div className="text-xs text-gray-500">من إجمالي {advancedStats?.totalCustomers || 0}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">معدل الاحتفاظ</span>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{advancedStats?.retentionRate || 0}%</div>
                          <div className="text-xs text-gray-500">شهري</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">مؤشرات الأداء</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">معدل النجاح</span>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">{advancedStats?.successRate || 0}%</div>
                          <div className="text-xs text-green-500">+2.3%</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">متوسط وقت المعالجة</span>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">{advancedStats?.averageProcessingTime || 0}س</div>
                          <div className="text-xs text-red-500">-15%</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">رضا العملاء</span>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">{advancedStats?.customerSatisfaction || 0}/5</div>
                          <div className="text-xs text-green-500">+0.2</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Analytics */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">التحليل المالي</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">الإيرادات الشهرية</span>
                        <div className="text-right">
                          <div className="font-bold text-amber-600">{advancedStats?.monthlyRevenue?.toLocaleString() || 0} د.ل</div>
                          <div className="text-xs text-green-500">+{advancedStats?.revenueGrowth || 0}%</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">الربح الصافي</span>
                        <div className="text-right">
                          <div className="font-bold text-amber-600">{advancedStats?.netProfit?.toLocaleString() || 0} د.ل</div>
                          <div className="text-xs text-green-500">+{advancedStats?.profitMargin || 0}%</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600">متوسط قيمة الطلب</span>
                        <div className="text-right">
                          <div className="font-bold text-amber-600">{advancedStats?.averageOrderValue?.toLocaleString() || 0} د.ل</div>
                          <div className="text-xs text-blue-500">+8.5%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <LineChart className="h-6 w-6 text-blue-600" />
                      <h4 className="text-lg font-bold text-gray-900">اتجاهات الإيرادات</h4>
                    </div>
                    <div className="space-y-4">
                      {advancedStats?.revenueChart?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">{item.month}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                                style={{ width: `${(item.revenue / Math.max(...(advancedStats?.revenueChart?.map((r: any) => r.revenue) || [1]))) * 100}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{item.revenue?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <PieChart className="h-6 w-6 text-purple-600" />
                      <h4 className="text-lg font-bold text-gray-900">توزيع أنواع الخدمات</h4>
                    </div>
                    <div className="space-y-4">
                      {advancedStats?.serviceTypes?.map((service: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                              index === 0 ? 'from-purple-400 to-purple-600' :
                              index === 1 ? 'from-blue-400 to-blue-600' :
                              index === 2 ? 'from-green-400 to-green-600' :
                              'from-gray-400 to-gray-600'
                            }`} />
                            <span className="text-gray-600">{service.type}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{service.count}</div>
                            <div className="text-xs text-gray-500">{service.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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

            {activeTab === 'performance' && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">تقارير الأداء</h3>
                <p className="text-gray-600 mb-4">مؤشرات الأداء الرئيسية والكفاءة</p>
                <button
                  onClick={() => handleExport('performance')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  تصدير تقرير الأداء
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
