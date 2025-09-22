import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import axios from 'axios';

interface Shipment {
  id: string;
  trackingNumber: string;
  description: string;
  status: string;
  originPort: string;
  destinationPort: string;
  estimatedArrival: string;
  actualArrival: string;
  vesselName: string;
  containerNumber: string;
  value: number;
  currency: string;
  createdAt: string;
}

interface ShipmentsData {
  shipments: Shipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CustomerShipments = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [shipmentsData, setShipmentsData] = useState<ShipmentsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }

      setIsLoading(true);
      const response = await axios.get('/api/customer-portal/shipments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          limit: 10,
        },
      });

      setShipmentsData(response.data);
    } catch (error: any) {
      console.error('Shipments error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        router.push('/customer/login');
      } else {
        setError('فشل في تحميل بيانات الشحنات');
      }
    } finally {
      setIsLoading(false);
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
    fetchShipments();
  }, [currentPage, fetchShipments]);

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

  const filteredShipments = shipmentsData?.shipments.filter(shipment => {
    const matchesSearch = searchTerm === '' || 
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.containerNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

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
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchShipments}
            className="mt-4 bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Head>
        <title>شحناتي - Golden Horse Shipping</title>
        <meta name="description" content="قائمة شحنات العميل" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">شحناتي</h1>
          <div className="text-sm text-gray-600">
            إجمالي الشحنات: {shipmentsData?.pagination.total || 0}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="البحث في الشحنات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">في الانتظار</option>
                <option value="processing">قيد المعالجة</option>
                <option value="shipped">تم الشحن</option>
                <option value="in_transit">في الطريق</option>
                <option value="at_port">في الميناء</option>
                <option value="customs_clearance">التخليص الجمركي</option>
                <option value="delivered">تم التسليم</option>
                <option value="delayed">متأخر</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredShipments.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لا توجد شحنات تطابق معايير البحث'
                  : 'لا توجد شحنات حالياً'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <div key={shipment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <h3 className="text-lg font-medium text-gray-900">
                        {shipment.trackingNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          shipment.status
                        )}`}
                      >
                        {getStatusText(shipment.status)}
                      </span>
                    </div>
                    <Link
                      href={`/customer/shipments/${shipment.id}`}
                      className="flex items-center text-gold-600 hover:text-gold-700 font-medium"
                    >
                      عرض التفاصيل
                      <Eye className="h-4 w-4 mr-2" />
                    </Link>
                  </div>

                  <p className="text-gray-600 mb-4">{shipment.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{shipment.originPort} → {shipment.destinationPort}</span>
                    </div>
                    
                    {shipment.estimatedArrival && (
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>الوصول المتوقع: {new Date(shipment.estimatedArrival).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}

                    <div className="flex items-center text-gray-500">
                      <Package className="h-4 w-4 mr-2" />
                      <span>القيمة: {shipment.value} {shipment.currency}</span>
                    </div>
                  </div>

                  {shipment.containerNumber && (
                    <div className="mt-2 text-sm text-gray-500">
                      رقم الحاوية: {shipment.containerNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {shipmentsData && shipmentsData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-700">
              عرض {((currentPage - 1) * shipmentsData.pagination.limit) + 1} إلى{' '}
              {Math.min(currentPage * shipmentsData.pagination.limit, shipmentsData.pagination.total)} من{' '}
              {shipmentsData.pagination.total} نتيجة
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              <span className="px-3 py-1 text-sm font-medium">
                {currentPage} من {shipmentsData.pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, shipmentsData.pagination.totalPages))}
                disabled={currentPage === shipmentsData.pagination.totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
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

export default CustomerShipments;
