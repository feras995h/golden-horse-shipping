import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="description" content="Golden Horse Shipping - Your trusted partner for shipping from China to Libya" />
        <meta name="keywords" content="shipping, china, libya, freight, cargo, golden horse" />
        <meta name="author" content="Golden Horse Shipping" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Golden Horse Shipping" />
        <meta property="og:description" content="Your trusted partner for shipping from China to Libya" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
