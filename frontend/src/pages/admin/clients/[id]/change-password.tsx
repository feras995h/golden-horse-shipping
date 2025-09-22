import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation } from 'react-query';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { clientsAPI } from '@/lib/api';
import {
  User,
  Key,
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  AlertCircle
} from 'lucide-react';

const ChangePasswordPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch client data
  const { data: client, isLoading: clientLoading } = useQuery(
    ['client', id],
    () => clientsAPI.getClient(id as string),
    {
      enabled: !!id,
      onError: () => {
        router.push('/admin/clients');
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (data: any) => clientsAPI.changePassword(id as string, data),
    {
      onSuccess: () => {
        router.push(`/admin/clients/${id}`);
      },
      onError: (error: any) => {
        console.error('Error changing password:', error);
        setErrors({ general: 'فشل في تغيير كلمة المرور' });
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    changePasswordMutation.mutate({
      newPassword: passwordForm.newPassword
    });
  };

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  if (clientLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!client) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">العميل غير موجود</h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على العميل المطلوب</p>
          <Link
            href="/admin/clients"
            className="inline-flex items-center px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
          >
            العودة للعملاء
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>تغيير كلمة المرور - {client.fullName}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              href={`/admin/clients/${id}`}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تغيير كلمة المرور</h1>
              <p className="text-gray-600">للعامل: {client.fullName}</p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="p-3 bg-gold-100 rounded-lg">
              <User className="h-6 w-6 text-gold-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{client.fullName}</h3>
              <p className="text-gray-600">{client.email}</p>
              {client.trackingNumber && (
                <p className="text-sm text-gold-600">رقم التتبع: {client.trackingNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">تغيير كلمة المرور</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handleInputChange}
                  className={`input-field pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handleInputChange}
                  className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 space-x-reverse">
              <Link
                href={`/admin/clients/${id}`}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={changePasswordMutation.isLoading}
                className="inline-flex items-center px-6 py-2 bg-gold-600 text-white text-sm font-medium rounded-lg hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {changePasswordMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    حفظ كلمة المرور
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Key className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">ملاحظة أمنية</h3>
              <p className="text-sm text-blue-700">
                تأكد من أن كلمة المرور الجديدة قوية وآمنة. سيتم تسجيل خروج العميل من جميع الأجهزة عند تغيير كلمة المرور.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChangePasswordPage;
