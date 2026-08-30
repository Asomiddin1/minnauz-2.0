'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Sparkles,
  Calendar,
  ExternalLink,
  PlayCircle,
  Bell,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { NotificationItem } from '@/lib/api';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationItem | null;
}

// Helper to convert standard YouTube URLs to Embed URL
function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    // Check for youtube.com/watch?v=ID
    const watchMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=0&rel=0`;
    }
  } catch {
    // fallback
  }
  return null;
}

export function NotificationModal({
  isOpen,
  onClose,
  notification,
}: NotificationModalProps) {
  if (!isOpen || !notification) return null;

  const embedUrl = getYouTubeEmbedUrl(notification.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="border-b border-border px-6 py-4.5 sm:px-8 flex items-center justify-between bg-secondary/30">
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

          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8 space-y-6 flex-1">
          {/* Title */}
          <h2 className="headline text-[22px] sm:text-[26px] font-bold text-foreground leading-tight">
            {notification.title}
          </h2>

          {/* YouTube Video Player Embed */}
          {embedUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
              <iframe
                src={embedUrl}
                title={notification.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          )}

          {/* Image (if not video or provided) */}
          {!embedUrl && notification.imageUrl && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-secondary/30">
              <Image
                src={notification.imageUrl}
                alt={notification.title}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          {/* Summary Message */}
          {notification.message && (
            <div className="rounded-2xl bg-secondary/40 p-4.5 border border-border/50 text-[14px] sm:text-[15px] font-medium text-foreground leading-relaxed">
              {notification.message}
            </div>
          )}

          {/* Detailed Content / Markdown-like body */}
          {notification.content && (
            <div className="text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed space-y-3 whitespace-pre-line">
              {notification.content}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border px-6 py-4 sm:px-8 flex items-center justify-between bg-secondary/20">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
          >
            <span>Yopish</span>
          </button>

          {notification.actionUrl && (
            <Link href={notification.actionUrl} onClick={onClose}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-6 py-2 text-[13px] font-bold text-white hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all shadow-xs"
              >
                <span>{notification.actionText || 'Koʻrish'}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
