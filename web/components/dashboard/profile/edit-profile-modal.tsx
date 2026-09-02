'use client';

import * as React from 'react';
import { X, User, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/i18n';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const { t } = useLang();
  const mDict = t?.profilePage?.editModal;

  const [fullName, setFullName] = React.useState(user?.fullName || '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFullName(user?.fullName || '');
      setError(null);
    }
  }, [isOpen, user?.fullName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();

    if (!trimmed) {
      setError(mDict?.errRequired || 'Ism va familiyani kiritishingiz shart');
      return;
    }

    if (trimmed.length > 80) {
      setError(mDict?.errTooLong || 'Ism uzunligi 80 ta belgidan oshmasligi kerak');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateProfile({ fullName: trimmed });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || mDict?.errGeneral || 'Ismni yangilashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card via-card to-background p-6 sm:p-7 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {mDict?.title || 'Profilni tahrirlash'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {mDict?.subtitle || 'Ism va familiyangizni yangilang'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-5">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-xs font-semibold text-foreground">
              {mDict?.nameLabel || 'Toʻliq ism'}
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={mDict?.placeholder || 'Masalan: Asomiddin Qarshiyev'}
                maxLength={80}
                className="w-full h-11 px-3.5 rounded-2xl border border-border/60 bg-secondary/20 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                autoFocus
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
                {fullName.length}/80
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl border border-border/60 bg-secondary/40 hover:bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {mDict?.cancel || 'Bekor qilish'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{mDict?.saving || 'Saqlanmoqda...'}</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{mDict?.save || 'Saqlash'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}