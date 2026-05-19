import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Weigh Bridge — Billing System',
  description: 'Computerized weigh bridge billing and management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${mono.variable} font-mono bg-white text-black antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}