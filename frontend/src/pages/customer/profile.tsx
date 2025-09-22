import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CustomerLayout from '@/components/Customer/CustomerLayout';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import axios from 'axios';

interface CustomerProfile {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

const CustomerProfile = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }

      const response = await axios.get('/api/customer-portal/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
    } catch (error: any) {
      console.error('Profile error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        router.push('/customer/login');
      } else {
        setError('فشل في تحميل بيانات الملف الشخصي');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    try {
      setIsChangingPassword(true);
      const token = localStorage.getItem('customerToken');
      
      await axios.patch('/api/customer-portal/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reset form and close modal
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      setShowChangePassword(false);
      
      // Show success message (you can add a toast notification here)
      alert('تم تغيير كلمة المرور بنجاح');
      
    } catch (error: any) {
      console.error('Password change error:', error);
      if (error.response?.data?.message) {
        setPasswordErrors({ general: error.response.data.message });
      } else {
        setPasswordErrors({ general: 'فشل في تغيير كلمة المرور' });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </CustomerLayout>
    );
  }

  if (!profile) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">لا توجد بيانات متاحة</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Head>
        <title>الملف الشخصي - {profile.customerName}</title>
        <meta name="description" content="الملف الشخصي للعميل" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.customerName}</h1>
          <p className="text-gray-600">رقم التتبع: {profile.trackingNumber}</p>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">حالة الحساب</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {profile.isActive ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-700 font-medium">الحساب نشط</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-red-700 font-medium">الحساب غير نشط</span>
                </>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Shield className="h-4 w-4 mr-2" />
              محمي بكلمة مرور
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الشخصية</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">الاسم الكامل</p>
                <p className="font-medium">{profile.customerName}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-medium">{profile.customerEmail}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">رقم الهاتف</p>
                <p className="font-medium">{profile.customerPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">نشاط الحساب</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">تاريخ إنشاء الحساب</p>
                  <p className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">آخر تسجيل دخول</p>
                  <p className="font-medium">
                    {profile.lastLogin 
                      ? new Date(profile.lastLogin).toLocaleString('ar-SA')
                      : 'لم يتم تسجيل الدخول من قبل'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الأمان</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">حماية الحساب</h3>
                  <p className="text-blue-800 text-sm">
                    حسابك محمي برقم التتبع وكلمة مرور. لا تشارك هذه المعلومات مع أي شخص آخر.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">تغيير كلمة المرور</h3>
                    <p className="text-blue-800 text-sm">
                      يمكنك تغيير كلمة المرور الخاصة بك في أي وقت.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  تغيير كلمة المرور
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الدعم والمساعدة</h2>
          <div className="space-y-3">
            <p className="text-gray-600">
              إذا كان لديك أي استفسارات أو تحتاج إلى مساعدة، يمكنك التواصل معنا:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span>+218 91 234 5678</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span>support@goldenhorseshipping.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">تغيير كلمة المرور</h3>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* General Error */}
                {passwordErrors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <p className="text-red-800 text-sm">{passwordErrors.general}</p>
                    </div>
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور الحالية *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className={`input-field pr-10 ${passwordErrors.currentPassword ? 'border-red-300' : ''}`}
                      placeholder="أدخل كلمة المرور الحالية"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور الجديدة *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className={`input-field pr-10 ${passwordErrors.newPassword ? 'border-red-300' : ''}`}
                      placeholder="أدخل كلمة المرور الجديدة"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    يجب أن تكون كلمة المرور 6 أحرف على الأقل
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تأكيد كلمة المرور الجديدة *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`input-field pr-10 ${passwordErrors.confirmPassword ? 'border-red-300' : ''}`}
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="loading-spinner mr-2" />
                        جاري التغيير...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        تغيير كلمة المرور
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default CustomerProfile;
