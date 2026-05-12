'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { MessageCircle, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppAdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<{ isReady: boolean }>({ isReady: false });
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

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [isHydrated, isAuthenticated, user, router]);

  const fetchStatus = async () => {
    try {
      const statusData = await adminService.getWhatsAppStatus();
      setStatus(statusData);
      
      if (!statusData.isReady) {
        const qrData = await adminService.getWhatsAppQR();
        setQrCode(qrData.qr);
      } else {
        setQrCode(null);
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp status', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('هل أنت متأكد من تسجيل الخروج من واتساب؟ سيتم مسح الجلسة الحالية.')) return;
    
    try {
      setLoading(true);
      await adminService.logoutWhatsApp();
      toast.success('تم تسجيل الخروج بنجاح. يمكنك الآن مسح QR جديد.');
      setQrCode(null);
      setStatus({ isReady: false });
      setTimeout(fetchStatus, 2000);
    } catch (error) {
      toast.error('فشل في تسجيل الخروج');
      setLoading(false);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 p-10 border border-slate-100 text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="p-5 bg-blue-50 rounded-3xl text-blue-600">
            <MessageCircle className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-2">ربط الواتساب</h1>
        <p className="text-slate-500 font-bold mb-8">إدارة نظام الـ OTP التلقائي للمنصة</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-400 font-bold">جاري فحص الحالة...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {status.isReady ? (
              <motion.div 
                key="ready"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-10"
              >
                <div className="bg-green-50 text-green-600 p-8 rounded-[2rem] flex flex-col items-center gap-4 border border-green-100">
                  <CheckCircle className="w-16 h-16" />
                  <div className="text-xl font-black">الواتساب متصل بنجاح</div>
                  <p className="text-sm font-bold opacity-80">النظام جاهز لإرسال كود التحقق للمستخدمين</p>
                </div>
                <div className="flex flex-col gap-3 w-full mt-8">
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                  >
                    <RefreshCw className="w-5 h-5" /> تحديث الحالة
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all border border-red-100"
                  >
                    تسجيل الخروج من واتساب
                  </button>
                </div>
              </motion.div>
            ) : qrCode ? (
              <motion.div 
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="bg-white p-6 rounded-3xl shadow-inner border border-slate-100 mb-6">
                  <QRCodeSVG value={qrCode} size={250} />
                </div>
                <div className="bg-amber-50 text-amber-600 p-6 rounded-2xl flex items-start gap-3 border border-amber-100 text-right mb-6">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
                  <div>
                    <div className="font-black mb-1">المسح الضوئي مطلوب</div>
                    <p className="text-xs font-bold leading-relaxed">قم بفتح واتساب على هاتفك - الإعدادات - الأجهزة المرتبطة - ربط جهاز، ثم وجه الكاميرا نحو الشاشة.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-sm animate-pulse mb-2">
                    <RefreshCw className="w-4 h-4" /> جاري انتظار المسح...
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-all text-xs"
                  >
                    إعادة ضبط الجلسة
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="not-ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 text-center"
              >
                <div className="bg-blue-50 text-blue-600 p-8 rounded-[2rem] flex flex-col items-center gap-4 border border-blue-100">
                  <Loader2 className="w-16 h-16 animate-spin" />
                  <div className="text-xl font-black">جاري توليد كود QR...</div>
                  <p className="text-sm font-bold opacity-80">يرجى الانتظار ثواني، السيرفر يقوم بتجهيز جلسة جديدة.</p>
                </div>
                <button 
                  onClick={fetchStatus}
                  className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  <RefreshCw className="w-5 h-5" /> تحديث يدوي
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
