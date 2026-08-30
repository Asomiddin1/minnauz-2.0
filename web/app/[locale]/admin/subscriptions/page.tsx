'use client';

import * as React from 'react';
import {
  Crown,
  Users,
  Coins,
  TrendingUp,
  Search,
  Plus,
  Clock,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Edit2,
  Trash2,
  Check,
  Power,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  api,
  AdminSubscriptionItem,
  AdminSubscriptionStats,
  SubscriptionPlanItem,
  SubscriptionTier,
  SubscriptionStatus,
} from '@/lib/api';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = React.useState<'users' | 'plans'>('users');

  // User Subscriptions State
  const [stats, setStats] = React.useState<AdminSubscriptionStats | null>(null);
  const [subscriptions, setSubscriptions] = React.useState<AdminSubscriptionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Plans State
  const [plans, setPlans] = React.useState<SubscriptionPlanItem[]>([]);
  const [plansLoading, setPlansLoading] = React.useState(false);

  // Grant VIP Modal
  const [isGrantModalOpen, setIsGrantModalOpen] = React.useState(false);
  const [grantEmail, setGrantEmail] = React.useState('');
  const [grantTier, setGrantTier] = React.useState<SubscriptionTier>('MONTHLY');
  const [grantDays, setGrantDays] = React.useState(30);
  const [grantNotes, setGrantNotes] = React.useState('');
  const [grantLoading, setGrantLoading] = React.useState(false);

  // Plan Create / Edit Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<SubscriptionPlanItem | null>(null);
  const [planForm, setPlanForm] = React.useState({
    tier: 'MONTHLY' as SubscriptionTier,
    name: '',
    nameRu: '',
    priceUzs: 49000,
    durationDays: 30,
    featuresText: '',
    popular: false,
    tag: '',
    order: 0,
    isActive: true,
  });
  const [planSaving, setPlanSaving] = React.useState(false);

  // User Subscription Edit Modal
  const [editingSub, setEditingSub] = React.useState<AdminSubscriptionItem | null>(null);
  const [subForm, setSubForm] = React.useState({
    status: 'ACTIVE' as SubscriptionStatus,
    endDate: '',
    notes: '',
  });
  const [subSaving, setSubSaving] = React.useState(false);

  // Alert Message
  const [alertMsg, setAlertMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Load Subscriptions & Stats
  const loadSubscriptions = React.useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        api.adminGetSubscriptionStats().catch(() => null),
        api.adminGetSubscriptions(page, 20, statusFilter || undefined).catch(() => null),
      ]);

      if (statsRes) setStats(statsRes);
      if (listRes) {
        setSubscriptions(listRes.items || []);
        setTotalPages(listRes.meta?.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to load admin subscriptions:', e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // Load Plans
  const loadPlans = React.useCallback(async () => {
    try {
      setPlansLoading(true);
      const data = await api.adminGetAllPlans();
      setPlans(data);
    } catch (e) {
      console.error('Failed to load plans:', e);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSubscriptions();
    loadPlans();
  }, [loadSubscriptions, loadPlans]);

  // Grant VIP
  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantLoading(true);
    try {
      const usersRes = await api.request<any>(
        `/admin/users?search=${encodeURIComponent(grantEmail.trim())}&limit=1`,
      );
      const targetUser = usersRes?.items?.[0];
      if (!targetUser) throw new Error('Kiritilgan email boʻyicha foydalanuvchi topilmadi');

      const res = await api.adminGrantSubscription({
        userId: targetUser.id,
        tier: grantTier,
        durationDays: Number(grantDays),
        notes: grantNotes.trim() || undefined,
      });

      showAlert(res.message);
      setIsGrantModalOpen(false);
      setGrantEmail('');
      setGrantNotes('');
      await loadSubscriptions();
    } catch (err: any) {
      showAlert(err?.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setGrantLoading(false);
    }
  };

  // Extend Subscription +30 days
  const handleExtendSub = async (sub: AdminSubscriptionItem, days = 30) => {
    try {
      await api.adminExtendUserSubscription(sub.id, days);
      showAlert(`Obuna muddati +${days} kunga uzaytirildi`);
      await loadSubscriptions();
    } catch (err: any) {
      showAlert(err?.message || 'Uzaytirishda xatolik', 'error');
    }
  };

  // Delete User Subscription
  const handleDeleteSub = async (id: string) => {
    if (!confirm('Ushbu foydalanuvchi obunasini bekor qilib oʻchirmoqchimisiz?')) return;
    try {
      const res = await api.adminDeleteUserSubscription(id);
      showAlert(res.message);
      await loadSubscriptions();
    } catch (err: any) {
      showAlert(err?.message || 'Oʻchirishda xatolik', 'error');
    }
  };

  // Open Edit User Subscription Modal
  const openEditSub = (sub: AdminSubscriptionItem) => {
    setEditingSub(sub);
    setSubForm({
      status: sub.status,
      endDate: new Date(sub.endDate).toISOString().split('T')[0],
      notes: (sub as any).notes || '',
    });
  };

  // Save User Subscription Edits
  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setSubSaving(true);
    try {
      await api.adminUpdateUserSubscription(editingSub.id, {
        status: subForm.status,
        endDate: subForm.endDate,
        notes: subForm.notes,
      });
      showAlert('Obuna maʼlumotlari yangilandi');
      setEditingSub(null);
      await loadSubscriptions();
    } catch (err: any) {
      showAlert(err?.message || 'Saqlashda xatolik', 'error');
    } finally {
      setSubSaving(false);
    }
  };

  // Open Plan Modal
  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      tier: 'MONTHLY',
      name: '',
      nameRu: '',
      priceUzs: 49000,
      durationDays: 30,
      featuresText: 'Barcha darslar va audio\nCheksiz AI Sensei\nMock testlar',
      popular: false,
      tag: '',
      order: plans.length + 1,
      isActive: true,
    });
    setIsPlanModalOpen(true);
  };

  const openEditPlan = (plan: SubscriptionPlanItem) => {
    setEditingPlan(plan);
    setPlanForm({
      tier: plan.tier,
      name: plan.name,
      nameRu: plan.nameRu || '',
      priceUzs: plan.priceUzs,
      durationDays: plan.durationDays,
      featuresText: (plan.features || []).join('\n'),
      popular: plan.popular || false,
      tag: plan.tag || '',
      order: plan.order || 0,
      isActive: plan.isActive !== false,
    });
    setIsPlanModalOpen(true);
  };

  // Save Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSaving(true);
    try {
      const features = planForm.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        tier: planForm.tier,
        name: planForm.name.trim(),
        nameRu: planForm.nameRu.trim() || undefined,
        priceUzs: Number(planForm.priceUzs),
        durationDays: Number(planForm.durationDays),
        features,
        popular: Boolean(planForm.popular),
        tag: planForm.tag.trim() || undefined,
        order: Number(planForm.order),
        isActive: Boolean(planForm.isActive),
      };

      if (editingPlan) {
        await api.adminUpdatePlan(editingPlan.id, payload);
        showAlert('Tarif muvaffaqiyatli yangilandi');
      } else {
        await api.adminCreatePlan(payload);
        showAlert('Yangi tarif yaratildi');
      }
      setIsPlanModalOpen(false);
      await loadPlans();
    } catch (err: any) {
      showAlert(err?.message || 'Tarifni saqlashda xatolik', 'error');
    } finally {
      setPlanSaving(false);
    }
  };

  // Delete Plan
  const handleDeletePlan = async (id: string) => {
    if (!confirm('Ushbu tarifni oʻchirmoqchimisiz?')) return;
    try {
      const res = await api.adminDeletePlan(id);
      showAlert(res.message);
      await loadPlans();
    } catch (err: any) {
      showAlert(err?.message || 'Oʻchirishda xatolik', 'error');
    }
  };

  // Toggle Plan Active
  const handleTogglePlan = async (id: string) => {
    try {
      await api.adminTogglePlan(id);
      await loadPlans();
    } catch (err: any) {
      showAlert(err?.message || 'Holatni oʻzgartirishda xatolik', 'error');
    }
  };

  const filteredItems = subscriptions.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const email = sub.user?.email?.toLowerCase() || '';
    const name = sub.user?.fullName?.toLowerCase() || '';
    return email.includes(q) || name.includes(q);
  });

  return (
    <div className="space-y-7 pb-16 animate-in fade-in duration-300 font-sans">
      {/* ALERT NOTIFICATION */}
      {alertMsg && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-3 animate-in slide-in-from-top-3 text-xs font-bold ${
            alertMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-[11px] font-bold text-yellow-600 dark:text-yellow-400 mb-2">
            <Crown className="h-3.5 w-3.5" />
            <span>Monetizatsiya & Aʼzolik CRUD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Obunalar & Tariflar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tariflarni yaratish, tahrirlash, faol obunalarni kuzatish va VIP huquqlarini berish.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'plans' ? (
            <button
              type="button"
              onClick={openCreatePlan}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Yangi Tarif Yaratish</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsGrantModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs transition-all shadow-sm cursor-pointer"
            >
              <Crown className="h-4 w-4" />
              <span>Foydalanuvchiga Pro berish</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Faol Pro Aʼzolar
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {stats?.activeSubscribers ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground">Hozirda faol foydalanuvchilar</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Jami Obunalar
            </span>
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {stats?.totalSubscriptions ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground">Ochilgan obunalar soni</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Jami Tushum
            </span>
            <div className="h-8 w-8 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-yellow-600 dark:text-yellow-400">
            {(stats?.totalRevenueUzs ?? 0).toLocaleString('uz-UZ')}{' '}
            <span className="text-xs font-medium text-muted-foreground">soʻm</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Toʻlov tizimlaridan oʻtgan summa</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Mavjud Tariflar
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{plans.length}</p>
          <p className="text-[11px] text-muted-foreground">
            {plans.filter((p) => p.isActive !== false).length} tasi faol
          </p>
        </div>
      </div>

      {/* 3. ASOSIY TABLAR (FOYDALANUVCHI OBUNALARI VA TARIFLAR CRUD) */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-secondary text-foreground border border-border/80 shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Foydalanuvchi Obunalari ({subscriptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-secondary text-foreground border border-border/80 shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Tariflar Boshqaruvi (Plans CRUD - {plans.length})</span>
        </button>
      </div>

      {/* TAB 1: FOYDALANUVCHI OBUNALARI */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { id: '', label: 'Barchasi' },
                { id: 'ACTIVE', label: 'Faol' },
                { id: 'CANCELED', label: 'Bekor qilingan' },
                { id: 'EXPIRED', label: 'Muddati oʻtgan' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(f.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === f.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Foydalanuvchi qidirish..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-secondary/30 text-muted-foreground uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Foydalanuvchi</th>
                    <th className="py-3 px-4">Tarif</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4">Amal qilish muddati</th>
                    <th className="py-3 px-4">Toʻlov</th>
                    <th className="py-3 px-4">Qolgan kunlar</th>
                    <th className="py-3 px-4 text-right">Amallar (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                        <span>Yuklanmoqda...</span>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        Obunalar topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((sub) => {
                      const isExpired = new Date(sub.endDate) < new Date();
                      return (
                        <tr key={sub.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={sub.user?.fullName}
                                src={sub.user?.avatarUrl}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-foreground truncate">
                                  {sub.user?.fullName || 'Ismsiz'}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {sub.user?.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-foreground">
                            <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                              <Crown className="h-3.5 w-3.5" />
                              <span>{sub.plan?.name || sub.tier}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {sub.status === 'ACTIVE' && !isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                                <CheckCircle2 className="h-3 w-3" />
                                Faol
                              </span>
                            ) : sub.status === 'CANCELED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-[11px] font-bold">
                                Bekor qilingan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-muted-foreground text-[11px] font-bold">
                                Tugagan
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-muted-foreground">
                            <span>
                              {new Date(sub.startDate).toLocaleDateString('uz-UZ')} —{' '}
                              {new Date(sub.endDate).toLocaleDateString('uz-UZ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-secondary text-foreground text-[11px] font-bold">
                              {sub.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-foreground">
                            {isExpired ? (
                              <span className="text-muted-foreground">0 kun</span>
                            ) : (
                              <span className="text-emerald-500">
                                {Math.max(
                                  0,
                                  Math.ceil(
                                    (new Date(sub.endDate).getTime() - Date.now()) /
                                      (1000 * 60 * 60 * 24),
                                  ),
                                )}{' '}
                                kun
                              </span>
                            )}
                          </td>

                          {/* Actions: +30 kun, Edit, Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="30 kunga uzaytirish"
                                onClick={() => handleExtendSub(sub, 30)}
                                className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold transition-all cursor-pointer"
                              >
                                +30 kun
                              </button>
                              <button
                                type="button"
                                title="Tahrirlash"
                                onClick={() => openEditSub(sub)}
                                className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Bekor qilish / O'chirish"
                                onClick={() => handleDeleteSub(sub.id)}
                                className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TARIFLAR BOSHQARUVI (PLANS CRUD) */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansLoading ? (
              <div className="col-span-3 py-20 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <span>Tariflar yuklanmoqda...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-muted-foreground">
                Tariflar topilmadi. Yangi tarif qoʻshing!
              </div>
            ) : (
              plans.map((plan) => {
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all bg-card shadow-xs ${
                      plan.popular
                        ? 'border-yellow-500/60 shadow-md ring-2 ring-yellow-500/20'
                        : 'border-border'
                    } ${plan.isActive === false ? 'opacity-60' : ''}`}
                  >
                    {plan.tag && (
                      <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {plan.tag}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                          <span className="text-[11px] font-bold text-muted-foreground">
                            Tier: {plan.tier}
                          </span>
                        </div>
                        <div
                          className={`p-2 rounded-xl ${
                            plan.popular
                              ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          <Crown className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-2xl sm:text-3xl font-black text-foreground">
                          {plan.priceUzs.toLocaleString('uz-UZ')}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          soʻm / {plan.durationDays > 365 ? 'umrbod' : `${plan.durationDays} kun`}
                        </span>
                      </div>

                      <div className="space-y-2 border-t border-border/60 pt-4 text-xs">
                        <div className="text-[11px] font-bold text-muted-foreground uppercase">
                          Imkoniyatlar ({((plan.features as string[]) || []).length} ta):
                        </div>
                        <ul className="space-y-1.5 text-muted-foreground">
                          {((plan.features as string[]) || []).slice(0, 4).map((f, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                          {((plan.features as string[]) || []).length > 4 && (
                            <li className="text-[11px] text-muted-foreground italic">
                              + yana {((plan.features as string[]) || []).length - 4} ta imkoniyat
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/60 mt-6 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePlan(plan.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          plan.isActive !== false
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        <span>{plan.isActive !== false ? 'Faol' : 'Nofaol'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditPlan(plan)}
                          className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Tahrirlash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: GRANT PRO MODAL */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsGrantModalOpen(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Foydalanuvchiga Pro berish</h3>
                <p className="text-xs text-muted-foreground">
                  Talabaga bepul yoki sovgʻa sifatida VIP obunani biriktirish.
                </p>
              </div>
            </div>

            <form onSubmit={handleGrant} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Foydalanuvchi Emaili:</label>
                <input
                  type="email"
                  required
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="masalan: student@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tarif:</label>
                  <select
                    value={grantTier}
                    onChange={(e) => setGrantTier(e.target.value as SubscriptionTier)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="MONTHLY">Oylik Pro</option>
                    <option value="QUARTERLY">3 Oylik Pro</option>
                    <option value="ANNUAL">Yillik VIP</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Muddat (kun):</label>
                  <input
                    type="number"
                    min={1}
                    value={grantDays}
                    onChange={(e) => setGrantDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Izoh (ixtiyoriy):</label>
                <input
                  type="text"
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="Masalan: Tanlov g'olibi uchun sovg'a"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <button
                type="submit"
                disabled={grantLoading}
                className="w-full py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {grantLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Biriktirilmoqda...</span>
                  </>
                ) : (
                  <span>Pro obunani biriktirish</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT PLAN MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {editingPlan ? 'Tarifni tahrirlash' : 'Yangi tarif yaratish'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tarif narxi, davomiyligi va beriladigan imkoniyatlarni sozlang.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tarif nomi (Oʻzbekcha):</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="Masalan: Oylik Pro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tier kategoriyasi:</label>
                  <select
                    value={planForm.tier}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, tier: e.target.value as SubscriptionTier })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="MONTHLY">MONTHLY (Oylik)</option>
                    <option value="QUARTERLY">QUARTERLY (3 oylik)</option>
                    <option value="ANNUAL">ANNUAL (Yillik)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Narxi (soʻmda):</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={planForm.priceUzs}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, priceUzs: Number(e.target.value) })
                    }
                    placeholder="Masalan: 49000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Davomiylik muddati (kun):</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={planForm.durationDays}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, durationDays: Number(e.target.value) })
                    }
                    placeholder="30"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Maxsus Tag / Badge:</label>
                  <input
                    type="text"
                    value={planForm.tag}
                    onChange={(e) => setPlanForm({ ...planForm, tag: e.target.value })}
                    placeholder="Masalan: Eng tejamkor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tartib raqami (Order):</label>
                  <input
                    type="number"
                    value={planForm.order}
                    onChange={(e) => setPlanForm({ ...planForm, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Imkoniyatlar roʻyxati (Har bir qatorda bittadan):
                </label>
                <textarea
                  rows={4}
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  placeholder="Barcha JLPT darslari&#10;Cheksiz AI Speaking&#10;Mock testlar"
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.popular}
                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="font-bold text-foreground">Eng ommabop (Popular)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="font-bold text-foreground">Faol tarif</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={planSaving}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {planSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <span>{editingPlan ? 'Tarifni yangilash' : 'Tarifni yaratish'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER SUBSCRIPTION MODAL */}
      {editingSub && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingSub(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Edit2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Obunani tahrirlash</h3>
                <p className="text-xs text-muted-foreground">
                  Foydalanuvchi: <strong className="text-foreground">{editingSub.user?.email}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Obuna holati (Status):</label>
                <select
                  value={subForm.status}
                  onChange={(e) =>
                    setSubForm({ ...subForm, status: e.target.value as SubscriptionStatus })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="ACTIVE">ACTIVE (Faol)</option>
                  <option value="CANCELED">CANCELED (Bekor qilingan)</option>
                  <option value="EXPIRED">EXPIRED (Tugagan)</option>
                  <option value="PAST_DUE">PAST_DUE (Toʻlov kutilmoqda)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tugash sanasi (End Date):</label>
                <input
                  type="date"
                  required
                  value={subForm.endDate}
                  onChange={(e) => setSubForm({ ...subForm, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Admin izohi:</label>
                <input
                  type="text"
                  value={subForm.notes}
                  onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                  placeholder="Masalan: Foydalanuvchi so'roviga binoan uzaytirildi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <button
                type="submit"
                disabled={subSaving}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {subSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <span>Oʻzgarishlarni saqlash</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
