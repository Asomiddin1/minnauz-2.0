'use client';

import * as React from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Target,
  Clock,
  Calendar,
  Edit3,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, UserStudyPlan } from '@/lib/api';
import { getNextJLPTExamDate } from '@/lib/jlpt';
import { StudyPlanModal } from '@/components/dashboard/study-plan-modal';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function ProfilePage() {
  const { user, devices, fetchDevices, revokeDevice, logout } = useAuth();
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [studyPlan, setStudyPlan] = React.useState<UserStudyPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);

  const examInfo = React.useMemo(() => getNextJLPTExamDate(), []);

  const loadPlan = React.useCallback(async () => {
    try {
      const plan = await api.getStudyPlan();
      setStudyPlan(plan);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    fetchDevices();
    loadPlan();
  }, [fetchDevices, loadPlan]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    await loadPlan();
    setRefreshing(false);
  };

  const handleRevoke = async (deviceId: string) => {
    setRevokingId(deviceId);
    try {
      await revokeDevice(deviceId);
    } finally {
      setRevokingId(null);
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'MU';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-12">
      
      {/* Study Plan Modal */}
      <StudyPlanModal
        isOpen={isPlanModalOpen}
        initialPlan={studyPlan}
        onClose={() => setIsPlanModalOpen(false)}
        onSaved={(newPlan) => {
          setStudyPlan(newPlan);
          loadPlan();
        }}
      />

      {/* Title */}
      <div>
        <h1 className="headline text-[32px] font-semibold text-foreground">Profil & Sozlamalar</h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Shaxsiy maʼlumotlar, oʻquv rejasi va ulangan qurilmalar (Device Manager)
        </p>
      </div>

      {/* 1. User Info Card */}
      <div className="rounded-[28px] border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="2xl" className="border-2 border-border shadow-sm" />
            <div className="space-y-1">
              <h2 className="text-[20px] font-semibold text-foreground">
                {user?.fullName || 'Foydalanuvchi'}
              </h2>
              <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user?.email || 'user@example.com'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-3.5 py-1 text-[13px] font-semibold text-[#0071e3]">
              <Shield className="h-3.5 w-3.5" />
              <span>Rol: {user?.role || 'USER'}</span>
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-secondary/40 p-4 border border-border/50">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
              Obuna holati
            </p>
            <p className="text-[16px] font-bold text-foreground mt-1">SUPERMINNA · Faol</p>
          </div>

          <div className="rounded-2xl bg-secondary/40 p-4 border border-border/50">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
              Oʻquv maqsadi
            </p>
            <p className="text-[16px] font-bold text-foreground mt-1">
              JLPT {studyPlan?.targetLevel || 'N5'} Sertifikati
            </p>
          </div>
        </div>
      </div>

      {/* 2. Study Plan Section (Shaxsiy O'rganish Rejasi) */}
      <div className="rounded-[28px] border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="headline text-[20px] font-semibold text-foreground">
                Shaxsiy Oʻrganish Rejasi (JLPT & Maqsadlar)
              </h3>
              <span className="rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[12px] font-bold text-[#0071e3]">
                {studyPlan?.targetLevel || 'N5'}
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">
              Haftalik dars soati, kunlik reja va JLPT imtihoniga tayyorgarlik surʼati.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPlanModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-xs cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Rejani oʻzgartirish</span>
          </button>
        </div>

        {/* Plan Details Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4 text-[#0071e3]" />
              <span className="text-[12px] uppercase font-semibold tracking-wider">Maqsad Daraja</span>
            </div>
            <p className="headline text-[22px] font-bold text-foreground">
              JLPT {studyPlan?.targetLevel || 'N5'}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {studyPlan?.targetMonths || 6} oylik reja
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span className="text-[12px] uppercase font-semibold tracking-wider">Haftalik Vaqt</span>
            </div>
            <p className="headline text-[22px] font-bold text-foreground">
              {studyPlan?.weeklyGoalHours || 4} soat <span className="text-[13px] font-normal text-muted-foreground">/ hafta</span>
            </p>
            <p className="text-[12px] text-muted-foreground">
              Kuniga ~{studyPlan?.dailyMinutes || 35} daqiqa
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-2 text-amber-500">
              <Calendar className="h-4 w-4" />
              <span className="text-[12px] uppercase font-bold tracking-wider">JLPT Imtihoni</span>
            </div>
            <p className="headline text-[22px] font-bold text-amber-500">
              {examInfo.daysRemaining} <span className="text-[13px] font-normal">kun qoldi</span>
            </p>
            <p className="text-[12px] text-muted-foreground">
              {examInfo.formattedDate} (1-yakshanba)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Device Manager Section (Maksimal 3 ta qurilma) */}
      <div className="rounded-[28px] border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="headline text-[20px] font-semibold text-foreground">
                Ulangan qurilmalar (Device Manager)
              </h3>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[12px] font-semibold text-foreground">
                {devices.length} / 3
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">
              Bitta akkauntda maksimal 3 ta faol qurilma ishlatilishi mumkin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>

        {/* Devices list */}
        <div className="space-y-3">
          {devices.length === 0 ? (
            <div className="rounded-2xl bg-secondary/30 p-6 text-center text-muted-foreground">
              <p className="text-[14px]">Qurilmalar yuklanmoqda yoki mavjud emas...</p>
            </div>
          ) : (
            devices.map((device) => {
              const isPhone = device.os?.toLowerCase().includes('ios') || device.os?.toLowerCase().includes('android');
              const Icon = isPhone ? Smartphone : Laptop;

              return (
                <div
                  key={device.deviceId}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                    device.isCurrent
                      ? 'border-[#0071e3]/40 bg-[#0071e3]/5 shadow-xs'
                      : 'border-border bg-secondary/20 hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                        device.isCurrent ? 'bg-[#0071e3] text-white' : 'bg-secondary text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-foreground">
                          {device.deviceName || 'Nomaʼlum qurilma'}
                        </p>
                        {device.isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Joriy qurilma</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] text-muted-foreground">
                        {device.browser} • {device.os} • IP: {device.ipAddress || '127.0.0.1'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-muted-foreground">
                      Oxirgi faollik: {new Date(device.lastActiveAt).toLocaleDateString()}
                    </span>

                    {!device.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(device.deviceId)}
                        disabled={revokingId === device.deviceId}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Sessiyani yopish</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Account Actions */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-[14px] font-medium text-destructive-foreground transition-opacity hover:opacity-90 shadow-xs"
        >
          <LogOut className="h-4 w-4" />
          <span>Tizimdan chiqish (Logout)</span>
        </button>
      </div>
    </div>
  );
}
