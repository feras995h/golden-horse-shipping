import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'react-query';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Calendar,
  Tag,
  Link as LinkIcon,
  Users,
  Save,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { adsAPI } from '@/lib/api';

interface AdFormData {
  title: string;
  description: string;
  imageFile: File | null;
  link: string;
  startDate: string;
  endDate: string;
  targetAudience: string;
  tags: string[];
  isActive: boolean;
}

const EditAdPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    description: '',
    imageFile: null,
    link: '',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    tags: [],
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Fetch ad data
  const { data: ad, isLoading } = useQuery(
    ['ad', id],
    async () => {
      const response = await adsAPI.getById(id as string);
      return response.data;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          imageFile: null,
          link: data.link || '',
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '',
          targetAudience: data.targetAudience || 'all',
          tags: data.tags || [],
          isActive: data.isActive ?? true,
        });
        
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      }
    }
  );

  // Update ad mutation
  const updateMutation = useMutation(
    (data: FormData) => adsAPI.update(id as string, data),
    {
      onSuccess: () => {
        router.push('/admin/ads');
      },
      onError: (error: any) => {
        setErrors(error.response?.data?.errors || { general: 'حدث خطأ أثناء تحديث الإعلان' });
      },
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setImagePreview(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الإعلان مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف الإعلان مطلوب';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'تاريخ البداية مطلوب';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية مطلوب';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('link', formData.link);
    submitData.append('startDate', formData.startDate);
    submitData.append('endDate', formData.endDate);
    submitData.append('targetAudience', formData.targetAudience);
    submitData.append('tags', JSON.stringify(formData.tags));
    submitData.append('isActive', formData.isActive.toString());
    
    if (formData.imageFile) {
      submitData.append('image', formData.imageFile);
    }

    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <AdminLayout title="تحرير الإعلان">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تحرير الإعلان">
      <Head>
        <title>تحرير الإعلان - {ad?.title} - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تحرير الإعلان</h1>
            <p className="text-gray-600">{ad?.title}</p>
          </div>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 ml-3" />
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              المعلومات الأساسية
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الإعلان *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`input-field ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="أدخل عنوان الإعلان"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الإعلان *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                  placeholder="أدخل وصف تفصيلي للإعلان"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الإعلان
                </label>
                <div className="relative">
                  <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="input-field pr-10"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 space-x-reverse bg-white rounded-xl shadow-sm p-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="btn-primary flex items-center"
            >
              {updateMutation.isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </form>
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

export default withAuth(EditAdPage);
