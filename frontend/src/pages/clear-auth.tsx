import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ClearAuthPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear all authentication data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
      
      // Clear any other auth-related items
      localStorage.clear();
      
      // Redirect to home page
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري مسح بيانات المصادقة...</p>
      </div>
    </div>
  );
};

export default ClearAuthPage;
