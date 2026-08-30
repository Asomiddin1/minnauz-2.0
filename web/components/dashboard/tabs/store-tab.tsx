'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Coins,
  Flame,
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
  Check,
  Copy,
  ArrowRight,
  Info,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Lock,
  Gift,
  HelpCircle,
} from 'lucide-react';
import {
  api,
  StoreItem,
  UserInventoryItem,
  UserCoinsState,
  CoinTransaction,
  StoreCategory,
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/i18n';
import { UserAvatar } from '@/components/shared/user-avatar';

export function StoreTab() {
  const { user, updateUser, equipFrame } = useAuth();
  const router = useRouter();
  const { lang } = useLang();

  const [items, setItems] = React.useState<StoreItem[]>([]);
  const [inventory, setInventory] = React.useState<UserInventoryItem[]>([]);
  const [userCoins, setUserCoins] = React.useState<UserCoinsState | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Active Category filter or 'INVENTORY'
  const [selectedTab, setSelectedTab] = React.useState<string>('ALL');

  // Purchase Modal
  const [purchasingItem, setPurchasingItem] = React.useState<StoreItem | null>(null);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = React.useState<string | null>(null);
  const [purchaseErrorMessage, setPurchaseErrorMessage] = React.useState<string | null>(null);

  // How to earn coins modal
  const [showEarnGuide, setShowEarnGuide] = React.useState(false);

  // History modal
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [historyList, setHistoryList] = React.useState<CoinTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);

  // Copied promo code toast state
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const loadStoreData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [itemsData, coinsData, inventoryData] = await Promise.allSettled([
        api.getStoreItems(),
        api.getUserCoins(),
        api.getUserInventory(),
      ]);

      if (itemsData.status === 'fulfilled') {
        setItems(itemsData.value);
      }
      if (coinsData.status === 'fulfilled') {
        setUserCoins(coinsData.value);
      }
      if (inventoryData.status === 'fulfilled') {
        setInventory(inventoryData.value);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  const loadHistory = async () => {
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const data = await api.getCoinHistory();
      setHistoryList(data);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!purchasingItem) return;
    setIsPurchasing(true);
    setPurchaseErrorMessage(null);
    try {
      const res = await api.purchaseStoreItem(purchasingItem.id);
      setPurchaseSuccessMessage(res.message);
      setUserCoins((prev) => (prev ? { ...prev, coins: res.remainingCoins } : null));
      setInventory((prev) => [res.inventoryItem, ...prev]);

      // If cosmetic frame, also update avatarFrame state
      if (purchasingItem.category === 'COSMETIC' && purchasingItem.actionKey) {
        setUserCoins((prev) =>
          prev ? { ...prev, avatarFrame: purchasingItem.actionKey || null } : null
        );
        updateUser({ avatarFrame: purchasingItem.actionKey });
      }

      setTimeout(() => {
        setPurchasingItem(null);
        setPurchaseSuccessMessage(null);
      }, 1800);
    } catch (err: any) {
      setPurchaseErrorMessage(err?.message || 'Xarid qilishda xatolik yuz berdi');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleEquipFrame = async (frameKey: string | null) => {
    try {
      await equipFrame(frameKey);
      setUserCoins((prev) => (prev ? { ...prev, avatarFrame: frameKey } : null));
    } catch (err: any) {
      alert(err?.message || 'Ramkani almashtirishda xatolik yuz berdi');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredItems = React.useMemo(() => {
    if (selectedTab === 'ALL') return items;
    return items.filter((i) => i.category === selectedTab);
  }, [items, selectedTab]);

  const getItemIcon = (icon: string) => {
    switch (icon) {
      case 'Percent':
        return <Percent className="h-5 w-5" />;
      case 'Crown':
        return <Crown className="h-5 w-5" />;
      case 'Shield':
        return <Shield className="h-5 w-5" />;
      case 'Zap':
        return <Zap className="h-5 w-5" />;
      case 'Bot':
        return <Bot className="h-5 w-5" />;
      case 'FileCheck2':
        return <FileCheck2 className="h-5 w-5" />;
      case 'BarChart3':
        return <BarChart3 className="h-5 w-5" />;
      case 'Palette':
        return <Palette className="h-5 w-5" />;
      case 'RotateCcw':
        return <RotateCcw className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (cat: StoreCategory) => {
    switch (cat) {
      case 'DISCOUNT':
        return 'from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30';
      case 'POWERUP':
        return 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30';
      case 'AI_PERK':
        return 'from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30';
      case 'COSMETIC':
        return 'from-purple-500/20 to-pink-500/20 text-purple-500 border-purple-500/30';
      default:
        return 'from-primary/20 to-primary/10 text-primary border-primary/30';
    }
  };

  return (
    <div className="space-y-7 pb-20 animate-in fade-in duration-300">
      {/* 1. HERO WALLET BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[11px] font-bold text-amber-500">
              <Coins className="h-3.5 w-3.5" />
              <span>MinnaUz Raqamli Doʻkon</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Minna Coin Doʻkoni 🛍️
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Darslarni oʻqib va testlarni yechib tangalar toʻplang! Ularni Pro obuna chegirmalari,
              Streak muzlatgichlari, AI repetitor va maxsus ramkalarga sarflang.
            </p>
          </div>

          {/* Golden Coin Wallet Card */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-card shadow-md min-w-[200px] shrink-0 text-center space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              Sizning Balansingiz
            </span>
            <div className="flex items-center justify-center gap-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black font-black text-sm shadow-md animate-bounce">
                🪙
              </div>
              <p className="text-3xl sm:text-4xl font-black text-amber-500">
                {userCoins?.coins ?? 0}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowEarnGuide(true)}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="h-3 w-3" />
                <span>Coin ishlash</span>
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={loadHistory}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
              >
                <History className="h-3 w-3" />
                <span>Tarix</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Streak & Perks Status Bar */}
        <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t border-border/40">
          <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3 border border-border/40">
            <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Flame className="h-4 w-4 fill-current" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Streak</p>
              <p className="text-xs font-black text-foreground">
                {userCoins?.streakDays || 0} kunlik faollik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3 border border-border/40">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Streak Muzlatgich
              </p>
              <p className="text-xs font-black text-foreground">
                {userCoins?.streakFrozen ? 'Faol ❄️ (Himoyalangan)' : 'Oʻchiq'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3 border border-border/40">
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Profil Ramkasi</p>
              <p className="text-xs font-black text-foreground">
                {userCoins?.avatarFrame
                  ? userCoins.avatarFrame.replace('FRAME_', '') + ' Ramkasi'
                  : 'Oddiy'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'Barchasi' },
          { id: 'DISCOUNT', label: 'Chegirmalar & Obuna 💎' },
          { id: 'POWERUP', label: 'Streak & Kuchaytirgichlar 🔥' },
          { id: 'AI_PERK', label: 'AI & Imtihon Chiptalari 🤖' },
          { id: 'COSMETIC', label: 'Profil Bezaklari 🌸' },
          {
            id: 'INVENTORY',
            label: `Mening Inventarim (${inventory.length}) 🎒`,
          },
        ].map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. INVENTORY VIEW */}
      {selectedTab === 'INVENTORY' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>Mening Sotib Olgan Buyumlarim</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {inventory.length} ta
              </span>
            </h2>
          </div>

          {inventory.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-foreground">Inventar boʻsh</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Siz hali doʻkondan hech narsa xarid qilmadingiz. Tangalaringiz evaziga foydali
                chegirma yoki kuchaytirgichlar oling!
              </p>
              <button
                type="button"
                onClick={() => setSelectedTab('ALL')}
                className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
              >
                Doʻkonni koʻrish
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((inv) => {
                const isFrame = inv.item.category === 'COSMETIC';
                const isEquipped = isFrame && user?.avatarFrame === inv.item.actionKey;

                return (
                  <div
                    key={inv.id}
                    className="rounded-3xl border border-border/60 bg-card p-5 shadow-xs space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {isFrame && inv.item.actionKey ? (
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              user={user}
                              size="sm"
                              frame={inv.item.actionKey}
                              showFrame={true}
                            />
                            {isEquipped && (
                              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                Oʻrnatilgan
                              </span>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`h-10 w-10 rounded-2xl bg-gradient-to-br flex items-center justify-center border shadow-xs ${getCategoryColor(
                              inv.item.category
                            )}`}
                          >
                            {getItemIcon(inv.item.icon)}
                          </div>
                        )}
                        {inv.item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-secondary text-foreground">
                            {inv.item.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-foreground">{inv.item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {inv.item.description}
                      </p>

                      {/* Promo code display for discounts */}
                      {inv.code && (
                        <div className="p-2.5 rounded-xl border border-border/60 bg-secondary/30 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">
                              Vaucher Promokodi:
                            </p>
                            <p className="text-xs font-mono font-bold text-primary truncate">
                              {inv.code}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inv.code!)}
                            className="h-7 px-2 rounded-lg bg-card hover:bg-secondary border border-border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          >
                            {copiedCode === inv.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span>{copiedCode === inv.code ? 'Nusxalandi' : 'Nusxa'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      {isFrame ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleEquipFrame(isEquipped ? null : inv.item.actionKey ?? null)
                          }
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isEquipped
                              ? 'border border-border/60 bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                              : 'bg-primary text-primary-foreground hover:opacity-90'
                          }`}
                        >
                          {isEquipped ? 'Ramkani yechish' : 'Profilga taqish'}
                        </button>
                      ) : inv.item.category === 'DISCOUNT' ? (
                        inv.isUsed ? (
                          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Ushbu vaucher ishlatilgan</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (inv.code) {
                                sessionStorage.setItem('minna_apply_promo', inv.code);
                              }
                              router.push(`/${lang}/dashboard/premium`);
                            }}
                            className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Crown className="h-3.5 w-3.5" />
                            <span>Obunada qoʻllash</span>
                          </button>
                        )
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Hisobingizda faollashtirilgan</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 4. STORE ITEMS GRID */
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-semibold text-muted-foreground">
                Doʻkon mahsulotlari yuklanmoqda...
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-foreground">Mahsulotlar topilmadi</h3>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                const userBalance = userCoins?.coins ?? 0;
                const canAfford = userBalance >= item.costCoins;
                const isOwned = inventory.some((inv) => inv.itemId === item.id);
                const isFrame = item.category === 'COSMETIC';

                return (
                  <div
                    key={item.id}
                    className="group relative rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Icon & Badge */}
                      <div className="flex items-center justify-between">
                        {isFrame && item.actionKey ? (
                          <div className="flex items-center gap-2.5">
                            <UserAvatar
                              user={user}
                              size="md"
                              frame={item.actionKey}
                              showFrame={true}
                            />
                            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                              Jonli Prevyu
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`h-11 w-11 rounded-2xl bg-gradient-to-br flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform ${getCategoryColor(
                              item.category
                            )}`}
                          >
                            {getItemIcon(item.icon)}
                          </div>
                        )}

                        {item.badge && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black border bg-primary/10 text-primary border-primary/20">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Row: Price & Buy Button */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🪙</span>
                        <span className="text-base font-black text-amber-500">
                          {item.costCoins}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          coin
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPurchasingItem(item);
                          setPurchaseErrorMessage(null);
                        }}
                        disabled={!canAfford && !isOwned}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs ${
                          isOwned && isFrame
                            ? 'bg-secondary text-foreground hover:bg-secondary/80'
                            : canAfford
                            ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                            : 'border border-border/60 bg-secondary/40 text-muted-foreground cursor-not-allowed opacity-60'
                        }`}
                      >
                        {isOwned && isFrame
                          ? 'Sotib olingan'
                          : canAfford
                          ? 'Xarid qilish'
                          : `Yetarli emas`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. PURCHASE CONFIRMATION MODAL */}
      {purchasingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div
              className={`h-14 w-14 rounded-3xl mx-auto flex items-center justify-center border shadow-md ${getCategoryColor(
                purchasingItem.category
              )}`}
            >
              {getItemIcon(purchasingItem.icon)}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">{purchasingItem.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {purchasingItem.description}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50 space-y-1 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Mahsulot narxi:</span>
                <span className="font-bold text-amber-500">{purchasingItem.costCoins} coin</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Sizning balansingiz:</span>
                <span className="font-bold text-foreground">{userCoins?.coins ?? 0} coin</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40 font-bold text-foreground">
                <span>Qoladigan balans:</span>
                <span className="text-primary">
                  {(userCoins?.coins ?? 0) - purchasingItem.costCoins} coin
                </span>
              </div>
            </div>

            {purchaseErrorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{purchaseErrorMessage}</span>
              </div>
            )}

            {purchaseSuccessMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{purchaseSuccessMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPurchasingItem(null)}
                disabled={isPurchasing}
                className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                disabled={isPurchasing || !!purchaseSuccessMessage}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isPurchasing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Tasdiqlash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. HOW TO EARN COINS MODAL */}
      {showEarnGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <h3 className="text-base font-bold text-foreground">Coin Toʻplash Yoʻllari</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEarnGuide(false)}
                className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/40">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-black">
                  📖
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">Darslarni tugatish</p>
                    <span className="font-black text-amber-500">+10 coin</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Har bir yangi dars va mashqlarni yakunlaganda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/40">
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-black">
                  🎯
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">JLPT Mock Imtihondan oʻtish</p>
                    <span className="font-black text-amber-500">+50 coin</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Rasmiy oʻtish balini toʻplaganda (90%+ boʻlsa +80 coin!).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/40">
                <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 font-black">
                  🔥
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">Kunlik faollik (Streak)</p>
                    <span className="font-black text-amber-500">+5 coin</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Har kuni kamida bitta dars qilganingizda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/40">
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 font-black">
                  ⚡️
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">7 kunlik uzluksiz Streak</p>
                    <span className="font-black text-amber-500">+30 coin</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Hafta davomida birorta kunni qoldirmasdan dars qilganda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/40">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 font-black">
                  🎁
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">30 kunlik katta Streak</p>
                    <span className="font-black text-amber-500">+150 coin</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    1 oylik muntazam yapon tili oʻrganish intizomi uchun.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEarnGuide(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              Tushunarli!
            </button>
          </div>
        </div>
      )}

      {/* 7. COIN TRANSACTION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">Coinlar Tarixi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {historyLoading ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Tarix yuklanmoqda...</p>
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                Hozircha hech qanday tranzaksiya mavjud emas
              </div>
            ) : (
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {historyList.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-secondary/20 border border-border/40 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <span
                        className={`font-black shrink-0 ${
                          isPositive ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      >
                        {isPositive ? `+${tx.amount}` : tx.amount} coin
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
