'use client';

import { useState, useEffect, Suspense } from 'react';
import { adminService } from '@/services/admin.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { UserCircle, Ban, Loader2, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function UsersContent() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  
  const [users, setUsers] = useState<any[]>([]);
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
    fetchUsers();
  }, [isHydrated, isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      let data = await adminService.getUsers();
      if (filter === 'banned') {
        data = data.filter((u: any) => u.is_banned);
      }
      setUsers(data);
    } catch (error) {
      toast.error('فشل في تحميل قائمة المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId: number, currentBanStatus: boolean) => {
    try {
      await adminService.toggleUserBan(userId, !currentBanStatus);
      toast.success(currentBanStatus ? 'تم إلغاء الحظر' : 'تم حظر المستخدم');
      fetchUsers();
    } catch (error) {
      toast.error('فشل تنفيذ العملية');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone.includes(searchTerm)
  );

  if (!isHydrated || loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">إدارة المستخدمين</h1>
          <p className="text-slate-500 font-bold">إجمالي المستخدمين في النظام: {users.length}</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/admin')} variant="outline" className="rounded-2xl font-bold border-2"><ArrowRight className="ml-2 w-5 h-5" /> لوحة التحكم</Button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-3.5 text-slate-400 w-6 h-6" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو رقم الهاتف..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pr-12 pl-4 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none"
            />
          </div>
          <div className="flex gap-2 bg-white p-2 rounded-2xl border-2 border-slate-100">
            <Button 
                onClick={() => router.push('/admin/users')} 
                variant={!filter ? 'default' : 'ghost'} 
                className="rounded-xl font-bold"
            >الكل</Button>
            <Button 
                onClick={() => router.push('/admin/users?filter=banned')} 
                variant={filter === 'banned' ? 'destructive' : 'ghost'} 
                className="rounded-xl font-bold"
            >المحظورين</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-black text-sm uppercase tracking-wider">
                <th className="px-8 py-5">المستخدم</th>
                <th className="px-8 py-5">رقم الهاتف</th>
                <th className="px-8 py-5">تاريخ الانضمام</th>
                <th className="px-8 py-5">الحالة</th>
                <th className="px-8 py-5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <UserCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg">{u.name}</div>
                        <div className="text-sm font-bold text-slate-400">ID: #{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-600">{u.phone}</td>
                  <td className="px-8 py-6 text-slate-500 font-medium">
                    {format(new Date(u.created_at), 'PPP', { locale: ar })}
                  </td>
                  <td className="px-8 py-6">
                    {u.is_banned ? (
                      <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-black flex items-center w-fit gap-2">
                        <Ban className="w-4 h-4" /> محظور
                      </span>
                    ) : (
                      <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-xs font-black flex items-center w-fit gap-2">
                        <ShieldCheck className="w-4 h-4" /> نشط
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <Button 
                      onClick={() => handleToggleBan(u.id, u.is_banned)}
                      variant={u.is_banned ? 'outline' : 'destructive'}
                      className="rounded-xl font-bold shadow-sm"
                    >
                      {u.is_banned ? 'إلغاء الحظر' : 'حظر الحساب'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-black text-xl">لا يوجد مستخدمين يطابقون بحثك.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsersAdmin() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>}>
      <UsersContent />
    </Suspense>
  );
}
