// External Dependencies
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';

// Relative Dependencies
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '../components/sidebar/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CanvasChat',
  description: 'A canvas for chatting with AI',
  icons: [{ rel: 'icon', url: '/logo.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en">
        <Suspense fallback={<div>Loading...</div>}>
          <body className={inter.className}>
            {children}
            <Toaster />
          </body>
        </Suspense>
      </html>
    </Providers>
  );
}
