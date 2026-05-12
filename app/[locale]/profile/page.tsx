import { getTranslations } from 'next-intl/server';
import { UserCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default async function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-20 pb-32 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
        <UserCircle2 className="w-12 h-12" />
      </div>
      <h1 className="text-2xl sm:text-4xl font-black text-slate-800 mb-4">
        حسابي
      </h1>
      <p className="text-slate-500 text-lg max-w-md mb-8">
        قم بتسجيل الدخول لإدارة إعلاناتك، مشاهدة رسائلك، وتعديل بيانات حسابك الشخصي.
      </p>
      
      <div className="flex gap-4">
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
          تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
