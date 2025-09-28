import { useState, useEffect, useCallback } from 'react';
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

  const fetchProfile = useCallback(async () => {
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
  }, [router]);

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
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 shadow-lg"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/20 to-indigo-600/20 animate-pulse"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <div className="p-6 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl shadow-lg shadow-red-200/50 w-fit mx-auto mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto drop-shadow-sm" />
          </div>
          <p className="text-red-600 mb-6 text-lg font-medium">{error}</p>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-105 font-medium"
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
        <div className="text-center py-16">
          <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg shadow-gray-200/50 w-fit mx-auto mb-6">
            <User className="h-16 w-16 text-gray-400 mx-auto drop-shadow-sm" />
          </div>
          <p className="text-gray-600 text-lg font-medium">لا توجد بيانات متاحة</p>
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
        <div className="relative p-8 bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-indigo-200/50 border border-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-indigo-800/5 rounded-2xl"></div>
          <div className="relative text-center">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200/50">
                <User className="h-14 w-14 text-white drop-shadow-sm" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent mb-2 drop-shadow-sm">{profile.customerName}</h1>
            <p className="text-indigo-600 font-medium">رقم التتبع: {profile.trackingNumber}</p>
          </div>
        </div>

        {/* Account Status */}
        <div className="relative p-6 bg-gradient-to-br from-purple-50/80 to-purple-100/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-purple-200/50 border border-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-purple-800/5 rounded-2xl"></div>
          <div className="relative">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-6 flex items-center">
              <Shield className="h-6 w-6 text-purple-600 mr-3" />
              حالة الحساب
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {profile.isActive ? (
                  <>
                    <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-full mr-4">
                      <CheckCircle className="h-6 w-6 text-green-600 drop-shadow-sm" />
                    </div>
                    <span className="text-green-700 font-semibold text-lg">الحساب نشط</span>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-full mr-4">
                      <AlertCircle className="h-6 w-6 text-red-600 drop-shadow-sm" />
                    </div>
                    <span className="text-red-700 font-semibold text-lg">الحساب غير نشط</span>
                  </>
                )}
              </div>
              <div className="flex items-center text-purple-600 font-medium">
                <Shield className="h-5 w-5 mr-2" />
                محمي بكلمة مرور
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="relative p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-200/50 border border-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-800/5 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-3" />
                المعلومات الشخصية
              </h2>
              <button
                onClick={() => setShowChangePassword(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-lg shadow-gold-200/50 hover:shadow-xl hover:shadow-gold-300/50 hover:scale-105 font-medium text-sm"
              >
                <Lock className="h-4 w-4 mr-2" />
                تغيير كلمة المرور
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-xl border border-blue-200/30">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mr-4">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">الاسم الكامل</p>
                  <p className="font-semibold text-blue-900">{profile.customerName}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-xl border border-blue-200/30">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mr-4">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">البريد الإلكتروني</p>
                  <p className="font-semibold text-blue-900">{profile.customerEmail}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-xl border border-blue-200/30">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mr-4">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">رقم الهاتف</p>
                  <p className="font-semibold text-blue-900">{profile.customerPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Activity */}
        <div className="relative p-6 bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-green-200/50 border border-green-200/50 hover:shadow-xl hover:shadow-green-300/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-800/5 rounded-2xl"></div>
          <div className="relative">
            <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent mb-6 flex items-center">
              <Calendar className="h-6 w-6 text-green-600 mr-3" />
              نشاط الحساب
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-green-100/50 rounded-xl border border-green-200/30">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-full mr-4">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">تاريخ إنشاء الحساب</p>
                    <p className="font-semibold text-green-900">
                      {new Date(profile.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-green-100/50 rounded-xl border border-green-200/30">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-full mr-4">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">آخر تسجيل دخول</p>
                    <p className="font-semibold text-green-900">
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
        </div>

        {/* Security Information */}
        <div className="relative p-6 bg-gradient-to-br from-orange-50/80 to-orange-100/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-orange-200/50 border border-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-orange-800/5 rounded-2xl"></div>
          <div className="relative">
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent mb-6 flex items-center">
              <Shield className="h-6 w-6 text-orange-600 mr-3" />
              معلومات الأمان
            </h2>
            <div className="space-y-6">
              <div className="relative p-6 bg-gradient-to-br from-orange-100/50 to-orange-200/50 border border-orange-300/30 rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-600/10 rounded-xl"></div>
                <div className="relative flex items-start">
                  <div className="p-2 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-orange-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900 mb-2 text-lg">حماية الحساب</h3>
                    <p className="text-orange-800 font-medium">
                      حسابك محمي برقم التتبع وكلمة مرور. لا تشارك هذه المعلومات مع أي شخص آخر.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative p-6 bg-gradient-to-br from-orange-100/50 to-orange-200/50 border border-orange-300/30 rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-600/10 rounded-xl"></div>
                <div className="relative flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="p-2 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full mr-4">
                      <Lock className="h-6 w-6 text-orange-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-orange-900 mb-2 text-lg">تغيير كلمة المرور</h3>
                      <p className="text-orange-800 font-medium">
                        يمكنك تغيير كلمة المرور الخاصة بك في أي وقت.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 hover:scale-105 font-semibold"
                  >
                    تغيير كلمة المرور
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="relative p-6 bg-gradient-to-br from-teal-50/80 to-teal-100/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-teal-200/50 border border-teal-200/50 hover:shadow-xl hover:shadow-teal-300/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600/5 to-teal-800/5 rounded-2xl"></div>
          <div className="relative">
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent mb-6 flex items-center">
              <Phone className="h-6 w-6 text-teal-600 mr-3" />
              الدعم والمساعدة
            </h2>
            <div className="space-y-4">
              <p className="text-teal-800 font-medium text-lg">
                إذا كان لديك أي استفسارات أو تحتاج إلى مساعدة، يمكنك التواصل معنا:
              </p>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gradient-to-r from-teal-50/50 to-teal-100/50 rounded-xl border border-teal-200/30">
                  <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full mr-4">
                    <Phone className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="font-semibold text-teal-900">+218 91 234 5678</span>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-teal-50/50 to-teal-100/50 rounded-xl border border-teal-200/30">
                  <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full mr-4">
                    <Mail className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="font-semibold text-teal-900">support@goldenhorseshipping.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="relative p-8 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full mr-3">
                      <Lock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">تغيير كلمة المرور</h3>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* General Error */}
                  {passwordErrors.general && (
                    <div className="relative p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200/50 rounded-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-600/10 rounded-xl"></div>
                      <div className="relative flex items-center">
                        <div className="p-1 bg-gradient-to-br from-red-100 to-red-200 rounded-full mr-3">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <p className="text-red-800 font-medium">{passwordErrors.general}</p>
                      </div>
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      كلمة المرور الحالية *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 pr-12 bg-gradient-to-r from-gray-50 to-gray-100 border-2 ${passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-medium`}
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200"
                      >
                        {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      كلمة المرور الجديدة *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 pr-12 bg-gradient-to-r from-gray-50 to-gray-100 border-2 ${passwordErrors.newPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-medium`}
                        placeholder="أدخل كلمة المرور الجديدة"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200"
                      >
                        {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{passwordErrors.newPassword}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                      يجب أن تكون كلمة المرور 6 أحرف على الأقل
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 pr-12 bg-gradient-to-r from-gray-50 to-gray-100 border-2 ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-medium`}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-xl border border-gray-300 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          جاري التغيير...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          تغيير كلمة المرور
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
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
