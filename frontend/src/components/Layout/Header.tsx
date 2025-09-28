import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery } from 'react-query';
import { Menu, X, Globe } from 'lucide-react';
import { settingsAPI } from '@/lib/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();

  // Fetch public settings for logo
  const { data: settings } = useQuery(
    'public-settings',
    () => settingsAPI.getPublic(),
    {
      select: (res) => res.data,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.services'), href: '/services' },

    { name: t('nav.tracking'), href: '/tracking' },
    { name: t('nav.ads'), href: '/ads' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-elegant-50/95 via-white/95 to-luxury-50/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur-xl border-b border-gold-200/50 shadow-xl shadow-gold-500/10">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-luxury-400 to-gold-600"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse flex-shrink-0 group">
            <div className="w-12 h-12 flex-shrink-0 relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-luxury-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-gold-100 to-luxury-200 rounded-full p-1 shadow-lg">
                <Image
                  src={settings?.logoUrl || "/images/logo.svg"}
                  alt={settings?.logoAlt || "Golden Horse Logo"}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
            <div className="text-2xl font-extrabold tracking-tight hidden sm:block">
              <span className="bg-gradient-to-r from-elegant-900 via-gold-700 to-luxury-800 bg-clip-text text-transparent group-hover:from-gold-600 group-hover:via-luxury-600 group-hover:to-gold-800 transition-all duration-300">
                {t('site.title')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {/* Main Navigation Links */}
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link link-underline text-base font-bold px-5 py-3 rounded-xl transition-all duration-300 relative group ${
                    router.pathname === item.href 
                      ? 'nav-link-active bg-gradient-to-r from-gold-100 to-luxury-100 text-gold-800 shadow-lg shadow-gold-500/20' 
                      : 'text-elegant-700 hover:text-gold-700'
                  }`}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-400/20 to-luxury-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <span className="relative z-10">{item.name}</span>
                </Link>
              ))}
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse border-r border-gold-200/50 pr-6 mr-2">
              {/* Language Switcher */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-elegant-50 to-luxury-50 rounded-xl p-3 shadow-md">
                <Globe className="h-5 w-5 text-gold-600" />
                <select
                  value={router.locale}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="text-base bg-transparent border-0 rounded-md px-2 py-1 focus-ring cursor-pointer text-elegant-800 font-semibold"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Admin Link */}
              <Link
                href="/admin"
                className="btn-primary text-base font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-luxury-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">{t('nav.admin')}</span>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-elegant-700 hover:text-gold-600 p-3 rounded-xl focus-ring bg-gradient-to-r from-elegant-50 to-luxury-50 shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t border-gold-200/50 mt-4 pt-6 bg-gradient-to-b from-elegant-50/80 to-luxury-50/80 backdrop-blur-sm">
            <div className="flex flex-col space-y-4">
              {/* Navigation Links */}
              <div className="space-y-3 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 relative group ${
                      router.pathname === item.href 
                        ? 'bg-gradient-to-r from-gold-100 to-luxury-100 text-gold-800 shadow-lg shadow-gold-500/20 border border-gold-200' 
                        : 'text-elegant-700 hover:bg-gradient-to-r hover:from-gold-50 hover:to-luxury-50 hover:text-gold-700 hover:shadow-md'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 to-luxury-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Mobile Controls */}
              <div className="border-t border-gold-200/50 pt-6 space-y-4 px-2">
                {/* Mobile Language Switcher */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-elegant-100 to-luxury-100 rounded-xl shadow-md">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Globe className="h-6 w-6 text-gold-600" />
                    <span className="text-base font-bold text-elegant-800">اللغة</span>
                  </div>
                  <select
                    value={router.locale}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="text-base bg-white border border-gold-200 rounded-lg px-4 py-2 focus-ring text-elegant-800 font-semibold shadow-sm"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Mobile Admin Link */}
                <Link
                  href="/admin"
                  className="block w-full text-center btn-primary text-base font-bold py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-luxury-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{t('nav.admin')}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
