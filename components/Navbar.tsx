'use client';

import { Link } from '@/i18n/routing';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '@/components/ui/button';
import { UserCircle, PlusCircle, Search, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const t = useTranslations('nav');

  return (
    <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        
        {/* Logo */}
        <Link href="/" className="text-lg sm:text-2xl font-extrabold text-blue-600 tracking-tight shrink-0">
          أوليكس<span className="text-slate-800">كلون</span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8 relative">
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            className="w-full bg-slate-100 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <Search className="absolute ltr:left-3 rtl:right-3 top-2.5 text-slate-400 w-4 h-4" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Language Switcher - always visible */}
          <LanguageSwitcher />

          {/* Auth - Desktop only */}
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold text-sm">
                  لوحة التحكم
                </Link>
              )}
              <div className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors">
                <UserCircle className="w-5 h-5 text-slate-600 shrink-0" />
                <span className="font-bold text-slate-700 hidden lg:block text-sm truncate max-w-[100px]">{user?.name}</span>
              </div>
              <Button 
                onClick={logout} 
                variant="ghost" 
                size="icon"
                className="hidden sm:flex text-red-500 hover:text-red-600 hover:bg-red-50 w-8 h-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="font-bold text-sm">
                {t('login')}
              </Button>
            </Link>
          )}

          {/* Post Ad - always visible */}
          <Link href="/ads/new">
            <Button 
              size="sm" 
              className="rounded-full shadow-md shadow-blue-200 hover:shadow-blue-300 transition-all gap-1.5 font-bold px-3 sm:px-5 text-xs sm:text-sm h-8 sm:h-9"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">{t('post_ad')}</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
