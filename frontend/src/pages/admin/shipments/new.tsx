import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'react-query';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Ship,
  DollarSign,
  Calendar,
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { withAuth } from '@/lib/auth';
import { shipmentsAPI, clientsAPI } from '@/lib/api';

interface ShipmentFormData {
  clientId: string;
  description: string;
  type: 'sea' | 'air' | 'land';
  originPort: string;
  destinationPort: string;
  weight: number;
  volume?: number;
  value: number;
  currency: string;
  totalCost: number;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  vesselName?: string;
  vesselMMSI?: string;
  vesselIMO?: string;
  containerNumber?: string;
  blNumber?: string;
  bookingNumber?: string;
  shippingLine?: string;
  voyage?: string;
  enableTracking?: boolean;
  notes?: string;
  specialInstructions?: string;
}

const NewShipmentPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  const [formData, setFormData] = useState<ShipmentFormData>({
    clientId: '',
    description: '',
    type: 'sea',
    originPort: '',
    destinationPort: '',
    weight: 0,
    volume: 0,
    value: 0,
    currency: 'USD',
    totalCost: 0,
    estimatedDeparture: '',
    estimatedArrival: '',
    vesselName: '',
    vesselMMSI: '',
    vesselIMO: '',
    containerNumber: '',
    blNumber: '',
    bookingNumber: '',
    shippingLine: '',
    voyage: '',
    enableTracking: false,
    notes: '',
    specialInstructions: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery(
    'clients-for-shipment',
    async () => {
      const response = await clientsAPI.getAll({ limit: 1000, isActive: true });
      return response.data;
    }
  );

  // Create shipment mutation
  const createShipmentMutation = useMutation(
    (data: ShipmentFormData) => shipmentsAPI.create(data),
    {
      onSuccess: (response) => {
        router.push(`/admin/shipments/${response.data.id}`);
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
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'العميل مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف الشحنة مطلوب';
    }

    if (!formData.originPort.trim()) {
      newErrors.originPort = 'ميناء المنشأ مطلوب';
    }

    if (!formData.destinationPort.trim()) {
      newErrors.destinationPort = 'ميناء الوصول مطلوب';
    }

    if (formData.weight <= 0) {
      newErrors.weight = 'الوزن يجب أن يكون أكبر من صفر';
    }

    if (formData.value <= 0) {
      newErrors.value = 'قيمة البضاعة يجب أن تكون أكبر من صفر';
    }

    if (formData.totalCost <= 0) {
      newErrors.totalCost = 'التكلفة الإجمالية يجب أن تكون أكبر من صفر';
    }

    // Validate tracking data if enabled
    if (formData.enableTracking) {
      if (!formData.containerNumber && !formData.blNumber && !formData.bookingNumber) {
        newErrors.tracking = 'يجب إدخال واحد على الأقل من: رقم الحاوية، رقم بوليصة الشحن، أو رقم الحجز';
      }
      
      // Validate container number format if provided
      if (formData.containerNumber && !formData.containerNumber.match(/^[A-Z]{4}[0-9]{7}$/)) {
        newErrors.containerNumber = 'رقم الحاوية يجب أن يكون بتنسيق: 4 أحرف + 7 أرقام';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      createShipmentMutation.mutate(formData);
    }
  };

  const shipmentTypes = [
    { value: 'sea', label: 'بحري' },
    { value: 'air', label: 'جوي' },
    { value: 'land', label: 'بري' }
  ];

  const currencies = [
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
    { value: 'LYD', label: 'دينار ليبي (LYD)' }
  ];

  return (
    <AdminLayout title="شحنة جديدة">
      <Head>
        <title>شحنة جديدة - {t('site.title')}</title>
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
            <h1 className="text-2xl font-bold text-gray-900">إنشاء شحنة جديدة</h1>
            <p className="text-gray-600">أدخل تفاصيل الشحنة الجديدة</p>
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
              <Package className="h-5 w-5 ml-2 text-gold-600" />
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العميل *
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className={`input-field ${errors.clientId ? 'border-red-300' : ''}`}
                >
                  <option value="">اختر العميل</option>
                  {clientsData?.clients?.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName} - {client.clientId}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الشحنة *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {shipmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الشحنة *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                  placeholder="أدخل وصف تفصيلي للشحنة"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ports Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 ml-2 text-gold-600" />
              معلومات الموانئ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ميناء المنشأ *
                </label>
                <input
                  type="text"
                  name="originPort"
                  value={formData.originPort}
                  onChange={handleInputChange}
                  className={`input-field ${errors.originPort ? 'border-red-300' : ''}`}
                  placeholder="مثال: ميناء طرابلس"
                />
                {errors.originPort && (
                  <p className="mt-1 text-sm text-red-600">{errors.originPort}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ميناء الوصول *
                </label>
                <input
                  type="text"
                  name="destinationPort"
                  value={formData.destinationPort}
                  onChange={handleInputChange}
                  className={`input-field ${errors.destinationPort ? 'border-red-300' : ''}`}
                  placeholder="مثال: ميناء الإسكندرية"
                />
                {errors.destinationPort && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationPort}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="h-5 w-5 ml-2 text-gold-600" />
              تفاصيل البضاعة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوزن (كيلوجرام) *
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`input-field ${errors.weight ? 'border-red-300' : ''}`}
                  placeholder="0.00"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحجم (متر مكعب)
                </label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العملة
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {currencies.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قيمة البضاعة *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`input-field ${errors.value ? 'border-red-300' : ''}`}
                  placeholder="0.00"
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التكلفة الإجمالية *
                </label>
                <input
                  type="number"
                  name="totalCost"
                  value={formData.totalCost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`input-field ${errors.totalCost ? 'border-red-300' : ''}`}
                  placeholder="0.00"
                />
                {errors.totalCost && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalCost}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vessel & Schedule Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Ship className="h-5 w-5 ml-2 text-gold-600" />
              معلومات السفينة والجدولة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ المغادرة المتوقع
                </label>
                <input
                  type="datetime-local"
                  name="estimatedDeparture"
                  value={formData.estimatedDeparture}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الوصول المتوقع
                </label>
                <input
                  type="datetime-local"
                  name="estimatedArrival"
                  value={formData.estimatedArrival}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم السفينة
                </label>
                <input
                  type="text"
                  name="vesselName"
                  value={formData.vesselName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="مثال: GOLDEN HORSE I"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الحاوية
                </label>
                <input
                  type="text"
                  name="containerNumber"
                  value={formData.containerNumber}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="مثال: ABCD1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MMSI رقم
                </label>
                <input
                  type="text"
                  name="vesselMMSI"
                  value={formData.vesselMMSI}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="مثال: 123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMO رقم
                </label>
                <input
                  type="text"
                  name="vesselIMO"
                  value={formData.vesselIMO}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="مثال: IMO1234567"
                />
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="h-5 w-5 ml-2 text-gold-600" />
              معلومات التتبع
            </h2>

            <div className="space-y-6">
              {/* Enable Tracking Toggle */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  name="enableTracking"
                  checked={formData.enableTracking}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  تفعيل التتبع المباشر من نظام ShipsGo
                </label>
              </div>

              {formData.enableTracking && (
                <div className="space-y-4">
                  {errors.tracking && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{errors.tracking}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الحاوية
                    </label>
                    <input
                      type="text"
                      name="containerNumber"
                      value={formData.containerNumber}
                      onChange={handleInputChange}
                      className={`input-field ${errors.containerNumber ? 'border-red-300' : ''}`}
                      placeholder="مثال: ABCD1234567"
                    />
                    <p className="text-xs text-gray-500 mt-1">تنسيق: 4 أحرف + 7 أرقام</p>
                    {errors.containerNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.containerNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم بوليصة الشحن (BL)
                    </label>
                    <input
                      type="text"
                      name="blNumber"
                      value={formData.blNumber}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="مثال: BL123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الحجز
                    </label>
                    <input
                      type="text"
                      name="bookingNumber"
                      value={formData.bookingNumber}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="مثال: BK123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      خط الشحن
                    </label>
                    <input
                      type="text"
                      name="shippingLine"
                      value={formData.shippingLine}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="مثال: MSC, Maersk, COSCO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الرحلة
                    </label>
                    <input
                      type="text"
                      name="voyage"
                      value={formData.voyage}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="مثال: 001E"
                    />
                  </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 ml-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">ملاحظة مهمة</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      لتفعيل التتبع المباشر، يجب إدخال واحد على الأقل من: رقم الحاوية، رقم بوليصة الشحن، أو رقم الحجز.
                      سيتم استخدام هذه البيانات لجلب معلومات التتبع المباشرة من نظام ShipsGo.
                    </p>
                  </div>
                </div>
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
                  rows={3}
                  className="input-field"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تعليمات خاصة
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="تعليمات خاصة للتعامل مع الشحنة..."
                />
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
              disabled={createShipmentMutation.isLoading}
              className="btn-primary flex items-center"
            >
              {createShipmentMutation.isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 ml-2" />
                  حفظ الشحنة
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

export default withAuth(NewShipmentPage);
