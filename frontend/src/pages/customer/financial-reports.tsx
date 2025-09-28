import { useState, useEffect, useCallback } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { 
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw,
  Filter
} from 'lucide-react';
import axios from 'axios';

interface FinancialReportData {
  customer: {
    id: string;
    trackingNumber: string;
    customerName: string;
  };
  financialStats: {
    totalValue: number;
    totalPaid: number;
    totalPending: number;
    paymentMethods: Record<string, number>;
    totalPayments: number;
  };
  monthlyData: Array<{
    month: string;
    totalValue: number;
    totalPaid: number;
    totalPending: number;
    paymentCount: number;
  }>;
  paymentMethodData: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  recentPayments: Array<{
    id: string;
    trackingNumber: string;
    amount: number;
    currency: string;
    method: string;
    paymentDate: string;
    referenceNumber: string;
  }>;
}

const CustomerFinancialReports = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const fetchReportData = useCallback(async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }

      setIsLoading(true);
      const response = await axios.get('/api/customer-portal/financial-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          period: selectedPeriod,
        },
      });

      setReportData(response.data);
    } catch (error: any) {
      console.error('Financial report error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        router.push('/customer/login');
      } else {
        setError('فشل في تحميل التقرير المالي');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, selectedPeriod]);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, fetchReportData]);

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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-500';
      case 'bank_transfer':
        return 'bg-blue-500';
      case 'credit_card':
        return 'bg-purple-500';
      case 'check':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gradient-to-r from-indigo-600 to-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-gradient-to-r from-purple-600 to-indigo-600 border-t-transparent rounded-full animate-spin animate-pulse"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative p-8 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50 text-center max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-red-800/5 rounded-2xl"></div>
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent mb-2">خطأ في التحميل</h3>
              <p className="text-red-600 font-medium mb-6">{error}</p>
              <button
                onClick={fetchReportData}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center mx-auto"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!reportData) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative p-8 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50 text-center max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600/5 to-gray-800/5 rounded-2xl"></div>
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">لا توجد بيانات</h3>
              <p className="text-gray-600 font-medium">لا توجد بيانات تقرير متاحة</p>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Head>
        <title>التقارير المالية - {reportData.customer.customerName}</title>
        <meta name="description" content="التقارير المالية التفصيلية للعميل" />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full mr-4">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">التقارير المالية</h1>
                <p className="text-gray-600 font-medium mt-1">تقارير مالية تفصيلية ورسوم بيانية</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-medium appearance-none pr-10"
                >
                  <option value="3months">آخر 3 أشهر</option>
                  <option value="6months">آخر 6 أشهر</option>
                  <option value="1year">آخر سنة</option>
                  <option value="all">جميع الفترات</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={fetchReportData}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                تحديث
              </button>
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative p-6 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-800/5 rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl mr-4">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">إجمالي القيمة</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                      {formatCurrency(reportData.financialStats.totalValue)}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                قيمة جميع الشحنات
              </div>
            </div>
          </div>

          <div className="relative p-6 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-800/5 rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mr-4">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">المدفوع</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                      {formatCurrency(reportData.financialStats.totalPaid)}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                المبلغ المدفوع فعلياً
              </div>
            </div>
          </div>

          <div className="relative p-6 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-red-800/5 rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl mr-4">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">المتبقي</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
                      {formatCurrency(reportData.financialStats.totalPending)}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-full">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                المبلغ المتبقي للدفع
              </div>
            </div>
          </div>

          <div className="relative p-6 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-purple-800/5 rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mr-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">إجمالي المدفوعات</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                      {reportData.financialStats.totalPayments}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                عدد المعاملات المالية
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">الاتجاه الشهري</h2>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">إجمالي القيمة</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">المدفوع</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">المتبقي</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {reportData.monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{month.month}</h3>
                  <div className="flex items-center space-x-4 space-x-reverse mt-2">
                    <span className="text-sm text-gray-600">
                      المدفوع: {formatCurrency(month.totalPaid)}
                    </span>
                    <span className="text-sm text-gray-600">
                      المتبقي: {formatCurrency(month.totalPending)}
                    </span>
                    <span className="text-sm text-gray-600">
                      المعاملات: {month.paymentCount}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(month.totalValue)}
                  </p>
                  <p className="text-sm text-gray-500">إجمالي القيمة</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">توزيع طرق الدفع</h2>
            <div className="space-y-4">
              {reportData.paymentMethodData.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${getPaymentMethodColor(method.method)}`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {getPaymentMethodText(method.method)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {method.count} معاملة
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(method.amount)} ({method.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">المدفوعات الأخيرة</h2>
            <div className="space-y-3">
              {reportData.recentPayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-lg mr-3">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.trackingNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getPaymentMethodText(payment.method)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">ملخص الإحصائيات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {((reportData.financialStats.totalPaid / reportData.financialStats.totalValue) * 100).toFixed(1)}%
              </h3>
              <p className="text-sm text-gray-600">نسبة الدفع</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {reportData.monthlyData.length}
              </h3>
              <p className="text-sm text-gray-600">شهور نشطة</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {reportData.paymentMethodData.length}
              </h3>
              <p className="text-sm text-gray-600">طرق دفع مختلفة</p>
            </div>
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

export default CustomerFinancialReports;
