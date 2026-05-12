'use client';

import { useState, useEffect } from 'react';
import { adService } from '@/services/ad.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LayoutList, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react';

export default function CategoriesAdmin() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchCategories();
  }, [isHydrated, isAuthenticated, user]);

  const fetchCategories = async () => {
    try {
      const data = await adService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('فشل في تحميل الأقسام');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black text-slate-800">إدارة أقسام الموقع</h1>
        <Button onClick={() => router.push('/admin')} variant="outline" className="rounded-2xl font-bold border-2"><ArrowRight className="ml-2 w-5 h-5" /> لوحة التحكم</Button>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-800">الأقسام الحالية</h2>
          <Button className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700" onClick={() => toast.info('إضافة قسم جديد ستتوفر في التحديث القادم')}>
            <Plus className="ml-2 w-5 h-5" /> إضافة قسم
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{cat.icon || '📦'}</div>
                <div>
                  <div className="font-black text-slate-800 text-lg">{cat.name}</div>
                  <div className="text-sm font-bold text-slate-400">Slug: {cat.slug}</div>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="text-slate-300 hover:text-red-500 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
