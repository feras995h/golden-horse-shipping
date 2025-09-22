import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import { shipmentsAPI } from '@/lib/api';
import {
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  ArrowLeft,
  Ship,
  Truck,
  Plane,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  ExternalLink,
  Weight,
  Ruler,
  CreditCard
} from 'lucide-react';

const ShipmentDetailsPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;

  // Fetch shipment details
  const { data: shipment, isLoading: shipmentLoading } = useQuery(
    ['shipment', id],
    async () => {
      if (!id) return null;
      const response = await shipmentsAPI.getById(id as string);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  const queryClient = useQueryClient();

  const [newStatus, setNewStatus] = useState<string>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('');

  const updateStatusMutation = useMutation(
    (status: string) => shipmentsAPI.updateStatus(id as string, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shipment', id]);
      },
    }
  );

  const updatePaymentStatusMutation = useMutation(
    (pStatus: string) => shipmentsAPI.updatePaymentStatus(id as string, pStatus),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shipment', id]);
      },
    }
  );

  type PaymentForm = {
    amount: number;
    currency: string;
    method: string;
    referenceNumber?: string;
    paymentDate: string;
    notes?: string;
  };

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    amount: 0,
    currency: 'LYD',
    method: 'cash',
    referenceNumber: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  const addPaymentMutation = useMutation(
    (data: any) => shipmentsAPI.addPaymentRecord(id as string, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shipment', id]);
        setPaymentForm({
          amount: 0,
          currency: 'LYD',
          method: 'cash',
          referenceNumber: '',
          paymentDate: new Date().toISOString().slice(0, 10),
          notes: ''
        });
      },
    }
  );

  const totalPaid = (shipment?.paymentRecords || []).reduce(
    (sum: number, r: any) => sum + Number(r.amount),
    0
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
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sea':
        return Ship;
      case 'air':
        return Plane;
      case 'land':
        return Truck;
      default:
        return Package;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircle;
      case 'delayed':
        return AlertTriangle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  if (shipmentLoading) {
    return (
      <AdminLayout title="تفاصيل الشحنة">
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner" />
        </div>
      </AdminLayout>
    );
  }

  if (!shipment) {
    return (
      <AdminLayout title="الشحنة غير موجودة">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الشحنة غير موجودة</h2>
          <Link
            href="/admin/shipments"
            className="text-gold-600 hover:text-gold-700 font-medium"
          >
            العودة إلى قائمة الشحنات
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const TypeIcon = getTypeIcon(shipment.type);
  const StatusIcon = getStatusIcon(shipment.status);

  return (
    <AdminLayout title={`تفاصيل الشحنة - ${shipment.trackingNumber}`}>
      <Head>
        <title>تفاصيل الشحنة - {shipment.trackingNumber} - {t('site.title')}</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              href="/admin/shipments"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shipment.trackingNumber}</h1>
              <p className="text-gray-600">{shipment.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <Link
              href={`/track/${shipment.trackingNumber}`}
              target="_blank"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              عرض عام
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
            <Link
              href={`/admin/shipments/${id}/edit`}
              className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              تعديل الشحنة
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipment Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الشحنة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">رقم التتبع</p>
                    <p className="font-medium text-gray-900">{shipment.trackingNumber}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TypeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">نوع الشحن</p>
                    <p className="font-medium text-gray-900">
                      {shipment.type === 'sea' ? 'بحري' :
                       shipment.type === 'air' ? 'جوي' :
                       shipment.type === 'land' ? 'بري' : shipment.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">من</p>
                    <p className="font-medium text-gray-900">{shipment.originPort}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">إلى</p>
                    <p className="font-medium text-gray-900">{shipment.destinationPort}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Weight className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">الوزن</p>
                    <p className="font-medium text-gray-900">{shipment.weight} كجم</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Ruler className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">الحجم</p>
                    <p className="font-medium text-gray-900">{shipment.volume || 'غير محدد'} م³</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">قيمة البضاعة</p>
                    <p className="font-medium text-gray-900">{shipment.value} {shipment.currency}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">التكلفة الإجمالية</p>
                    <p className="font-medium text-gray-900">{shipment.totalCost} {shipment.currency}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات العميل</h3>
              {shipment.client ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{shipment.client.fullName}</p>
                      <p className="text-sm text-gray-500">{shipment.client.email}</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/clients/${shipment.client.id}`}
                    className="text-gold-600 hover:text-gold-700 text-sm font-medium"
                  >
                    عرض تفاصيل العميل
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">معلومات العميل غير متوفرة</p>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الجدول الزمني</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                    <p className="font-medium text-gray-900">
                      {new Date(shipment.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                {shipment.estimatedDeparture && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">المغادرة المتوقعة</p>
                      <p className="font-medium text-gray-900">
                        {new Date(shipment.estimatedDeparture).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                )}
                {shipment.estimatedArrival && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">الوصول المتوقع</p>
                      <p className="font-medium text-gray-900">
                        {new Date(shipment.estimatedArrival).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {shipment.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ملاحظات</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{shipment.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الحالة</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">حالة الشحنة</span>
                  <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {shipment.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">حالة الدفع</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(shipment.paymentStatus)}`}>
                    {shipment.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة الاعتماد</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                {shipment.status === 'pending' ? (
                  <button
                    onClick={() => updateStatusMutation.mutate('processing')}
                    className="flex-1 text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                  >
                    اعتماد الشحنة (تحويل من مبدئية إلى معتمدة)
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatusMutation.mutate('pending')}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  >
                    إرجاع الحالة إلى مبدئية
                  </button>
                )}
                <div className="flex-1 flex items-center gap-2">
                  <select
                    value={(newStatus as string) || shipment.status}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="pending">في الانتظار (مبدئية)</option>
                    <option value="processing">معتمدة/قيد التنفيذ</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="in_transit">في الطريق</option>
                    <option value="at_port">في الميناء</option>
                    <option value="customs_clearance">التخليص الجمركي</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="delayed">متأخر</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <button
                    onClick={() => updateStatusMutation.mutate((newStatus as string) || shipment.status)}
                    disabled={updateStatusMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateStatusMutation.isLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المدفوعات</h3>
              <div className="mb-4 text-sm text-gray-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span>إجمالي المدفوع</span>
                  <span className="font-semibold">{totalPaid.toFixed(2)} {shipment.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>المتبقي</span>
                  <span className="font-semibold">{(Number(shipment.totalCost) - totalPaid).toFixed(2)} {shipment.currency}</span>
                </div>
              </div>

              {/* Add Payment Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="المبلغ"
                  />
                  <select
                    value={paymentForm.currency}
                    onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                    className="input-field"
                  >
                    <option value="LYD">LYD</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="input-field"
                  >
                    <option value="cash">نقدي</option>
                    <option value="bank_transfer">حوالة مصرفية</option>
                    <option value="credit_card">بطاقة</option>
                    <option value="check">شيك</option>
                    <option value="other">أخرى</option>
                  </select>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                    className="input-field col-span-2"
                    placeholder="رقم المرجع (اختياري)"
                  />
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    rows={2}
                    className="input-field col-span-2"
                    placeholder="ملاحظات (اختياري)"
                  />
                </div>
                <button
                  onClick={() => addPaymentMutation.mutate({ ...paymentForm, paymentDate: new Date(paymentForm.paymentDate) })}
                  disabled={addPaymentMutation.isLoading || paymentForm.amount <= 0}
                  className="btn-primary w-full"
                >
                  {addPaymentMutation.isLoading ? 'جاري الإضافة...' : 'إضافة دفعة'}
                </button>
              </div>

              {shipment.paymentRecords?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">سجل الدفعات</h4>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {shipment.paymentRecords.map((pr: any) => (
                      <div key={pr.id} className="border rounded-lg p-3 text-sm flex items-center justify-between">
                        <div>
                          <div className="font-medium">{Number(pr.amount).toFixed(2)} {pr.currency}</div>
                          <div className="text-gray-500">{new Date(pr.paymentDate).toLocaleDateString('ar-SA')} • {pr.method}</div>
                          {pr.referenceNumber && <div className="text-gray-500">مرجع: {pr.referenceNumber}</div>}
                          {pr.notes && <div className="text-gray-500">ملاحظات: {pr.notes}</div>}
                        </div>
                        <div className="text-gray-400 text-xs">بواسطة: {pr.recordedBy}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* Vessel Information */}
            {(shipment.vesselName || shipment.vesselMMSI || shipment.containerNumber) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات السفينة</h3>
                <div className="space-y-3">
                  {shipment.vesselName && (
                    <div>
                      <p className="text-sm text-gray-500">اسم السفينة</p>
                      <p className="font-medium text-gray-900">{shipment.vesselName}</p>
                    </div>
                  )}
                  {shipment.vesselMMSI && (
                    <div>
                      <p className="text-sm text-gray-500">MMSI</p>
                      <p className="font-medium text-gray-900">{shipment.vesselMMSI}</p>
                    </div>
                  )}
                  {shipment.containerNumber && (
                    <div>
                      <p className="text-sm text-gray-500">رقم الحاوية</p>
                      <p className="font-medium text-gray-900">{shipment.containerNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  تحديث الحالة
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  إضافة ملاحظة
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  إرسال إشعار للعميل
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ShipmentDetailsPage;
