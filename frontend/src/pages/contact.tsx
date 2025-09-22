import { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Globe, Users } from 'lucide-react';

const ContactPage = () => {
  const { t } = useTranslation('common');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    serviceType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        serviceType: 'general'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'الهاتف',
      details: ['+218 21 123 4567', '+218 91 234 5678'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      details: ['info@goldenhorse-shipping.ly', 'support@goldenhorse-shipping.ly'],
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: MapPin,
      title: 'العنوان',
      details: ['شارع الجمهورية، طرابلس، ليبيا', 'مقابل ميناء طرابلس'],
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      details: ['الأحد - الخميس: 8:00 - 17:00', 'الجمعة: 8:00 - 12:00'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const offices = [
    {
      city: 'طرابلس',
      address: 'شارع الجمهورية، مقابل ميناء طرابلس',
      phone: '+218 21 123 4567',
      email: 'tripoli@goldenhorse-shipping.ly',
      manager: 'أحمد محمد الليبي'
    },
    {
      city: 'بنغازي',
      address: 'شارع جمال عبد الناصر، بنغازي',
      phone: '+218 61 234 5678',
      email: 'benghazi@goldenhorse-shipping.ly',
      manager: 'فاطمة علي السنوسي'
    },
    {
      city: 'شنغهاي',
      address: 'Shanghai Free Trade Zone, China',
      phone: '+86 21 1234 5678',
      email: 'shanghai@goldenhorse-shipping.ly',
      manager: 'Li Wei'
    }
  ];

  const serviceTypes = [
    { value: 'general', label: 'استفسار عام' },
    { value: 'quote', label: 'طلب عرض سعر' },
    { value: 'tracking', label: 'تتبع شحنة' },
    { value: 'complaint', label: 'شكوى أو اقتراح' },
    { value: 'partnership', label: 'شراكة تجارية' }
  ];

  return (
    <Layout>
      <Head>
        <title>{t('nav.contact')} - {t('site.title')}</title>
        <meta name="description" content="تواصل مع الحصان الذهبي للشحن - خدمة عملاء متميزة ودعم فني على مدار الساعة" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gold-500 to-gold-600 text-white section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-hero mb-6">
              تواصل معنا
            </h1>
            <p className="text-xl md:text-2xl text-gold-100 max-w-3xl mx-auto">
              نحن هنا لخدمتكم على مدار الساعة - تواصلوا معنا بأي طريقة تناسبكم
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className={`${info.bgColor} rounded-2xl p-6 text-center`}>
                <div className={`w-16 h-16 ${info.color} bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <info.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {info.title}
                </h3>
                {info.details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="text-gray-700 mb-1">
                    {detail}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="section-title mb-4">
                  أرسل لنا رسالة
                </h2>
                <p className="text-gray-600">
                  املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="input-field"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="input-field"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      className="input-field"
                      placeholder="+218 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الشركة
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({...form, company: e.target.value})}
                      className="input-field"
                      placeholder="اسم شركتك (اختياري)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الاستفسار
                  </label>
                  <select
                    value={form.serviceType}
                    onChange={(e) => setForm({...form, serviceType: e.target.value})}
                    className="input-field"
                  >
                    {serviceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموضوع *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                    className="input-field"
                    placeholder="موضوع رسالتك"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرسالة *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    className="input-field resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="loading-spinner mr-2" />
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.
                  </div>
                )}
              </form>
            </div>

            {/* Map & Additional Info */}
            <div>
              <div className="mb-8">
                <h2 className="section-title mb-4">
                  موقعنا
                </h2>
                <p className="text-gray-600">
                  مكتبنا الرئيسي في قلب طرابلس، بالقرب من الميناء
                </p>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-2xl h-64 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">خريطة الموقع</p>
                  <p className="text-sm text-gray-400">طرابلس، ليبيا</p>
                </div>
              </div>

              {/* Quick Contact Options */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center">
                  <Phone className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">اتصل بنا الآن</p>
                    <p className="text-sm text-gray-600">+218 21 123 4567</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                  <MessageCircle className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">واتساب</p>
                    <p className="text-sm text-gray-600">+218 91 234 5678</p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center">
                  <Mail className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">البريد الإلكتروني</p>
                    <p className="text-sm text-gray-600">info@goldenhorse-shipping.ly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              مكاتبنا حول العالم
            </h2>
            <p className="text-xl text-gray-600">
              شبكة مكاتب واسعة لخدمتكم في أي مكان
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  مكتب {office.city}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {office.address}
                  </p>
                  <p className="flex items-center justify-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {office.phone}
                  </p>
                  <p className="flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {office.email}
                  </p>
                  <p className="flex items-center justify-center">
                    <Users className="h-4 w-4 mr-2" />
                    {office.manager}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              الأسئلة الشائعة
            </h2>
            <p className="text-xl text-gray-600">
              إجابات سريعة على أكثر الأسئلة شيوعاً
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                كم تستغرق عملية الشحن من الصين إلى ليبيا؟
              </h3>
              <p className="text-gray-600">
                يعتمد ذلك على نوع الشحن: الشحن البحري يستغرق 25-35 يوماً، الشحن الجوي 3-7 أيام، والشحن البري 1-3 أيام للتوصيل المحلي.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                هل يمكنني تتبع شحنتي؟
              </h3>
              <p className="text-gray-600">
                نعم، يمكنك تتبع شحنتك في أي وقت من خلال رقم التتبع أو رقم العميل على موقعنا الإلكتروني.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ما هي طرق الدفع المتاحة؟
              </h3>
              <p className="text-gray-600">
                نقبل الدفع نقداً، التحويل البنكي، والدفع الإلكتروني. يمكن الدفع مقدماً أو عند الاستلام حسب نوع الخدمة.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                هل تقدمون خدمة التأمين على البضائع؟
              </h3>
              <p className="text-gray-600">
                نعم، نوفر تأمين شامل على البضائع بنسبة 0.5% من قيمة البضاعة لحمايتها من جميع المخاطر المحتملة.
              </p>
            </div>
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

export default ContactPage;
