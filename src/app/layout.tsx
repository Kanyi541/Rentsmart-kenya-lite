
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { AuthProvider } from '@/hooks/use-auth';

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
          {children}
        </AuthProvider>
        <Toaster />
        <Script src="https://js.paystack.co/v1/inline.js" />
      </body>
    </html>
  );
}
