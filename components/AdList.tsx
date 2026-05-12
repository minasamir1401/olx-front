'use client';

import { useEffect, useState } from 'react';
import { adService } from '@/services/ad.service';
import { Ad } from '@/types';
import { Link } from '@/i18n/routing';
import { MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

interface AdListProps {
  ads?: Ad[];
}

export default function AdList({ ads: initialAds }: AdListProps) {
  const [ads, setAds] = useState<Ad[]>(initialAds || []);
  const [loading, setLoading] = useState(!initialAds);
  const locale = useLocale();
  const t = useTranslations('ad');

  useEffect(() => {
    if (initialAds) {
      setAds(initialAds);
      setLoading(false);
      return;
    }

    const fetchAds = async () => {
      try {
        setLoading(true);
        const data = await adService.getAds();
        setAds(data.ads || []);
      } catch (error) {
        console.error('Failed to fetch ads', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [initialAds]);

  const dateLocale = locale === 'ar' ? ar : enUS;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Card key={i} className="overflow-hidden border-0 shadow-sm animate-pulse rounded-3xl">
            <div className="h-48 bg-slate-200" />
            <CardContent className="p-5 space-y-4">
              <div className="h-6 bg-slate-200 rounded-full w-3/4" />
              <div className="h-8 bg-slate-200 rounded-full w-1/2" />
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 rounded-full w-1/4" />
                <div className="h-4 bg-slate-200 rounded-full w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {ads.map((ad, index) => (
        <Link href={`/ad/${ad.slug}`} key={`${ad.id}-${index}`} className="group">
          <Card className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white group-hover:-translate-y-2 rounded-[2rem] relative">
            <div className="h-52 bg-slate-50 relative overflow-hidden flex items-center justify-center">
              {ad.images && ad.images.length > 0 ? (
                <img src={ad.images[0].image_url?.startsWith('http') ? ad.images[0].image_url : `https://olxnar-api.red-gate.tech${ad.images[0].image_url}`} alt={ad.title} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 p-2" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                  <span className="text-4xl mb-2">📸</span>
                  <span className="text-xs font-bold uppercase tracking-widest">{locale === 'ar' ? 'لا توجد صور' : 'No images'}</span>
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-blue-600 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                {locale === 'ar' ? 'مميز' : 'Featured'}
              </div>
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-44">
              <div>
                <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors text-lg">
                  {ad.title}
                </h3>
                <p className="text-2xl font-black text-blue-600 mt-2">
                  {ad.price.toLocaleString()} <span className="text-sm font-bold">{t('price')}</span>
                </p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate max-w-[100px]">{ad.city}</span>
                </div>
                <div className="flex items-center gap-1 font-bold">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: dateLocale })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
