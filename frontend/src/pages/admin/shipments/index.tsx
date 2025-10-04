import { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { shipmentsAPI } from '@/lib/api';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Ship,
  Clock,
  DollarSign,
  MapPin,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const ShipmentsPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch shipments
  const { data: shipmentsData, isLoading, error } = useQuery(
    ['shipments', currentPage, pageSize, searchTerm, statusFilter, paymentFilter],
    async () => {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
      };
      const response = await shipmentsAPI.getAll(params);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  // Delete shipment mutation
  const deleteShipmentMutation = useMutation(
    (shipmentId: string) => shipmentsAPI.delete(shipmentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('shipments');
        setShowDeleteModal(false);
        setSelectedShipment(null);
      },
    }
  );

  // Update status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: string }) => 
      shipmentsAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('shipments');
      },
    }
  );

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation(
    ({ id, paymentStatus }: { id: string; paymentStatus: string }) => 
      shipmentsAPI.updatePaymentStatus(id, paymentStatus),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('shipments');
      },
    }
  );

  const handleDeleteShipment = () => {
    if (selectedShipment) {
      deleteShipmentMutation.mutate(selectedShipment.id);
    }
  };

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

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: 'في الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      in_transit: 'في الطريق',
      at_port: 'في الميناء',
      customs_clearance: 'التخليص الجمركي',
      delivered: 'تم التسليم',
      delayed: 'متأخر',
      cancelled: 'ملغي',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getPaymentStatusText = (status: string) => {
    const statusTexts = {
      paid: 'مدفوع',
      partial: 'مدفوع جزئياً',
      unpaid: 'غير مدفوع',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const filteredShipments = shipmentsData?.shipments || [];
  const totalPages = Math.ceil((shipmentsData?.total || 0) / pageSize);

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'pending', label: 'في الانتظار' },
    { value: 'processing', label: 'قيد المعالجة' },
    { value: 'shipped', label: 'تم الشحن' },
    { value: 'in_transit', label: 'في الطريق' },
    { value: 'at_port', label: 'في الميناء' },
    { value: 'customs_clearance', label: 'التخليص الجمركي' },
    { value: 'delivered', label: 'تم التسليم' },
    { value: 'delayed', label: 'متأخر' },
    { value: 'cancelled', label: 'ملغي' }
  ];

  const paymentOptions = [
    { value: 'all', label: 'جميع حالات الدفع' },
    { value: 'paid', label: 'مدفوع' },
    { value: 'partial', label: 'مدفوع جزئياً' },
    { value: 'unpaid', label: 'غير مدفوع' }
  ];

  return (
    <AdminLayout title="إدارة الشحنات">
      <Head>
        <title>إدارة الشحنات - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Package className="h-8 w-8 text-gold-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة الشحنات</h1>
              <p className="text-gray-600">
                إجمالي الشحنات: {shipmentsData?.total || 0}
              </p>
            </div>
          </div>
          <Link
            href="/admin/shipments/new"
            className="btn-primary flex items-center mt-4 sm:mt-0"
          >
            <Plus className="h-5 w-5 ml-2" />
            شحنة جديدة
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث برقم التتبع، العميل، أو الوصف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-10"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pr-10"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="input-field pr-10"
              >
                {paymentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPaymentFilter('all');
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">حدث خطأ في تحميل البيانات</p>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد شحنات
              </h3>
              <p className="text-gray-600 mb-4">
                ابدأ بإضافة شحنة جديدة للنظام
              </p>
              <Link href="/admin/shipments/new" className="btn-primary">
                <Plus className="h-5 w-5 ml-2" />
                إضافة شحنة جديدة
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الشحنة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المسار
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الدفع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التكلفة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShipments.map((shipment: any) => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gold-600" />
                              </div>
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {shipment.trackingNumber}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-32">
                                {shipment.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 ml-1" />
                            <div className="text-sm text-gray-900">
                              {shipment.client?.fullName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <MapPin className="h-3 w-3 text-gray-400 ml-1" />
                              {shipment.originPort}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 text-gray-400 ml-1" />
                              {shipment.destinationPort}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {shipment.status === 'delayed' && (
                              <AlertTriangle className="h-3 w-3 ml-1" />
                            )}
                            {getStatusText(shipment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(shipment.paymentStatus)}`}>
                            {getPaymentStatusText(shipment.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(Number(shipment.totalCost) + Number(shipment.additionalCharges || 0)).toFixed(2)} {shipment.currency}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(() => {
                              const paid = (shipment.paymentRecords || []).reduce((s: number, r: any) => s + Number(r.amount), 0) + Number(shipment.adminAmountPaid || 0);
                              return `مدفوع: ${paid.toFixed(2)}`;
                            })()}
                            {' | '}
                            {(() => {
                              const totalDue = Number(shipment.totalCost) + Number(shipment.additionalCharges || 0);
                              const paid = (shipment.paymentRecords || []).reduce((s: number, r: any) => s + Number(r.amount), 0) + Number(shipment.adminAmountPaid || 0);
                              const remaining = Math.max(totalDue - paid, 0);
                              return `متبقي: ${remaining.toFixed(2)}`;
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(shipment.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                          {shipment.expectedDelivery && (
                            <div className="text-sm text-gray-500">
                              متوقع: {new Date(shipment.expectedDelivery).toLocaleDateString('ar-EG')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Link
                              href={`/admin/shipments/${shipment.id}`}
                              className="text-gold-600 hover:text-gold-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/shipments/${shipment.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedShipment(shipment);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
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
                          {(currentPage - 1) * pageSize + 1}
                        </span>{' '}
                        إلى{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pageSize, shipmentsData?.total || 0)}
                        </span>{' '}
                        من{' '}
                        <span className="font-medium">{shipmentsData?.total || 0}</span>{' '}
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
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
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
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          التالي
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                حذف الشحنة
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  هل أنت متأكد من حذف الشحنة &quot;{selectedShipment?.trackingNumber}&quot;؟
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleDeleteShipment}
                  disabled={deleteShipmentMutation.isLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteShipmentMutation.isLoading ? 'جاري الحذف...' : 'حذف'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedShipment(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

export default withAuth(ShipmentsPage);
