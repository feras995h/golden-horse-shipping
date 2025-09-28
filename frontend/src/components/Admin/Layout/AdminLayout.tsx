import { useState, ReactNode, memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useAuth, usePermissions } from '@/lib/auth';
import { settingsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  Ship,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
  User,
  ChevronDown,
  UserCog,
  ImageIcon
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isAdmin } = usePermissions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Fetch public settings for logo
  const { data: settings } = useQuery(
    'public-settings',
    () => settingsAPI.getPublic(),
    {
      select: (res) => res.data,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const navigation = useMemo(() => {
    const baseNavigation = [
      {
        name: 'لوحة التحكم',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        current: router.pathname === '/admin/dashboard'
      },
      {
        name: 'العملاء',
        href: '/admin/clients',
        icon: Users,
        current: router.pathname.startsWith('/admin/clients')
      },
      {
        name: 'الشحنات',
        href: '/admin/shipments',
        icon: Package,
        current: router.pathname.startsWith('/admin/shipments')
      },
      {
        name: 'تتبع الشحن',
        href: '/admin/tracking',
        icon: Ship,
        current: router.pathname.startsWith('/admin/tracking')
      },
      {
        name: 'الإعلانات',
        href: '/admin/ads',
        icon: Megaphone,
        current: router.pathname.startsWith('/admin/ads')
      },
      {
        name: 'التقارير',
        href: '/admin/reports',
        icon: BarChart3,
        current: router.pathname.startsWith('/admin/reports')
      }
    ];

    if (isAdmin()) {
      baseNavigation.push(
        {
          name: 'المستخدمين',
          href: '/admin/users',
          icon: UserCog,
          current: router.pathname.startsWith('/admin/users')
        },
        {
          name: 'الشعار',
          href: '/admin/logo',
          icon: ImageIcon,
          current: router.pathname.startsWith('/admin/logo')
        },
        {
          name: 'الإعدادات',
          href: '/admin/settings',
          icon: Settings,
          current: router.pathname.startsWith('/admin/settings')
        }
      );
    }

    return baseNavigation;
  }, [router.pathname, isAdmin]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/admin/login');
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"></div>
      
      {/* Top Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gold-200/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse flex-shrink-0">
              <div className="w-10 h-10 flex-shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-600 rounded-xl blur-sm opacity-30"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-xl p-1">
                  <Image
                    src={settings?.logoUrl || "/images/logo.svg"}
                    alt={settings?.logoAlt || "شعار الشركة"}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>
              </div>
              <div className="flex-shrink-0 min-w-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gold-600 via-gold-500 to-gold-700 bg-clip-text text-transparent truncate max-w-48 hover:from-gold-500 hover:to-gold-600 transition-all duration-300">
                  {settings?.siteName || "شركة الحصان الذهبي للشحن"}
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block flex-1 mx-8">
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      relative flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 whitespace-nowrap group overflow-hidden
                      ${item.current
                        ? 'bg-gradient-to-r from-gold-100 to-gold-50 text-gold-700 shadow-lg shadow-gold-200/50 border border-gold-200'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:text-gray-900 hover:shadow-md hover:shadow-gray-200/50'
                      }
                    `}
                  >
                    {item.current && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 to-gold-600/10 rounded-xl"></div>
                    )}
                    <item.icon className={`ml-2 h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                      item.current ? 'text-gold-600' : 'group-hover:text-gold-500'
                    }`} />
                    <span className="truncate relative z-10">{item.name}</span>
                    {item.current && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-3 space-x-reverse flex-shrink-0">
              {/* Notifications */}
              <button className="relative text-gray-500 hover:text-gold-600 p-2 rounded-xl hover:bg-gold-50 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400/0 to-gold-600/0 group-hover:from-gold-400/10 group-hover:to-gold-600/10 rounded-xl transition-all duration-300"></div>
                <Bell className="h-5 w-5 relative z-10" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30 animate-pulse"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 bg-gradient-to-r from-gray-50 to-white hover:from-gold-50 hover:to-gold-100 rounded-xl px-3 py-2 min-w-0 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-gold-200"
                >
                  <div className="w-7 h-7 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center ml-2 flex-shrink-0 shadow-lg shadow-gold-500/30">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden xl:block truncate max-w-32 font-medium">{user?.fullName}</span>
                  <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0 transition-transform duration-300" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gold-200/30 py-1 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gold-50/30 to-white"></div>
                    <Link
                      href="/admin/profile"
                      className="relative block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gold-50 hover:to-gold-100 hover:text-gold-700 transition-all duration-200"
                    >
                      الملف الشخصي
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="relative block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gold-50 hover:to-gold-100 hover:text-gold-700 transition-all duration-200"
                    >
                      الإعدادات
                    </Link>
                    <div className="border-t border-gold-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="relative block w-full text-right px-4 py-2 text-sm text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden relative text-gray-500 hover:text-gold-600 p-2 rounded-xl hover:bg-gold-50 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400/0 to-gold-600/0 group-hover:from-gold-400/10 group-hover:to-gold-600/10 rounded-xl transition-all duration-300"></div>
                <Menu className="h-5 w-5 relative z-10" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gold-200/30 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              <div className="grid grid-cols-2 gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      relative flex items-center justify-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 group overflow-hidden
                      ${item.current
                        ? 'bg-gradient-to-r from-gold-100 to-gold-50 text-gold-700 shadow-lg shadow-gold-200/50 border border-gold-200'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:text-gray-900 hover:shadow-md hover:shadow-gray-200/50 border border-gray-200 hover:border-gold-200'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.current && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 to-gold-600/10 rounded-xl"></div>
                    )}
                    <item.icon className={`ml-2 h-5 w-5 transition-all duration-300 ${
                      item.current ? 'text-gold-600' : 'group-hover:text-gold-500'
                    }`} />
                    <span className="truncate relative z-10">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <div className="w-full">
        {/* Page header */}
        {title && (
          <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gold-200/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-50/50 to-transparent rounded-lg"></div>
                <h1 className="relative text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {title}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-100 via-transparent to-gold-50"></div>
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Click outside to close dropdown */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}

      {/* Click outside to close mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default memo(AdminLayout);
