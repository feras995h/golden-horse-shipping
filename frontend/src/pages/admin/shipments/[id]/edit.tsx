import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
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
  notes?: string;
  specialInstructions?: string;
}

const EditShipmentPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  
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
    notes: '',
    specialInstructions: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch shipment data
  const { data: shipment, isLoading } = useQuery(
    ['shipment', id],
    async () => {
      const response = await shipmentsAPI.getById(id as string);
      return response.data;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        setFormData({
          clientId: data.clientId || '',
          description: data.description || '',
          type: data.type || 'sea',
          originPort: data.originPort || '',
          destinationPort: data.destinationPort || '',
          weight: data.weight || 0,
          volume: data.volume || 0,
          value: data.value || 0,
          currency: data.currency || 'USD',
          totalCost: data.totalCost || 0,
          estimatedDeparture: data.estimatedDeparture ? new Date(data.estimatedDeparture).toISOString().slice(0, 16) : '',
          estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival).toISOString().slice(0, 16) : '',
          vesselName: data.vesselName || '',
          vesselMMSI: data.vesselMMSI || '',
          vesselIMO: data.vesselIMO || '',
          containerNumber: data.containerNumber || '',
          notes: data.notes || '',
          specialInstructions: data.specialInstructions || ''
        });
      }
    }
  );

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery(
    'clients-for-shipment',
    async () => {
      const response = await clientsAPI.getAll({ limit: 1000, isActive: true });
      return response.data;
    }
  );

  // Update shipment mutation
  const updateShipmentMutation = useMutation(
    (data: ShipmentFormData) => shipmentsAPI.update(id as string, data),
    {
      onSuccess: () => {
        router.push(`/admin/shipments/${id}`);
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
      [name]: type === 'number' ? parseFloat(value) || 0 : value
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateShipmentMutation.mutate(formData);
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

  if (isLoading) {
    return (
      <AdminLayout title="تحرير الشحنة">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تحرير الشحنة">
      <Head>
        <title>تحرير الشحنة - {shipment?.trackingNumber} - {t('site.title')}</title>
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
            <h1 className="text-2xl font-bold text-gray-900">تحرير الشحنة</h1>
            <p className="text-gray-600">رقم التتبع: {shipment?.trackingNumber}</p>
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
              disabled={updateShipmentMutation.isLoading}
              className="btn-primary flex items-center"
            >
              {updateShipmentMutation.isLoading ? (
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

export default withAuth(EditShipmentPage);
