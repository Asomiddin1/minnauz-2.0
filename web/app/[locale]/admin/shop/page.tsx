'use client';

import * as React from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Coins,
  Shield,
  Zap,
  Percent,
  Crown,
  Sparkles,
  Bot,
  FileCheck2,
  BarChart3,
  Palette,
  RotateCcw,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Tag,
  Eye,
  X,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import {
  api,
  AdminStoreItem,
  AdminStoreStats,
  AdminStorePurchase,
  StoreCategory,
} from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function AdminShopPage() {
  const { lang } = useLang();

  const [items, setItems] = React.useState<AdminStoreItem[]>([]);
  const [stats, setStats] = React.useState<AdminStoreStats | null>(null);
  const [purchases, setPurchases] = React.useState<AdminStorePurchase[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('ALL');
  const [activeView, setActiveView] = React.useState<'ITEMS' | 'PURCHASES'>('ITEMS');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<AdminStoreItem | null>(null);
  const [modalSaving, setModalSaving] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    category: 'DISCOUNT' as StoreCategory,
    costCoins: 100,
    icon: 'Percent',
    badge: '',
    discountPercent: 10,
    durationDays: 0,
    actionKey: '',
    isAvailable: true,
    order: 0,
  });

  // Delete Confirm Modal
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, itemsData, purchasesData] = await Promise.allSettled([
        api.adminGetStoreStats(),
        api.adminGetStoreItems(),
        api.adminGetStorePurchases(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (itemsData.status === 'fulfilled') setItems(itemsData.value);
      if (purchasesData.status === 'fulfilled') setPurchases(purchasesData.value);
    } catch (err: any) {
      setError(err?.message || 'Maʼlumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'DISCOUNT',
      costCoins: 150,
      icon: 'Percent',
      badge: '',
      discountPercent: 10,
      durationDays: 0,
      actionKey: 'PRO_DISCOUNT_10',
      isAvailable: true,
      order: items.length + 1,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AdminStoreItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      costCoins: item.costCoins,
      icon: item.icon || 'Sparkles',
      badge: item.badge || '',
      discountPercent: item.discountPercent || 0,
      durationDays: item.durationDays || 0,
      actionKey: item.actionKey || '',
      isAvailable: item.isAvailable,
      order: item.order || 0,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError('Mahsulot nomini kiritish shart');
      return;
    }

    setModalSaving(true);
    setModalError(null);
    try {
      if (editingItem) {
        await api.adminUpdateStoreItem(editingItem.id, formData);
      } else {
        await api.adminCreateStoreItem(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.adminDeleteStoreItem(deletingId);
      setDeletingId(null);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Oʻchirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  const getItemIcon = (icon: string) => {
    switch (icon) {
      case 'Percent':
        return <Percent className="h-4 w-4" />;
      case 'Crown':
        return <Crown className="h-4 w-4" />;
      case 'Shield':
        return <Shield className="h-4 w-4" />;
      case 'Zap':
        return <Zap className="h-4 w-4" />;
      case 'Bot':
        return <Bot className="h-4 w-4" />;
      case 'FileCheck2':
        return <FileCheck2 className="h-4 w-4" />;
      case 'BarChart3':
        return <BarChart3 className="h-4 w-4" />;
      case 'Palette':
        return <Palette className="h-4 w-4" />;
      case 'RotateCcw':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (cat: StoreCategory) => {
    switch (cat) {
      case 'DISCOUNT':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Chegirma (DISCOUNT)
          </span>
        );
      case 'POWERUP':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Streak (POWERUP)
          </span>
        );
      case 'AI_PERK':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            AI Imtiyoz (AI_PERK)
          </span>
        );
      case 'COSMETIC':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
            Profil Ramka (COSMETIC)
          </span>
        );
      default:
        return null;
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.actionKey && item.actionKey.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Raqamli Doʻkon Boshqaruvi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Minna Coin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Platforma ichidagi vaucherlar, streak muzlatgichlari, AI imtiyozlar va profil
            ramkalarini boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="h-9 w-9 rounded-xl border border-border/60 bg-card hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
            title="Yangilash"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Yangi Mahsulot</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Statistics Bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Jami Mahsulotlar</span>
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">{stats?.totalItems ?? items.length}</p>
          <p className="text-[11px] text-muted-foreground">Doʻkonda faol raqamli buyumlar</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Foydalanuvchilar Xaridi</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">
            {stats?.totalPurchases ?? purchases.length} ta
          </p>
          <p className="text-[11px] text-muted-foreground">Muvaffaqiyatli amalga oshirilgan</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Sarflangan Tangalar</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-500">
            {stats?.totalCoinsSpent ?? 0} 🪙
          </p>
          <p className="text-[11px] text-muted-foreground">Foydalanuvchilar xaridiga ketgan</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Kategoriyalar</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-foreground">
              💎 {stats?.categories?.DISCOUNT || 5}
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-foreground">
              🔥 {stats?.categories?.POWERUP || 3}
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-foreground">
              🤖 {stats?.categories?.AI_PERK || 3}
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-foreground">
              🌸 {stats?.categories?.COSMETIC || 3}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground pt-0.5">4 ta toifada taqsimlangan</p>
        </div>
      </div>

      {/* 3. Main Views Navigation (Mahsulotlar vs Oxirgi Xaridlar) */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('ITEMS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'ITEMS'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Doʻkon Mahsulotlari ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('PURCHASES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'PURCHASES'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Foydalanuvchilar Xaridlari ({purchases.length})
          </button>
        </div>

        {activeView === 'ITEMS' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nomi yoki kalit soʻz..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 sm:w-56 h-8.5 pl-8.5 pr-3 rounded-xl border border-border/60 bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8.5 px-3 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">Barcha kategoriyalar</option>
              <option value="DISCOUNT">💎 Chegirmalar (DISCOUNT)</option>
              <option value="POWERUP">🔥 Streak (POWERUP)</option>
              <option value="AI_PERK">🤖 AI Imtiyoz (AI_PERK)</option>
              <option value="COSMETIC">🌸 Profil Bezak (COSMETIC)</option>
            </select>
          </div>
        )}
      </div>

      {/* 4. ITEMS TABLE VIEW */}
      {activeView === 'ITEMS' && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/30 text-muted-foreground font-semibold">
                  <th className="p-4">Mahsulot</th>
                  <th className="p-4">Kategoriya</th>
                  <th className="p-4">Narxi (Coin)</th>
                  <th className="p-4">Belgi (Badge)</th>
                  <th className="p-4">Xaridlar soni</th>
                  <th className="p-4">Holat</th>
                  <th className="p-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Mahsulotlar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                            {getItemIcon(item.icon)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">{getCategoryBadge(item.category)}</td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-black text-amber-500">
                          <span>🪙</span>
                          <span>{item.costCoins}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {item.badge ? (
                          <span className="px-2 py-0.5 rounded-md bg-secondary font-semibold text-foreground text-[11px]">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">-</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-foreground">
                          {item._count?.inventoryItems || 0} marta
                        </span>
                      </td>

                      <td className="p-4">
                        {item.isAvailable ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Faol
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
                            <XCircle className="h-3.5 w-3.5" />
                            Nofaol
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(item.id)}
                            className="h-8 w-8 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive flex items-center justify-center transition-all cursor-pointer"
                            title="Oʻchirish"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PURCHASES LOG VIEW */}
      {activeView === 'PURCHASES' && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/30 text-muted-foreground font-semibold">
                  <th className="p-4">Foydalanuvchi</th>
                  <th className="p-4">Xarid qilingan buyum</th>
                  <th className="p-4">Narxi (Coin)</th>
                  <th className="p-4">Vaucher Kodi</th>
                  <th className="p-4">Sana & Vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Hozircha xaridlar mavjud emas
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            user={p.user}
                            size="sm"
                          />
                          <div>
                            <p className="font-bold text-foreground">
                              {p.user.fullName || 'Foydalanuvchi'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{p.user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            {getItemIcon(p.item.icon)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{p.item.title}</p>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                              {p.item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-amber-500">🪙 {p.item.costCoins}</span>
                      </td>

                      <td className="p-4">
                        {p.code ? (
                          <span className="font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                            {p.code}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Avtomatik aktiv</span>
                        )}
                      </td>

                      <td className="p-4 text-muted-foreground">
                        {new Date(p.purchasedAt).toLocaleDateString('uz-UZ', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {editingItem ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qoʻshish'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Mahsulot Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 10% Pro Chegirma Vaucheri"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Tavsifi</label>
                <textarea
                  rows={2}
                  placeholder="Mahsulot haqida qisqacha maʼlumot..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border/60 bg-secondary/20 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Kategoriya *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as StoreCategory })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="DISCOUNT">💎 Chegirma (DISCOUNT)</option>
                    <option value="POWERUP">🔥 Streak (POWERUP)</option>
                    <option value="AI_PERK">🤖 AI Imtiyoz (AI_PERK)</option>
                    <option value="COSMETIC">🌸 Profil Ramkasi (COSMETIC)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Narxi (Coin) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.costCoins}
                    onChange={(e) =>
                      setFormData({ ...formData, costCoins: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-bold text-amber-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Ikonka</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="Percent">Percent (%)</option>
                    <option value="Crown">Crown (Toj)</option>
                    <option value="Shield">Shield (Qalqon/Muzlatgich)</option>
                    <option value="Zap">Zap (Chaqmoq/Booster)</option>
                    <option value="Bot">Bot (AI Ustoz)</option>
                    <option value="Palette">Palette (Ramka)</option>
                    <option value="FileCheck2">FileCheck2 (Imtihon)</option>
                    <option value="BarChart3">BarChart3 (Tahlil)</option>
                    <option value="RotateCcw">RotateCcw (Tiklash)</option>
                    <option value="Sparkles">Sparkles (Yulduzcha)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Belgi (Badge text)</label>
                  <input
                    type="text"
                    placeholder="Masalan: -50%, Mashhur"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Action Key</label>
                  <input
                    type="text"
                    placeholder="PRO_DISCOUNT_10, STREAK_FREEZE"
                    value={formData.actionKey}
                    onChange={(e) => setFormData({ ...formData, actionKey: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Tartib raqami</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                />
                <label
                  htmlFor="isAvailable"
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  Doʻkonda sotuvga chiqarilsin (Faol)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingItem ? 'Yangilash' : 'Yaratish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center border border-destructive/20">
              <Trash2 className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Mahsulotni oʻchirish</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Haqiqatan ham bu mahsulotni doʻkondan butunlay oʻchirib tashlamoqchimisiz?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive text-xs font-bold text-destructive-foreground hover:opacity-90 active:scale-95 shadow-sm transition-all cursor-pointer"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Oʻchirish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
