'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Calendar,
  ExternalLink,
  PlayCircle,
  Sparkles,
  Zap,
  Tag,
  Share2,
  Home,
  Check,
} from 'lucide-react';
import { api, NotificationItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';

const TYPE_CONFIG = {
  PROMO: {
    label: 'Aksiya & Taklif',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    iconBg: 'bg-amber-500/10 text-amber-500',
    icon: Sparkles,
  },
  UPDATE: {
    label: 'Yangilanish',
    badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    iconBg: 'bg-purple-500/10 text-purple-500',
    icon: Zap,
  },
  SYSTEM: {
    label: 'Tizim xabari',
    badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    iconBg: 'bg-rose-500/10 text-rose-500',
    icon: Bell,
  },
  ANNOUNCEMENT: {
    label: 'Eʼlon',
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    iconBg: 'bg-blue-500/10 text-blue-500',
    icon: Tag,
  },
};

function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const watchMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=0&rel=0`;
    }
  } catch {
    // fallback
  }
  return null;
}

export default function NotificationDetailPage() {
  const { lang } = useLang();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [notification, setNotification] = React.useState<NotificationItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    api
      .getNotificationById(id)
      .then((data) => setNotification(data))
      .catch((err) => {
        console.error('Failed to load notification:', err);
        setError('Xabarnoma topilmadi yoki oʻchirilgan.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: notification?.title,
          text: notification?.message,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // share cancelled or clipboard failed
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16 px-4 sm:px-0">
        <div className="h-10 w-36 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="rounded-3xl border border-border/50 bg-card/40 p-12 text-center text-sm text-muted-foreground backdrop-blur-xs space-y-4">
          <div className="h-6 w-1/2 bg-muted/40 rounded-xl mx-auto animate-pulse" />
          <div className="h-4 w-3/4 bg-muted/30 rounded-xl mx-auto animate-pulse" />
          <p className="text-xs text-muted-foreground pt-4">Xabarnoma yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16 px-4 sm:px-0">
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-4 backdrop-blur-md">
          <div className="inline-flex p-3.5 rounded-2xl bg-destructive/10 text-destructive">
            <Bell className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Xabarnoma topilmadi</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
          <div className="pt-2">
            <Link href={`/${lang}/dashboard/notifications`}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Barcha xabarnomalarga qaytish</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(notification.videoUrl);
  const config =
    TYPE_CONFIG[notification.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.ANNOUNCEMENT;
  const TypeIcon = config.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 px-4 sm:px-0">
      {/* Navigation & Controls */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/${lang}/dashboard/notifications`}
          className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Barcha xabarnomalar</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer shadow-xs active:scale-95"
          title="Ulashish"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Nusxalandi</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              <span>Ulashish</span>
            </>
          )}
        </button>
      </div>

      {/* Main Article Container */}
      <article className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card to-background p-6 sm:p-9 shadow-xs backdrop-blur-xl space-y-7">
        {/* Metadata Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${config.badge}`}
              >
                <TypeIcon className="h-3.5 w-3.5" />
                {config.label}
              </span>

              {notification.videoUrl && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-500 text-[11px] font-semibold">
                  <PlayCircle className="h-3.5 w-3.5" />
                  Video mavjud
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={notification.createdAt}>
                {new Date(notification.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-[1.25]">
            {notification.title}
          </h1>
        </div>

        {/* Media Block: Video or Cover Image */}
        {embedUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-black shadow-lg">
            <iframe
              src={embedUrl}
              title={notification.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        )}

        {!embedUrl && notification.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 shadow-xs">
            <Image
              src={notification.imageUrl}
              alt={notification.title}
              fill
              unoptimized
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Summary Callout */}
        {notification.message && (
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 p-5 text-sm sm:text-base font-medium text-foreground leading-relaxed">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/70" />
            <p>{notification.message}</p>
          </div>
        )}

        {/* Rich Body Content */}
        {notification.content && (
          <div className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed space-y-4 whitespace-pre-line border-t border-border/50 pt-6">
            {notification.content}
          </div>
        )}

        {/* Action Buttons / CTA Footer */}
        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {notification.actionUrl ? (
            <Link href={notification.actionUrl} className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <span>{notification.actionText || 'Koʻrish'}</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </Link>
          ) : (
            <div />
          )}

          <Link href={`/${lang}/dashboard`} className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 text-xs sm:text-sm font-medium text-foreground hover:bg-secondary transition-all cursor-pointer active:scale-95"
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              <span>Bosh sahifa</span>
            </button>
          </Link>
        </div>
      </article>
    </div>
  );
}