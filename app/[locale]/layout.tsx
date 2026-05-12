import type { Metadata } from 'next';
import { Inter, Cairo, Tajawal } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNavbar from '@/components/BottomNavbar';
import { Toaster } from '@/components/ui/sonner';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });
const tajawal = Tajawal({ 
  subsets: ['arabic'], 
  weight: ['400', '500', '700'], 
  variable: '--font-tajawal' 
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  
  return {
    title: isAr ? 'أوليكس كلون | OLX Clone' : 'OLX Clone | Best Classifieds',
    description: isAr 
      ? 'أفضل منصة لبيع وشراء الإعلانات المبوبة في مصر.' 
      : 'The best platform for buying and selling classified ads.',
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const isAr = locale === 'ar';

  return (
    <html lang={locale} dir={isAr ? 'rtl' : 'ltr'} className="scroll-smooth">
      <body className={`${inter.variable} ${cairo.variable} ${tajawal.variable} ${isAr ? 'font-arabic' : 'font-sans'} bg-slate-50 min-h-screen flex flex-col antialiased transition-colors duration-300`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar locale={locale} />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <footer className="hidden md:block bg-white border-t py-12 mt-auto">
            <div className="container mx-auto px-4 text-center text-slate-500 font-medium">
              <p>&copy; {new Date().getFullYear()} أوليكس كلون. جميع الحقوق محفوظة.</p>
            </div>
          </footer>
          <BottomNavbar />
          <Toaster position={isAr ? "top-left" : "top-right"} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
