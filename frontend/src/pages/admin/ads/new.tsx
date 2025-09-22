import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Calendar,
  Tag,
  Link as LinkIcon,
  Users,
  Save
} from 'lucide-react';
import Image from 'next/image';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
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

const NewAdPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
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

  // Create ad mutation
  const createMutation = useMutation(
    (data: FormData) => adsAPI.create(data),
    {
      onSuccess: () => {
        router.push('/admin/ads');
      },
      onError: (error: any) => {
        setErrors(error.response?.data?.errors || { general: 'حدث خطأ أثناء إنشاء الإعلان' });
      },
    }
  );

  const handleInputChange = (field: keyof AdFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'يجب أن يكون الملف صورة' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' }));
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous image errors
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setImagePreview(null);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الإعلان مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف الإعلان مطلوب';
    }

    if (!formData.imageFile) {
      newErrors.image = 'صورة الإعلان مطلوبة';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'تاريخ البداية مطلوب';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية مطلوب';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
    }

    if (formData.link && !isValidUrl(formData.link)) {
      newErrors.link = 'رابط غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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

    createMutation.mutate(submitData);
  };

  return (
    <AdminLayout title="إضافة إعلان جديد">
      <Head>
        <title>إضافة إعلان جديد - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إضافة إعلان جديد</h1>
            <p className="mt-1 text-sm text-gray-500">
              إنشاء إعلان جديد لعرضه للعملاء
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">المعلومات الأساسية</h2>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عنوان الإعلان *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="أدخل عنوان الإعلان"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وصف الإعلان *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="أدخل وصف الإعلان"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <LinkIcon className="w-4 h-4 inline mr-1" />
                      رابط الإعلان (اختياري)
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => handleInputChange('link', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.link ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://example.com"
                    />
                    {errors.link && (
                      <p className="mt-1 text-sm text-red-600">{errors.link}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">صورة الإعلان</h2>
                
                <div className="space-y-4">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              اختر صورة الإعلان
                            </span>
                            <span className="mt-1 block text-sm text-gray-500">
                              PNG, JPG, GIF حتى 5MB
                            </span>
                          </label>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            رفع صورة
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-full h-64 relative rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="معاينة الإعلان"
                          fill
                          sizes="100vw"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {errors.image && (
                    <p className="text-sm text-red-600">{errors.image}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <Tag className="w-5 h-5 inline mr-2" />
                  العلامات
                </h2>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="أضف علامة"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      إضافة
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="mr-2 text-amber-600 hover:text-amber-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publication Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">إعدادات النشر</h2>
                
                <div className="space-y-4">
                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
                      نشر الإعلان فوراً
                    </label>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      تاريخ البداية *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.startDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      تاريخ النهاية *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-4 h-4 inline mr-1" />
                      الجمهور المستهدف
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">جميع العملاء</option>
                      <option value="new">العملاء الجدد</option>
                      <option value="existing">العملاء الحاليين</option>
                      <option value="vip">العملاء المميزين</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={createMutation.isLoading}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createMutation.isLoading ? 'جاري الحفظ...' : 'حفظ الإعلان'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    إلغاء
                  </button>
                </div>
                
                {errors.general && (
                  <p className="mt-3 text-sm text-red-600">{errors.general}</p>
                )}
              </div>
            </div>
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

export default NewAdPage;
