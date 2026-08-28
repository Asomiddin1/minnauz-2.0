'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  PlayCircle,
  Sparkles,
  Search,
  CheckCheck,
  ArrowRight,
  Inbox,
  Filter,
  RefreshCw,
  Video,
} from 'lucide-react';
import { api, NotificationItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';

export default function NotificationsPage() {
  const { lang } = useLang();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'ALL' | 'UNREAD' | 'ANNOUNCEMENT' | 'UPDATE' | 'PROMO'>('ALL');

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const list = await api.getUserNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    // Filter by type or unread
    if (activeFilter === 'UNREAD' && notif.isRead) return false;
    if (activeFilter === 'ANNOUNCEMENT' && notif.type !== 'ANNOUNCEMENT') return false;
    if (activeFilter === 'UPDATE' && notif.type !== 'UPDATE') return false;
    if (activeFilter === 'PROMO' && notif.type !== 'PROMO') return false;

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        notif.title.toLowerCase().includes(q) ||
        notif.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-3 py-1 text-[12px] font-semibold text-[#0071e3]">
              <Bell className="h-3.5 w-3.5" />
              <span>Bildirishnomalar</span>
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#0071e3] px-2 py-0.5 text-[11px] font-bold text-white">
                {unreadCount} yangi
              </span>
            )}
          </div>
          <h1 className="headline text-[28px] sm:text-[34px] font-bold text-foreground mt-1">
            Xabarnomalar va Eʼlonlar
          </h1>
          <p className="text-[14px] sm:text-[15px] text-muted-foreground mt-0.5">
            Platforma yangiliklari, video darslar, eʼlonlar va shaxsiy xabarlar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 text-[#0071e3]" />
              <span>Hammasini oʻqildi</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
            title="Yangilash"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'ALL', label: 'Barchasi' },
              { id: 'UNREAD', label: `Oʻqilmaganlar (${unreadCount})` },
              { id: 'ANNOUNCEMENT', label: 'Eʼlonlar' },
              { id: 'UPDATE', label: 'Yangilanishlar' },
              { id: 'PROMO', label: 'Aksiyalar' },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-foreground text-background shadow-xs font-semibold'
                      : 'border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="h-9 w-full rounded-full border border-border bg-secondary/40 pl-8.5 pr-3 text-[13px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="rounded-[28px] border border-border bg-card p-12 text-center text-[14px] text-muted-foreground">
            Xabarnomalar yuklanmoqda...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-[28px] border border-border bg-card p-12 text-center space-y-3">
            <Inbox className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <h3 className="text-[17px] font-semibold text-foreground">Xabarlar topilmadi</h3>
            <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
              Ushbu filtr boʻyicha hozircha hech qanday xabarnoma mavjud emas.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <Link
              key={notif.id}
              href={`/${lang}/dashboard/notifications/${notif.id}`}
              className="block"
            >
              <div
                className={`rounded-[24px] border transition-all p-5 sm:p-6 bg-card flex items-start justify-between gap-4 hover:border-foreground/20 hover:shadow-xs group cursor-pointer ${
                  !notif.isRead ? 'border-[#0071e3]/40 bg-[#0071e3]/5 shadow-xs' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105 ${
                      notif.videoUrl
                        ? 'bg-rose-500/10 text-rose-500'
                        : notif.type === 'PROMO'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-[#0071e3]/10 text-[#0071e3]'
                    }`}
                  >
                    {notif.videoUrl ? (
                      <PlayCircle className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          notif.type === 'PROMO'
                            ? 'bg-amber-500/10 text-amber-600'
                            : notif.type === 'UPDATE'
                            ? 'bg-purple-500/10 text-purple-600'
                            : notif.type === 'SYSTEM'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-[#0071e3]/10 text-[#0071e3]'
                        }`}
                      >
                        {notif.type === 'PROMO'
                          ? 'Aksiya'
                          : notif.type === 'UPDATE'
                          ? 'Yangilanish'
                          : notif.type === 'SYSTEM'
                          ? 'Tizim'
                          : 'Eʼlon'}
                      </span>

                      {notif.videoUrl && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                          <Video className="h-3 w-3" />
                          <span>Video</span>
                        </span>
                      )}

                      {!notif.isRead && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#0071e3] px-2 py-0.5 text-[10px] font-bold text-white">
                          Yangi
                        </span>
                      )}

                      <span className="text-[12px] text-muted-foreground ml-auto">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3
                      className={`text-[16px] sm:text-[17px] leading-snug truncate ${
                        !notif.isRead ? 'font-bold text-foreground' : 'font-semibold text-foreground/90'
                      }`}
                    >
                      {notif.title}
                    </h3>

                    <p className="text-[13px] sm:text-[14px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:grid h-9 w-9 place-items-center rounded-full text-muted-foreground group-hover:text-foreground group-hover:bg-secondary transition-colors shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
