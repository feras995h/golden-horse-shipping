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
  ArrowRight,
  Sparkles,
  Award
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
      <section className="relative hero-gradient text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-gold-900/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-luxury-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 z-10">
          <div className="text-center">
            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-gold-300/30 text-gold-200 text-sm font-medium mb-6">
                <Star className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gold-400" />
                الشريك الموثوق في عالم الشحن والخدمات اللوجستية
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-8 animate-fade-in">
              <span className="text-gradient block mb-2">{t('hero.title')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gold-200 font-light max-w-4xl mx-auto animate-slide-up leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <p className="text-lg mb-12 text-white/80 max-w-3xl mx-auto animate-slide-up leading-relaxed">
              {t('hero.description')}
            </p>

            {/* Enhanced Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up mb-16">
              <Link href="/services" className="group relative overflow-hidden bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center">
                <span className="relative z-10">{t('hero.servicesButton')}</span>
                <ArrowRight className="h-6 w-6 rtl:mr-3 ltr:ml-3 rtl:rotate-180 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link href="/contact" className="group relative overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white hover:text-gold-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                <span className="relative z-10">{t('hero.contactButton')}</span>
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
        <div className="absolute top-20 left-10 animate-float opacity-30">
          <div className="relative">
            <Ship className="h-16 w-16 text-gold-300" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gold-400 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float opacity-30" style={{ animationDelay: '2s' }}>
          <div className="relative">
            <Plane className="h-14 w-14 text-luxury-200" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-luxury-400 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="absolute top-1/2 left-20 animate-float opacity-20" style={{ animationDelay: '4s' }}>
          <Package className="h-12 w-12 text-gold-400" />
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="relative -mt-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-4">
                    <div className="text-4xl md:text-5xl font-black text-gradient mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.number}
                    </div>
                    <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="text-elegant-700 font-bold text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section className="py-24 bg-gradient-to-br from-elegant-50 via-white to-luxury-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold-100 text-gold-700 text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              خدماتنا المتميزة
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-elegant-900 mb-6">
              <span className="text-gradient">{t('services.title')}</span>
            </h2>
            <p className="text-xl text-elegant-600 max-w-4xl mx-auto leading-relaxed">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-luxury-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative glass-panel p-8 h-full group-hover:scale-105 transition-all duration-500">
                  <div className="relative mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-r ${service.color} rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
                      <service.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-2xl font-black text-elegant-900 mb-6 group-hover:text-gold-700 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-elegant-600 leading-relaxed text-lg">
                    {service.description}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 to-luxury-500 rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Enhanced Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50/30 via-transparent to-luxury-50/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-luxury-100 text-luxury-700 text-sm font-semibold mb-6">
              <Award className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              مميزاتنا التنافسية
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-elegant-900 mb-6">
              <span className="text-gradient">{t('features.title')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-luxury-500/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="relative mb-8 mx-auto w-fit">
                    <div className="w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
                      <feature.icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-luxury-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <h3 className="text-xl font-black text-elegant-900 mb-4 group-hover:text-gold-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-elegant-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-elegant-50 via-luxury-50 to-gold-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold-100 text-gold-700 text-sm font-semibold mb-6">
              <Star className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              آراء عملائنا الكرام
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-elegant-900 mb-6">
              <span className="text-gradient">ماذا يقول عملاؤنا</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-luxury-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative glass-panel p-8 h-full group-hover:scale-105 transition-all duration-500">
                  <div className="flex items-center mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6 text-gold-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-elegant-700 mb-8 leading-relaxed text-lg font-medium">
                    &quot;خدمة ممتازة وسريعة، وصلت بضاعتي في الوقت المحدد وبحالة ممتازة. أنصح بشدة بالتعامل مع الحصان الذهبي.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xl">
                      أ
                    </div>
                    <div className="mr-4 rtl:ml-4 rtl:mr-0">
                      <div className="font-black text-elegant-900 text-lg">أحمد محمد</div>
                      <div className="text-elegant-600 font-semibold">تاجر</div>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 text-gold-300/30 text-6xl font-black">&quot;</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-gold-900/30"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-luxury-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-gold-300/30 text-gold-200 text-sm font-semibold mb-8">
              <Package className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gold-400" />
              ابدأ رحلتك معنا الآن
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
            <span className="text-gradient">ابدأ رحلة الشحن معنا اليوم</span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-gold-200 max-w-4xl mx-auto leading-relaxed font-light">
            احصل على عرض سعر مجاني واكتشف كيف يمكننا مساعدتك في شحن بضائعك بأمان وسرعة
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact" className="group relative overflow-hidden bg-white text-gold-700 hover:bg-gold-50 font-black py-5 px-10 rounded-2xl text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <span className="relative z-10">احصل على عرض سعر</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gold-50 to-luxury-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link href="/tracking" className="group relative overflow-hidden border-2 border-white/50 text-white hover:bg-white hover:text-gold-700 font-black py-5 px-10 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-md">
              <span className="relative z-10">تتبع شحنتك</span>
            </Link>
          </div>
        </div>
      </section>
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
