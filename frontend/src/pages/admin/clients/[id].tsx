import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from 'react-query';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { clientsAPI, shipmentsAPI } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Edit,
  ArrowLeft,
  Building,
  Globe,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Key,
  Shield,
  RefreshCw
} from 'lucide-react';

const ClientDetailsPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState('');

  // Fetch client details
  const { data: client, isLoading: clientLoading } = useQuery(
    ['client', id],
    async () => {
      if (!id) return null;
      const response = await clientsAPI.getById(id as string);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  // Fetch client shipments
  const { data: shipmentsData, isLoading: shipmentsLoading } = useQuery(
    ['client-shipments', id],
    async () => {
      if (!id) return null;
      const response = await clientsAPI.getClientShipments(id as string);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;
    
    setIsResettingPassword(true);
    setResetPasswordMessage('');
    
    try {
      const response = await clientsAPI.resetPassword(id as string);
      setResetPasswordMessage('تم إعادة تعيين كلمة المرور بنجاح. تم إرسال كلمة المرور الجديدة للعميل.');
    } catch (error) {
      setResetPasswordMessage('حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (clientLoading) {
    return (
      <AdminLayout title="تفاصيل العميل">
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner" />
        </div>
      </AdminLayout>
    );
  }

  if (!client) {
    return (
      <AdminLayout title="العميل غير موجود">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">العميل غير موجود</h2>
          <Link
            href="/admin/clients"
            className="text-gold-600 hover:text-gold-700 font-medium"
          >
            العودة إلى قائمة العملاء
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`تفاصيل العميل - ${client.fullName}`}>
      <Head>
        <title>تفاصيل العميل - {client.fullName} - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              href="/admin/clients"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.fullName}</h1>
              <p className="text-gray-600">رقم العميل: {client.clientId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <Link
              href={`/admin/clients/${id}/edit`}
              className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              تعديل العميل
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">الاسم الكامل</p>
                    <p className="font-medium text-gray-900">{client.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                    <p className="font-medium text-gray-900">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">الشركة</p>
                    <p className="font-medium text-gray-900">{client.company || 'غير محدد'}</p>
                  </div>
                </div>
                <div className="flex items-start md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">العنوان</p>
                    <p className="font-medium text-gray-900">
                      {client.addressLine1}
                      {client.addressLine2 && `, ${client.addressLine2}`}
                      <br />
                      {client.city}, {client.country} {client.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Access Information */}
            {client.hasPortalAccess && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات البوابة الإلكترونية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">رقم التتبع</p>
                      <p className="font-medium text-gray-900">{client.trackingNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">حالة الوصول</p>
                      <p className="font-medium text-green-600">مفعل</p>
                    </div>
                  </div>
                  {client.lastLogin && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">آخر تسجيل دخول</p>
                        <p className="font-medium text-gray-900">
                          {new Date(client.lastLogin).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href={`/admin/clients/${id}/change-password`}
                    className="inline-flex items-center px-4 py-2 bg-gold-600 text-white text-sm font-medium rounded-lg hover:bg-gold-700 transition-colors"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    تغيير كلمة المرور
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Shipments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">الشحنات الأخيرة</h3>
                <Link
                  href={`/admin/shipments?clientId=${id}`}
                  className="text-gold-600 hover:text-gold-700 text-sm font-medium"
                >
                  عرض جميع الشحنات
                </Link>
              </div>

              {shipmentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="skeleton h-5 w-32 mb-2"></div>
                        <div className="skeleton h-4 w-48"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="skeleton h-6 w-16 rounded-full"></div>
                        <div className="skeleton h-6 w-16 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : shipmentsData?.length > 0 ? (
                <div className="space-y-4">
                  {shipmentsData.slice(0, 5).map((shipment: any) => (
                    <div key={shipment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <Link
                          href={`/admin/shipments/${shipment.id}`}
                          className="font-medium text-gray-900 hover:text-gold-600"
                        >
                          {shipment.trackingNumber}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {shipment.description} - {shipment.originPort} إلى {shipment.destinationPort}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(shipment.paymentStatus)}`}>
                          {shipment.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد شحنات لهذا العميل</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة العميل</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الحالة</span>
                  <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    client.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        نشط
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        غير نشط
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">تاريخ التسجيل</span>
                  <span className="text-gray-900">
                    {new Date(client.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">البوابة الإلكترونية</span>
                  <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    client.hasPortalAccess 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.hasPortalAccess ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        مفعلة
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        غير مفعلة
                      </>
                    )}
                  </span>
                </div>
                {client.hasPortalAccess && (
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={handleResetPassword}
                      disabled={isResettingPassword}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResettingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري إعادة التعيين...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          إعادة تعيين كلمة المرور
                        </>
                      )}
                    </button>
                    {resetPasswordMessage && (
                      <div className={`mt-2 p-2 rounded text-sm ${
                        resetPasswordMessage.includes('بنجاح') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {resetPasswordMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات سريعة</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-600">إجمالي الشحنات</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {shipmentsData?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-gray-600">الشحنات النشطة</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {shipmentsData?.filter((s: any) => 
                      ['pending', 'processing', 'shipped', 'in_transit'].includes(s.status)
                    ).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">الشحنات المكتملة</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {shipmentsData?.filter((s: any) => s.status === 'delivered').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClientDetailsPage;
