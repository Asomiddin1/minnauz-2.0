'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  Smartphone,
  UserPlus,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api, AdminUserStats, AdminUserItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function AdminOverviewPage() {
  const { lang, t } = useLang();
  const { user, isAuthenticated } = useAuth();

  const [stats, setStats] = React.useState<AdminUserStats | null>(null);
  const [recentUsers, setRecentUsers] = React.useState<AdminUserItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        api.getAdminUserStats(),
        api.getAdminUsers({ limit: 5, page: 1 }),
      ]);
      setStats(statsData);
      setRecentUsers(usersData.items);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
            {t?.admin?.overview?.roles?.superAdmin || 'Super Admin'}
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            {t?.admin?.overview?.roles?.admin || 'Admin'}
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            {t?.admin?.overview?.roles?.teacher || 'Ustoz'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {t?.admin?.overview?.roles?.student || 'Oʻquvchi'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="headline text-[28px] sm:text-[32px] font-bold text-foreground">
            {t?.admin?.overview?.title || 'Boshqaruv Paneli'}
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            {t?.admin?.overview?.welcome || 'Xush kelibsiz'}, <strong className="text-foreground">{user?.fullName || user?.email}</strong>. {t?.admin?.overview?.subtitle || 'Platforma koʻrsatkichlari va foydalanuvchilar holati:'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t?.admin?.overview?.refresh || 'Yangilash'}</span>
          </button>
          <Link
            href={`/${lang}/admin/users`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0071e3] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t?.admin?.sidebar?.users || 'Foydalanuvchilar'}</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-muted-foreground">Jami Foydalanuvchilar</p>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[28px] font-bold text-foreground">
              {loading ? '...' : stats?.totalUsers ?? 0}
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {stats?.verifiedUsers ?? 0} ta
              </span>{' '}
              tasdiqlangan
            </p>
          </div>
        </div>

        {/* Admins */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-muted-foreground">Adminlar soni</p>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[28px] font-bold text-foreground">
              {loading ? '...' : stats?.totalAdmins ?? 0}
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {stats?.superAdmins ?? 0} ta Super Admin
            </p>
          </div>
        </div>

        {/* Teachers */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-muted-foreground">Ustozlar (Teachers)</p>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[28px] font-bold text-foreground">
              {loading ? '...' : stats?.teachers ?? 0}
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground">Dars oʻtuvchi pedagoglar</p>
          </div>
        </div>

        {/* Active Device Sessions */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-muted-foreground">Faol Sessiyalar</p>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[28px] font-bold text-foreground">
              {loading ? '...' : stats?.activeSessions ?? 0}
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground">Ulangan qurilmalar soni</p>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-foreground">
              {t?.admin?.overview?.recentUsers || 'Soʻnggi roʻyxatdan oʻtganlar'}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {t?.admin?.overview?.subtitle || 'Yangi qoʻshilgan foydalanuvchilar roʻyxati'}
            </p>
          </div>
          <Link
            href={`/${lang}/admin/users`}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0071e3] hover:underline"
          >
            <span>{t?.admin?.overview?.viewAll || 'Barchasini koʻrish'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground">
                <th className="pb-3 font-semibold">{t?.admin?.overview?.tableUser || 'Foydalanuvchi'}</th>
                <th className="pb-3 font-semibold">{t?.admin?.overview?.tableRole || 'Rol'}</th>
                <th className="pb-3 font-semibold">{t?.admin?.overview?.tableStatus || 'Holat'}</th>
                <th className="pb-3 font-semibold">Qurilmalar</th>
                <th className="pb-3 font-semibold">{t?.admin?.overview?.tableJoined || 'Sana'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    {t?.admin?.overview?.noUsers || 'Foydalanuvchilar topilmadi'}
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} size="sm" />
                        <div>
                          <p className="font-semibold text-foreground">
                            {u.fullName || 'Nomsiz'}
                          </p>
                          <p className="text-[12px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">{getRoleBadge(u.role)}</td>
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Tasdiqlangan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[12px] text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Kutilmoqda</span>
                          </span>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {u.activeDevicesCount > 0 ? 'Tizimda faol' : 'Hali kirmagan'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 text-muted-foreground">
                      {u.activeDevicesCount} ta qurilma
                    </td>
                    <td className="py-3.5 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
