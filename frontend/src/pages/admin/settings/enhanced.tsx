import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  HardDrive,
  Server
} from 'lucide-react';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { settingsAPI } from '@/lib/api';

const EnhancedSettingsPage = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Fetch settings
  const { data: settings, isLoading } = useQuery(
    'settings',
    async () => {
      const response = await settingsAPI.getAll();
      return response.data;
    }
  );

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      const formValues: any = {};
      Object.keys(settings).forEach(key => {
        formValues[key] = settings[key].value;
      });
      setFormData(formValues);
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation(
    (data: any) => settingsAPI.update(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settings');
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
        setTimeout(() => setMessage(null), 3000);
      },
      onError: () => {
        setMessage({ type: 'error', text: 'حدث خطأ في حفظ الإعدادات' });
        setTimeout(() => setMessage(null), 3000);
      },
    }
  );

  // Create backup mutation
  const createBackupMutation = useMutation(
    () => settingsAPI.createBackup(),
    {
      onSuccess: () => {
        setMessage({ type: 'success', text: 'تم إنشاء النسخة الاحتياطية بنجاح' });
        setTimeout(() => setMessage(null), 3000);
      },
      onError: () => {
        setMessage({ type: 'error', text: 'حدث خطأ في إنشاء النسخة الاحتياطية' });
        setTimeout(() => setMessage(null), 3000);
      },
    }
  );

  // Fetch system info
  const { data: systemInfo } = useQuery(
    'system-info',
    async () => {
      const response = await settingsAPI.getSystemInfo();
      return response.data;
    }
  );

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleReset = () => {
    if (settings) {
      const formValues: any = {};
      Object.keys(settings).forEach(key => {
        formValues[key] = settings[key].value;
      });
      setFormData(formValues);
    }
  };

  const handleCreateBackup = () => {
    createBackupMutation.mutate();
  };

  const settingsTabs = [
    {
      id: 'general',
      name: 'عام',
      icon: Settings,
    },
    {
      id: 'notifications',
      name: 'الإشعارات',
      icon: Bell,
    },
    {
      id: 'security',
      name: 'الأمان',
      icon: Shield,
    },
    {
      id: 'system',
      name: 'النظام',
      icon: Database,
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout title="الإعدادات">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="الإعدادات">
      <Head>
        <title>الإعدادات - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
            <p className="text-gray-600 mt-1">إدارة إعدادات وتكوين النظام</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={handleCreateBackup}
              disabled={createBackupMutation.isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              نسخة احتياطية
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة تعيين
            </button>
            <button
              onClick={handleSave}
              disabled={updateSettingsMutation.isLoading}
              className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              حفظ التغييرات
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 ml-3" />
            ) : (
              <AlertCircle className="h-5 w-5 ml-3" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Settings Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 space-x-reverse px-6">
              {settingsTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-gold-500 text-gold-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 ml-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">الإعدادات العامة</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الموقع
                    </label>
                    <input
                      type="text"
                      value={formData.siteName || ''}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني للتواصل
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail || ''}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العملة الافتراضية
                    </label>
                    <select
                      value={formData.currency || 'SAR'}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    >
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="EUR">يورو (EUR)</option>
                      <option value="LYD">دينار ليبي (LYD)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">معلومات النظام</h3>
                {systemInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Server className="h-5 w-5 text-gray-600 ml-2" />
                        <h4 className="font-medium text-gray-900">معلومات الخادم</h4>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>إصدار Node.js: {systemInfo.nodeVersion}</p>
                        <p>المنصة: {systemInfo.platform}</p>
                        <p>المعمارية: {systemInfo.arch}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <HardDrive className="h-5 w-5 text-gray-600 ml-2" />
                        <h4 className="font-medium text-gray-900">استخدام الذاكرة</h4>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>المستخدمة: {Math.round(systemInfo.memoryUsage?.used / 1024 / 1024)} MB</p>
                        <p>الإجمالية: {Math.round(systemInfo.memoryUsage?.total / 1024 / 1024)} MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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

export default withAuth(EnhancedSettingsPage);
