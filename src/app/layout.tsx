import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { AuthProvider } from '@/hooks/use-auth';
import { LoadingProvider } from '@/hooks/use-loading';
import { GlobalLoadingIndicator } from '@/components/global-loading-indicator';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RentSmart Kenya Lite | Modern Rental & Property Management',
  description: 'Streamline property management in Kenya. Track rent payments, manage tenants, schedule maintenance, and gain AI-powered insights with RentSmart Kenya.',
  keywords: [
    'rental management',
    'property management software',
    'landlord app Kenya',
    'tenant portal',
    'rent tracker',
    'RentSmart Kenya',
    'real estate management system',
  ],
  authors: [{ name: 'RentSmart' }],
  metadataBase: new URL('https://rentsmart.co.ke'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RentSmart Kenya Lite | Modern Rental & Property Management',
    description: 'Streamline property management in Kenya. Track rent payments, manage tenants, schedule maintenance, and gain AI-powered insights.',
    url: 'https://rentsmart.co.ke',
    siteName: 'RentSmart Kenya Lite',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/RentSmart.png',
        width: 800,
        height: 800,
        alt: 'RentSmart Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'RentSmart Kenya Lite | Property Management Software',
    description: 'Streamline property management in Kenya. Track rent payments, manage tenants, and gain AI-powered insights.',
    images: ['/RentSmart.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="F-H7qWt8QRPtrifGFm-zYLhD0agIRF2lPqEO9yipZxs" />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
          <LoadingProvider>
            <FirebaseErrorListener />
            <GlobalLoadingIndicator />
            {children}
          </LoadingProvider>
        </AuthProvider>
        <Toaster />
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
