import { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { clientsAPI } from '@/lib/api';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Building, FileText, Lock, Eye, EyeOff, Shield } from 'lucide-react';

const NewClientPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Libya',
    company: '',
    nationalId: '',
    passportNumber: '',
    notes: '',
    isActive: true,
    hasPortalAccess: false,
    trackingNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Create client mutation
  const createClientMutation = useMutation(
    (data: any) => clientsAPI.create(data),
    {
      onSuccess: (response) => {
        router.push(`/admin/clients/${response.data.id}`);
      },
      onError: (error: any) => {
        console.error('Client creation error:', error);
        
        if (error.response?.status === 409) {
          // Handle 409 Conflict errors specifically
          const message = error.response?.data?.message || '';
          if (message.includes('email')) {
            setErrors({ email: 'عميل بهذا البريد الإلكتروني موجود بالفعل' });
          } else if (message.includes('tracking') || message.includes('trackingNumber')) {
            setErrors({ trackingNumber: 'عميل برقم التتبع هذا موجود بالفعل' });
          } else {
            setErrors({ general: 'عميل بهذه البيانات موجود بالفعل. يرجى التحقق من البريد الإلكتروني أو رقم التتبع.' });
          }
        } else if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'حدث خطأ أثناء إنشاء العميل. يرجى المحاولة مرة أخرى.' });
        }
      },
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }

    // Portal access validation
    if (formData.hasPortalAccess) {
      if (formData.trackingNumber && formData.trackingNumber.length < 5) {
        newErrors.trackingNumber = 'رقم التتبع يجب أن يكون 5 أحرف على الأقل';
      }

      if (!formData.password.trim()) {
        newErrors.password = 'كلمة المرور مطلوبة للوصول للبوابة';
      } else if (formData.password.length < 6) {
        newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || undefined,
        addressLine1: formData.address,
        addressLine2: undefined,
        city: formData.city,
        country: formData.country,
        postalCode: undefined,
        notes: formData.notes || undefined,
      };
      createClientMutation.mutate(payload);
    }
  };

  const libyanCities = [
    'طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'بيان', 'صبراتة', 'الخمس', 
    'زليتن', 'أجدابيا', 'درنة', 'توكرة', 'المرج', 'البيضاء', 'شحات',
    'طبرق', 'غدامس', 'مرزق', 'سبها', 'أوباري', 'الكفرة'
  ];

  return (
    <AdminLayout title="عميل جديد">
      <Head>
        <title>عميل جديد - {t('site.title')}</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إضافة عميل جديد</h1>
              <p className="text-gray-600">أدخل بيانات العميل الجديد</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 ml-2 text-gold-600" />
              المعلومات الشخصية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  اسم الشركة
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="اسم الشركة (اختياري)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهوية الوطنية
                </label>
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="رقم الهوية الوطنية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم جواز السفر
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="رقم جواز السفر"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Phone className="h-5 w-5 ml-2 text-gold-600" />
              معلومات الاتصال
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  رقم الهاتف *
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`input-field pr-10 ${errors.phone ? 'border-red-300' : ''}`}
                    placeholder="+218 XX XXX XXXX"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 ml-2 text-gold-600" />
              معلومات العنوان
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`input-field ${errors.address ? 'border-red-300' : ''}`}
                  placeholder="العنوان التفصيلي"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`input-field ${errors.city ? 'border-red-300' : ''}`}
                >
                  <option value="">اختر المدينة</option>
                  {libyanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البلد
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="Libya">ليبيا</option>
                  <option value="Tunisia">تونس</option>
                  <option value="Egypt">مصر</option>
                  <option value="Algeria">الجزائر</option>
                  <option value="Morocco">المغرب</option>
                  <option value="Other">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 ml-2 text-gold-600" />
              معلومات إضافية
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="أي ملاحظات إضافية حول العميل..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <label className="mr-2 block text-sm text-gray-700">
                  حساب نشط
                </label>
              </div>
            </div>
          </div>

          {/* Portal Access */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="h-5 w-5 ml-2 text-gold-600" />
              الوصول للبوابة الإلكترونية
            </h2>

            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasPortalAccess"
                  checked={formData.hasPortalAccess}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <label className="mr-2 block text-sm text-gray-700">
                  تفعيل الوصول للبوابة الإلكترونية
                </label>
              </div>

              {formData.hasPortalAccess && (
                <div className="space-y-6 border-t pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم التتبع (اختياري)
                    </label>
                    <input
                      type="text"
                      name="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={handleInputChange}
                      className={`input-field ${errors.trackingNumber ? 'border-red-500' : ''}`}
                      placeholder="اتركه فارغاً لإنشاء رقم تلقائي"
                    />
                    {errors.trackingNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.trackingNumber}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      سيتم إنشاء رقم تلقائي إذا لم يتم إدخال رقم
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="كلمة المرور للوصول للبوابة"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 left-0 pl-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="تأكيد كلمة المرور"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 left-0 pl-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="mr-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          معلومات الوصول للبوابة
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>• سيتمكن العميل من تسجيل الدخول باستخدام رقم التتبع وكلمة المرور</p>
                          <p>• يمكن للعميل تتبع شحناته وإدارة بياناته المالية</p>
                          <p>• يمكن تغيير كلمة المرور لاحقاً من لوحة التحكم</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              disabled={createClientMutation.isLoading}
              className="btn-primary flex items-center"
            >
              {createClientMutation.isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 ml-2" />
                  حفظ العميل
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

export default withAuth(NewClientPage);
