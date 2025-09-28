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
  Wallet,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface FinancialData {
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
  payments: Array<{
    id: string;
    shipmentId: string;
    trackingNumber: string;
    amount: number;
    currency: string;
    method: string;
    paymentDate: string;
    referenceNumber: string;
    notes: string;
    recordedBy: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CustomerFinancial = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');

  const fetchFinancialData = useCallback(async () => {
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
          page: currentPage,
          limit: 10,
        },
      });

      setFinancialData(response.data);
    } catch (error: any) {
      console.error('Financial data error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        router.push('/customer/login');
      } else {
        setError('فشل في تحميل البيانات المالية');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, currentPage]);

  useEffect(() => {
    fetchFinancialData();
  }, [currentPage, searchTerm, filterMethod, fetchFinancialData]);

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
        return 'bg-green-100 text-green-800';
      case 'bank_transfer':
        return 'bg-blue-100 text-blue-800';
      case 'credit_card':
        return 'bg-purple-100 text-purple-800';
      case 'check':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = financialData?.payments.filter(payment => {
    const matchesSearch = payment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesMethod;
  }) || [];

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
            onClick={fetchFinancialData}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105"
          >
            إعادة المحاولة
          </button>
        </div>
      </CustomerLayout>
    );
  }

  if (!financialData) {
    return (
      <CustomerLayout>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8 text-center shadow-xl">
          <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <DollarSign className="h-10 w-10 text-gray-600" />
          </div>
          <p className="text-gray-600 text-lg font-medium">لا توجد بيانات مالية متاحة</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Head>
        <title>البيانات المالية - {financialData.customer.customerName}</title>
        <meta name="description" content="البيانات المالية للعميل" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50 hover:shadow-3xl hover:shadow-gray-900/30 transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl mr-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <DollarSign className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent drop-shadow-sm">البيانات المالية</h1>
                <p className="text-indigo-600/70 font-medium mt-1">عرض البيانات المالية والمدفوعات</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/customer/financial-reports"
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                التقارير المالية
              </Link>
              <button
                onClick={fetchFinancialData}
                className="flex items-center px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-indigo-600 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                تحديث
              </button>
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white/95 to-green-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-green-100/50 border border-green-200/30 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-green-700">إجمالي القيمة</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                    ${financialData.financialStats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="text-sm text-green-600/70 font-medium relative">
              قيمة جميع الشحنات
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/95 to-blue-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-blue-100/50 border border-blue-200/30 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-blue-700">المدفوع</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                    ${financialData.financialStats.totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
              <CreditCard className="h-5 w-5 text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="text-sm text-blue-600/70 font-medium relative">
              المبلغ المدفوع فعلياً
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/95 to-red-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-red-100/50 border border-red-200/30 hover:shadow-2xl hover:shadow-red-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-red-700">المتبقي</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
                    ${financialData.financialStats.totalPending.toLocaleString()}
                  </p>
                </div>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="text-sm text-red-600/70 font-medium relative">
              المبلغ المتبقي للدفع
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/95 to-purple-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-purple-100/50 border border-purple-200/30 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-purple-700">إجمالي المدفوعات</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                    {financialData.financialStats.totalPayments}
                  </p>
                </div>
              </div>
              <Calendar className="h-5 w-5 text-purple-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="text-sm text-purple-600/70 font-medium relative">
              عدد المعاملات المالية
            </div>
          </div>
        </div>

        {/* Payment Methods Overview */}
        {Object.keys(financialData.financialStats.paymentMethods).length > 0 && (
          <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl shadow-gray-100/50 border border-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-6 drop-shadow-sm">طرق الدفع المستخدمة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(financialData.financialStats.paymentMethods).map(([method, count]) => (
                  <div key={method} className="text-center group/item">
                    <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group-hover/item:scale-110">
                      <CreditCard className="h-8 w-8 text-indigo-600 mx-auto" />
                    </div>
                    <p className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">{count}</p>
                    <p className="text-sm text-indigo-600/70 font-medium">
                      {getPaymentMethodText(method)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl shadow-gray-100/50 border border-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <input
                type="text"
                placeholder="البحث برقم التتبع أو المرجع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 font-medium"
              />
            </div>

            <div className="relative">
              <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 font-medium appearance-none"
              >
                <option value="all">جميع طرق الدفع</option>
                <option value="cash">نقداً</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="credit_card">بطاقة ائتمان</option>
                <option value="check">شيك</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterMethod('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-indigo-600 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-8 border-b border-gray-200/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent drop-shadow-sm">سجل المدفوعات</h2>
          </div>

          <div className="overflow-x-auto">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <CreditCard className="h-12 w-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
                  لا توجد مدفوعات
                </h3>
                <p className="text-gray-600 font-medium">
                  لم يتم العثور على مدفوعات تطابق معايير البحث
                </p>
              </div>
            ) : (

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم التتبع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      طريقة الدفع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الدفع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم المرجع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ملاحظات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.trackingNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          ${payment.amount.toLocaleString()} {payment.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.method)}`}>
                          {getPaymentMethodText(payment.method)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.referenceNumber || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payment.notes || 'لا توجد ملاحظات'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {financialData.pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(financialData.pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === financialData.pagination.totalPages}
                  className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    عرض{' '}
                    <span className="font-medium">
                      {(currentPage - 1) * 10 + 1}
                    </span>{' '}
                    إلى{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, financialData.pagination.total)}
                    </span>{' '}
                    من{' '}
                    <span className="font-medium">{financialData.pagination.total}</span>{' '}
                    نتيجة
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      السابق
                    </button>
                    {Array.from({ length: financialData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-gold-50 border-gold-500 text-gold-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(financialData.pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === financialData.pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      التالي
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
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

export default CustomerFinancial;
