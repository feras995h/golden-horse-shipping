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
            onClick={fetchReportData}
            className="mt-4 bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </CustomerLayout>
    );
  }

  if (!reportData) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">لا توجد بيانات تقرير متاحة</p>
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

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
            <p className="text-gray-600">تقارير مالية تفصيلية ورسوم بيانية</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            >
              <option value="3months">آخر 3 أشهر</option>
              <option value="6months">آخر 6 أشهر</option>
              <option value="1year">آخر سنة</option>
              <option value="all">جميع الفترات</option>
            </select>
            <button
              onClick={fetchReportData}
              className="flex items-center text-gold-600 hover:text-gold-700"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              تحديث
            </button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي القيمة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.financialStats.totalValue)}
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
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">المدفوع</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.financialStats.totalPaid)}
                  </p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-sm text-gray-500">
              المبلغ المدفوع فعلياً
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">المتبقي</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.financialStats.totalPending)}
                  </p>
                </div>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-sm text-gray-500">
              المبلغ المتبقي للدفع
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المدفوعات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.financialStats.totalPayments}
                  </p>
                </div>
              </div>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-sm text-gray-500">
              عدد المعاملات المالية
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
