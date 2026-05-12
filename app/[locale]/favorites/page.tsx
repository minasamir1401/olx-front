import { getTranslations } from 'next-intl/server';
import { Heart } from 'lucide-react';

export default async function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-20 pb-32 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
        <Heart className="w-12 h-12" />
      </div>
      <h1 className="text-2xl sm:text-4xl font-black text-slate-800 mb-4">
        المفضلة
      </h1>
      <p className="text-slate-500 text-lg max-w-md">
        لا توجد إعلانات في المفضلة حتى الآن. تصفح الإعلانات واضغط على علامة القلب لحفظها هنا.
      </p>
    </div>
  );
}
