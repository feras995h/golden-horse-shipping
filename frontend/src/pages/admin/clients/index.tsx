import { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';

import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { clientsAPI } from '@/lib/api';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Package,
  Phone,
  Mail,
  MapPin,
  Shield,
  Key
} from 'lucide-react';

const ClientsPage = () => {
  const { t } = useTranslation('common');

  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch clients
  const { data: clientsData, isLoading, error } = useQuery(
    ['clients', currentPage, pageSize, searchTerm, statusFilter],
    async () => {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      const response = await clientsAPI.getAll(params);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  // Delete client mutation
  const deleteClientMutation = useMutation(
    (clientId: string) => clientsAPI.delete(clientId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        setShowDeleteModal(false);
        setSelectedClient(null);
      },
    }
  );

  // Toggle client status mutation
  const toggleStatusMutation = useMutation(
    (clientId: string) => clientsAPI.toggleStatus(clientId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
      },
    }
  );

  const handleDeleteClient = () => {
    if (selectedClient) {
      deleteClientMutation.mutate(selectedClient.id);
    }
  };

  const handleToggleStatus = (client: any) => {
    toggleStatusMutation.mutate(client.id);
  };

  const filteredClients = clientsData?.clients || [];
  const totalPages = Math.ceil((clientsData?.total || 0) / pageSize);

  return (
    <AdminLayout title="إدارة العملاء">
      <Head>
        <title>إدارة العملاء - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Users className="h-8 w-8 text-gold-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
              <p className="text-gray-600">
                إجمالي العملاء: {clientsData?.total || 0}
              </p>
            </div>
          </div>
          <Link
            href="/admin/clients/new"
            className="btn-primary flex items-center mt-4 sm:mt-0"
          >
            <Plus className="h-5 w-5 ml-2" />
            عميل جديد
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم، البريد، أو رقم الهاتف..."
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
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">حدث خطأ في تحميل البيانات</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا يوجد عملاء
              </h3>
              <p className="text-gray-600 mb-4">
                ابدأ بإضافة عميل جديد للنظام
              </p>
              <Link href="/admin/clients/new" className="btn-primary">
                <Plus className="h-5 w-5 ml-2" />
                إضافة عميل جديد
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        معلومات الاتصال
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الشحنات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        البوابة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ التسجيل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client: any) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center">
                                <span className="text-gold-600 font-medium text-sm">
                                  {client.fullName?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {client.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {client.clientId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <Phone className="h-4 w-4 text-gray-400 ml-1" />
                              {client.phone}
                            </div>
                            <div className="flex items-center mb-1">
                              <Mail className="h-4 w-4 text-gray-400 ml-1" />
                              {client.email}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 ml-1" />
                              {client.city}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-gray-400 ml-1" />
                              <span className="text-sm text-gray-900">
                                {client.shipmentsCount || 0}
                              </span>
                            </div>
                            <Link
                              href={`/admin/clients/${client.id}/shipments`}
                              className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                            >
                              عرض الشحنات
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {client.hasPortalAccess ? (
                              <>
                                <Shield className="h-4 w-4 text-green-500 ml-1" />
                                <div className="text-sm">
                                  <div className="text-green-800 font-medium">مفعل</div>
                                  {client.trackingNumber && (
                                    <div className="text-xs text-gray-500">
                                      {client.trackingNumber}
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <Key className="h-4 w-4 text-gray-400 ml-1" />
                                <span className="text-sm text-gray-500">غير مفعل</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {client.isActive ? (
                              <>
                                <UserCheck className="h-3 w-3 ml-1" />
                                نشط
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3 ml-1" />
                                غير نشط
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(client.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Link
                              href={`/admin/clients/${client.id}`}
                              className="text-gold-600 hover:text-gold-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/clients/${client.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(client)}
                              className={`${
                                client.isActive
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={client.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                            >
                              {client.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClient(client);
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
                          {Math.min(currentPage * pageSize, clientsData?.total || 0)}
                        </span>{' '}
                        من{' '}
                        <span className="font-medium">{clientsData?.total || 0}</span>{' '}
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                حذف العميل
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  هل أنت متأكد من حذف العميل &quot;{selectedClient?.fullName}&quot;؟
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleDeleteClient}
                  disabled={deleteClientMutation.isLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteClientMutation.isLoading ? 'جاري الحذف...' : 'حذف'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedClient(null);
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

export default withAuth(ClientsPage);
