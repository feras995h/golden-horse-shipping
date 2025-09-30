import React, { useState, useRef } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
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
  Server,
  ImageIcon,
  X
} from 'lucide-react';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { settingsAPI } from '@/lib/api';

const SettingsPage = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Logo upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Logo upload handlers
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'يرجى اختيار ملف صورة صالح (SVG, PNG, JPG)' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'حجم الملف يجب أن يكون أقل من 2 ميجابايت' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('logo', logoFile);
      uploadFormData.append('logoAlt', formData.logoAlt?.value || 'شعار الموقع');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('فشل في رفع الشعار');
      }

      const result = await response.json();
      
      // Refresh settings
      queryClient.invalidateQueries('settings');
      
      // Clear form
      clearLogo();
      
      setMessage({ type: 'success', text: 'تم رفع الشعار بنجاح' });
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'حدث خطأ في رفع الشعار' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

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
                
                {/* Logo Upload Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    إدارة الشعار
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Logo Display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الشعار الحالي
                      </label>
                      <div className="border border-gray-300 rounded-lg p-4 bg-white">
                        {settings?.logoUrl?.value ? (
                          <div className="flex flex-col items-center">
                            <div className="w-32 h-32 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
                              <Image
                                src={settings.logoUrl.value}
                                alt={settings.logoAlt?.value || 'الشعار الحالي'}
                                width={128}
                                height={128}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">الشعار الحالي</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                            <ImageIcon className="h-12 w-12 mb-2" />
                            <p className="text-sm">لا يوجد شعار</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رفع شعار جديد
                      </label>
                      <div className="space-y-4">
                        {/* File Input */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold-400 transition-colors">
                          {logoPreview ? (
                            <div className="relative">
                              <div className="w-32 h-32 mx-auto flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
                                <Image
                                  src={logoPreview}
                                  alt="معاينة الشعار"
                                  width={128}
                                  height={128}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <button
                                onClick={clearLogo}
                                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <p className="text-sm text-gray-600 mt-2">معاينة الشعار الجديد</p>
                            </div>
                          ) : (
                            <div>
                              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                              <p className="text-sm text-gray-600 mb-2">اختر ملف الشعار</p>
                              <p className="text-xs text-gray-500">SVG, PNG, JPG (حد أقصى 2MB)</p>
                            </div>
                          )}
                          
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                            onChange={handleLogoSelect}
                            className="hidden"
                          />
                          
                          {!logoPreview && (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-4 bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors"
                            >
                              اختيار ملف
                            </button>
                          )}
                        </div>

                        {/* Upload Button */}
                        {logoFile && (
                          <button
                            onClick={handleLogoUpload}
                            disabled={isUploading}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isUploading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                جاري الرفع...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                رفع الشعار
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other General Settings */}
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

        {/* Message Display */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
