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
    <header className="sticky top-0 z-50 bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse flex-shrink-0">
            <div className="w-10 h-10 flex-shrink-0">
              <Image
                src={settings?.logoUrl || "/images/logo.svg"}
                alt={settings?.logoAlt || "Golden Horse Logo"}
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="text-2xl font-extrabold tracking-tight hidden sm:block">
              <span className="text-gray-900">{t('site.title')}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {/* Main Navigation Links */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link link-underline text-base font-semibold ${router.pathname === item.href ? 'nav-link-active' : ''}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse border-r border-gray-200 pr-4">
              {/* Language Switcher */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Globe className="h-5 w-5 text-gray-500" />
                <select
                  value={router.locale}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="text-base bg-transparent border border-gray-200 rounded-md px-3 py-2 focus-ring cursor-pointer"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Admin Link */}
              <Link
                href="/admin"
                className="btn-primary text-base font-semibold px-6 py-3"
              >
                {t('nav.admin')}
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gold-600 p-2 rounded-md focus-ring"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-4 pt-4">
            <div className="flex flex-col space-y-3">
              {/* Navigation Links */}
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
                      router.pathname === item.href 
                        ? 'bg-gold-100 text-gold-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Controls */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                {/* Mobile Language Switcher */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Globe className="h-6 w-6 text-gray-500" />
                    <span className="text-base font-semibold text-gray-700">اللغة</span>
                  </div>
                  <select
                    value={router.locale}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="text-base bg-white border border-gray-200 rounded-md px-3 py-2 focus-ring"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Mobile Admin Link */}
                <Link
                  href="/admin"
                  className="block w-full text-center btn-primary text-base font-semibold py-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.admin')}
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
