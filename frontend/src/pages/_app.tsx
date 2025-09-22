import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale } = router;

  useEffect(() => {
    // Add locale class to body for CSS targeting
    if (typeof document !== 'undefined') {
      // Add locale class to body for CSS targeting
      document.body.className = document.body.className.replace(/locale-\w+/g, '');
      document.body.classList.add(`locale-${locale || 'ar'}`);
    }
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp);
