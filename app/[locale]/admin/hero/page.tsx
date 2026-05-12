'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function HeroAdmin() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
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
    fetchHeroes();
  }, [isHydrated, isAuthenticated, user]);

  const fetchHeroes = async () => {
    try {
      const data = await adminService.getHeroes();
      setHeroes(data);
    } catch (error) {
      toast.error('فشل في تحميل صور الهيرو');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('يرجى اختيار صورة');

    setUploading(true);
    const formData = new FormData();
    formData.append('images', file);
    formData.append('title', title);
    formData.append('subtitle', subtitle);

    try {
      await adminService.createHero(formData);
      toast.success('تمت إضافة صورة الهيرو بنجاح');
      setTitle('');
      setSubtitle('');
      setFile(null);
      fetchHeroes();
    } catch (error) {
      toast.error('فشل الرفع');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await adminService.deleteHero(id);
      toast.success('تم الحذف');
      fetchHeroes();
    } catch (error) {
      toast.error('فشل الحذف');
    }
  };

  if (!isHydrated || loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black text-slate-800">إدارة صور الواجهة (Hero)</h1>
        <Button onClick={() => router.push('/admin')} variant="outline" className="rounded-2xl font-bold">العودة للوحة التحكم</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Upload Form */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 h-fit">
          <h2 className="text-2xl font-black text-slate-800 mb-6">إضافة صورة جديدة</h2>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">العنوان الرئيسي</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                placeholder="مثال: مستقبل البيع والشراء"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">العنوان الفرعي</label>
              <input 
                type="text" 
                value={subtitle} 
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                placeholder="مثال: انضم لآلاف المشترين"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">الصورة</label>
              <div className="relative h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden">
                {file ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                    <span className="text-slate-400 font-bold">اضغط لاختيار صورة</span>
                  </>
                )}
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            <Button type="submit" disabled={uploading} className="w-full rounded-2xl py-6 text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-6 h-6 ml-2" /> حفظ وإضافة</>}
            </Button>
          </form>
        </div>

        {/* Hero List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-800 mb-6">الصور الحالية</h2>
          {heroes.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-12 text-center text-slate-400 font-bold border border-slate-100">
              لا يوجد صور مضافة حالياً. الموقع يستخدم الصورة الافتراضية.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {heroes.map((hero) => (
                <div key={hero.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 group relative">
                  <div className="h-48 bg-slate-200 relative">
                    <img src={hero.image_url?.startsWith('http') ? hero.image_url : `https://olxnar-api.red-gate.tech${hero.image_url}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button onClick={() => handleDelete(hero.id)} variant="destructive" className="rounded-full w-12 h-12 p-0 shadow-xl">
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-slate-800 mb-1 truncate">{hero.title || 'بدون عنوان'}</h3>
                    <p className="text-sm font-bold text-slate-400 truncate">{hero.subtitle || 'بدون عنوان فرعي'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
