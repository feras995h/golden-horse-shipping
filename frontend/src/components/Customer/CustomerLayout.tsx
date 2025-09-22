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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />
        <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">القائمة</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
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
                  className={`flex items-center px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                    item.current
                      ? 'bg-gold-100 text-gold-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="h-6 w-6 ml-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 ml-3" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:w-64 lg:flex lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-l border-gray-200">
          {/* Logo and customer info */}
          <div className="flex flex-col items-center px-6 py-6 border-b border-gray-200">
            <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mb-4">
              <Ship className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 text-center">
              {customerData.customerName}
            </h2>
            <p className="text-sm text-gray-600 text-center">
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
                  className={`flex items-center px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                    item.current
                      ? 'bg-gold-100 text-gold-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-6 w-6 ml-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 ml-3" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900">
                  Golden Horse Shipping
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
