import { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import ShipsGoTrackingCard from '@/components/Tracking/ShipsGoTrackingCard';
import axios from 'axios';
import { MapPin, Package, AlertCircle } from 'lucide-react';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import {
  Ship,
  Plane,
  Truck,
  Shield,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

const HomePage = () => {
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation('common');
  const router = useRouter();
  const [trackingInput, setTrackingInput] = useState('');

  const handleTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingInput.trim();
    if (!query) return;

    setError(null);
    setIsLoading(true);
    setTrackingResult(null);

    try {
      const containerRegex = /^[A-Z]{4}\d{7}$/i; // e.g., MSKU1234567
      const clientIdRegex = /^GH-\d{6}$/i;      // e.g., GH-123456
      const trackingNumberRegex = /^GH[A-Z0-9]+$/i; // e.g., GHABC123

      if (clientIdRegex.test(query)) {
        const res = await axios.get(`/api/clients/${encodeURIComponent(query)}/shipments`);
        setTrackingResult({ type: 'clientShipments', data: res.data });
      } else if (trackingNumberRegex.test(query)) {
        const res = await axios.get(`/api/shipments/track/${encodeURIComponent(query)}`);
        setTrackingResult({ type: 'shipment', data: res.data });
      } else if (containerRegex.test(query)) {
        const res = await axios.get(`/api/shipsgo-tracking/track`, { params: { container: query.toUpperCase() } });
        setTrackingResult({ type: 'shipsgo', data: res.data });
      } else {
        // Try BL as a fallback
        const res = await axios.get(`/api/shipsgo-tracking/track`, { params: { bl: query.toUpperCase() } });
        setTrackingResult({ type: 'shipsgo', data: res.data });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء جلب بيانات التتبع';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    {
      icon: Ship,
      title: t('services.sea.title'),
      description: t('services.sea.description'),
      color: 'from-gold-500 to-gold-600',
    },
    {
      icon: Plane,
      title: t('services.air.title'),
      description: t('services.air.description'),
      color: 'from-gray-900 to-gray-800',
    },
    {
      icon: Truck,
      title: t('services.land.title'),
      description: t('services.land.description'),
      color: 'from-gold-600 to-gold-700',
    },
  ];

  const features = [
    {
      icon: Package,
      title: t('features.tracking.title'),
      description: t('features.tracking.description'),
    },
    {
      icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.description'),
    },
    {
      icon: Clock,
      title: t('features.support.title'),
      description: t('features.support.description'),
    },
    {
      icon: DollarSign,
      title: t('features.competitive.title'),
      description: t('features.competitive.description'),
    },
  ];

  const stats = [
    { number: '5000+', label: 'شحنة سنوياً' },
    { number: '98%', label: 'معدل الرضا' },
    { number: '15+', label: 'سنة خبرة' },
    { number: '24/7', label: 'دعم العملاء' },
  ];

  return (
    <Layout>
      <Head>
        <title>{t('site.title')} - {t('site.tagline')}</title>
        <meta name="description" content={t('site.description')} />
      </Head>

      {/* Hero Section */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">

            <h1 className="heading-hero mb-6 animate-fade-in">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-300 animate-slide-up">
              {t('hero.subtitle')}
            </p>
            <p className="text-lg mb-12 text-gray-100 max-w-3xl mx-auto animate-slide-up">
              {t('hero.description')}
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 animate-slide-up">
              <Link href="/services" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center">
                <span>{t('hero.servicesButton')}</span>
                <ArrowRight className="h-5 w-5 rtl:mr-2 ltr:ml-2 rtl:rotate-180" />
              </Link>
              <Link href="/contact" className="bg-secondary-800 hover:bg-secondary-900 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200">
                {t('hero.contactButton')}
              </Link>
            </div>

            {/* Inline tracking results */}
            {isLoading && (
              <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
                <div className="bg-white/10 text-white rounded-xl p-4 text-center">جارٍ جلب البيانات...</div>
              </div>
            )}
            {error && (
              <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
                <div className="bg-red-50 text-red-700 rounded-xl p-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            {trackingResult && (
              <div className="max-w-4xl mx-auto mb-8 animate-slide-up text-right rtl:text-right ltr:text-left">
                {(() => {
                  const res: any = trackingResult;
                  if (res?.data?.success) {
                    return <ShipsGoTrackingCard trackingData={res.data} />;
                  }
                  if (res?.type === 'clientShipments' && Array.isArray(res?.data)) {
                    return (
                      <div className="bg-white rounded-2xl p-6 shadow-lg text-gray-900">
                        <h3 className="text-xl font-bold mb-4">شحنات العميل</h3>
                        <div className="space-y-4">
                          {res.data.map((s: any, idx: number) => (
                            <div key={idx} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-primary-600" />
                                <div>
                                  <div className="font-semibold">{s.trackingNumber || ''}</div>
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{s.originPort || ''} → {s.destinationPort || ''}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {s.status} • {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  const s = res?.data;
                  if (s) {
                    return (
                      <div className="bg-white rounded-2xl p-6 shadow-lg text-gray-900">
                        <h3 className="text-xl font-bold mb-2">تفاصيل الشحنة</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-500">رقم التتبع:</span> <span className="font-semibold">{s.trackingNumber || ''}</span></div>
                          <div><span className="text-gray-500">الحالة:</span> <span className="font-semibold">{s.status || ''}</span></div>
                          <div><span className="text-gray-500">من:</span> <span className="font-semibold">{s.originPort || ''}</span></div>
                          <div><span className="text-gray-500">إلى:</span> <span className="font-semibold">{s.destinationPort || ''}</span></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <Ship className="h-12 w-12 text-white opacity-20" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '2s' }}>
          <Plane className="h-10 w-10 text-white opacity-20" />
        </div>
      </section>

      {/* Stats Section */}
      <Section bg="white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Services Section */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              {t('services.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="card group hover-lift">
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              {t('features.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              آراء عملائنا
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="card hover-lift">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-gold-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &quot;خدمة ممتازة وسريعة، وصلت بضاعتي في الوقت المحدد وبحالة ممتازة. أنصح بشدة بالتعامل مع الحصان الذهبي.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-white font-bold">
                    أ
                  </div>
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <div className="font-semibold text-gray-900">أحمد محمد</div>
                    <div className="text-sm text-gray-500">تاجر</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <Section bg="gradientGold">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">ابدأ رحلة الشحن معنا اليوم</h2>
          <p className="text-xl mb-8 text-gold-100 max-w-3xl mx-auto">احصل على عرض سعر مجاني واكتشف كيف يمكننا مساعدتك في شحن بضائعك بأمان وسرعة</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-white text-gold-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">احصل على عرض سعر</Link>
            <Link href="/tracking" className="border-2 border-white text-white hover:bg-white hover:text-gold-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200">تتبع شحنتك</Link>
          </div>
        </Container>
      </Section>
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

export default HomePage;
