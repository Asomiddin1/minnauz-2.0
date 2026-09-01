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
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  MousePointerClick,
} from 'lucide-react';
import {
  api,
  BannerItem,
  CreateBannerDto,
  NotificationItem,
  getMediaUrl,
} from '@/lib/api';
import { useLang } from '@/lib/i18n';

const TAG_ICONS = [
  { id: 'Sparkles', label: 'Yulduz (Sparkles)', icon: Sparkles },
  { id: 'PlayCircle', label: 'Video (Play)', icon: PlayCircle },
  { id: 'Calendar', label: 'Kalendar (Calendar)', icon: Calendar },
  { id: 'Target', label: 'Nishon (Target)', icon: Target },
  { id: 'Award', label: 'Mukofot (Award)', icon: Award },
  { id: 'Flame', label: 'Olov (Flame)', icon: Flame },
];

export default function AdminBannersPage() {
  const { lang, t } = useLang();
  const [banners, setBanners] = React.useState<BannerItem[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<BannerItem | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Custom button toggle & image upload state
  const [hasButton, setHasButton] = React.useState(false);
  const [imageInputMode, setImageInputMode] = React.useState<'upload' | 'url'>('upload');
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = React.useState<CreateBannerDto>({
    title: '',
    desc: '',
    tag: 'Yangilik',
    tagIcon: 'Sparkles',
    image: '',
    btnText: '',
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
      image: '',
      btnText: '',
      btnUrl: '',
      btnIcon: 'ArrowRight',
      actionType: 'LINK',
      notificationId: '',
      order: (banners[banners.length - 1]?.order || 0) + 1,
      isActive: true,
      isDismissible: true,
      targetAudience: 'ALL',
    });
    setHasButton(false);
    setImageInputMode('upload');
    setModalOpen(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    const bannerHasButton = Boolean(banner.btnText && banner.btnText.trim());
    setFormData({
      title: banner.title,
      desc: banner.desc,
      tag: banner.tag,
      tagIcon: banner.tagIcon,
      image: banner.image || '',
      btnText: banner.btnText || '',
      btnUrl: banner.btnUrl || '',
      btnIcon: banner.btnIcon || 'ArrowRight',
      actionType: banner.actionType,
      notificationId: banner.notificationId || '',
      order: banner.order,
      isActive: banner.isActive,
      isDismissible: banner.isDismissible,
      targetAudience: banner.targetAudience,
    });
    setHasButton(bannerHasButton);
    setImageInputMode(banner.image?.startsWith('http') ? 'url' : 'upload');
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      setFormData((prev) => ({ ...prev, image: res.url }));
    } catch (err: any) {
      alert(err?.message || 'Rasm yuklashda xatolik yuz berdi');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.desc) return;

    setSubmitting(true);
    try {
      const finalData: CreateBannerDto = {
        ...formData,
        image: formData.image?.trim() || '',
        btnText: hasButton ? (formData.btnText?.trim() || 'Batafsil') : '',
        btnUrl: formData.btnUrl?.trim() || undefined,
      };

      if (editingBanner) {
        await api.updateBanner(editingBanner.id, finalData);
      } else {
        await api.createBanner(finalData);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Bannerni saqlashda xatolik yuz berdi');
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
      console.error('Failed to toggle banner active state:', err);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Haqiqatan ham ushbu bannerni oʻchirmoqchimisiz?')) return;
    try {
      await api.deleteBanner(bannerId);
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
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

    // Recalculate orders
    const bannerOrders = newBanners.map((b, idx) => ({
      id: b.id,
      order: idx + 1,
    }));

    setBanners(newBanners);

    try {
      await api.reorderBanners(bannerOrders.map((b) => b.id));
    } catch (err) {
      console.error('Failed to reorder banners:', err);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sliders className="h-3.5 w-3.5" />
              <span>Reklama & Eʼlonlar</span>
            </span>
          </div>
          <h1 className="headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            {t?.admin?.banners?.title || 'Dashboard Bannerlar Boshqaruvi'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t?.admin?.banners?.subtitle || 'Oʻquvchilar va oʻqituvchilar bosh sahifasidagi slayd bannerlarini moslashtiring, yangi bannerlar qoʻshing yoki tartibini oʻzgartiring.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t?.admin?.overview?.refresh || 'Yangilash'}</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0071e3] px-4 py-2.5 text-xs font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t?.admin?.banners?.createBanner || 'Yangi Banner'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
          <p className="text-xs font-semibold text-muted-foreground">Bannerlar yuklanmoqda...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-secondary/20 space-y-3">
          <Sliders className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">Bannerlar mavjud emas</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Hozircha hech qanday maxsus banner yaratilmagan. Yangi banner qoʻshing va uni bosh sahifada eʼlon qiling.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0071e3] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Banner yaratish</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                !banner.isActive ? 'opacity-60 bg-secondary/10' : ''
              }`}
            >
              {/* Left Info & Image Preview */}
              <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                {/* Order Controls */}
                <div className="flex sm:flex-col items-center justify-center rounded-2xl border border-border/60 bg-secondary/20 p-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="grid h-7 w-7 place-items-center rounded-xl hover:bg-card disabled:opacity-30 cursor-pointer"
                    title="Tepaga surish"
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

                {/* Banner Thumbnail Preview */}
                <div className="relative aspect-[16/9] w-full sm:w-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary/30">
                  {banner.image ? (
                    <Image
                      src={getMediaUrl(banner.image)}
                      alt={banner.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#0071e3]/15 to-secondary/40 text-muted-foreground p-3 text-center">
                      <ImageIcon className="h-6 w-6 mb-1 text-primary/70" />
                      <span className="text-[10px] font-semibold">Rasmsiz</span>
                    </div>
                  )}
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

                    {banner.btnText ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        <MousePointerClick className="h-3 w-3" />
                        <span>Tugma: {banner.btnText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        Tugmasiz banner
                      </span>
                    )}

                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                      Auditoriya: {banner.targetAudience === 'ALL' ? 'Barchaga' : banner.targetAudience}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-foreground truncate">
                    {banner.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {banner.desc}
                  </p>

                  {banner.btnUrl && (
                    <div className="flex items-center gap-1 text-[11px] text-[#0071e3] font-medium truncate pt-0.5">
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{banner.btnUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleToggleActive(banner)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title={banner.isActive ? 'Faolsizlantirish' : 'Faollashtirish'}
                >
                  {banner.isActive ? (
                    <Eye className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(banner)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title="Tahrirlash"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(banner.id)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Oʻchirish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5 sm:px-8 bg-secondary/20">
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

              {/* BANNER IMAGE SECTION: Upload or URL (No forced default) */}
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4.5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-[13px] font-semibold text-foreground">
                      Banner Rasmi (Ixtiyoriy)
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Kompyuterdan rasm yuklang yoki internetdan havola (URL) kiriting
                    </p>
                  </div>

                  {/* Upload vs URL Tabs */}
                  <div className="flex items-center rounded-xl bg-card border border-border/80 p-1 text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-[#0071e3] text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Fayl yuklash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-[#0071e3] text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span>Havola (URL)</span>
                    </button>
                  </div>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="banner-file-upload-input"
                    />
                    <label
                      htmlFor="banner-file-upload-input"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/80 hover:border-[#0071e3]/60 rounded-2xl bg-card hover:bg-secondary/30 transition-all cursor-pointer text-center space-y-2"
                    >
                      {uploadingImage ? (
                        <div className="flex items-center gap-2 text-[#0071e3] font-semibold text-xs py-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Rasm serverga yuklanmoqda...</span>
                        </div>
                      ) : (
                        <>
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <UploadCloud className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              Kompyuterdan rasm tanlash uchun bosing
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              PNG, JPG, WebP, GIF yoki SVG (Maks. 20 MB)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/banner.jpg yoki /uploads/images/..."
                      className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3]"
                    />
                  </div>
                )}

                {/* Attached Image Preview */}
                {formData.image && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card">
                    <div className="relative h-14 w-24 shrink-0 rounded-xl overflow-hidden border border-border/80 bg-secondary/40">
                      <Image
                        src={getMediaUrl(formData.image)}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {formData.image}
                      </p>
                      <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Rasm muvaffaqiyatli biriktirildi</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="h-8 px-3 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Oʻchirish</span>
                    </button>
                  </div>
                )}
              </div>

              {/* BUTTON SECTION: Optional button toggle */}
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-[13px] font-semibold text-foreground">
                      Bannerda tugma koʻrsatilsinmi?
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Tugma ixtiyoriy. Agar kerak boʻlmasa, tugmasiz toza banner chiqarishingiz mumkin.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={hasButton}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasButton(checked);
                        if (!checked) {
                          setFormData({ ...formData, btnText: '' });
                        } else if (!formData.btnText) {
                          setFormData({ ...formData, btnText: 'Batafsil' });
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]" />
                  </label>
                </div>

                {hasButton && (
                  <div className="pt-3 border-t border-border/60 space-y-3 animate-in fade-in duration-200">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                          Tugma Matni *
                        </label>
                        <input
                          type="text"
                          required={hasButton}
                          value={formData.btnText}
                          onChange={(e) => setFormData({ ...formData, btnText: e.target.value })}
                          placeholder="Darsga o'tish, Batafsil, Ishtirok etish..."
                          className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3]"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                          Tugma Ikonkasi
                        </label>
                        <select
                          value={formData.btnIcon}
                          onChange={(e) => setFormData({ ...formData, btnIcon: e.target.value })}
                          className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-[#0071e3] cursor-pointer"
                        >
                          <option value="ArrowRight">Oʻngga strelka (ArrowRight)</option>
                          <option value="PlayCircle">Video ijro (PlayCircle)</option>
                          <option value="Sparkles">Yulduzcha (Sparkles)</option>
                          <option value="ExternalLink">Tashqi havola (ExternalLink)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION TYPE & LINK URL */}
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
                    Havola (URL) {hasButton ? '' : '(Ixtiyoriy)'}
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
                    Foydalanuvchi bannerdagi tugmani bosganda ushbu xabarnomaning videosi va toʻliq matni modal boʻlib ochiladi.
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
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
