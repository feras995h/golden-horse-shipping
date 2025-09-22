import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import { Users, Award, Globe, Clock, Shield, Target } from 'lucide-react';

const AboutPage = () => {
  const { t } = useTranslation('common');

  const values = [
    {
      icon: Shield,
      title: t('about.values.transparency'),
      description: 'نحن نؤمن أن الثقة تبدأ بالوضوح',
    },
    {
      icon: Target,
      title: t('about.values.responsibility'),
      description: 'نضمن التزامنا تجاه عملائنا من التعاقد حتى التسليم',
    },
    {
      icon: Award,
      title: t('about.values.professionalism'),
      description: 'فرق عمل مدربة وإجراءات دقيقة في كل مرحلة',
    },
    {
      icon: Globe,
      title: t('about.values.flexibility'),
      description: 'حلول مخصصة تناسب متطلبات السوق المتغيرة',
    },
    {
      icon: Users,
      title: t('about.values.guarantee'),
      description: 'عقود قانونية وضمانات حقيقية على الجودة',
    },
  ];

  const team = [
    {
      name: 'أحمد محمد',
      position: 'المدير العام',
      experience: '15 سنة خبرة في مجال الشحن',
      image: '/team/ceo.jpg',
    },
    {
      name: 'فاطمة علي',
      position: 'مديرة العمليات',
      experience: '12 سنة خبرة في اللوجستيات',
      image: '/team/operations.jpg',
    },
    {
      name: 'محمد حسن',
      position: 'مدير خدمة العملاء',
      experience: '8 سنوات خبرة في خدمة العملاء',
      image: '/team/customer-service.jpg',
    },
  ];

  const stats = [
    { number: '5000+', label: 'شحنة سنوياً' },
    { number: '500+', label: 'عميل راضٍ' },
    { number: '15+', label: 'سنة خبرة' },
    { number: '98%', label: 'معدل الرضا' },
  ];

  return (
    <Layout>
      <Head>
        <title>{t('nav.about')} - {t('site.title')}</title>
        <meta name="description" content="تعرف على شركة الحصان الذهبي للشحن - خبرة 15 عاماً في الشحن من الصين إلى ليبيا" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gold-500 to-gold-600 text-white section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-hero mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gold-100 max-w-3xl mx-auto">
              {t('about.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-6">
                {t('about.vision.title')}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {t('about.vision.content')}
                </p>
              </div>

              <h2 className="section-title mb-6 mt-12">
                {t('about.mission.title')}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {t('about.mission.content')}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold mb-2">{stat.number}</div>
                      <div className="text-gold-100">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              {t('about.values.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نؤمن بأن النجاح يأتي من الالتزام بالقيم الأساسية التي تحكم عملنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              فريق العمل
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              فريق من المحترفين المتخصصين في مجال الشحن واللوجستيات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center group hover-lift">
                <div className="w-32 h-32 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-gold-600 font-semibold mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600">
                  {member.experience}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="card">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-gold-600 mr-4" />
                <h3 className="text-2xl font-bold text-gray-900">رسالتنا</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                نسعى لتقديم خدمات شحن متميزة تربط بين الأسواق الصينية والليبية، مع ضمان
                الجودة والسرعة والأمان في كل عملية شحن. نهدف إلى أن نكون الشريك الموثوق
                للتجار والشركات في رحلة نمو أعمالهم.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-gold-600 mr-4" />
                <h3 className="text-2xl font-bold text-gray-900">رؤيتنا</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                أن نصبح الشركة الرائدة في مجال الشحن بين الصين وليبيا، ونوسع خدماتنا
                لتشمل المزيد من الدول العربية والأفريقية، مع الحفاظ على أعلى معايير
                الجودة والخدمة المتميزة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              الشهادات والاعتمادات
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نحمل جميع التراخيص والشهادات المطلوبة لضمان خدمة آمنة وقانونية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Award className="h-16 w-16 text-gold-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ترخيص وزارة النقل</h3>
              <p className="text-gray-600">مرخص من وزارة النقل الليبية</p>
            </div>
            <div className="card text-center">
              <Award className="h-16 w-16 text-gold-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">شهادة ISO 9001</h3>
              <p className="text-gray-600">معتمد لإدارة الجودة</p>
            </div>
            <div className="card text-center">
              <Award className="h-16 w-16 text-gold-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">عضوية FIATA</h3>
              <p className="text-gray-600">عضو في الاتحاد الدولي لوكلاء الشحن</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gold-500 to-gold-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ابدأ رحلة الشحن معنا اليوم
          </h2>
          <p className="text-xl mb-8 text-gold-100 max-w-3xl mx-auto">
            انضم إلى مئات العملاء الذين يثقون بخدماتنا لشحن بضائعهم بأمان وسرعة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-gold-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              تواصل معنا
            </Link>
            <Link
              href="/services"
              className="border-2 border-white text-white hover:bg-white hover:text-gold-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200"
            >
              تعرف على خدماتنا
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

export default AboutPage;
