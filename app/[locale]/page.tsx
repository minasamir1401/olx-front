'use client';

import { Link, useRouter } from '@/i18n/routing';
import { Search, MapPin, Car, Building2, Smartphone, Monitor, Sofa, Shirt, Briefcase, Wrench } from 'lucide-react';
import AdList from '@/components/AdList';
import { useLocale, useTranslations } from 'next-intl';
import NextImage from 'next/image';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();

  const [heroes, setHeroes] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!query && !location) return;
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location) params.append('city', location);
    router.push(`/ads?${params.toString()}`);
  };

  useEffect(() => {
    adminService.getHeroes().then(data => {
      if (data && data.length > 0) {
        setHeroes(data);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (heroes.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroes.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroes.length]);

  const categories = [
    { name: t('categories.vehicles'),    Icon: Car,         slug: 'vehicles'    },
    { name: t('categories.real-estate'), Icon: Building2,   slug: 'real-estate' },
    { name: t('categories.mobiles'),     Icon: Smartphone,  slug: 'mobiles'     },
    { name: t('categories.electronics'), Icon: Monitor,     slug: 'electronics' },
    { name: t('categories.furniture'),   Icon: Sofa,        slug: 'furniture'   },
    { name: t('categories.fashion'),     Icon: Shirt,       slug: 'fashion'     },
    { name: t('categories.jobs'),        Icon: Briefcase,   slug: 'jobs'        },
    { name: t('categories.services'),    Icon: Wrench,      slug: 'services'    },
  ];

  const isAr = locale === 'ar';

  const activeHero = heroes.length > 0 ? heroes[currentHeroIndex] : null;

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Premium Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden rounded-b-[2rem] sm:rounded-b-[4rem] shadow-2xl transition-all duration-1000">
        {/* Background Image - responsive & optimized with Next.js Image */}
        <div className="absolute inset-0 z-0 bg-black/25">
          <NextImage
            key={activeHero?.id || 'default'}
            src={
              activeHero?.image_url
                ? `http://localhost:5000${activeHero.image_url}`
                : 'https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=2070&auto=format&fit=crop'
            }
            alt="Hero Background"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            className="object-cover scale-105 animate-slow-zoom transition-opacity duration-1000"
            style={{ objectPosition: 'center center' }}
            unoptimized={!!activeHero?.image_url}
          />
        </div>

        {/* Floating Elements for "Animated" feel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 container mx-auto px-3 sm:px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 sm:mb-8 tracking-tight leading-tight animate-fade-in-up" key={`title-${activeHero?.id || 'default'}`}>
            {activeHero ? (
              <>
                {activeHero.title} <br/>
                {activeHero.subtitle && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100 text-3xl md:text-5xl block mt-4">
                    {activeHero.subtitle}
                  </span>
                )}
              </>
            ) : (
              <>
                {t('hero.title_part1')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
                  {t('hero.title_part2')}
                </span>
              </>
            )}
          </h1>
          <p className="text-sm sm:text-xl md:text-2xl text-blue-100/90 max-w-3xl mx-auto mb-6 sm:mb-12 font-bold animate-fade-in-up delay-200" key={`subtitle-${activeHero?.id || 'default'}`}>
            {activeHero ? '' : t('hero.subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-[2.5rem] p-2 sm:p-3 flex flex-col sm:flex-row gap-2 sm:gap-3 shadow-2xl border border-white/20 animate-fade-in-up delay-500">
            <div className="flex-1 relative flex items-center bg-white/90 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 transition-all focus-within:ring-4 ring-blue-500/20">
              <Search className="w-5 h-5 text-blue-600 mx-2 sm:mx-3 shrink-0" />
              <input 
                type="text" 
                placeholder={t('hero.search_placeholder')} 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 font-bold text-sm sm:text-xl min-w-0"
              />
            </div>
            <div className="hidden sm:flex md:w-64 relative items-center bg-white/90 rounded-2xl px-5 py-4 transition-all focus-within:ring-4 ring-blue-500/20">
              <MapPin className="w-5 h-5 text-blue-600 mx-3 shrink-0" />
              <input 
                type="text" 
                placeholder={t('hero.search_location')} 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 font-bold text-xl min-w-0"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-2xl transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-blue-900/40 w-full sm:w-auto"
            >
              {t('hero.search_button')}
            </button>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slow-zoom { animation: slow-zoom 20s infinite ease-in-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s forwards ease-out; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-500 { animation-delay: 0.4s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>

      {/* Categories - 2 card rows stacked */}
      <section className="container mx-auto px-3 sm:px-4 flex flex-col gap-3">
        <h2 className={`text-lg sm:text-2xl font-black text-slate-800 border-blue-600 px-3 ${isAr ? 'border-r-4' : 'border-l-4'}`}>
          {t('home.categories')}
        </h2>

        {/* Row 1 - first 4 categories */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex divide-x divide-slate-100 border border-slate-100 rounded-2xl bg-white shadow-sm min-w-full">
            {categories.slice(0, 4).map((cat, i) => (
              <Link
                key={i}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 px-3 py-4 hover:bg-blue-50 transition-colors group flex-1"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-200">
                  <cat.Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors text-center leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Row 2 - last 4 categories */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex divide-x divide-slate-100 border border-slate-100 rounded-2xl bg-white shadow-sm min-w-full">
            {categories.slice(4, 8).map((cat, i) => (
              <Link
                key={i}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 px-3 py-4 hover:bg-blue-50 transition-colors group flex-1"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-200">
                  <cat.Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors text-center leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      <section className="container mx-auto px-3 sm:px-4 bg-white/50 py-8 sm:py-12 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-inner">
        <div className="flex items-center justify-between mb-6 sm:mb-10 px-2 sm:px-4">
          <h2 className="text-xl sm:text-3xl font-black text-slate-800">{t('home.latest')}</h2>
          <Link href="/ads" className="bg-blue-50 text-blue-600 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            {t('home.view_all')}
          </Link>
        </div>
        <AdList />
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center bg-blue-600 rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl text-white">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-3xl sm:text-5xl font-black">+1M</div>
            <div className="text-blue-100 font-bold text-sm sm:text-base">{t('home.stats.users')}</div>
          </div>
          <div className="space-y-1 sm:space-y-2 border-y sm:border-y-0 sm:border-x border-white/20 py-4 sm:py-0">
            <div className="text-3xl sm:text-5xl font-black">+500K</div>
            <div className="text-blue-100 font-bold text-sm sm:text-base">{t('home.stats.ads')}</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-3xl sm:text-5xl font-black">+100</div>
            <div className="text-blue-100 font-bold text-sm sm:text-base">{t('home.stats.cities')}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
