import { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import { Lock, User, AlertCircle, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import axios from 'axios';

const CustomerLogin = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerNumber: '',
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
      const response = await axios.post('/api/customer-auth/login-customer-number', {
        customerNumber: formData.customerNumber.toUpperCase(),
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
        'فشل في تسجيل الدخول. يرجى التحقق من رقم العميل وكلمة المرور.'
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

      {/* Background with animated elements */}
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-gold-400/30" />
            </div>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header Section */}
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300 mb-8">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4">
                {t('customer.login.title')}
              </h2>
              <p className="text-blue-100/80 text-lg">
                {t('customer.login.subtitle')}
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4 animate-shake">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-300 mr-3" />
                      <p className="text-red-100 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Customer Number Field */}
                  <div className="group">
                    <label htmlFor="customerNumber" className="block text-sm font-medium text-blue-100 mb-3">
                      {t('customer.login.customerNumber')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
                        <User className="h-5 w-5 text-gold-400 group-focus-within:text-gold-300 transition-colors" />
                      </div>
                      <input
                        id="customerNumber"
                        name="customerNumber"
                        type="text"
                        required
                        value={formData.customerNumber}
                        onChange={handleInputChange}
                        autoComplete="username"
                        className="w-full px-4 py-4 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:bg-white/15"
                        placeholder={t('customer.login.customerNumberPlaceholder')}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-3">
                      {t('customer.login.password')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
                        <Lock className="h-5 w-5 text-gold-400 group-focus-within:text-gold-300 transition-colors" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="current-password"
                        className="w-full px-4 py-4 pr-12 pl-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:bg-white/15"
                        placeholder={t('customer.login.passwordPlaceholder')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 left-0 pl-4 flex items-center z-10 hover:scale-110 transition-transform"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                        )}
                      </button>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    {isLoading ? (
                      <div className="flex items-center relative z-10">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {t('customer.login.loggingIn')}
                      </div>
                    ) : (
                      <span className="relative z-10">{t('customer.login.loginButton')}</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Additional Links */}
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <p className="text-blue-100/80 text-sm">
                    {t('customer.login.noAccount')}{' '}
                    <Link href="/contact" className="font-medium text-gold-400 hover:text-gold-300 transition-colors hover:underline">
                      {t('customer.login.contactUs')}
                    </Link>
                  </p>
                </div>

                <div className="text-center">
                  <Link 
                    href="/tracking" 
                    className="inline-flex items-center text-sm text-blue-300 hover:text-white transition-colors hover:underline"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('customer.login.trackWithoutLogin')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Shield className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-sm text-blue-100/80">{t('customer.login.sslProtected')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
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
