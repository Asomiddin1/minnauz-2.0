'use client';

import * as React from 'react';
import {
  Bell,
  Plus,
  Trash2,
  PlayCircle,
  Sparkles,
  ExternalLink,
  Users,
  Eye,
  CheckCircle2,
  X,
  RefreshCw,
  Video,
  Sliders,
  Send,
} from 'lucide-react';
import { api, NotificationItem, CreateNotificationDto } from '@/lib/api';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState<CreateNotificationDto>({
    title: '',
    message: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    actionUrl: '',
    actionText: '',
    audience: 'ALL',
    targetUserId: '',
    type: 'ANNOUNCEMENT',
    isPublished: true,
    createBanner: false,
    bannerTag: 'Eʼlon',
    bannerImage: '/banner_art.png',
  });

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const list = await api.getAllNotificationsAdmin();
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

  const openCreateModal = () => {
    setFormData({
      title: '',
      message: '',
      content: '',
      imageUrl: '',
      videoUrl: '',
      actionUrl: '',
      actionText: 'Koʻrish',
      audience: 'ALL',
      targetUserId: '',
      type: 'ANNOUNCEMENT',
      isPublished: true,
      createBanner: true,
      bannerTag: 'Yangi Eʼlon',
      bannerImage: '/banner_art.png',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    setSubmitting(true);
    try {
      await api.createNotification(formData);
      setModalOpen(false);
      await loadNotifications();
    } catch (err) {
      console.error('Failed to create notification:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham bu xabarnomani o'chirmoqchimisiz?")) return;
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-3 py-1 text-[12px] font-semibold text-[#0071e3]">
              <Bell className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </span>
            <span className="text-[13px] text-muted-foreground">
              Jami: {notifications.length} ta xabarnoma
            </span>
          </div>
          <h1 className="headline text-[28px] sm:text-[32px] font-bold text-foreground mt-1">
            Xabarnomalar Boshqaruvi
          </h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            Oʻquvchilar, ustozlar yoki barcha foydalanuvchilarga video, rasm va eʼlon xabarnomalarini joʻnatish.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-5 py-2.5 text-[13px] font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Yangi Xabarnoma</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-[24px] border border-border bg-card p-12 text-center text-muted-foreground text-[14px]">
            Xabarnomalar yuklanmoqda...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-[24px] border border-border bg-card p-12 text-center space-y-3">
            <Bell className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <h3 className="text-[17px] font-semibold text-foreground">Hozircha xabarnomalar yoʻq</h3>
            <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
              Foydalanuvchilarga yangi darslar, eʼlonlar yoki YouTube video qoʻllanmalarini yuborish uchun yuqoridagi tugmani bosing.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-5 py-2 text-[13px] font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Xabarnoma yuborish</span>
            </button>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="rounded-[24px] border border-border hover:border-foreground/20 transition-all p-5 sm:p-6 bg-card flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                    notif.videoUrl
                      ? 'bg-rose-500/10 text-rose-500'
                      : notif.type === 'PROMO'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-[#0071e3]/10 text-[#0071e3]'
                  }`}
                >
                  {notif.videoUrl ? (
                    <PlayCircle className="h-6 w-6" />
                  ) : (
                    <Sparkles className="h-6 w-6" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
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
                      {notif.type}
                    </span>

                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                      Auditoriya: {notif.audience === 'ALL' ? 'Barchaga' : notif.audience === 'TEACHER' ? 'Ustozlarga' : 'Oʻquvchilarga'}
                    </span>

                    {notif.videoUrl && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600">
                        <Video className="h-3 w-3" />
                        <span>YouTube Video</span>
                      </span>
                    )}

                    {notif.hasBanner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                        <Sliders className="h-3 w-3" />
                        <span>Bannerda mavjud</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-[17px] font-bold text-foreground leading-snug truncate">
                    {notif.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4 pt-1 text-[12px] text-muted-foreground">
                    <span>Sana: {new Date(notif.createdAt).toLocaleDateString()}</span>
                    <span>Oʻqiganlar: <strong className="text-foreground">{notif.readCount || 0} ta</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
                <button
                  type="button"
                  onClick={() => handleDelete(notif.id)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                  title="Oʻchirish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Send Notification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-border bg-card shadow-2xl flex flex-col max-h-[90vh]">
            <div className="border-b border-border px-6 py-4.5 sm:px-8 flex items-center justify-between bg-secondary/30">
              <div>
                <h3 className="headline text-[20px] font-bold text-foreground">
                  Yangi Xabarnoma Yuborish
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  Foydalanuvchilarga yangi eʼlon, video dars yoki aksiya xabarini yuborish.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 sm:px-8 space-y-4.5 flex-1">
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                  Xabarnoma Sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Yangi video qo'llanma va JLPT testlar to'plami"
                  className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                  Qisqa Xabar (Bildirishnomada koʻrinadi) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Platformada yangi video darslar yuklandi..."
                  className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Auditoriya (Qabul qiluvchilar)
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card cursor-pointer"
                  >
                    <option value="ALL">Barchaga (Umumiy)</option>
                    <option value="USER">Faqat Oʻquvchilarga</option>
                    <option value="TEACHER">Faqat Oʻqituvchilarga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Xabar Turi
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card cursor-pointer"
                  >
                    <option value="ANNOUNCEMENT">Eʼlon (Announcement)</option>
                    <option value="UPDATE">Yangilanish (Update)</option>
                    <option value="PROMO">Aksiya / Taklif (Promo)</option>
                    <option value="SYSTEM">Tizim xabari (System)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                  YouTube Video Havolasi (Ixtiyoriy)
                </label>
                <div className="relative">
                  <PlayCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
                  <input
                    type="text"
                    value={formData.videoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-2xl border border-border bg-secondary/30 pl-10 pr-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Video kiritilsa, xabarni ochganda toʻgʻridan-toʻgʻri YouTube video pleyeri koʻrsatiladi.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Rasm URL (Ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/banner_art.png yoki rasm havolasi"
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Harakat Havolasi (Action URL)
                  </label>
                  <input
                    type="text"
                    value={formData.actionUrl || ''}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    placeholder="/dashboard/courses yoki tashqi URL"
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                  Batafsil Matn / Maqola (Ixtiyoriy)
                </label>
                <textarea
                  rows={4}
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Xabarning to'liq tavsifi, yo'riqnomalar va ma'lumotlar..."
                  className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card resize-y"
                />
              </div>

              {/* Create Banner Toggle */}
              <div className="rounded-2xl border border-[#0071e3]/30 bg-[#0071e3]/5 p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.createBanner}
                    onChange={(e) => setFormData({ ...formData, createBanner: e.target.checked })}
                    className="h-4 w-4 rounded accent-[#0071e3]"
                  />
                  <div>
                    <p className="text-[13px] font-bold text-foreground">
                      Bir vaqtning oʻzida Dashboardda Banner sifatida ham chiqarish
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Ushbu eʼlon bosh sahifadagi aylanuvchi slayd bannerlarga avtomatik qoʻshiladi.
                    </p>
                  </div>
                </label>

                {formData.createBanner && (
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/50 animate-in fade-in">
                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1">
                        Banner Tegi
                      </label>
                      <input
                        type="text"
                        value={formData.bannerTag || 'Eʼlon'}
                        onChange={(e) => setFormData({ ...formData, bannerTag: e.target.value })}
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-[13px] text-foreground outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-foreground mb-1">
                        Banner Rasmi
                      </label>
                      <input
                        type="text"
                        value={formData.bannerImage || '/banner_art.png'}
                        onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-[13px] text-foreground outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-6 py-2.5 text-[13px] font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Yuborilmoqda...' : 'Xabarnomani Yuborish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
