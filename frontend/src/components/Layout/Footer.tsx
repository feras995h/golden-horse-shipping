import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Ship, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="bg-gradient-to-r from-gold-500 to-gold-600 p-2 rounded-lg">
                <Ship className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">{t('site.title')}</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('site.tagline')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gold-400">{t('nav.services')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('services.sea.title')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('services.air.title')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('services.land.title')}
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('nav.tracking')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gold-400">{t('footer.about')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('nav.about')}
                </Link>
              </li>

              <li>
                <Link href="/ads" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('nav.ads')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gold-400">{t('footer.contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <MapPin className="h-4 w-4 text-gold-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  طرابلس، ليبيا
                </span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-4 w-4 text-gold-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  +218 21 123 4567
                </span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-4 w-4 text-gold-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  info@goldenhorse.ly
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 {t('site.title')}. {t('footer.rights')}.
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors link-underline">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors link-underline">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
