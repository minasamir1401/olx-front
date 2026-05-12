'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { adService } from '@/services/ad.service';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  LayoutList, 
  CheckCircle, 
  Ban, 
  TrendingUp, 
  AlertCircle, 
  Eye, 
  X, 
  MessageCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, activeAds: 0, pendingAdsCount: 0, bannedUsers: 0 });
  const [selectedAd, setSelectedAd] = useState<any>(null); // For the modal

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for hydration
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [isHydrated, isAuthenticated, user, router]);

  const fetchData = async () => {
    try {
      setLoadingAds(true);
      const [adsData, statsData] = await Promise.all([
        adService.getPendingAds(),
        adminService.getStats()
      ]);
      setPendingAds(adsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoadingAds(false);
    }
  };

  const handleUpdateStatus = async (adId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adService.updateAdStatus(adId, status);
      toast.success(status === 'APPROVED' ? 'تمت الموافقة على الإعلان ونشره' : 'تم رفض الإعلان');
      setPendingAds(pendingAds.filter(ad => ad.id !== adId));
      setStats(prev => ({ 
        ...prev, 
        pendingAdsCount: prev.pendingAdsCount - 1,
        activeAds: status === 'APPROVED' ? prev.activeAds + 1 : prev.activeAds
      }));
      setSelectedAd(null); // Close modal if open
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث حالة الإعلان');
    }
  };

  const t = useTranslations('dashboard');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">{t('title')}</h1>
          <p className="text-slate-500 font-bold text-lg">{t('welcome', { name: user?.name || 'Admin' })}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-black text-slate-700">{isAr ? 'السيرفر يعمل بكفاءة' : 'Server is healthy'}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <Link href="/admin/users" className="bg-white border-0 shadow-xl shadow-blue-100/50 rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer block">
          <div className="flex flex-row items-center justify-between pb-2 pt-8 px-8">
            <h3 className="text-base font-black text-slate-400">{t('stats.total_users')}</h3>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="px-8 pb-8">
            <div className="text-4xl font-black text-slate-800">{stats.totalUsers}</div>
          </div>
        </Link>
        
        <Link href="/admin/ads" className="bg-white border-0 shadow-xl shadow-blue-100/50 rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer block">
          <div className="flex flex-row items-center justify-between pb-2 pt-8 px-8">
            <h3 className="text-base font-black text-slate-400">{t('stats.active_ads')}</h3>
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <LayoutList className="w-6 h-6" />
            </div>
          </div>
          <div className="px-8 pb-8">
            <div className="text-4xl font-black text-slate-800">{stats.activeAds}</div>
          </div>
        </Link>
        
        <div className="bg-white border-0 shadow-xl shadow-blue-100/50 rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all block">
          <div className="flex flex-row items-center justify-between pb-2 pt-8 px-8">
            <h3 className="text-base font-black text-slate-400">{t('stats.pending_ads')}</h3>
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="px-8 pb-8">
            <div className="text-4xl font-black text-slate-800">{stats.pendingAdsCount}</div>
            <p className="text-sm font-bold text-slate-400 mt-2">{isAr ? 'بانتظار قرارك بالأسفل' : 'Waiting for your review'}</p>
          </div>
        </div>
        
        <Link href="/admin/users?filter=banned" className="bg-white border-0 shadow-xl shadow-blue-100/50 rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer block">
          <div className="flex flex-row items-center justify-between pb-2 pt-8 px-8">
            <h3 className="text-base font-black text-slate-400">{t('stats.banned_users')}</h3>
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Ban className="w-6 h-6" />
            </div>
          </div>
          <div className="px-8 pb-8">
            <div className="text-4xl font-black text-slate-800">{stats.bannedUsers}</div>
          </div>
        </Link>
      </div>

      {/* Hero Management Link */}
      <div className="mb-12">
        <Link href="/admin/hero" className="flex items-center justify-between p-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] text-white shadow-2xl hover:scale-[1.01] transition-all border border-blue-400/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-2 flex items-center gap-3">
              إدارة الهيرو (Hero Section) <TrendingUp className="w-8 h-8" />
            </h3>
            <p className="text-blue-100 font-bold text-lg">تغيير صور الواجهة والرسائل الترحيبية للموقع بشكل احترافي</p>
          </div>
          <div className="relative z-10 p-5 bg-white/20 rounded-full backdrop-blur-md group-hover:rotate-12 transition-transform">
            <LayoutList className="w-12 h-12" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl shadow-blue-100/50 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800">إعلانات بانتظار الموافقة</h2>
          </div>
          <div className="space-y-6">
            {loadingAds ? (
              <p className="text-slate-500 font-bold text-center py-10">جاري تحميل الإعلانات...</p>
            ) : pendingAds.length === 0 ? (
              <p className="text-slate-500 font-bold text-center py-10">لا يوجد إعلانات بانتظار المراجعة حالياً.</p>
            ) : (
              pendingAds.map((ad) => (
                <div key={ad.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 group">
                  <div className="w-full sm:w-24 h-40 sm:h-24 bg-slate-200 rounded-2xl shrink-0 overflow-hidden cursor-pointer" onClick={() => setSelectedAd(ad)}>
                    {ad.images?.[0] ? (
                      <img src={ad.images[0].image_url?.startsWith('http') ? ad.images[0].image_url : `https://olxnar-api.red-gate.tech${ad.images[0].image_url}`} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-right cursor-pointer" onClick={() => setSelectedAd(ad)}>
                    <h4 className="font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors text-lg">{ad.title}</h4>
                    <p className="text-sm font-bold text-slate-400">بواسطة: {ad.user?.name || 'غير معروف'} • {ad.city} • <span className="text-blue-600">{ad.price} ج.م</span></p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-center">
                    <button 
                      onClick={() => setSelectedAd(ad)}
                      className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(ad.id, 'APPROVED')}
                      className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                      title="موافقة"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(ad.id, 'REJECTED')}
                      className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="رفض"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-blue-100/50 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-8">إجراءات سريعة</h2>
            <div className="space-y-4">
              <Link href="/admin/categories" className="w-full text-right px-8 py-5 rounded-[1.5rem] bg-slate-50 hover:bg-blue-600 hover:text-white transition-all font-black text-slate-700 shadow-sm border border-slate-100 flex items-center justify-between group">
                <span>إدارة الأقسام</span>
                <TrendingUp className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/admin/whatsapp" className="w-full text-right px-8 py-5 rounded-[1.5rem] bg-green-50 hover:bg-green-600 hover:text-white transition-all font-black text-green-700 shadow-sm border border-green-100 flex items-center justify-between group">
                <span>ربط الواتساب (OTP)</span>
                <MessageCircle className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => toast.info('نظام التقارير قيد التطوير حالياً')}
                className="w-full text-right px-8 py-5 rounded-[1.5rem] bg-slate-50 hover:bg-blue-600 hover:text-white transition-all font-black text-slate-700 shadow-sm border border-slate-100 flex items-center justify-between group"
              >
                <span>تقارير المخالفات</span>
                <TrendingUp className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => toast.info('إعدادات المنصة ستكون متاحة قريباً')}
                className="w-full text-right px-8 py-5 rounded-[1.5rem] bg-slate-50 hover:bg-blue-600 hover:text-white transition-all font-black text-slate-700 shadow-sm border border-slate-100 flex items-center justify-between group"
              >
                <span>إعدادات المنصة</span>
                <TrendingUp className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Ad Details */}
      {selectedAd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedAd(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-10 space-y-8">
              <h2 className="text-3xl font-black text-slate-800 pr-12">{selectedAd.title}</h2>
              
              {/* Images Grid */}
              {selectedAd.images && selectedAd.images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                  {selectedAd.images.map((img: any, i: number) => (
                    <img key={i} src={img.image_url?.startsWith('http') ? img.image_url : `https://olxnar-api.red-gate.tech${img.image_url}`} alt="" className="h-64 rounded-3xl object-cover snap-center border border-slate-100 shadow-sm" />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div>
                  <span className="block text-slate-400 font-bold text-sm mb-1">السعر</span>
                  <span className="text-xl font-black text-blue-600">{selectedAd.price} ج.م</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-sm mb-1">المدينة</span>
                  <span className="text-lg font-black text-slate-800">{selectedAd.city}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-sm mb-1">القسم</span>
                  <span className="text-lg font-black text-slate-800">{selectedAd.category?.name}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-sm mb-1">رقم الموبايل</span>
                  <span className="text-lg font-black text-slate-800 dir-ltr">{selectedAd.phone}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 mb-4">وصف الإعلان</h3>
                <p className="text-slate-600 font-medium leading-loose whitespace-pre-wrap bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  {selectedAd.description}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 mb-4">بيانات الناشر</h3>
                <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xl">
                    {selectedAd.user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{selectedAd.user?.name}</h4>
                    <p className="text-slate-500 font-bold">{selectedAd.user?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => handleUpdateStatus(selectedAd.id, 'REJECTED')}
                  className="px-8 py-4 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl font-black transition-colors"
                >
                  رفض الإعلان
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedAd.id, 'APPROVED')}
                  className="px-8 py-4 bg-green-500 text-white hover:bg-green-600 rounded-2xl font-black shadow-lg shadow-green-200 transition-colors"
                >
                  موافقة ونشر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
