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
  title: 'RentNode| Modern Rental & Property Management',
  description: 'Streamline property management in Kenya. Track rent payments, manage tenants, schedule maintenance, and gain AI-powered insights with RentNode Kenya.',
  keywords: [
    'rental management',
    'property management software',
    'landlord app Kenya',
    'tenant portal',
    'rent tracker',
    'RentNode Kenya',
    'real estate management system',
  ],
  authors: [{ name: 'RentNode' }],
  metadataBase: new URL('https://RentNode.co.ke'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RentNode| Modern Rental & Property Management',
    description: 'Streamline property management in Kenya. Track rent payments, manage tenants, schedule maintenance, and gain AI-powered insights.',
    url: 'https://RentNode.co.ke',
    siteName: 'RentNode Kenya Lite',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/RentNode.png',
        width: 800,
        height: 800,
        alt: 'RentNode Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'RentNode| Property Management Software',
    description: 'Streamline property management in Kenya. Track rent payments, manage tenants, and gain AI-powered insights.',
    images: ['/RentNode.png'],
  },
  icons: {
    icon: '/my-favicon.ico',
    shortcut: '/my-favicon-32x32.png',
    apple: '/my-apple-touch-icon.png',
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
