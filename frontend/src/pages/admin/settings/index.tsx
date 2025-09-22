import React, { useState } from 'react';
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

const SettingsPage = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch settings
  const { data: settings, isLoading } = useQuery(
    'settings',
    async () => {
      const response = await settingsAPI.getAll();
      return response.data;
    }
  );

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

  // Local form state
  const [formData, setFormData] = useState<any>({});

  // Update form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const handleSave = () => {
    const updateData: any = {};
    Object.keys(formData).forEach(key => {
      updateData[key] = formData[key].value;
    });
    updateSettingsMutation.mutate(updateData);
  };

  const handleReset = () => {
    if (settings) {
      setFormData(settings);
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
              onClick={handleReset}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة تعيين
            </button>
            <button
              onClick={handleSave}
              className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              حفظ التغييرات
            </button>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 space-x-reverse px-6">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-gold-500 text-gold-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
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
                      value={formData.siteName?.value || ''}
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
                      value={formData.contactEmail?.value || ''}
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
                      value={formData.phoneNumber?.value || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العملة
                    </label>
                    <select
                      value={formData.currency?.value || ''}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    >
                      <option value="LYD">دينار ليبي (LYD)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="EUR">يورو (EUR)</option>
                      <option value="CNY">يوان صيني (CNY)</option>
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف الموقع
                    </label>
                    <textarea
                      value={formData.siteDescription?.value || ''}
                      onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">إعدادات الإشعارات</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">إشعارات البريد الإلكتروني</h4>
                      <p className="text-sm text-gray-500">تلقي إشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications?.value === 'true' || formData.emailNotifications?.value === true}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">إشعارات الرسائل النصية</h4>
                      <p className="text-sm text-gray-500">تلقي إشعارات عبر الرسائل النصية</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.smsNotifications?.value === 'true' || formData.smsNotifications?.value === true}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">إعدادات الأمان</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">تمكين التسجيل</h4>
                      <p className="text-sm text-gray-500">السماح للمستخدمين الجدد بالتسجيل</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.registrationEnabled?.value === 'true' || formData.registrationEnabled?.value === true}
                        onChange={(e) => handleInputChange('registrationEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">إعدادات النظام</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">وضع الصيانة</h4>
                      <p className="text-sm text-gray-500">تعطيل الوصول للموقع مؤقتاً</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.maintenanceMode?.value === 'true' || formData.maintenanceMode?.value === true}
                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">النسخ الاحتياطي التلقائي</h4>
                      <p className="text-sm text-gray-500">إنشاء نسخ احتياطية تلقائية من البيانات</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoBackup?.value === 'true' || formData.autoBackup?.value === true}
                        onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
