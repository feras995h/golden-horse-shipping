import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Save,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { usersAPI } from '@/lib/api';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: 'admin' | 'operator';
  isActive: boolean;
}

const NewUserPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'operator',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Create user mutation
  const createUserMutation = useMutation(
    (data: Omit<UserFormData, 'confirmPassword'>) => usersAPI.create(data),
    {
      onSuccess: (response) => {
        router.push(`/admin/users/${response.data.id}`);
      },
      onError: (error: any) => {
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        }
      },
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب';
    } else if (formData.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmPassword, ...submitData } = formData;
      createUserMutation.mutate(submitData);
    }
  };

  return (
    <AdminLayout title="مستخدم جديد">
      <Head>
        <title>مستخدم جديد - {t('site.title')}</title>
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
            <h1 className="text-2xl font-bold text-gray-900">إنشاء مستخدم جديد</h1>
            <p className="text-gray-600">أدخل تفاصيل المستخدم الجديد</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 ml-2 text-gold-600" />
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`input-field ${errors.username ? 'border-red-300' : ''}`}
                  placeholder="أدخل اسم المستخدم"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`input-field ${errors.fullName ? 'border-red-300' : ''}`}
                  placeholder="أدخل الاسم الكامل"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field pr-10 ${errors.email ? 'border-red-300' : ''}`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور *
                </label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field pr-10"
                  >
                    <option value="operator">مشغل</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Lock className="h-5 w-5 ml-2 text-gold-600" />
              معلومات الأمان
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`input-field pr-10 pl-10 ${errors.password ? 'border-red-300' : ''}`}
                    placeholder="أدخل كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`input-field pr-10 pl-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-gold-600 shadow-sm focus:border-gold-300 focus:ring focus:ring-gold-200 focus:ring-opacity-50"
                />
                <span className="mr-2 text-sm text-gray-700">المستخدم نشط</span>
              </label>
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
              disabled={createUserMutation.isLoading}
              className="btn-primary flex items-center"
            >
              {createUserMutation.isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 ml-2" />
                  حفظ المستخدم
                </>
              )}
            </button>
          </div>
        </form>
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

export default withAuth(NewUserPage);
