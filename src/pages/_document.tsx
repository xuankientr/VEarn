import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="vi" className="dark">
      <Head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Inter font - Primary */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        
        {/* Favicon — dùng logo có sẵn (public/logo.png) */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Meta */}
        <meta name="theme-color" content="#0a0f1a" />
        <meta name="color-scheme" content="dark" />
        
        {/* PWA */}
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className="scrollbar-premium">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
