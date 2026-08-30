'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Palette,
  Sparkles,
  Check,
  RotateCcw,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/i18n';
import { api, UserInventoryItem, StoreItem } from '@/lib/api';
import { UserAvatar, AVATAR_FRAMES } from '@/components/shared/user-avatar';

export function ProfileFramesCard() {
  const { user, equipFrame } = useAuth();
  const { lang } = useLang();

  const [inventory, setInventory] = React.useState<UserInventoryItem[]>([]);
  const [storeItems, setStoreItems] = React.useState<StoreItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEquipping, setIsEquipping] = React.useState(false);
  const [selectedPreviewKey, setSelectedPreviewKey] = React.useState<string | null>(
    user?.avatarFrame || null
  );
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync selectedPreviewKey if user.avatarFrame changes externally
  React.useEffect(() => {
    setSelectedPreviewKey(user?.avatarFrame || null);
  }, [user?.avatarFrame]);

  // Load inventory and store items to check ownership
  const loadData = React.useCallback(async () => {
    try {
      const [invRes, storeRes] = await Promise.allSettled([
        api.getUserInventory(),
        api.getStoreItems(),
      ]);

      if (invRes.status === 'fulfilled') {
        setInventory(invRes.value);
      }
      if (storeRes.status === 'fulfilled') {
        setStoreItems(storeRes.value);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // List of owned frame actionKeys (plus currently equipped one)
  const ownedFrameKeys = React.useMemo(() => {
    const keys = new Set<string>();
    for (const inv of inventory) {
      if (inv.item?.actionKey && inv.item.actionKey.startsWith('FRAME_')) {
        keys.add(inv.item.actionKey);
      }
    }
    if (user?.avatarFrame && user.avatarFrame !== 'NONE') {
      keys.add(user.avatarFrame);
    }
    if (user?.isPro) {
      // Pro a'zolar uchun Shogun Imperator Toji ramkasi doimiy ochiq
      keys.add('FRAME_SHOGUN');
    }
    return keys;
  }, [inventory, user?.avatarFrame, user?.isPro]);

  // Handle equipping or unequipping
  const handleApplyFrame = async (frameKey: string | null) => {
    setIsEquipping(true);
    try {
      await equipFrame(frameKey);
      setSelectedPreviewKey(frameKey);
      setToastMessage(
        frameKey
          ? `"${AVATAR_FRAMES[frameKey]?.name || 'Ramka'}" muvaffaqiyatli oʻrnatildi!`
          : 'Ramka olib tashlandi (oddiy koʻrinish).'
      );
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err?.message || 'Ramkani yangilashda xatolik yuz berdi');
    } finally {
      setIsEquipping(false);
    }
  };

  const framesList = Object.values(AVATAR_FRAMES);

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold tracking-wide uppercase">
              <Palette className="h-3.5 w-3.5" />
              <span>Profil Bezaklari</span>
            </span>
            {user?.avatarFrame && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-bold border border-amber-500/20">
                <Sparkles className="h-3 w-3" />
                <span>Faol ramka mavjud</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Avatar Ramkalari & Bezaklar
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Doʻkondan olingan ramkalar bilan profilingizni bezating va platformada oʻziga xos koʻrinishga ega boʻling.
          </p>
        </div>

        <Link
          href={`/${lang}/dashboard?tab=store`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/60 text-xs font-semibold text-foreground transition-all cursor-pointer active:scale-95 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <ShoppingBag className="h-4 w-4 text-primary" />
          <span>Doʻkonga oʻtish</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </Link>
      </div>

      {/* Success feedback toast */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Live Preview Box & Frame Selector */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr] items-start">
        {/* Left: Live Preview Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border/60 bg-secondary/20 text-center space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Jonli koʻrinish (Preview)
          </p>

          <div className="py-2">
            <UserAvatar
              user={user}
              size="2xl"
              frame={selectedPreviewKey}
              className="transition-all duration-300 transform scale-110"
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              {selectedPreviewKey && AVATAR_FRAMES[selectedPreviewKey]
                ? AVATAR_FRAMES[selectedPreviewKey].name
                : 'Oddiy (Ramkasiz)'}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              {selectedPreviewKey && AVATAR_FRAMES[selectedPreviewKey]
                ? AVATAR_FRAMES[selectedPreviewKey].description
                : 'Standart profil halqasi'}
            </p>
          </div>

          {/* Action on Preview */}
          <div className="w-full pt-1">
            {selectedPreviewKey === (user?.avatarFrame || null) ? (
              <button
                type="button"
                disabled
                className="w-full py-2 px-3 rounded-xl bg-secondary/80 text-muted-foreground text-xs font-bold border border-border/50 cursor-default"
              >
                Hozir oʻrnatilgan
              </button>
            ) : ownedFrameKeys.has(selectedPreviewKey!) || selectedPreviewKey === null ? (
              <button
                type="button"
                onClick={() => handleApplyFrame(selectedPreviewKey)}
                disabled={isEquipping}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isEquipping ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Oʻrnatilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>
                      {selectedPreviewKey === null ? 'Ramkani yechish' : 'Profilga oʻrnatish'}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <Link
                href={`/${lang}/dashboard?tab=store`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Doʻkondan xarid qilish</span>
              </Link>
            )}
          </div>
        </div>

        {/* Right: Frames Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Mavjud ramkalar toʻplami
            </span>
            {user?.avatarFrame && (
              <button
                type="button"
                onClick={() => handleApplyFrame(null)}
                disabled={isEquipping}
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Standartga qaytarish</span>
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Standard (No Frame) Option */}
            <div
              onClick={() => setSelectedPreviewKey(null)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedPreviewKey === null
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border/60 bg-card hover:bg-secondary/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-secondary/80 border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  Oddiy
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground truncate">
                      Standart Ramkasiz
                    </p>
                    {user?.avatarFrame === null && (
                      <span className="text-[10px] text-primary font-bold">(Faol)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Hech qanday maxsus bezaksiz
                  </p>
                </div>
              </div>

              {selectedPreviewKey === null && (
                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>

            {/* Custom Cosmetic Frames */}
            {framesList.map((frame) => {
              const isOwned = ownedFrameKeys.has(frame.key);
              const isEquipped = user?.avatarFrame === frame.key;
              const isSelected = selectedPreviewKey === frame.key;

              return (
                <div
                  key={frame.key}
                  onClick={() => setSelectedPreviewKey(frame.key)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                      : 'border-border/60 bg-card hover:bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                      <UserAvatar
                        user={user}
                        size="sm"
                        frame={frame.key}
                        showFrame={true}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-foreground truncate">
                          {frame.name}
                        </p>
                        {isEquipped ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Faol
                          </span>
                        ) : isOwned ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            Mavjud
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Lock className="h-2.5 w-2.5" />
                            Doʻkonda
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {frame.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
