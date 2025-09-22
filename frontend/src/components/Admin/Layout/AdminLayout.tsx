import { useState, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useAuth, usePermissions } from '@/lib/auth';
import { settingsAPI } from '@/lib/api';
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

  const navigation = [
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
    navigation.push({
      name: 'المستخدمين',
      href: '/admin/users',
      icon: UserCog,
      current: router.pathname.startsWith('/admin/users')
    });
    navigation.push({
      name: 'الشعار',
      href: '/admin/logo',
      icon: ImageIcon,
      current: router.pathname.startsWith('/admin/logo')
    });
    navigation.push({
      name: 'الإعدادات',
      href: '/admin/settings',
      icon: Settings,
      current: router.pathname.startsWith('/admin/settings')
    });
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse flex-shrink-0">
              <div className="w-8 h-8 flex-shrink-0">
                <Image
                  src={settings?.logoUrl || "/images/logo.svg"}
                  alt={settings?.logoAlt || "شعار الشركة"}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-shrink-0 min-w-0">
                <h1 className="text-xl font-bold text-gold-600 truncate max-w-48">
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
                      flex items-center px-4 py-3 rounded-md text-base font-semibold transition-colors whitespace-nowrap
                      ${item.current
                        ? 'bg-gold-100 text-gold-700 border-b-2 border-gold-500'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="ml-2 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-3 space-x-reverse flex-shrink-0">
              {/* Notifications */}
              <button className="text-gray-500 hover:text-gray-700 relative p-2">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 bg-gray-50 rounded-full px-3 py-2 min-w-0"
                >
                  <div className="w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden xl:block truncate max-w-32">{user?.fullName}</span>
                  <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      الملف الشخصي
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      الإعدادات
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-right px-4 py-2 text-sm text-red-700 hover:bg-red-50"
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
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <div className="grid grid-cols-2 gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center justify-center px-4 py-3 rounded-lg text-base font-semibold transition-colors
                      ${item.current
                        ? 'bg-gold-100 text-gold-700 border-2 border-gold-500'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="ml-2 h-5 w-5" />
                    <span className="truncate">{item.name}</span>
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
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
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

export default AdminLayout;
