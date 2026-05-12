'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error('يرجى إدخال رقم الهاتف وكلمة المرور');

    setLoading(true);
    try {
      const data = await authService.login(phone, password);
      
      if (data.user.role !== 'ADMIN') {
        toast.error('عذراً، هذا الحساب ليس لديه صلاحيات الإدارة');
        return;
      }

      login(data.user, data.token);
      toast.success('مرحباً بك في لوحة التحكم');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-slate-800" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">بوابة الإدارة</h1>
          <p className="text-slate-500 font-bold mt-2">تسجيل الدخول للمشرفين فقط</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 block">رقم الموبايل</label>
            <Input
              type="tel"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-left font-bold"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 block">كلمة المرور</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-left font-bold"
              dir="ltr"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-lg"
            disabled={loading}
          >
            {loading ? 'جاري التحقق...' : 'دخول للوحة التحكم'}
          </Button>
        </form>
      </div>
    </div>
  );
}
