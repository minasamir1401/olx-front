'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function toggleLanguage() {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Button 
      onClick={toggleLanguage} 
      variant="ghost" 
      disabled={isPending}
      className={`rounded-full flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-bold text-sm transition-all ${isPending ? 'opacity-50' : 'opacity-100'}`}
    >
      <Globe className="w-4 h-4" strokeWidth={2.5} />
      <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
      <span className="sr-only">Toggle Language</span>
    </Button>
  );
}
