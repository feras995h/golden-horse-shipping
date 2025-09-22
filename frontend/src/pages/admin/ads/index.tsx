import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  Calendar,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';

import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { adsAPI } from '@/lib/api';


interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl?: string | null;
  status: 'active' | 'inactive' | 'expired';
  startDate: string | null;
  endDate: string | null;
  clickCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const AdsManagementPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch ads
  const { data: ads = [], isLoading } = useQuery<any, any, Ad[]>(
    ['ads', searchQuery, statusFilter],
    () => adsAPI.getAll({ search: searchQuery, status: statusFilter }),
    {
      select: (res) => {
        const items = res?.data?.ads || [];
        return items.map((ad: any) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          imageUrl: ad.imageUrl ?? null,
          linkUrl: ad.linkUrl ?? null,
          status: ad.status,
          startDate: ad.startDate ?? null,
          endDate: ad.endDate ?? null,
          clickCount: ad.clickCount ?? 0,
          viewCount: ad.viewCount ?? 0,
          tags: ad.tags ? String(ad.tags).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          createdAt: ad.createdAt,
          updatedAt: ad.updatedAt,
        }));
      },
      refetchInterval: 30000,
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id: string) => adsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ads']);
        setShowDeleteModal(false);
        setSelectedAd(null);
      },
    }
  );

  // Toggle active status mutation
  const toggleStatusMutation = useMutation(
    ({ id, status }: { id: string; status: 'active' | 'inactive' | 'expired' }) =>
      adsAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ads']);
      },
    }
  );

  const handleDelete = () => {
    if (selectedAd) {
      deleteMutation.mutate(selectedAd.id);
    }
  };

  const handleToggleStatus = (ad: Ad) => {
    const nextStatus: 'active' | 'inactive' = ad.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id: ad.id, status: nextStatus });
  };

  const getStatusColor = (status: 'active' | 'inactive' | 'expired') => {
    if (status === 'active') return 'text-green-600 bg-green-100';
    if (status === 'inactive') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString?: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString('ar-EG') : '—';
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  return (
    <AdminLayout title={t('admin.ads')}>
      <Head>
        <title>{t('admin.ads')} - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.ads')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              إدارة الإعلانات والعروض الترويجية
            </p>
          </div>
          <Link
            href="/admin/ads/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة إعلان جديد
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البحث
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="عنوان الإعلان أو الوصف"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">جميع الإعلانات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="expired">منتهي الصلاحية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ads Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white shadow rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))
          ) : !ads || ads.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد إعلانات</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإنشاء إعلان جديد لعرضه للعملاء
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/ads/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة إعلان جديد
                </Link>
              </div>
            </div>
          ) : (
            (ads || []).map((ad: Ad) => (
              <div key={ad.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Ad Image */}
                <div className="relative h-48 bg-gray-200">
                  {ad.imageUrl ? (
                    <Image
                      src={ad.imageUrl}
                      alt={ad.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          نشط
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          غير نشط
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Ad Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{ad.title}</h3>
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ad.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{ad.clickCount}</div>
                      <div className="text-xs text-gray-500">نقرات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{calculateCTR(ad.clickCount, ad.viewCount)}%</div>
                      <div className="text-xs text-gray-500">معدل النقر</div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</span>
                  </div>

                  {/* Tags */}
                  {ad.tags && ad.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {ad.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                      {ad.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{ad.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => router.push(`/admin/ads/${ad.id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        عرض
                      </button>
                      <button
                        onClick={() => router.push(`/admin/ads/${ad.id}/edit`)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        تعديل
                      </button>
                    </div>

                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleToggleStatus(ad)}
                        disabled={toggleStatusMutation.isLoading}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          ad.status === 'active'
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        } disabled:opacity-50`}
                      >
                        {ad.status === 'active' ? 'إيقاف' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAd(ad);
                          setShowDeleteModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedAd && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  حذف الإعلان
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    هل أنت متأكد من حذف الإعلان &quot;{selectedAd.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 space-x-reverse px-4 py-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isLoading}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {deleteMutation.isLoading ? 'جاري الحذف...' : 'حذف'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default AdsManagementPage;
