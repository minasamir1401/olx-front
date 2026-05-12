'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MessageSquare, User, MapPin, Lock, Phone } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

type AuthMode = 'login' | 'register' | 'register-otp' | 'forgot' | 'forgot-otp';

export default function LoginPage() {
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuthStore();

  const governorates = isAr ? [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'البحيرة',
    'الشرقية', 'الدقهلية', 'الغربية', 'المنوفية', 'كفر الشيخ',
    'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء',
    'جنوب سيناء', 'البحر الأحمر', 'الفيوم', 'بني سويف', 'المنيا',
    'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'الوادي الجديد', 'مطروح'
  ] : [
    'Cairo', 'Giza', 'Alexandria', 'Qalyubia', 'Beheira',
    'Sharqia', 'Dakahlia', 'Gharbia', 'Monufia', 'Kafr El Sheikh',
    'Damietta', 'Port Said', 'Ismailia', 'Suez', 'North Sinai',
    'South Sinai', 'Red Sea', 'Faiyum', 'Beni Suef', 'Minya',
    'Assiut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'New Valley', 'Matrouh'
  ];

  const validatePhone = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error(isAr ? 'رقم الموبايل وكلمة السر مطلوبين' : 'Phone and password are required');
    if (!validatePhone(phone)) return toast.error(isAr ? 'تأكد من كتابة رقم الموبايل بشكل صحيح' : 'Ensure phone number is correct');
    
    setIsLoading(true);
    try {
      const data = await authService.login(phone, password);
      login(data.user, data.token);
      toast.success(isAr ? 'أهلاً بيك! تم تسجيل الدخول بنجاح' : 'Welcome! Logged in successfully');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || (isAr ? 'فشل تسجيل الدخول، تأكد من بياناتك' : 'Login failed, check your credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keeping other handlers logic, just updating toasts if needed)
  const handleRegisterRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !city || !password) return toast.error(isAr ? 'يرجى ملء جميع البيانات' : 'Please fill all fields');
    
    setIsLoading(true);
    try {
      const data = await authService.requestOTP(phone);
      toast.success(isAr ? 'تم إرسال كود التفعيل على واتساب' : 'Activation code sent on WhatsApp');
      setMode('register-otp');
    } catch (error: any) {
      toast.error(error.response?.data?.error || (isAr ? 'فشل إرسال الكود' : 'Failed to send code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error(isAr ? 'أدخل الكود' : 'Enter code');
    
    setIsLoading(true);
    try {
      const data = await authService.register(phone, otp, name, city, password);
      login(data.user, data.token);
      toast.success(isAr ? 'تم إنشاء حسابك بنجاح!' : 'Account created successfully!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || (isAr ? 'الكود غير صحيح' : 'Incorrect code'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4 bg-slate-50/50">
      <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
      <Card className="w-full max-w-lg shadow-2xl shadow-blue-200/50 border-0 bg-white/80 backdrop-blur-xl rounded-[2.5rem] relative z-10 overflow-hidden my-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400"></div>
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            {mode.includes('otp') ? <MessageSquare className="w-8 h-8 text-blue-600" /> : <User className="w-8 h-8 text-blue-600" />}
          </div>
          <CardTitle className="text-3xl font-black text-slate-800">
            {mode === 'login' && tAuth('login')}
            {mode === 'register' && tAuth('register')}
            {mode === 'forgot' && tAuth('forgot_password')}
            {mode.includes('otp') && tAuth('otp')}
          </CardTitle>
          <CardDescription className="text-base font-bold text-slate-500 mt-2">
            {mode === 'login' && tAuth('welcome_back')}
            {mode === 'register' && tAuth('register_subtitle')}
            {mode.includes('otp') && `${isAr ? 'بعتنا كود على' : 'We sent a code to'} ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          
          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="login-phone" className="text-base font-black text-slate-700">{tAuth('phone')}</Label>
                <div className="relative">
                  <Input id="login-phone" type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white border-slate-200 h-14 rounded-2xl text-lg font-bold pe-12 text-left" dir="ltr" disabled={isLoading} />
                  <Phone className="absolute end-4 top-4 text-slate-400 w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-pass" className="text-base font-black text-slate-700">{tAuth('password')}</Label>
                  <button type="button" onClick={() => setMode('forgot')} className="text-sm font-bold text-blue-600 hover:underline">{tAuth('forgot_password')}</button>
                </div>
                <div className="relative">
                  <Input id="login-pass" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-slate-200 h-14 rounded-2xl text-lg font-bold pe-12 text-left" dir="ltr" disabled={isLoading} />
                  <Lock className="absolute end-4 top-4 text-slate-400 w-6 h-6" />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-lg" disabled={isLoading}>{isLoading ? (isAr ? 'جاري الدخول...' : 'Logging in...') : tAuth('submit_login')}</Button>
              <div className="text-center pt-4">
                <span className="text-slate-500 font-bold">{tAuth('no_account')} </span>
                <button type="button" onClick={() => setMode('register')} className="text-blue-600 font-black hover:underline">{tAuth('register')}</button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterRequestOTP} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="reg-name" className="text-base font-black text-slate-700">{tAuth('full_name')}</Label>
                <div className="relative">
                  <Input id="reg-name" type="text" placeholder={isAr ? "مثلاً: أحمد محمود" : "e.g. John Doe"} value={name} onChange={(e) => setName(e.target.value)} className="bg-white border-slate-200 h-14 rounded-2xl text-lg font-bold pe-12" disabled={isLoading} />
                  <User className="absolute end-4 top-4 text-slate-400 w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="reg-phone" className="text-base font-black text-slate-700">{tAuth('phone')}</Label>
                <div className="relative">
                  <Input id="reg-phone" type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white border-slate-200 h-14 rounded-2xl text-lg font-bold pe-12 text-left" dir="ltr" disabled={isLoading} />
                  <Phone className="absolute end-4 top-4 text-slate-400 w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="reg-city" className="text-base font-black text-slate-700">{tAuth('city')}</Label>
                <div className="relative">
                  <select id="reg-city" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-white border border-slate-200 h-14 rounded-2xl text-lg font-bold pe-12 ps-4 appearance-none outline-none" disabled={isLoading}>
                    <option value="" disabled>{isAr ? 'اختر المحافظة...' : 'Select city...'}</option>
                    {governorates.map((gov) => (<option key={gov} value={gov}>{gov}</option>))}
                  </select>
                  <MapPin className="absolute end-4 top-4 text-slate-400 w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="reg-pass" className="text-base font-black text-slate-700">{tAuth('password')}</Label>
                <div className="relative">
                  <Input id="reg-pass" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-slate-200 h-14 rounded-2xl text-lg font-bold pe-12 text-left" dir="ltr" disabled={isLoading} />
                  <Lock className="absolute end-4 top-4 text-slate-400 w-6 h-6" />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-lg" disabled={isLoading}>{isLoading ? (isAr ? 'جاري المعالجة...' : 'Processing...') : tAuth('submit_register')}</Button>
              <div className="text-center pt-4">
                <span className="text-slate-500 font-bold">{tAuth('have_account')} </span>
                <button type="button" onClick={() => setMode('login')} className="text-blue-600 font-black hover:underline">{tAuth('login')}</button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="forgot-phone" className="text-base font-black text-slate-700">{tAuth('phone')}</Label>
                <div className="relative">
                  <Input id="forgot-phone" type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white border-slate-200 h-14 rounded-2xl text-lg font-bold pe-12 text-left" dir="ltr" disabled={isLoading} />
                  <Phone className="absolute end-4 top-4 text-slate-400 w-6 h-6" />
                </div>
              </div>
              <Button type="button" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-lg" disabled={isLoading}>{isLoading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : tAuth('submit_forgot')}</Button>
              <Button type="button" variant="ghost" className="w-full h-12 rounded-xl text-slate-500 font-bold" onClick={() => setMode('login')} disabled={isLoading}>{tAuth('back_to_login')}</Button>
            </form>
          )}

          {/* OTP VERIFY FORM */}
          {mode === 'register-otp' && (
            <form onSubmit={handleRegisterVerify} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="reg-otp" className="text-base font-black text-slate-700">{tAuth('otp')}</Label>
                <Input id="reg-otp" type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} className="bg-white border-slate-200 h-14 rounded-2xl text-center tracking-[0.5em] font-black text-2xl" maxLength={6} disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-lg" disabled={isLoading}>{isLoading ? (isAr ? 'جاري التأكيد...' : 'Verifying...') : tAuth('submit_otp')}</Button>
              <Button type="button" variant="ghost" className="w-full h-12 rounded-xl text-slate-500 font-bold" onClick={() => setMode('register')} disabled={isLoading}>{isAr ? 'تعديل البيانات' : 'Edit Info'}</Button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
