import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { AuthProvider } from '@/hooks/use-auth';
import { LoadingProvider } from '@/hooks/use-loading';
import { GlobalLoadingIndicator } from '@/components/global-loading-indicator';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RentSmart Kenya Lite',
  description: 'A modern rental management platform with AI-powered insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
          <LoadingProvider>
            <GlobalLoadingIndicator />
            {children}
          </LoadingProvider>
        </AuthProvider>
        <Toaster />
        {/* Paystack Inline JS */}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
