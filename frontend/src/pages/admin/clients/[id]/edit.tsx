import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'react-query';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { clientsAPI } from '@/lib/api';

interface ClientFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  company: string;
  nationalId: string;
  passportNumber: string;
  notes: string;
  isActive: boolean;
}

const EditClientPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState<ClientFormData>({
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
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch client data
  const { data: client, isLoading } = useQuery(
    ['client', id],
    async () => {
      const response = await clientsAPI.getById(id as string);
      return response.data;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: [data.addressLine1, data.addressLine2].filter(Boolean).join(' ') || '',
          city: data.city || '',
          country: data.country || 'Libya',
          company: data.company || '',
          nationalId: '',
          passportNumber: '',
          notes: data.notes || '',
          isActive: data.isActive ?? true
        });
      }
    }
  );

  // Update client mutation
  const updateClientMutation = useMutation(
    (data: ClientFormData) => clientsAPI.update(id as string, data),
    {
      onSuccess: () => {
        router.push(`/admin/clients/${id}`);
      },
      onError: (error: any) => {
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
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
      updateClientMutation.mutate(payload as any);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="تحرير العميل">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تحرير العميل">
      <Head>
        <title>تحرير العميل - {client?.fullName} - {t('site.title')}</title>
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
            <h1 className="text-2xl font-bold text-gray-900">تحرير العميل</h1>
            <p className="text-gray-600">{client?.fullName} - {client?.clientId}</p>
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
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`input-field ${errors.address ? 'border-red-300' : ''}`}
                  placeholder="أدخل العنوان التفصيلي"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`input-field ${errors.city ? 'border-red-300' : ''}`}
                  placeholder="أدخل المدينة"
                />
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
                  <option value="Algeria">الجزائر</option>
                  <option value="Egypt">مصر</option>
                  <option value="Morocco">المغرب</option>
                  <option value="Sudan">السودان</option>
                  <option value="Other">أخرى</option>
                </select>
              </div>
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
              disabled={updateClientMutation.isLoading}
              className="btn-primary flex items-center"
            >
              {updateClientMutation.isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default withAuth(EditClientPage);
