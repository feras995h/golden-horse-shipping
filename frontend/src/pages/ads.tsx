import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout/Layout';
import { ExternalLink, Calendar, Eye, Tag, Search, Filter } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  tags: string[];
  startDate: string;
  endDate: string;
  viewCount: number;
  clickCount: number;
  status: 'active' | 'inactive' | 'expired';
}

const AdsPage = () => {
  const { t } = useTranslation('common');
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockAds: Ad[] = [
      {
        id: 1,
        title: 'خصم خاص على الشحن البحري',
        description: 'احصل على خصم 20% على جميع شحنات الحاويات الكاملة لفترة محدودة',
        imageUrl: '/images/ads/sea-shipping-discount.jpg',
        link: '/services',
        tags: ['خصم', 'شحن بحري', 'حاويات'],
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        viewCount: 1250,
        clickCount: 89,
        status: 'active'
      },
      {
        id: 2,
        title: 'خدمة الشحن السريع الجديدة',
        description: 'خدمة شحن جوي جديدة بأسعار منافسة ووقت تسليم أقل',
        imageUrl: '/images/ads/fast-shipping.jpg',
        link: '/pricing',
        tags: ['جديد', 'شحن جوي', 'سريع'],
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        viewCount: 890,
        clickCount: 67,
        status: 'active'
      },
      {
        id: 3,
        title: 'افتتاح مكتب جديد في بنغازي',
        description: 'نعلن عن افتتاح مكتبنا الجديد في بنغازي لخدمة عملائنا في المنطقة الشرقية',
        imageUrl: '/images/ads/new-office.jpg',
        tags: ['افتتاح', 'مكتب', 'بنغازي'],
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        viewCount: 456,
        clickCount: 23,
        status: 'expired'
      },
      {
        id: 4,
        title: 'شراكة جديدة مع موانئ الصين',
        description: 'توقيع اتفاقية شراكة استراتيجية مع أكبر موانئ الصين لتحسين خدماتنا',
        imageUrl: '/images/ads/partnership.jpg',
        link: '/about',
        tags: ['شراكة', 'موانئ', 'الصين'],
        startDate: '2024-02-10',
        endDate: '2024-05-10',
        viewCount: 678,
        clickCount: 45,
        status: 'active'
      },
      {
        id: 5,
        title: 'تطبيق الهاتف المحمول قريباً',
        description: 'تطبيق جديد للهواتف الذكية لتتبع الشحنات وإدارة الطلبات بسهولة',
        imageUrl: '/images/ads/mobile-app.jpg',
        tags: ['تطبيق', 'هاتف', 'تتبع'],
        startDate: '2024-03-01',
        endDate: '2024-06-01',
        viewCount: 234,
        clickCount: 12,
        status: 'active'
      },
      {
        id: 6,
        title: 'خدمة التخليص الجمركي المطورة',
        description: 'نظام جديد للتخليص الجمركي يقلل أوقات الانتظار بنسبة 50%',
        imageUrl: '/images/ads/customs-clearance.jpg',
        link: '/services',
        tags: ['تخليص', 'جمارك', 'تطوير'],
        startDate: '2024-01-20',
        endDate: '2024-04-20',
        viewCount: 567,
        clickCount: 34,
        status: 'active'
      }
    ];

    setTimeout(() => {
      setAds(mockAds);
      setFilteredAds(mockAds.filter(ad => ad.status === 'active'));
      setLoading(false);
    }, 1000);
  }, []);

  // Get all unique tags
  const allTags = Array.from(new Set(ads.flatMap(ad => ad.tags)));

  // Filter ads based on search and tag
  useEffect(() => {
    let filtered = ads.filter(ad => ad.status === 'active');

    if (searchTerm) {
      filtered = filtered.filter(ad =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(ad => ad.tags.includes(selectedTag));
    }

    setFilteredAds(filtered);
  }, [searchTerm, selectedTag, ads]);

  const handleAdClick = (ad: Ad) => {
    // In real app, this would increment click count via API
    setAds(prevAds =>
      prevAds.map(a =>
        a.id === ad.id ? { ...a, clickCount: a.clickCount + 1 } : a
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'expired':
        return 'منتهي';
      default:
        return 'غير نشط';
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="section bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-panel p-6">
                  <div className="skeleton h-48 w-full mb-4 rounded-xl"></div>
                  <div className="skeleton h-6 w-2/3 mb-2"></div>
                  <div className="skeleton h-4 w-full mb-1"></div>
                  <div className="skeleton h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>الإعلانات والعروض - {t('site.title')}</title>
        <meta name="description" content="اطلع على أحدث الإعلانات والعروض الخاصة من الحصان الذهبي للشحن" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gold-500 to-gold-600 text-white section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-hero mb-6">
              الإعلانات والعروض
            </h1>
            <p className="text-xl md:text-2xl text-gold-100 max-w-3xl mx-auto">
              اكتشف أحدث العروض والخدمات الجديدة من الحصان الذهبي للشحن
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="section-tight bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الإعلانات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pr-10"
                />
              </div>

              {/* Tag Filter */}
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="input-field pr-10"
                >
                  <option value="">جميع الفئات</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-center text-gray-600">
              عرض {filteredAds.length} من {ads.filter(ad => ad.status === 'active').length} إعلان
            </div>
          </div>
        </div>
      </section>

      {/* Ads Grid */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد إعلانات
              </h3>
              <p className="text-gray-600">
                لم نجد أي إعلانات تطابق معايير البحث الخاصة بك
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAds.map((ad) => (
                <div key={ad.id} className="card group hover-lift">
                  {/* Ad Image */}
                  {ad.imageUrl && (
                    <div className="relative h-48 mb-6 bg-gray-200 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                          {getStatusText(ad.status)}
                        </span>
                      </div>
                      {/* Placeholder for image */}
                      <div className="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-4xl mb-2">📢</div>
                          <p className="text-sm">صورة الإعلان</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ad Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gold-600 transition-colors">
                      {ad.title}
                    </h3>

                    <p className="text-gray-600 line-clamp-3">
                      {ad.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {ad.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gold-100 text-gold-800 text-xs font-medium rounded-full"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {ad.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{ad.tags.length - 3} المزيد
                        </span>
                      )}
                    </div>

                    {/* Date and Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(ad.startDate)}
                      </div>
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {ad.viewCount}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {ad.link && (
                      <Link
                        href={ad.link}
                        onClick={() => handleAdClick(ad)}
                        className="inline-flex items-center text-gold-600 hover:text-gold-700 font-medium"
                      >
                        اقرأ المزيد
                        <ExternalLink className="h-4 w-4 mr-2" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section bg-gradient-to-r from-gold-500 to-gold-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            لا تفوت أي عرض جديد
          </h2>
          <p className="text-xl mb-8 text-gold-100">
            اشترك في نشرتنا الإخبارية لتصلك أحدث العروض والإعلانات
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
              />
              <button className="bg-white text-gold-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors">
                اشترك الآن
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            هل تحتاج مساعدة؟
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            فريق خدمة العملاء جاهز لمساعدتك في أي استفسار حول عروضنا وخدماتنا
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-primary"
            >
              تواصل معنا
            </Link>
            <Link
              href="/services"
              className="btn-secondary"
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

export default AdsPage;
