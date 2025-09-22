import { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const CustomerLogin = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formData, setFormData] = useState({
    trackingNumber: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/customer-auth/login', {
        trackingNumber: formData.trackingNumber.toUpperCase(),
        password: formData.password,
      });

      // Store token and customer data
      localStorage.setItem('customerToken', response.data.access_token);
      localStorage.setItem('customerData', JSON.stringify(response.data.customer));

      // Redirect to customer dashboard
      router.push('/customer/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        'فشل في تسجيل الدخول. يرجى التحقق من رقم التتبع وكلمة المرور.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectAccess = () => {
    const token = router.query.token as string;
    if (token) {
      // Handle direct access token
      handleDirectAccessLogin(token);
    }
  };

  const handleDirectAccessLogin = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/customer-auth/direct-access', {
        token,
      });

      // Store token and customer data
      localStorage.setItem('customerToken', response.data.access_token);
      localStorage.setItem('customerData', JSON.stringify(response.data.customer));

      // Redirect to customer dashboard
      router.push('/customer/dashboard');
    } catch (error: any) {
      console.error('Direct access error:', error);
      setError('رابط الوصول المباشر غير صالح أو منتهي الصلاحية.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for direct access token on component mount
  useState(() => {
    if (router.query.token) {
      handleDirectAccess();
    }
  });

  return (
    <Layout>
      <Head>
        <title>تسجيل دخول العملاء - Golden Horse Shipping</title>
        <meta name="description" content="تسجيل دخول العملاء لمتابعة الشحنات" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gold-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gold-500 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              تسجيل دخول العملاء
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ادخل رقم التتبع وكلمة المرور للوصول إلى حسابك
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  رقم التتبع
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="trackingNumber"
                    name="trackingNumber"
                    type="text"
                    required
                    value={formData.trackingNumber}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm"
                    placeholder="مثال: MSKU4603728"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-3 py-3 pr-10 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm"
                    placeholder="ادخل كلمة المرور"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gold-600 hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                لا تملك حساب؟{' '}
                <Link href="/contact" className="font-medium text-gold-600 hover:text-gold-500">
                  تواصل معنا
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link href="/tracking" className="text-sm text-blue-600 hover:text-blue-500">
                تتبع الشحنة بدون تسجيل دخول
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default CustomerLogin;
