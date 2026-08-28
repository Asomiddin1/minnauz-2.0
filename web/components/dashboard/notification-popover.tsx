'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  ExternalLink,
  PlayCircle,
  Sparkles,
  CheckCheck,
  Inbox,
} from 'lucide-react';
import { api, NotificationItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { NotificationModal } from './notification-modal';

export function NotificationPopover() {
  const { lang } = useLang();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationItem | null>(null);

  const popoverRef = React.useRef<HTMLDivElement>(null);

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const list = await api.getUserNotifications();
      setNotifications(list);
      const count = list.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    } catch {
      // not logged in or error
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();

    // Check count every 2 minutes
    const interval = setInterval(() => {
      api.getUnreadNotificationCount()
        .then((res) => setUnreadCount(res.unreadCount))
        .catch(() => {});
    }, 120000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Click outside listener
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    setSelectedNotification(notif);
    setIsOpen(false);
    if (!notif.isRead) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Detail Modal */}
      <NotificationModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      <div className="relative" ref={popoverRef}>
        {/* Bell Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) loadNotifications();
          }}
          aria-label="Xabarnomalar"
          className="relative grid h-8.5 w-8.5 sm:h-9 sm:w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0071e3] px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Card */}
        {isOpen && (
          <div className="absolute right-0 top-12 z-50 w-[340px] sm:w-[380px] overflow-hidden rounded-[24px] border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-secondary/30">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold text-foreground">Xabarnomalar</h4>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[11px] font-bold text-[#0071e3]">
                    {unreadCount} yangi
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0071e3] hover:underline cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Oʻqildi</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-border/50">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-muted-foreground">
                  Yuklanmoqda...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Inbox className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-[14px] font-medium text-foreground">Hozircha xabarlar yoʻq</p>
                  <p className="text-[12px] text-muted-foreground">
                    Yangi eʼlon va yangilanishlar shu yerda chiqadi.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 6).map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/${lang}/dashboard/notifications/${notif.id}`}
                    onClick={() => {
                      setIsOpen(false);
                      if (!notif.isRead) {
                        api.markNotificationRead(notif.id).catch(() => {});
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                      }
                    }}
                    className={`block w-full text-left p-4 transition-colors hover:bg-secondary/50 cursor-pointer ${
                      !notif.isRead ? 'bg-[#0071e3]/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full mt-0.5 ${
                          notif.videoUrl
                            ? 'bg-rose-500/10 text-rose-500'
                            : notif.type === 'PROMO'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-[#0071e3]/10 text-[#0071e3]'
                        }`}
                      >
                        {notif.videoUrl ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-[13px] font-medium leading-tight truncate ${
                              !notif.isRead ? 'text-foreground font-bold' : 'text-foreground/85'
                            }`}
                          >
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-[#0071e3] shrink-0" />
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground line-clamp-2 leading-snug">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground/70 block pt-0.5">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-3 text-center bg-secondary/20">
              <Link
                href={`/${lang}/dashboard/notifications`}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0071e3] hover:underline cursor-pointer"
              >
                <span>Barcha xabarnomalarni koʻrish</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
