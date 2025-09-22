import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import HomePage from './index';

const HomeRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear any authentication data that might be causing issues
    if (typeof window !== 'undefined') {
      // Only clear if we're being redirected from admin
      if (document.referrer.includes('/admin')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Redirect to the actual home page
      router.replace('/');
    }
  }, [router]);

  // Render the actual home page component
  return <HomePage />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common'])),
    },
  };
};

export default HomeRedirectPage;
