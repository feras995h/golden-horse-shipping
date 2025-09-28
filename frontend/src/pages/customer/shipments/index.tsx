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

  const fetchShipments = useCallback(async () => {
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
  }, [router, currentPage]);

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
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-indigo-100/50 border border-indigo-200/30 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center relative z-10">
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-300">
              <Package className="h-7 w-7 text-indigo-600 drop-shadow-sm" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-600 bg-clip-text text-transparent mr-4">
              شحناتي
            </h1>
          </div>
          <div className="text-lg font-semibold text-indigo-600/80 relative z-10">
            إجمالي الشحنات: <span className="text-indigo-700">{shipmentsData?.pagination.total || 0}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-purple-100/50 border border-purple-200/30 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Search */}
            <div className="relative group/input">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-purple-400 group-hover/input:text-purple-600 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="البحث في الشحنات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pr-12 pl-4 py-3 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 bg-gradient-to-r from-purple-50/30 to-transparent hover:from-purple-50/50 transition-all duration-300 text-purple-700 placeholder-purple-400"
              />
            </div>

            {/* Status Filter */}
            <div className="relative group/select">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-purple-400 group-hover/select:text-purple-600 transition-colors duration-300" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pr-12 pl-4 py-3 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 bg-gradient-to-r from-purple-50/30 to-transparent hover:from-purple-50/50 transition-all duration-300 text-purple-700 appearance-none cursor-pointer"
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-200/30 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {filteredShipments.length === 0 ? (
            <div className="text-center py-16 relative z-10">
              <div className="p-6 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl shadow-lg shadow-indigo-200/50 w-fit mx-auto mb-6">
                <Package className="h-16 w-16 text-indigo-400 mx-auto drop-shadow-sm" />
              </div>
              <p className="text-indigo-600/70 text-lg font-medium">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لا توجد شحنات تطابق معايير البحث'
                  : 'لا توجد شحنات حالياً'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-indigo-200/30 relative z-10">
              {filteredShipments.map((shipment) => (
                <div key={shipment.id} className="p-6 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-300 group/item">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <h3 className="text-xl font-semibold text-indigo-700 group-hover/item:text-indigo-800 transition-colors duration-300">
                        {shipment.trackingNumber}
                      </h3>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 group-hover/item:scale-105 ${getStatusColor(
                          shipment.status
                        )}`}
                      >
                        {getStatusText(shipment.status)}
                      </span>
                    </div>
                    <Link
                      href={`/customer/shipments/${shipment.id}`}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-105 font-medium group-hover/item:scale-110"
                    >
                      عرض التفاصيل
                      <Eye className="h-4 w-4 mr-2" />
                    </Link>
                  </div>

                  <p className="text-indigo-600/70 mb-4 font-medium">{shipment.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-indigo-600/60 font-medium">
                      <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg mr-3 shadow-sm group-hover/item:scale-110 transition-transform duration-300">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span>{shipment.originPort} → {shipment.destinationPort}</span>
                    </div>
                    
                    {shipment.estimatedArrival && (
                      <div className="flex items-center text-indigo-600/60 font-medium">
                        <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg mr-3 shadow-sm group-hover/item:scale-110 transition-transform duration-300">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span>الوصول المتوقع: {new Date(shipment.estimatedArrival).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}

                    <div className="flex items-center text-indigo-600/60 font-medium">
                      <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg mr-3 shadow-sm group-hover/item:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span>القيمة: {shipment.value} {shipment.currency}</span>
                    </div>
                  </div>

                  {shipment.containerNumber && (
                    <div className="mt-3 text-sm text-indigo-600/60 font-medium bg-gradient-to-r from-indigo-50/50 to-transparent rounded-lg p-3 border border-indigo-200/30">
                      رقم الحاوية: <span className="text-indigo-700 font-semibold">{shipment.containerNumber}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {shipmentsData && shipmentsData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 space-x-reverse bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-200/30 p-6 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center space-x-2 space-x-reverse relative z-10">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-105 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-gray-200/50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ChevronLeft className="h-4 w-4 ml-1" />
                السابق
              </button>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                {Array.from({ length: Math.min(5, shipmentsData.pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(shipmentsData.pagination.totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-md hover:scale-105 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200/50'
                          : 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 hover:from-indigo-200 hover:to-indigo-300 shadow-indigo-100/50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(shipmentsData.pagination.totalPages, currentPage + 1))}
                disabled={currentPage === shipmentsData.pagination.totalPages}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-105 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-gray-200/50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                التالي
                <ChevronRight className="h-4 w-4 mr-1" />
              </button>
            </div>
            
            <div className="text-sm text-indigo-600/70 font-medium relative z-10">
              صفحة {currentPage} من {shipmentsData.pagination.totalPages} ({shipmentsData.pagination.total} شحنة)
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
