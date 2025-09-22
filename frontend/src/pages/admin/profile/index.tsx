import { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/lib/auth';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Save,
  Camera,
  Edit3
} from 'lucide-react';

const ProfilePage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    bio: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    // Handle save profile
    console.log('Saving profile:', profile);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Handle password change
    console.log('Changing password');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordForm(false);
  };

  return (
    <AdminLayout title="الملف الشخصي">
      <Head>
        <title>الملف الشخصي - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
            <p className="text-gray-600 mt-1">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.fullName}</h3>
                <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'admin' 
                    ? 'bg-gold-100 text-gold-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user?.role === 'admin' ? 'مدير' : 'مشغل'}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  انضم في {new Date().toLocaleDateString('ar-SA')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">المعلومات الشخصية</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gold-600 hover:text-gold-700 flex items-center text-sm font-medium"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  {isEditing ? 'إلغاء' : 'تعديل'}
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.phone || 'غير محدد'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.address || 'غير محدد'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نبذة شخصية
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        placeholder="اكتب نبذة مختصرة عنك..."
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.bio || 'لم يتم إضافة نبذة شخصية'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex items-center justify-end space-x-3 space-x-reverse">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      حفظ التغييرات
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">تغيير كلمة المرور</h3>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-gold-600 hover:text-gold-700 flex items-center text-sm font-medium"
                >
                  <Key className="h-4 w-4 mr-1" />
                  {showPasswordForm ? 'إلغاء' : 'تغيير كلمة المرور'}
                </button>
              </div>

              {showPasswordForm && (
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور الحالية
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end space-x-3 space-x-reverse">
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors flex items-center"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      تغيير كلمة المرور
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;
