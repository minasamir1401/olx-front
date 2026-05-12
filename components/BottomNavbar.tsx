'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { Home, Search, PlusCircle, Heart, UserCircle } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function BottomNavbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const locale = useLocale();
  const isAr = locale === 'ar';

  const isActive = (path: string) => pathname === path;

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: isAr ? 'الرئيسية' : 'Home',
      active: isActive('/'),
    },
    {
      href: '/ads',
      icon: Search,
      label: isAr ? 'بحث' : 'Search',
      active: isActive('/ads'),
    },
    {
      href: '/ads/new',
      icon: PlusCircle,
      label: isAr ? 'أضف إعلان' : 'Post Ad',
      active: false,
      isPrimary: true,
    },
    {
      href: '/favorites',
      icon: Heart,
      label: isAr ? 'المفضلة' : 'Favorites',
      active: isActive('/favorites'),
    },
    {
      href: isAuthenticated ? '/profile' : '/login',
      icon: UserCircle,
      label: isAr ? 'حسابي' : 'Account',
      active: isActive('/profile') || isActive('/login'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className="flex flex-col items-center gap-0.5 group -mt-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/40 group-hover:bg-blue-700 group-hover:scale-110 transition-all">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-black text-blue-600 mt-1">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href as any}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition-all group"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                item.active 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black transition-colors ${
                item.active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
