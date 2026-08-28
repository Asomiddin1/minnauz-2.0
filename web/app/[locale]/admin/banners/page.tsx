'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Sliders,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  PlayCircle,
  Calendar,
  Target,
  Award,
  Flame,
  CheckCircle2,
  X,
  ExternalLink,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { api, BannerItem, CreateBannerDto, NotificationItem } from '@/lib/api';

const TAG_ICONS = [
  { id: 'Sparkles', label: 'Yulduz (Sparkles)', icon: Sparkles },
  { id: 'PlayCircle', label: 'Video (Play)', icon: PlayCircle },
  { id: 'Calendar', label: 'Kalendar (Calendar)', icon: Calendar },
  { id: 'Target', label: 'Nishon (Target)', icon: Target },
  { id: 'Award', label: 'Mukofot (Award)', icon: Award },
  { id: 'Flame', label: 'Olov (Flame)', icon: Flame },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = React.useState<BannerItem[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<BannerItem | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState<CreateBannerDto>({
    title: '',
    desc: '',
    tag: 'Yangilik',
    tagIcon: 'Sparkles',
    image: '/banner_art.png',
    btnText: 'Batafsil',
    btnUrl: '',
    btnIcon: 'ArrowRight',
    actionType: 'LINK',
    notificationId: '',
    order: 1,
    isActive: true,
    isDismissible: true,
    targetAudience: 'ALL',
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [bannersRes, notifsRes] = await Promise.all([
        api.getAllBannersAdmin(),
        api.getAllNotificationsAdmin().catch(() => []),
      ]);
      setBanners(bannersRes);
      setNotifications(notifsRes);
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      desc: '',
      tag: 'Yangilik',
      tagIcon: 'Sparkles',
      image: '/banner_art.png',
      btnText: 'Batafsil',
      btnUrl: '',
      btnIcon: 'ArrowRight',
      actionType: 'LINK',
      notificationId: '',
      order: (banners[banners.length - 1]?.order || 0) + 1,
      isActive: true,
      isDismissible: true,
      targetAudience: 'ALL',
    });
    setModalOpen(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      desc: banner.desc,
      tag: banner.tag,
      tagIcon: banner.tagIcon,
      image: banner.image,
      btnText: banner.btnText,
      btnUrl: banner.btnUrl || '',
      btnIcon: banner.btnIcon,
      actionType: banner.actionType,
      notificationId: banner.notificationId || '',
      order: banner.order,
      isActive: banner.isActive,
      isDismissible: banner.isDismissible,
      targetAudience: banner.targetAudience,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.desc) return;

    setSubmitting(true);
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, formData);
      } else {
        await api.createBanner(formData);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save banner:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      await api.toggleBannerActive(banner.id);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b)),
      );
    } catch (err) {
      console.error('Failed to toggle banner:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham bu bannerni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    setBanners(newBanners);
    try {
      await api.reorderBanners(newBanners.map((b) => b.id));
    } catch (err) {
      console.error('Failed to reorder banners:', err);
      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-3 py-1 text-[12px] font-semibold text-[#0071e3]">
              <Sliders className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </span>
            <span className="text-[13px] text-muted-foreground">
              Jami: {banners.length} ta banner
            </span>
          </div>
          <h1 className="headline text-[28px] sm:text-[32px] font-bold text-foreground mt-1">
            Bannerlar Boshqaruvi
          </h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            Dashboard bosh sahifasidagi slayd bannerlarni tartiblash, yaratish va oʻzgartirish.
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
            <Plus className="h-4 w-4" />
            <span>Yangi Banner</span>
          </button>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-[24px] border border-border bg-card p-12 text-center text-muted-foreground text-[14px]">
            Bannerlar yuklanmoqda...
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-[24px] border border-border bg-card p-12 text-center space-y-3">
            <Sliders className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <h3 className="text-[17px] font-semibold text-foreground">Hozircha maxsus bannerlar yoʻq</h3>
            <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
              Dashboardda standart 3 ta tizim banneri ishlamoqda. Yangi eʼlon yoki aksiya qoʻshish uchun yuqoridagi tugmani bosing.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-5 py-2 text-[13px] font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Banner yaratish</span>
            </button>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`rounded-[24px] border transition-all p-5 sm:p-6 bg-card flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs ${
                !banner.isActive ? 'opacity-60 border-border/60' : 'border-border hover:border-foreground/20'
              }`}
            >
              {/* Left Info & Image Preview */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 flex-1 min-w-0">
                {/* Order Index & Arrows */}
                <div className="flex sm:flex-col items-center gap-1 shrink-0 bg-secondary/50 p-1.5 rounded-2xl border border-border/50">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="grid h-7 w-7 place-items-center rounded-xl hover:bg-card disabled:opacity-30 cursor-pointer"
                    title="Yuqoriga surish"
                  >
                    <ArrowUp className="h-3.5 w-3.5 text-foreground" />
                  </button>
                  <span className="text-[13px] font-bold text-foreground px-2 py-0.5">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={index === banners.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="grid h-7 w-7 place-items-center rounded-xl hover:bg-card disabled:opacity-30 cursor-pointer"
                    title="Pastga surish"
                  >
                    <ArrowDown className="h-3.5 w-3.5 text-foreground" />
                  </button>
                </div>

                {/* Banner Thumbnail */}
                <div className="relative aspect-[16/9] w-full sm:w-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary/30">
                  <Image
                    src={banner.image || '/banner_art.png'}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-foreground">
                      {banner.tag}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        banner.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {banner.isActive ? 'Faol' : 'Nofaol'}
                    </span>

                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                      Auditoriya: {banner.targetAudience === 'ALL' ? 'Barchaga' : banner.targetAudience === 'TEACHER' ? 'Ustozlarga' : 'Oʻquvchilarga'}
                    </span>

                    <span className="rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0071e3]">
                      {banner.actionType === 'NOTIFICATION_DETAIL'
                        ? 'Video / Eʼlon modali'
                        : banner.actionType === 'PLAN_MODAL'
                        ? 'Reja tuzish modali'
                        : 'Havola'}
                    </span>

                    {banner.isDismissible && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                        Yopilishi mumkin (Dismissible)
                      </span>
                    )}
                  </div>

                  <h3 className="text-[17px] font-bold text-foreground leading-snug truncate">
                    {banner.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground line-clamp-2">
                    {banner.desc}
                  </p>
                  <p className="text-[12px] text-muted-foreground pt-1">
                    Tugma: <strong className="text-foreground">{banner.btnText}</strong>
                    {banner.btnUrl && <span className="ml-1 text-muted-foreground/70">({banner.btnUrl})</span>}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
                <button
                  type="button"
                  onClick={() => handleToggleActive(banner)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                    banner.isActive
                      ? 'border-border bg-secondary/50 text-foreground hover:bg-secondary'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                  }`}
                >
                  {banner.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{banner.isActive ? 'Nofaol qilish' : 'Faollashtirish'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(banner)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title="Tahrirlash"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(banner.id)}
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-border bg-card shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="border-b border-border px-6 py-4.5 sm:px-8 flex items-center justify-between bg-secondary/30">
              <div>
                <h3 className="headline text-[20px] font-bold text-foreground">
                  {editingBanner ? 'Bannerni Tahrirlash' : 'Yangi Banner Yaratish'}
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  Dashboard bosh sahifasidagi slayd banner parametrlarini sozlang.
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 sm:px-8 space-y-4.5 flex-1">
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                  Banner Sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Yangi video darslar va JLPT qo'llanmasi"
                  className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                  Tavsif (Qisqa matn) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="MinnaUz 2.0 dagi barcha yangi imkoniyatlar bilan tanishing..."
                  className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Teg / Kategoriya matni
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Eʼlon, Aksiya, Qo'llanma..."
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Teg Ikonkasi
                  </label>
                  <select
                    value={formData.tagIcon}
                    onChange={(e) => setFormData({ ...formData, tagIcon: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card cursor-pointer"
                  >
                    {TAG_ICONS.map((ti) => (
                      <option key={ti.id} value={ti.id}>
                        {ti.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Harakat turi (Action Type)
                  </label>
                  <select
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value as any })}
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card cursor-pointer"
                  >
                    <option value="LINK">Havolaga oʻtish (Sahifa / Tashqi URL)</option>
                    <option value="NOTIFICATION_DETAIL">Batafsil Xabar / Video Modalini ochish</option>
                    <option value="PLAN_MODAL">Reja tuzish modalini ochish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Auditoriya
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card cursor-pointer"
                  >
                    <option value="ALL">Barcha foydalanuvchilar</option>
                    <option value="USER">Faqat Oʻquvchilar</option>
                    <option value="TEACHER">Faqat Oʻqituvchilar</option>
                  </select>
                </div>
              </div>

              {formData.actionType === 'LINK' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                      Tugma Matni
                    </label>
                    <input
                      type="text"
                      value={formData.btnText}
                      onChange={(e) => setFormData({ ...formData, btnText: e.target.value })}
                      placeholder="Darsga o'tish, Ko'rish..."
                      className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                      Tugma Havolasi (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.btnUrl || ''}
                      onChange={(e) => setFormData({ ...formData, btnUrl: e.target.value })}
                      placeholder="/dashboard/courses yoki https://..."
                      className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                    />
                  </div>
                </div>
              )}

              {formData.actionType === 'NOTIFICATION_DETAIL' && (
                <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-3">
                  <label className="block text-[13px] font-semibold text-foreground">
                    Bogʻlangan Xabarnoma (Eʼlon / Video)
                  </label>
                  <select
                    value={formData.notificationId || ''}
                    onChange={(e) => setFormData({ ...formData, notificationId: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] cursor-pointer"
                  >
                    <option value="">-- Mavjud xabarnomalardan tanlang --</option>
                    {notifications.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title} ({n.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-[12px] text-muted-foreground">
                    Foydalanuvchi bannerdagi tugmani bosganda ushbu xabarnomaning YouTube videosi va toʻliq matni modal boʻlib ochiladi.
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Banner Rasmi URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/banner_art.png yoki rasm havolasi"
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                    Tartib raqami (Order)
                  </label>
                  <input
                    type="number"
                    value={formData.order || 1}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] focus:bg-card"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/60">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl border border-border/50 bg-secondary/20 hover:bg-secondary/40">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded accent-[#0071e3]"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Faol holatda chiqarish</p>
                    <p className="text-[11px] text-muted-foreground">Dashboardda darhol koʻrinadi</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl border border-border/50 bg-secondary/20 hover:bg-secondary/40">
                  <input
                    type="checkbox"
                    checked={formData.isDismissible}
                    onChange={(e) => setFormData({ ...formData, isDismissible: e.target.checked })}
                    className="h-4 w-4 rounded accent-[#0071e3]"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Yopish (X) imkoniyati</p>
                    <p className="text-[11px] text-muted-foreground">Foydalanuvchi bannerni yopa oladi</p>
                  </div>
                </label>
              </div>

              {/* Actions */}
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
                  {submitting ? 'Saqlanmoqda...' : editingBanner ? 'Yangilash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
