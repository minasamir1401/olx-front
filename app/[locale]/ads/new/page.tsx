'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { adService } from '@/services/ad.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePlus, X, Info } from 'lucide-react';

export default function PostAdPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    phone: '',
    category_id: ''
  });
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('لازم تسجل دخول الأول عشان تنزل إعلان');
        router.push('/login');
      }
    }
    
    // Fetch categories
    adService.getCategories().then(cats => {
      setCategories(cats);
      if (cats.length > 0 && !formData.category_id) {
        setFormData(prev => ({...prev, category_id: cats[0].id.toString()}));
      }
    }).catch(err => console.error("Failed to load categories"));
  }, [isAuthenticated, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 5) {
        toast.error('أخره 5 صور بس يا بطل');
        return;
      }
      
      const newImages = [...images, ...filesArray];
      setImages(newImages);
      
      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price || !formData.city || !formData.phone) {
      toast.error('يا ريت تملى كل البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      images.forEach(image => {
        submitData.append('images', image);
      });

      const response = await adService.createAd(submitData);
      toast.success('إعلانك اترفع بنجاح! 🚀', {
        description: 'الإعلان حالياً في مرحلة المراجعة من الإدارة وهينزل على الموقع فور الموافقة عليه.',
        duration: 8000
      });
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'حدث خطأ أثناء رفع الإعلان. تأكد من حجم الصور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="border-0 shadow-2xl shadow-blue-100/50 bg-white/90 backdrop-blur-md rounded-[3rem] overflow-hidden">
        <div className="bg-blue-600 p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <CardHeader className="p-0 relative z-10">
            <CardTitle className="text-4xl font-black mb-2">نزل إعلانك</CardTitle>
            <p className="text-blue-100 font-bold text-lg">بـ 3 خطوات بس، حاجتك هتتباع بأحسن سعر</p>
          </CardHeader>
        </div>
        <CardContent className="p-10 md:p-16">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Basic Info */}
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg">1</span>
                بيانات الإعلان الأساسية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-base font-black text-slate-700">عنوان الإعلان *</Label>
                  <Input
                    id="title"
                    placeholder="مثلاً: آيفون 15 برو ماكس كسر زيرو"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    maxLength={70}
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-base font-black text-slate-700">القسم *</Label>
                  <select 
                    id="category"
                    className="flex h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-base font-bold ring-offset-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="price" className="text-base font-black text-slate-700">السعر (ج.م) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-base font-black text-slate-700">المدينة / المحافظة *</Label>
                  <Input
                    id="city"
                    placeholder="مثلاً: القاهرة، التجمع الخامس"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-black text-slate-700">وصف المنتج بالتفصيل *</Label>
                <textarea
                  id="description"
                  placeholder="اوصف حاجتك بكل أمانة عشان تتباع أسرع..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[180px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-base font-bold ring-offset-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg">2</span>
                صور الإعلان
              </h3>
              
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <p className="text-sm font-bold text-blue-800 leading-relaxed">
                  الصور الواضحة بتزود فرص البيع بنسبة 80%. صور حاجتك في إضاءة كويسة ومن كذا زاوية.
                  <span className="block mt-1 font-black text-blue-600">أقصى عدد للصور هو 5 صور.</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-slate-100 shadow-sm group">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {previewUrls.length < 5 && (
                  <label className="aspect-square rounded-[1.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                    <ImagePlus className="w-10 h-10 mb-3" />
                    <span className="text-xs font-black">إضافة صور</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg">3</span>
                بيانات التواصل
              </h3>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-black text-slate-700">رقم الموبايل للتواصل *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold md:w-1/2 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-10 flex flex-col md:flex-row justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} className="h-14 rounded-2xl px-10 font-black text-slate-500 text-lg">
                إلغاء
              </Button>
              <Button type="submit" className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 px-16 font-black text-xl shadow-xl shadow-blue-200 transition-all active:scale-95" disabled={loading}>
                {loading ? 'بنشره حالاً...' : 'انشر الإعلان دلوقت'}
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
