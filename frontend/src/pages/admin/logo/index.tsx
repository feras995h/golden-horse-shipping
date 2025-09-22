import React, { useState, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Upload,
  Save,
  RefreshCw,
  ImageIcon,
  AlertCircle,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';

import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { settingsAPI } from '@/lib/api';

interface LogoSettings {
  logoUrl?: string;
  logoAlt?: string;
  faviconUrl?: string;
}

const LogoManagementPage = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoAlt, setLogoAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery(
    'settings',
    () => settingsAPI.getAll(),
    {
      select: (res) => res.data,
      onSuccess: (data) => {
        setLogoAlt(data.logoAlt?.value || 'شعار الشركة');
      }
    }
  );

  // Update settings mutation
  const updateMutation = useMutation(
    (data: any) => settingsAPI.update(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settings');
        setLogoFile(null);
        setFaviconFile(null);
        setLogoPreview(null);
        setFaviconPreview(null);
        setIsUploading(false);
      },
      onError: () => {
        setIsUploading(false);
      }
    }
  );

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for favicon
        alert('حجم الملف كبير جداً. الحد الأقصى 1 ميجابايت للأيقونة');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }

      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }
      
      formData.append('logoAlt', logoAlt);

      // For now, we'll simulate the upload and save the alt text
      // In a real implementation, you'd upload to a file storage service
      const updateData: any = {};
      
      if (logoAlt !== settings?.logoAlt?.value) {
        updateData.logoAlt = logoAlt;
      }

      if (Object.keys(updateData).length > 0) {
        await updateMutation.mutateAsync(updateData);
      } else {
        setIsUploading(false);
      }
      
    } catch (error) {
      console.error('Error saving logo:', error);
      setIsUploading(false);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview(null);
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="إدارة الشعار">
        <div className="flex items-center justify-center min-h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-gold-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إدارة الشعار">
      <Head>
        <title>إدارة الشعار - لوحة التحكم</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <ImageIcon className="h-8 w-8 text-gold-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة الشعار</h1>
              <p className="text-gray-600">قم بتحديث شعار الموقع والأيقونة المفضلة</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Logo */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الشعار الحالي</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image
                  src="/images/logo.svg"
                  alt="الشعار الحالي"
                  width={128}
                  height={128}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="text-sm text-gray-600">الشعار الحالي</p>
            </div>
          </div>

          {/* Upload New Logo */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">رفع شعار جديد</h2>
            
            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشعار الرئيسي
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold-400 transition-colors">
                  {logoPreview ? (
                    <div className="relative">
                      <Image
                        src={logoPreview}
                        alt="معاينة الشعار"
                        width={200}
                        height={128}
                        className="max-w-full max-h-32 mx-auto object-contain"
                      />
                      <button
                        onClick={clearLogo}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">اسحب الملف هنا أو انقر للاختيار</p>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG حتى 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Logo Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  النص البديل للشعار
                </label>
                <input
                  type="text"
                  value={logoAlt}
                  onChange={(e) => setLogoAlt(e.target.value)}
                  placeholder="شعار الشركة"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Favicon Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الأيقونة المفضلة (Favicon)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأيقونة الحالية
              </label>
              <div className="border border-gray-300 rounded-lg p-4 text-center">
                <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600">16x16 px</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رفع أيقونة جديدة
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gold-400 transition-colors">
                {faviconPreview ? (
                  <div className="relative">
                    <Image
                      src={faviconPreview}
                      alt="معاينة الأيقونة"
                      width={32}
                      height={32}
                      className="w-8 h-8 mx-auto object-contain"
                    />
                    <button
                      onClick={clearFavicon}
                      className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">ICO, PNG حتى 1MB</p>
                  </div>
                )}
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*,.ico"
                  onChange={handleFaviconSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>سيتم تطبيق التغييرات على جميع صفحات الموقع</span>
            </div>
            
            <div className="flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              
              <button
                onClick={handleSave}
                disabled={isUploading || (!logoFile && !faviconFile && logoAlt === settings?.logoAlt?.value)}
                className="px-6 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rtl:space-x-reverse transition-colors"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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

export default withAuth(LogoManagementPage, 'admin');
