import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth';

const DebugPage = () => {
  const router = useRouter();
  const { user, token, isLoading, isAuthenticated } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      setLocalStorageData({
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user'),
        customerToken: localStorage.getItem('customerToken'),
        customerUser: localStorage.getItem('customerUser'),
        allKeys: Object.keys(localStorage),
      });
    }
  }, []);

  const clearAllAuth = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const clearAdminAuth = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">صفحة التشخيص</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auth State */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">حالة المصادقة</h2>
              <div className="space-y-2 text-sm">
                <div><strong>مصادق:</strong> {isAuthenticated ? 'نعم' : 'لا'}</div>
                <div><strong>جاري التحميل:</strong> {isLoading ? 'نعم' : 'لا'}</div>
                <div><strong>المستخدم:</strong> {user ? user.username : 'غير موجود'}</div>
                <div><strong>الرمز المميز:</strong> {token ? 'موجود' : 'غير موجود'}</div>
              </div>
            </div>

            {/* Current Path */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">المسار الحالي</h2>
              <div className="text-sm">
                <div><strong>المسار:</strong> {currentPath}</div>
                <div><strong>Router Path:</strong> {router.pathname}</div>
                <div><strong>Router AsPath:</strong> {router.asPath}</div>
              </div>
            </div>

            {/* LocalStorage Data */}
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <h2 className="text-lg font-semibold mb-3">بيانات التخزين المحلي</h2>
              <div className="text-sm space-y-2">
                <div><strong>Admin Token:</strong> {localStorageData.token ? 'موجود' : 'غير موجود'}</div>
                <div><strong>Admin User:</strong> {localStorageData.user ? 'موجود' : 'غير موجود'}</div>
                <div><strong>Customer Token:</strong> {localStorageData.customerToken ? 'موجود' : 'غير موجود'}</div>
                <div><strong>Customer User:</strong> {localStorageData.customerUser ? 'موجود' : 'غير موجود'}</div>
                <div><strong>جميع المفاتيح:</strong> {localStorageData.allKeys?.join(', ') || 'لا توجد'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <h2 className="text-lg font-semibold mb-3">الإجراءات</h2>
              <div className="space-y-3">
                <button
                  onClick={clearAllAuth}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mr-3"
                >
                  مسح جميع بيانات المصادقة
                </button>
                <button
                  onClick={clearAdminAuth}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 mr-3"
                >
                  مسح بيانات مصادقة الإدارة فقط
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-3"
                >
                  الذهاب للصفحة الرئيسية
                </button>
                <button
                  onClick={() => router.push('/tracking')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mr-3"
                >
                  الذهاب لصفحة التتبع
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 md:col-span-2">
              <h2 className="text-lg font-semibold mb-3 text-blue-900">التعليمات</h2>
              <div className="text-sm text-blue-800 space-y-2">
                <p>1. إذا كنت تواجه مشكلة في التوجيه التلقائي، اضغط على &quot;مسح جميع بيانات المصادقة&quot;</p>
                <p>2. إذا كنت تريد الوصول للصفحة الرئيسية، اضغط على &quot;الذهاب للصفحة الرئيسية&quot;</p>
                <p>3. للوصول لصفحة التتبع العامة، اضغط على &quot;الذهاب لصفحة التتبع&quot;</p>
                <p>4. لتسجيل دخول العملاء، اذهب إلى: <code>/customer/login</code></p>
                <p>5. لتسجيل دخول الإدارة، اذهب إلى: <code>/admin/login</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
