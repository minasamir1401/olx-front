'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adService } from '@/services/ad.service';
import { Ad } from '@/types';
import { MapPin, Clock, Phone, MessageCircle, UserCircle, AlertTriangle, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';

export default function AdDetailsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const params = useParams();
  const slug = params.slug as string;
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const [showPhone, setShowPhone] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        const data = await adService.getAdDetails(slug);
        setAd(data);
      } catch (error) {
        console.error('Failed to fetch ad details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [slug]);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (ad && favorites.includes(ad.id)) {
      setIsFavorite(true);
    }
  }, [ad]);

  const toggleFavorite = () => {
    if (!ad) return;
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((id: number) => id !== ad.id);
      toast.success('تم الحذف من المفضلة');
    } else {
      newFavorites = [...favorites, ad.id];
      toast.success('تم الإضافة للمفضلة');
    }
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const [isSharing, setIsSharing] = useState(false);
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: ad?.title,
          text: ad?.description?.substring(0, 100),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط للحافظة');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط للحافظة');
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="h-96 bg-slate-200 rounded-[3rem] mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-12 bg-slate-200 rounded-full w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded-full w-1/2"></div>
            <div className="h-32 bg-slate-200 rounded-3xl w-full"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded-[2.5rem]"></div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return <div className="container mx-auto px-4 py-20 text-center text-slate-500 font-bold text-2xl">الإعلان ده مش موجود</div>;
  }

  const images = ad.images || [];
  const mainImage = images.length > 0 ? `http://localhost:5000${images[activeImageIndex].image_url}` : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Gallery Container */}
          <div className="bg-white rounded-[3rem] p-6 shadow-xl shadow-blue-100/50 border border-slate-100">
            <div className="relative group">
              <div className="h-[500px] md:h-[600px] flex items-center justify-center bg-slate-50/80 backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-slate-100">
                {mainImage ? (
                  <img src={mainImage} alt={ad.title} className="w-full h-full object-contain p-4 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <span className="text-8xl mb-4">📸</span>
                    <span className="text-xl font-black uppercase tracking-widest">مفيش صور حالياً</span>
                  </div>
                )}
              </div>
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <Button onClick={handleShare} size="icon" variant="secondary" className="rounded-2xl w-12 h-12 shadow-lg bg-white/90 hover:bg-blue-600 hover:text-white transition-all backdrop-blur-md">
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button onClick={toggleFavorite} size="icon" variant="secondary" className={`rounded-2xl w-12 h-12 shadow-lg bg-white/90 transition-all backdrop-blur-md hover:bg-red-50 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-red-400'}`}>
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-6 snap-x hide-scrollbar">
                {images.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all shrink-0 snap-center ${activeImageIndex === index ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105 bg-slate-100'}`}
                  >
                    <img src={`http://localhost:5000${img.image_url}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ad Information */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-blue-100/50 border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-black mb-4">
                  {ad.category?.name}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight mb-4">{ad.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    {ad.city}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    نُشر {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: ar })}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 bg-slate-200 rounded-full"></span>
                    {ad.views} مشاهدة
                  </div>
                </div>
              </div>
              <div className="bg-blue-600 text-white px-8 py-4 rounded-3xl text-center shadow-lg shadow-blue-200 shrink-0">
                <div className="text-sm font-bold opacity-80 mb-1">{isAr ? 'السعر المطلوب' : 'Price'}</div>
                <div className="text-3xl font-black">{ad.price.toLocaleString()} <span className="text-lg">{isAr ? 'ج.م' : 'EGP'}</span></div>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-10">
              <h3 className="text-2xl font-black text-slate-800 mb-6">{isAr ? 'وصف الإعلان' : 'Description'}</h3>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line font-medium">
                {ad.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Seller Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-blue-100/50 border border-slate-100 sticky top-24">
            <h3 className={`text-xl font-black text-slate-800 mb-8 border-blue-600 px-3 ${isAr ? 'border-r-4' : 'border-l-4'}`}>
              {isAr ? 'بيانات البائع' : 'Seller Info'}
            </h3>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg">
                {ad.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-black text-slate-800 text-xl mb-1">{ad.user?.name}</p>
                <p className="text-sm font-bold text-slate-400">{isAr ? 'عضو منذ' : 'Member since'} {new Date(ad.user?.created_at || Date.now()).getFullYear()}</p>
              </div>
            </div>

            <div className="space-y-4">
              {showPhone ? (
                <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 flex items-center justify-center text-2xl font-black text-blue-700 tracking-widest shadow-inner">
                  {ad.phone}
                </div>
              ) : (
                <Button 
                  onClick={() => setShowPhone(true)} 
                  className="w-full h-16 text-xl font-black bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-200 gap-3"
                >
                  <Phone className="w-6 h-6" />
                  {isAr ? 'إظهار رقم الموبايل' : 'Show Phone'}
                </Button>
              )}
              
              <Button 
                onClick={() => window.open(`https://wa.me/2${ad.phone.replace(/^0/, '')}`, '_blank')}
                variant="outline" 
                className="w-full h-16 text-xl font-black border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-2xl gap-3 transition-all"
              >
                <MessageCircle className="w-6 h-6" />
                {isAr ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
              </Button>
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
              <div className="flex items-center gap-2 mb-3 text-amber-800 font-black">
                <AlertTriangle className="w-5 h-5" />
                {isAr ? 'نصائح للسلامة' : 'Safety Tips'}
              </div>
              <ul className="text-sm text-amber-700 space-y-3 font-bold">
                <li className="flex gap-2"><span>•</span> {isAr ? 'قابل البائع في مكان عام' : 'Meet seller in public place'}</li>
                <li className="flex gap-2"><span>•</span> {isAr ? 'متدفعش أي فلوس مقدم' : 'Don\'t pay any money upfront'}</li>
                <li className="flex gap-2"><span>•</span> {isAr ? 'عاين الحاجة كويس قبل ما تدفع' : 'Inspect the item well before paying'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
