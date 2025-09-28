import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Home, 
  Package, 
  User, 
  LogOut, 
  Menu, 
  X,
  Ship,
  MapPin,
  DollarSign
} from 'lucide-react';

interface CustomerLayoutProps {
  children: ReactNode;
}

interface CustomerData {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check authentication and load customer data
    const token = localStorage.getItem('customerToken');
    const storedCustomerData = localStorage.getItem('customerData');

    if (!token || !storedCustomerData) {
      router.push('/customer/login');
      return;
    }

    try {
      const parsedCustomerData = JSON.parse(storedCustomerData);
      setCustomerData(parsedCustomerData);
    } catch (error) {
      console.error('Error parsing customer data:', error);
      router.push('/customer/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    router.push('/customer/login');
  };

  const navigation = [
    {
      name: 'لوحة التحكم',
      href: '/customer/dashboard',
      icon: Home,
      current: router.pathname === '/customer/dashboard',
    },
    {
      name: 'شحناتي',
      href: '/customer/shipments',
      icon: Package,
      current: router.pathname.startsWith('/customer/shipments'),
    },
    {
      name: 'البيانات المالية',
      href: '/customer/financial',
      icon: DollarSign,
      current: router.pathname.startsWith('/customer/financial'),
    },
    {
      name: 'الملف الشخصي',
      href: '/customer/profile',
      icon: User,
      current: router.pathname === '/customer/profile',
    },
    {
      name: 'تتبع عام',
      href: '/tracking',
      icon: MapPin,
      current: router.pathname === '/tracking',
    },
  ];

  if (!customerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-yellow-50/20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)] pointer-events-none" />
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gold-200/50">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gold-200/30 bg-gradient-to-r from-gold-50/50 to-amber-50/30">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-gold-600 to-amber-600 bg-clip-text text-transparent">القائمة</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gold-400 hover:text-gold-600 transition-colors p-1 rounded-lg hover:bg-gold-100/50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300 group ${
                    item.current
                      ? 'bg-gradient-to-r from-gold-100 to-amber-100 text-gold-700 shadow-lg shadow-gold-200/50 border border-gold-200/50'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gold-50 hover:to-amber-50 hover:text-gold-600 hover:shadow-md hover:shadow-gold-100/50'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className={`h-6 w-6 ml-3 transition-all duration-300 ${
                    item.current 
                      ? 'text-gold-600 drop-shadow-sm' 
                      : 'group-hover:text-gold-500 group-hover:scale-110'
                  }`} />
                  <span className="relative">
                    {item.name}
                    {item.current && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 to-amber-400 rounded-full" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gold-200/30 p-4 bg-gradient-to-r from-red-50/50 to-rose-50/30">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-xl transition-all duration-300 group hover:shadow-md hover:shadow-red-100/50"
            >
              <LogOut className="h-5 w-5 ml-3 group-hover:scale-110 transition-transform duration-300" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:w-64 lg:flex lg:flex-col">
        <div className="flex flex-col flex-1 bg-white/95 backdrop-blur-xl border-l border-gold-200/50 shadow-2xl">
          {/* Logo and customer info */}
          <div className="flex flex-col items-center px-6 py-6 border-b border-gold-200/30 bg-gradient-to-br from-gold-50/50 via-amber-50/30 to-yellow-50/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-100/20 to-amber-100/10 rounded-t-xl" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-gold-200/50 border-2 border-gold-300/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
              <Ship className="h-10 w-10 text-white drop-shadow-lg relative z-10" />
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-gold-700 via-gold-600 to-amber-600 bg-clip-text text-transparent text-center relative z-10">
              {customerData.customerName}
            </h2>
            <p className="text-sm text-gold-600/80 text-center font-medium relative z-10">
              {customerData.trackingNumber}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300 group relative ${
                    item.current
                      ? 'bg-gradient-to-r from-gold-100 to-amber-100 text-gold-700 shadow-lg shadow-gold-200/50 border border-gold-200/50'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gold-50 hover:to-amber-50 hover:text-gold-600 hover:shadow-md hover:shadow-gold-100/50'
                  }`}
                >
                  {item.current && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gold-200/30 to-amber-200/20 rounded-xl" />
                  )}
                  <Icon className={`h-6 w-6 ml-3 transition-all duration-300 relative z-10 ${
                    item.current 
                      ? 'text-gold-600 drop-shadow-sm' 
                      : 'group-hover:text-gold-500 group-hover:scale-110'
                  }`} />
                  <span className="relative z-10">
                    {item.name}
                    {item.current && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 to-amber-400 rounded-full" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t border-gold-200/30 p-4 bg-gradient-to-r from-red-50/50 to-rose-50/30">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-xl transition-all duration-300 group hover:shadow-md hover:shadow-red-100/50"
            >
              <LogOut className="h-5 w-5 ml-3 group-hover:scale-110 transition-transform duration-300" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gold-200/50 px-4 py-4 lg:px-8 shadow-lg shadow-gold-100/20">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-50/30 via-amber-50/20 to-yellow-50/10" />
          <div className="flex items-center justify-between relative z-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gold-400 hover:text-gold-600 lg:hidden p-2 rounded-lg hover:bg-gold-100/50 transition-all duration-300"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gold-700 via-gold-600 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                  Golden Horse Shipping
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-8 lg:px-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
