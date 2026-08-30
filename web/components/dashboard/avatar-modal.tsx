'use client';

import * as React from 'react';
import {
  X,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Loader2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserAvatar } from '@/components/shared/user-avatar';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.28a12 12 0 0 0 0 10.78l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.11C6.23 6.86 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarModal({ isOpen, onClose }: AvatarModalProps) {
  const { user, uploadAvatar, selectGoogleAvatar, removeAvatar } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [pendingAction, setPendingAction] = React.useState<
    'UPLOAD' | 'GOOGLE' | 'REMOVE' | null
  >(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Clean up object URL when changed or unmounted
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setPendingAction(null);
      setPendingFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isGoogleActive =
    !!user?.avatarUrl &&
    (user.avatarUrl === user.googleAvatarUrl ||
      user.avatarUrl.includes('googleusercontent.com'));

  const isCustomActive =
    !!user?.avatarUrl && user.avatarUrl.includes('/uploads/avatars/');

  const hasGoogleOption =
    !!user?.googleAvatarUrl ||
    (user?.avatarUrl && user.avatarUrl.includes('googleusercontent.com'));

  const googleAvatarSrc =
    user?.googleAvatarUrl ||
    (user?.avatarUrl?.includes('googleusercontent.com')
      ? user.avatarUrl
      : undefined);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Faqat JPEG, PNG yoki WEBP formatidagi rasmlar qabul qilinadi');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPreviewUrl(objectUrl);
    setPendingAction('UPLOAD');
    setError(null);
    setSuccess(null);
  };

  const handleSelectGoogle = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPendingFile(null);
    setPendingAction('GOOGLE');
    setError(null);
    setSuccess(null);
  };

  const handleSelectRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPendingFile(null);
    setPendingAction('REMOVE');
    setError(null);
    setSuccess(null);
  };

  const handleResetPending = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPendingFile(null);
    setPendingAction(null);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!pendingAction) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (pendingAction === 'UPLOAD' && pendingFile) {
        await uploadAvatar(pendingFile);
        setSuccess('Profil rasmi muvaffaqiyatli saqlandi!');
      } else if (pendingAction === 'GOOGLE') {
        await selectGoogleAvatar();
        setSuccess('Google rasmi muvaffaqiyatli tanlandi!');
      } else if (pendingAction === 'REMOVE') {
        await removeAvatar();
        setSuccess('Rasm oʻchirildi va standart holatga qaytarildi!');
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Amalni bajarishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-foreground">
              Profil rasmini sozlash
            </h2>
            <p className="text-xs text-muted-foreground">
              Rasm tanlang va &quot;Saqlash&quot; tugmasini bosing
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Avatar Preview */}
        <div className="flex flex-col items-center justify-center space-y-3 py-1">
          <div className="relative">
            {pendingAction === 'UPLOAD' && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-24 w-24 rounded-full object-cover border-4 border-primary shadow-xl ring-4 ring-primary/20"
              />
            ) : pendingAction === 'GOOGLE' && googleAvatarSrc ? (
              <img
                src={googleAvatarSrc}
                alt="Google Preview"
                referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-full object-cover border-4 border-blue-500 shadow-xl ring-4 ring-blue-500/20"
              />
            ) : pendingAction === 'REMOVE' ? (
              <UserAvatar
                user={{ ...user, avatarUrl: null }}
                size="2xl"
                className="h-24 w-24 border-4 border-destructive/40 shadow-xl"
              />
            ) : (
              <UserAvatar
                user={user}
                size="2xl"
                className="h-24 w-24 border-4 border-primary/20 shadow-xl"
              />
            )}

            {loading && (
              <div className="absolute inset-0 rounded-full bg-background/70 backdrop-blur-xs flex items-center justify-center">
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {user?.fullName || 'Foydalanuvchi'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border">
              {pendingAction ? (
                <span className="text-amber-500 border-amber-500/20 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <RotateCcw className="h-3 w-3" />
                  Kutilayotgan oʻzgarish (Saqlanmagan)
                </span>
              ) : isGoogleActive ? (
                <span className="text-blue-500 border-blue-500/20 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <GoogleIcon />
                  Hozirgi: Google rasmi
                </span>
              ) : isCustomActive ? (
                <span className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Hozirgi: Yuklangan rasm
                </span>
              ) : (
                <span className="text-muted-foreground border-border bg-secondary/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Hozirgi: Standart gradient
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Option Selectors */}
        <div className="space-y-2">
          {/* Option 1: Upload new photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group text-left disabled:opacity-50 ${
              pendingAction === 'UPLOAD'
                ? 'border-primary bg-primary/10 shadow-xs'
                : 'border-border/60 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  pendingAction === 'UPLOAD'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <UploadCloud className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  Qurilmadan yangi rasm yuklash
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {pendingAction === 'UPLOAD' && pendingFile
                    ? `Tanlandi: ${pendingFile.name}`
                    : 'JPEG, PNG yoki WEBP (maks. 5MB)'}
                </p>
              </div>
            </div>
            {pendingAction === 'UPLOAD' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-primary">
                <Check className="h-4 w-4" />
                Tanlandi
              </span>
            ) : (
              <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                Tanlash →
              </span>
            )}
          </button>

          {/* Option 2: Google Avatar */}
          {hasGoogleOption && (
            <button
              type="button"
              onClick={handleSelectGoogle}
              disabled={loading}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer group disabled:opacity-50 ${
                pendingAction === 'GOOGLE'
                  ? 'border-blue-500 bg-blue-500/10 shadow-xs'
                  : isGoogleActive && !pendingAction
                  ? 'border-blue-500/40 bg-blue-500/5'
                  : 'border-border/60 bg-secondary/20 hover:bg-secondary/40 hover:border-blue-500/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                  {googleAvatarSrc ? (
                    <img
                      src={googleAvatarSrc}
                      alt="Google Avatar"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <GoogleIcon />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-semibold text-foreground">
                      Google profil rasmi
                    </p>
                    <GoogleIcon />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Google hisobingizdagi rasmni oʻrnatish
                  </p>
                </div>
              </div>
              {pendingAction === 'GOOGLE' ? (
                <span className="flex items-center gap-1 text-xs font-bold text-blue-500">
                  <Check className="h-4 w-4" />
                  Tanlandi
                </span>
              ) : isGoogleActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Faol
                </span>
              ) : (
                <span className="text-xs font-semibold text-blue-500 group-hover:translate-x-0.5 transition-transform">
                  Tanlash →
                </span>
              )}
            </button>
          )}

          {/* Option 3: Remove Avatar */}
          {user?.avatarUrl && (
            <button
              type="button"
              onClick={handleSelectRemove}
              disabled={loading}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group text-left disabled:opacity-50 ${
                pendingAction === 'REMOVE'
                  ? 'border-destructive bg-destructive/10 shadow-xs text-destructive'
                  : 'border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold">
                    Rasmni oʻchirish
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Bosh harfli standart gradientga qaytish
                  </p>
                </div>
              </div>
              {pendingAction === 'REMOVE' ? (
                <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                  <Check className="h-4 w-4" />
                  Tanlandi
                </span>
              ) : (
                <span className="text-xs font-medium">Tanlash</span>
              )}
            </button>
          )}
        </div>

        {/* Modal Action Buttons (Saqlash & Bekor qilish) */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-2.5">
          {pendingAction && (
            <button
              type="button"
              onClick={handleResetPending}
              disabled={loading}
              className="px-3.5 py-2 rounded-2xl border border-border/60 bg-secondary/30 hover:bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              Tiklash
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!pendingAction || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold transition-all shadow-md hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Saqlash</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
