'use client';

import { useState, useEffect } from 'react';
import { adService } from '@/services/ad.service';
import AdList from '@/components/AdList';
import { Loader2 } from 'lucide-react';
import { use } from 'react';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchCategoryAds = async () => {
      try {
        const response = await adService.getAds({ category: resolvedParams.slug });
        setAds(response.ads || []);
        
        // Find category name from the first ad or fetch categories to map the slug
        if (response.ads && response.ads.length > 0) {
          setCategoryName(response.ads[0].category?.name || resolvedParams.slug);
        } else {
          // If no ads, fetch categories to get the name
          const cats = await adService.getCategories();
          const cat = cats.find((c: any) => c.slug === resolvedParams.slug);
          setCategoryName(cat ? cat.name : resolvedParams.slug);
        }
      } catch (error) {
        console.error('Failed to load category ads', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAds();
  }, [resolvedParams.slug]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-800 mb-2 border-r-8 border-blue-600 pr-4">
          إعلانات {categoryName}
        </h1>
        <p className="text-slate-500 font-bold pr-6">تصفح أحدث الإعلانات المضافة في هذا القسم</p>
      </div>

      {ads.length > 0 ? (
        <AdList ads={ads} />
      ) : (
        <div className="bg-white rounded-[3rem] p-16 text-center text-slate-400 font-bold border border-slate-100 flex flex-col items-center justify-center shadow-sm">
          <span className="text-6xl mb-4">📭</span>
          <p className="text-2xl font-black text-slate-600">مفيش إعلانات هنا لسه!</p>
          <p className="mt-2">كن أول من يضيف إعلان في هذا القسم.</p>
        </div>
      )}
    </div>
  );
}
