'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { adService } from '@/services/ad.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LayoutList, Trash2, Eye, Loader2, Search, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function AdsAdmin() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    fetchAds();
  }, [isHydrated, isAuthenticated, user]);

  const fetchAds = async () => {
    try {
      // getAds returns { ads, pagination }
      const response = await adService.getAds(); 
      setAds(response.ads || []);
    } catch (error) {
      toast.error('فشل في تحميل الإعلانات');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (adId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adService.updateAdStatus(adId, status);
      toast.success(status === 'APPROVED' ? 'تم تفعيل الإعلان' : 'تم رفض/أرشفة الإعلان');
      fetchAds();
    } catch (error) {
      toast.error('فشل تحديث الحالة');
    }
  };

  const filteredAds = ads.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ad.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isHydrated || loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">إدارة الإعلانات النشطة</h1>
          <p className="text-slate-500 font-bold">إجمالي الإعلانات في النظام: {ads.length}</p>
        </div>
        <Button onClick={() => router.push('/admin')} variant="outline" className="rounded-2xl font-bold border-2"><ArrowRight className="ml-2 w-5 h-5" /> لوحة التحكم</Button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-3.5 text-slate-400 w-6 h-6" />
            <input 
              type="text" 
              placeholder="ابحث بالعنوان أو المدينة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pr-12 pl-4 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-black text-sm uppercase tracking-wider">
                <th className="px-8 py-5">الإعلان</th>
                <th className="px-8 py-5">المعلن</th>
                <th className="px-8 py-5">السعر</th>
                <th className="px-8 py-5">تاريخ النشر</th>
                <th className="px-8 py-5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                        {ad.images?.[0] ? (
                          <img src={`http://localhost:5000${ad.images[0].image_url}`} className="w-full h-full object-cover" />
                        ) : (
                          <LayoutList className="w-8 h-8 text-slate-300 m-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg truncate max-w-[200px]">{ad.title}</div>
                        <div className="text-sm font-bold text-slate-400">{ad.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-600">{ad.user?.name || 'مستخدم'}</td>
                  <td className="px-8 py-6 font-black text-blue-600">{ad.price} ج.م</td>
                  <td className="px-8 py-6 text-slate-500 font-medium">
                    {format(new Date(ad.created_at), 'PPP', { locale: ar })}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-blue-600 hover:bg-blue-50 rounded-xl"
                        onClick={() => window.open(`/ad/${ad.slug}`, '_blank')}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-red-500 hover:bg-red-50 rounded-xl"
                        onClick={() => handleUpdateStatus(ad.id, 'REJECTED')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
