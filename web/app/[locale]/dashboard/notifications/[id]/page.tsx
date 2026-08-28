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
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { api, NotificationItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';

function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const watchMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
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

  React.useEffect(() => {
    if (!id) return;
    api.getNotificationById(id)
      .then((data) => setNotification(data))
      .catch((err) => {
        console.error('Failed to load notification:', err);
        setError('Xabarnoma topilmadi yoki oʻchirilgan.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6 animate-in fade-in duration-200 pb-16">
        <div className="rounded-[28px] border border-border bg-card p-12 text-center text-muted-foreground text-[14px]">
          Xabarnoma yuklanmoqda...
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="max-w-3xl space-y-6 animate-in fade-in duration-200 pb-16">
        <div className="rounded-[28px] border border-border bg-card p-12 text-center space-y-4">
          <Bell className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <h2 className="text-[20px] font-bold text-foreground">Xabarnoma topilmadi</h2>
          <p className="text-[14px] text-muted-foreground">{error}</p>
          <Link href={`/${lang}/dashboard/notifications`}>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-6 py-2.5 text-[13px] font-semibold text-white">
              <ArrowLeft className="h-4 w-4" />
              <span>Barcha xabarnomalarga qaytish</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(notification.videoUrl);

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/${lang}/dashboard/notifications`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Barcha xabarnomalar</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-3 py-1 text-[12px] font-semibold text-[#0071e3]">
            <Bell className="h-3.5 w-3.5" />
            <span>
              {notification.type === 'PROMO'
                ? 'Aksiya & Taklif'
                : notification.type === 'UPDATE'
                ? 'Yangilanish'
                : notification.type === 'SYSTEM'
                ? 'Tizim xabari'
                : 'Eʼlon'}
            </span>
          </span>
          <span className="text-[12px] text-muted-foreground">
            {new Date(notification.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="rounded-[32px] border border-border bg-card p-6 sm:p-10 shadow-xs space-y-8">
        {/* Title */}
        <h1 className="headline text-[26px] sm:text-[36px] font-bold text-foreground leading-[1.2]">
          {notification.title}
        </h1>

        {/* YouTube Video Player Embed */}
        {embedUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-md">
            <iframe
              src={embedUrl}
              title={notification.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        )}

        {/* Image (if no video) */}
        {!embedUrl && notification.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-secondary/30">
            <Image
              src={notification.imageUrl}
              alt={notification.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Summary Message Callout */}
        {notification.message && (
          <div className="rounded-2xl bg-secondary/40 p-5 border border-border/50 text-[15px] sm:text-[16px] font-medium text-foreground leading-relaxed">
            {notification.message}
          </div>
        )}

        {/* Rich Body Content */}
        {notification.content && (
          <div className="text-[15px] sm:text-[16px] text-muted-foreground leading-relaxed space-y-4 whitespace-pre-line border-t border-border/60 pt-6">
            {notification.content}
          </div>
        )}

        {/* Action Button CTA */}
        {notification.actionUrl && (
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <Link href={notification.actionUrl}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-7 py-3 text-[14px] font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-md cursor-pointer"
              >
                <span>{notification.actionText || 'Koʻrish'}</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </Link>

            <Link href={`/${lang}/dashboard`}>
              <button
                type="button"
                className="rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                Bosh sahifaga qaytish
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
