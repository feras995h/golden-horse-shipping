import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import { Ship, Plane, Truck, Package, Clock, Shield, DollarSign, CheckCircle } from 'lucide-react';

const ServicesPage = () => {
  const { t } = useTranslation('common');

  const services = [
    {
      icon: Ship,
      title: 'الشحن البحري',
      subtitle: 'الخيار الاقتصادي للبضائع الكبيرة',
      description: 'خدمة شحن بحري موثوقة للبضائع الثقيلة والكبيرة الحجم من موانئ الصين إلى الموانئ الليبية',
      features: [
        'شحن الحاويات الكاملة (FCL)',
        'الشحن المجمع (LCL)',
        'معدات خاصة للبضائع الثقيلة',
        'تأمين شامل على البضائع',
        'تتبع مباشر عبر الأقمار الصناعية'
      ],

      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: Plane,
      title: 'الشحن الجوي',
      subtitle: 'السرعة والأمان للبضائع العاجلة',
      description: 'خدمة شحن جوي سريع للبضائع العاجلة والحساسة مع ضمان الوصول في أقصر وقت ممكن',
      features: [
        'شحن البضائع العاجلة',
        'معالجة خاصة للبضائع الحساسة',
        'خدمة التخليص السريع',
        'تتبع لحظي للشحنات',
        'تسليم من المطار إلى الباب'
      ],

      color: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600'
    },
    {
      icon: Truck,
      title: 'الشحن البري',
      subtitle: 'حلول مرنة للنقل الداخلي',
      description: 'خدمات نقل بري متكاملة داخل ليبيا مع إمكانية التوصيل إلى جميع المدن والمناطق',
      features: [
        'التوصيل إلى جميع المدن الليبية',
        'شاحنات مجهزة بأحدث التقنيات',
        'خدمة التحميل والتفريغ',
        'تأمين شامل أثناء النقل',
        'مرونة في مواعيد التسليم'
      ],

      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  const additionalServices = [
    {
      icon: Package,
      title: 'التعبئة والتغليف',
      description: 'خدمات تعبئة وتغليف احترافية لضمان وصول البضائع بأمان'
    },
    {
      icon: Shield,
      title: 'التأمين على البضائع',
      description: 'تأمين شامل يغطي جميع المخاطر المحتملة أثناء النقل'
    },
    {
      icon: Clock,
      title: 'التخليص الجمركي',
      description: 'خدمات تخليص جمركي سريعة ومتخصصة في جميع الموانئ'
    },
    {
      icon: DollarSign,
      title: 'خدمات مالية',
      description: 'حلول دفع مرنة وخدمات صرف العملات بأفضل الأسعار'
    }
  ];

  const processSteps = [
    {
      step: '1',
      title: 'طلب عرض السعر',
      description: 'تواصل معنا وأرسل تفاصيل البضائع للحصول على عرض سعر مفصل'
    },
    {
      step: '2',
      title: 'تأكيد الطلب',
      description: 'بعد الموافقة على العرض، نقوم بتأكيد الطلب وبدء الترتيبات'
    },
    {
      step: '3',
      title: 'التجميع والشحن',
      description: 'نقوم بتجميع البضائع من الموردين وترتيب عملية الشحن'
    },
    {
      step: '4',
      title: 'التتبع والمراقبة',
      description: 'تتبع مباشر لشحنتك من لحظة المغادرة حتى الوصول'
    },
    {
      step: '5',
      title: 'التسليم',
      description: 'استلام البضائع في الميناء أو التوصيل إلى عنوانك'
    }
  ];

  return (
    <Layout>
      <Head>
        <title>{t('nav.services')} - {t('site.title')}</title>
        <meta name="description" content="خدمات الشحن المتكاملة من الصين إلى ليبيا - شحن بحري، جوي، وبري مع الحصان الذهبي" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gold-500 to-gold-600 text-white section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-hero mb-6">
              خدماتنا المتكاملة
            </h1>
            <p className="text-xl md:text-2xl text-gold-100 max-w-3xl mx-auto">
              حلول شحن شاملة تلبي جميع احتياجاتكم من الصين إلى ليبيا
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              أنواع الشحن
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اختر نوع الشحن المناسب لاحتياجاتك وميزانيتك
            </p>
          </div>

          <div className="space-y-12">
            {services.map((service, index) => (
              <div key={index} className={`${service.bgColor} rounded-2xl p-8 lg:p-12`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mr-4`}>
                        <service.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                        <p className={`${service.textColor} font-medium`}>{service.subtitle}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {service.description}
                    </p>



                    <Link
                      href="/contact"
                      className={`inline-flex items-center bg-gradient-to-r ${service.color} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200`}
                    >
                      احصل على عرض سعر
                    </Link>
                  </div>

                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">المميزات الرئيسية</h4>
                      <ul className="space-y-3">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <CheckCircle className={`h-5 w-5 ${service.textColor} mr-3 flex-shrink-0`} />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              خدمات إضافية
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              خدمات متكاملة لتسهيل عملية الشحن والاستيراد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="card text-center group hover-lift">
                <div className="w-16 h-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              كيف نعمل
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              عملية بسيطة وواضحة من البداية حتى التسليم
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gold-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl relative z-10">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gold-500 to-gold-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            جاهز لبدء الشحن؟
          </h2>
          <p className="text-xl mb-8 text-gold-100 max-w-3xl mx-auto">
            تواصل معنا اليوم للحصول على عرض سعر مخصص لاحتياجاتك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-gold-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              احصل على عرض سعر
            </Link>
            <Link
              href="/tracking"
              className="border-2 border-white text-white hover:bg-white hover:text-gold-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200"
            >
              تتبع شحنتك
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

export default ServicesPage;
