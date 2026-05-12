import AdList from '@/components/AdList';
import { getTranslations } from 'next-intl/server';

export default async function AdsPage() {
  const t = await getTranslations('home');

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl sm:text-4xl font-black text-slate-800 mb-8 border-blue-600 px-4 border-r-4">
        {t('latest')}
      </h1>
      <AdList />
    </div>
  );
}
