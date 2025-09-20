import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import HydrationFix from '@/components/HydrationFix';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinkStacks - Collaborative Link Curator',
  description: 'A collaborative link curator with hierarchical tags and multi-segment board paths',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationFix />
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}