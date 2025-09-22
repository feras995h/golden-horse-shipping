import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import AdminLayout from '@/components/Admin/Layout/AdminLayout';
import ShipsGoTrackingCard from '@/components/Tracking/ShipsGoTrackingCard';
import { withAuth } from '@/lib/auth';
import { shipsGoAPI } from '@/lib/api';
import { AlertCircle, CheckCircle, Search } from 'lucide-react';

interface HealthStatus {
  configured: boolean;
  rateLimit: number;
}

const AdminTrackingPage = () => {
  const [container, setContainer] = useState('');
  const [bl, setBl] = useState('');
  const [booking, setBooking] = useState('');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await shipsGoAPI.getHealth();
      setHealth(res.data);
    } catch (e) {
      setHealth({ configured: false, rateLimit: 0 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // allow only one identifier at a time
    const filled = [container, bl, booking].filter(Boolean).length;
    if (filled !== 1) {
      setError('يرجى إدخال معرف واحد فقط: رقم حاوية أو بوليصة شحن أو حجز.');
      return;
    }

    setLoading(true);
    try {
      const params: any = {};
      if (container) params.container = container.trim().toUpperCase();
      if (bl) params.bl = bl.trim().toUpperCase();
      if (booking) params.booking = booking.trim().toUpperCase();
      const res = await shipsGoAPI.trackShipment(params);
      setResult(res.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) setError('غير مصرح. تحقق من مفتاح API.');
      else if (err.response?.status === 429) setError('تم تجاوز حد الطلبات. حاول لاحقًا.');
      else if (err.response?.status === 404) setError('غير موجود');
      else setError('حدث خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  // load health once
  if (health === null) {
    fetchHealth();
  }

  return (
    <AdminLayout title="تتبع الشحن (ShipsGo)">
      <Head>
        <title>تتبع الشحن (ShipsGo)</title>
      </Head>

      {/* Health status */}
      <div className={`mb-6 p-4 rounded-lg border ${health?.configured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center">
          {health?.configured ? (
            <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
          )}
          <p className="font-medium">
            {health?.configured ? 'ShipsGo جاهز (تم ضبط مفتاح API)' : 'ShipsGo غير مضبوط: يرجى إضافة SHIPSGO_API_KEY إلى بيئة الخادم'}
          </p>
          {health && (
            <span className="text-sm text-gray-600 mr-4">الحد/دقيقة: {health.rateLimit}</span>
          )}
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">رقم الحاوية</label>
            <input value={container} onChange={(e) => { setContainer(e.target.value); setBl(''); setBooking(''); }} placeholder="ABCD1234567" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">رقم بوليصة الشحن (BL)</label>
            <input value={bl} onChange={(e) => { setBl(e.target.value); setContainer(''); setBooking(''); }} placeholder="BL123456" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">رقم الحجز</label>
            <input value={booking} onChange={(e) => { setBooking(e.target.value); setContainer(''); setBl(''); }} placeholder="BOOK123" className="input-field" />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" disabled={loading} className="btn-primary inline-flex items-center">
            {loading ? <div className="loading-spinner"></div> : <Search className="h-5 w-5" />}
            <span className="ml-2">بحث</span>
          </button>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded p-3">{error}</div>
        )}
      </form>

      {/* Result */}
      {result && result.success && result.data?.milestones ? (
        <ShipsGoTrackingCard trackingData={result} />
      ) : result ? (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
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

export default withAuth(AdminTrackingPage);

