import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  Shield,
  User,
  MoreVertical
} from 'lucide-react';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { usersAPI } from '@/lib/api';

const UsersPage = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery(
    ['users', currentPage, pageSize, searchTerm, roleFilter, statusFilter],
    async () => {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
      };
      const response = await usersAPI.getAll(params);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (userId: string) => usersAPI.delete(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setShowDeleteModal(false);
        setSelectedUser(null);
      },
    }
  );

  // Toggle user status mutation
  const toggleStatusMutation = useMutation(
    (userId: string) => usersAPI.toggleStatus(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleToggleStatus = (userId: string) => {
    toggleStatusMutation.mutate(userId);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'مدير', color: 'bg-red-100 text-red-800', icon: Shield },
      operator: { label: 'مشغل', color: 'bg-blue-100 text-blue-800', icon: User },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.operator;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 ml-1" />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 ml-1" />
        نشط
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <UserX className="h-3 w-3 ml-1" />
        غير نشط
      </span>
    );
  };

  return (
    <AdminLayout title="إدارة المستخدمين">
      <Head>
        <title>إدارة المستخدمين - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Users className="h-8 w-8 text-gold-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
              <p className="text-gray-600">
                إجمالي المستخدمين: {usersData?.total || 0}
              </p>
            </div>
          </div>
          <Link
            href="/admin/users/new"
            className="btn-primary flex items-center mt-4 sm:mt-0"
          >
            <Plus className="h-5 w-5 ml-2" />
            مستخدم جديد
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-10"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">جميع الأدوار</option>
              <option value="admin">مدير</option>
              <option value="operator">مشغل</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="btn-secondary flex items-center justify-center"
            >
              <Filter className="h-5 w-5 ml-2" />
              إعادة تعيين
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-600">
              حدث خطأ في تحميل البيانات
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      آخر دخول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersData?.users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center">
                              <span className="text-gold-600 font-medium text-sm">
                                {user.fullName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.username} • {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-SA') : 'لم يسجل دخول'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-gold-600 hover:text-gold-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
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
          )}
        </div>

        {/* Pagination */}
        {usersData && usersData.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl shadow-sm">
            <div className="text-sm text-gray-700">
              عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, usersData.total)} من {usersData.total} نتيجة
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <span className="text-sm text-gray-700">
                صفحة {currentPage} من {usersData.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, usersData.totalPages))}
                disabled={currentPage === usersData.totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">حذف المستخدم</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  هل أنت متأكد من حذف المستخدم &quot;{selectedUser?.fullName}&quot;؟
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-4 space-x-reverse mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteUserMutation.isLoading}
                  className="btn-danger flex items-center"
                >
                  {deleteUserMutation.isLoading ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      جاري الحذف...
                    </>
                  ) : (
                    'حذف'
                  )}
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

export default withAuth(UsersPage);
