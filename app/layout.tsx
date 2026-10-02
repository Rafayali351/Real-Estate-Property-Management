import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToastProvider } from '@/components/ui/Toast';
import CustomCursor from '@/components/CustomCursor';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'REAL ESTATE | Trophy Estates, Penthouses & Private Residences',
  description:
    'Exclusive luxury real estate management and advisory across Pakistan. Curated architectural estates, sky penthouses, and waterfront sanctuaries.',
  keywords:
    'luxury real estate, private estates, penthouses, mansions, islamabad luxury homes, lahore dha estates, karachi seafront villas',
  openGraph: {
    title: 'REAL ESTATE | Trophy Estates & Private Residences',
    description:
      'Discover premier trophy residences, sky penthouses, and private estates across Pakistan.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-obsidian-charcoal text-white min-h-screen antialiased flex flex-col font-sans">
        <AuthProvider>
          <SettingsProvider>
            <ToastProvider>
              <CustomCursor />
              <Navbar />
              <div className="flex-1 flex flex-col">{children}</div>
              <Footer />
            </ToastProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
