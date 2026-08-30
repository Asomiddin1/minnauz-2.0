'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Trophy,
  Clock,
  HelpCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Headphones,
  AlertCircle,
  Calendar,
  X,
  Check,
  RotateCcw,
  UploadCloud,
  Link as LinkIcon,
  Play,
  Pause,
  Music,
  Volume2,
  Crown,
} from 'lucide-react';
import { api, AdminJlptTestItem, JlptLevel } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { getMediaUrl } from '@/components/shared/user-avatar';

export function getOfficialJlptPassScore(level: JlptLevel): number {
  switch (level) {
    case 'N5':
      return 80;
    case 'N4':
      return 90;
    case 'N3':
      return 95;
    case 'N2':
      return 90;
    case 'N1':
      return 100;
    default:
      return 80;
  }
}

export default function AdminTestsPage() {
  const { lang } = useLang();
  const [tests, setTests] = React.useState<AdminJlptTestItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTest, setEditingTest] = React.useState<AdminJlptTestItem | null>(null);
  const [modalLoading, setModalLoading] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = React.useState({
    title: '',
    slug: '',
    description: '',
    level: 'N5' as JlptLevel,
    durationMinutes: 105,
    passingScore: 60,
    totalScore: 180,
    audioUrl: '',
    order: 1,
    isPublished: true,
    isPremium: false,
  });

  const [togglingPremiumId, setTogglingPremiumId] = React.useState<string | null>(null);

  // Audio upload & source state
  const [audioSourceType, setAudioSourceType] = React.useState<'UPLOAD' | 'URL'>('UPLOAD');
  const [isUploadingAudio, setIsUploadingAudio] = React.useState(false);
  const [uploadProgressText, setUploadProgressText] = React.useState('');
  const audioInputRef = React.useRef<HTMLInputElement | null>(null);

  // Audio preview playback in modal
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setModalError('Audio fayl hajmi 100 MB dan oshmasligi kerak');
      return;
    }

    setIsUploadingAudio(true);
    setUploadProgressText(`${file.name} yuklanmoqda...`);
    setModalError(null);

    try {
      const res = await api.uploadAudio(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, audioUrl: res.url }));
        setUploadProgressText(`Yuklandi: ${file.name}`);
      }
    } catch (err: any) {
      setModalError(err?.message || 'Audio yuklashda xatolik yuz berdi');
    } finally {
      setIsUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const togglePreviewAudio = () => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => {});
    }
  };

  const loadTests = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminGetTests();
      setTests(data);
    } catch (err: any) {
      setError(err?.message || 'Testlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handleOpenCreate = () => {
    setEditingTest(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      level: 'N5',
      durationMinutes: 105,
      passingScore: 80, // N5 rasmiy standarti (80/180 ball)
      totalScore: 180,
      audioUrl: '',
      order: tests.length + 1,
      isPublished: true,
      isPremium: false,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: AdminJlptTestItem) => {
    setEditingTest(t);
    setFormData({
      title: t.title,
      slug: t.slug,
      description: t.description || '',
      level: t.level,
      durationMinutes: t.durationMinutes,
      passingScore: t.passingScore,
      totalScore: t.totalScore,
      audioUrl: t.audioUrl || '',
      order: t.order,
      isPublished: t.isPublished,
      isPremium: t.isPremium ?? false,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleTogglePremium = async (t: AdminJlptTestItem) => {
    try {
      setTogglingPremiumId(t.id);
      const nextVal = !t.isPremium;
      await api.adminUpdateTest(t.id, { isPremium: nextVal });
      setTests((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, isPremium: nextVal } : item))
      );
    } catch (err: any) {
      alert(err?.message || 'Tarifni oʻzgartirishda xatolik yuz berdi');
    } finally {
      setTogglingPremiumId(null);
    }
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      // Auto-generate slug if creating new
      if (!editingTest) {
        const slug = val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        return { ...prev, title: val, slug };
      }
      return { ...prev, title: val };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      setModalError('Test nomi va slug kiritilishi shart');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        level: formData.level,
        category: 'MOCK_EXAM',
        durationMinutes: Number(formData.durationMinutes),
        passingScore: Number(formData.passingScore),
        totalScore: Number(formData.totalScore),
        audioUrl: formData.audioUrl.trim() || undefined,
        order: Number(formData.order),
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
      };

      if (editingTest) {
        await api.adminUpdateTest(editingTest.id, payload);
      } else {
        await api.adminCreateTest(payload);
      }

      setIsModalOpen(false);
      await loadTests();
    } catch (err: any) {
      setModalError(err?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.adminDeleteTest(deletingId);
      setDeletingId(null);
      await loadTests();
    } catch (err: any) {
      alert(err?.message || 'Oʻchirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTests = React.useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase());
      const matchesLevel = levelFilter === 'ALL' || t.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [tests, search, levelFilter]);

  const stats = React.useMemo(() => {
    const total = tests.length;
    const n5Count = tests.filter((t) => t.level === 'N5').length;
    const n4Count = tests.filter((t) => t.level === 'N4').length;
    const totalQuestions = tests.reduce((acc, t) => acc + (t.questionCount || 0), 0);
    return { total, n5Count, n4Count, totalQuestions };
  }, [tests]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
              Admin Boshqaruvi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground mt-1">
            JLPT Mock Imtihonlar Boshqaruvi
          </h1>
          <p className="text-xs text-muted-foreground">
            Haqiqiy 3 modulli JLPT imtihonlarini yaratish, tahrirlash va savollarini boshqarish
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Yangi Mock Imtihon</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Jami Mock Imtihonlar
          </p>
          <p className="text-2xl font-black text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
            JLPT N5 Imtihonlar
          </p>
          <p className="text-2xl font-black text-blue-500 mt-1">{stats.n5Count}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
            JLPT N4 Imtihonlar
          </p>
          <p className="text-2xl font-black text-emerald-500 mt-1">{stats.n4Count}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Jami Savollar Soni
          </p>
          <p className="text-2xl font-black text-foreground mt-1">{stats.totalQuestions}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi yoki slug boʻyicha qidirish..."
            className="w-full h-10 pl-10 pr-4 rounded-2xl border border-border/60 bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                levelFilter === lvl
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {lvl === 'ALL' ? 'Barchasi' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Table / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">Testlar yuklanmoqda...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
          <FileCheck2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">Mock imtihonlar topilmadi</h3>
          <p className="text-xs text-muted-foreground">
            Hozircha hech qanday test qoʻshilmagan yoki qidiruv boʻyicha natija yoʻq.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
          >
            Yangi Mock Imtihon yaratish
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 border-b border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="p-4">Daraja</th>
                  <th className="p-4">Test Nomi</th>
                  <th className="p-4">Savollar</th>
                  <th className="p-4">Vaqt & Ball</th>
                  <th className="p-4">Topshirishlar</th>
                  <th className="p-4">Audio</th>
                  <th className="p-4">Tarif</th>
                  <th className="p-4">Holat</th>
                  <th className="p-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredTests.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-black text-xs">
                        {t.level}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-foreground truncate">{t.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        /{t.slug}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-foreground">{t.questionCount || 0} ta</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{t.durationMinutes} daqiqa</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t.totalScore} ball (oʻtish: {t.passingScore} ball)
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground font-medium">
                        {t.attemptsCount || 0} marta
                      </span>
                    </td>
                    <td className="p-4">
                      {t.audioUrl ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-semibold text-[11px]">
                          <Headphones className="h-3 w-3" />
                          Mavjud
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Yoʻq</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePremium(t)}
                        disabled={togglingPremiumId === t.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 ${
                          t.isPremium
                            ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25'
                            : 'bg-secondary/70 text-muted-foreground border border-border/60 hover:text-foreground hover:bg-secondary'
                        }`}
                        title="Tarifni Bepul / Pro ga oʻzgartirish uchun bosing"
                      >
                        {togglingPremiumId === t.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : t.isPremium ? (
                          <>
                            <Crown className="h-3 w-3 text-yellow-500" />
                            <span>Pro Obuna</span>
                          </>
                        ) : (
                          <>
                            <span>🔓 Bepul</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      {t.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Faol
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
                          <XCircle className="h-3.5 w-3.5" />
                          Qoralama
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/${lang}/admin/tests/${t.id}`}
                          className="h-8 px-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="Savollarni boshqarish"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          <span>Savollar</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(t.id)}
                          className="h-8 w-8 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive flex items-center justify-center transition-all cursor-pointer"
                          title="Oʻchirish"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {editingTest ? 'Mock Imtihonni Tahrirlash' : 'Yangi Mock Imtihon Qoʻshish'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Test Nomi *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Masalan: JLPT N5 Toʻliq Mock Imtihon #3"
                  className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Slug (URL) *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="jlpt-n5-mock-3"
                    className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-secondary/20 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Daraja (Level) *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => {
                      const newLevel = e.target.value as JlptLevel;
                      setFormData((prev) => ({
                        ...prev,
                        level: newLevel,
                        passingScore: getOfficialJlptPassScore(newLevel),
                      }));
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="N5">JLPT N5 (Oʻtish: 80 ball)</option>
                    <option value="N4">JLPT N4 (Oʻtish: 90 ball)</option>
                    <option value="N3">JLPT N3 (Oʻtish: 95 ball)</option>
                    <option value="N2">JLPT N2 (Oʻtish: 90 ball)</option>
                    <option value="N1">JLPT N1 (Oʻtish: 100 ball)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Vaqt (Daqiqa)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Jami Ball</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalScore}
                    onChange={(e) =>
                      setFormData({ ...formData, totalScore: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Oʻtish Bali</label>
                    <span className="text-[10px] font-bold text-primary">
                      {formData.level}: {getOfficialJlptPassScore(formData.level)}/180
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({ ...formData, passingScore: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* DUAL-MODE CHOUKAI AUDIO COMPONENT */}
              <div className="space-y-2.5 p-3.5 rounded-2xl border border-border/70 bg-secondary/15">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Headphones className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-bold text-foreground">
                      Choukai Tinglab Tushunish Audio Treki
                    </span>
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex items-center bg-card rounded-xl p-0.5 border border-border/60">
                    <button
                      type="button"
                      onClick={() => setAudioSourceType('UPLOAD')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        audioSourceType === 'UPLOAD'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <UploadCloud className="h-3 w-3" />
                      <span>Fayl yuklash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioSourceType('URL')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        audioSourceType === 'URL'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <LinkIcon className="h-3 w-3" />
                      <span>Havola (URL)</span>
                    </button>
                  </div>
                </div>

                {/* Upload Mode */}
                {audioSourceType === 'UPLOAD' ? (
                  <div className="space-y-2">
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/mp3,audio/mpeg,audio/m4a,audio/x-m4a,audio/wav,audio/aac,audio/ogg,audio/webm"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => !isUploadingAudio && audioInputRef.current?.click()}
                      className={`p-4 rounded-xl border border-dashed text-center transition-all cursor-pointer ${
                        isUploadingAudio
                          ? 'border-primary bg-primary/5 cursor-wait'
                          : 'border-border/80 hover:border-primary/50 hover:bg-card/50 bg-secondary/10'
                      }`}
                    >
                      {isUploadingAudio ? (
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <p className="text-xs font-semibold text-primary">
                            {uploadProgressText || 'Audio serverga yuklanmoqda...'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">Iltimos kuting...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <UploadCloud className="h-6 w-6 text-primary" />
                          <p className="text-xs font-bold text-foreground">
                            Audio faylni tanlang yoki shu yerga tashlang
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            MP3, M4A, WAV, AAC, OGG (maksimal 100 MB — toʻliq 40-50 daqiqalik audio uchun yetarli)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* URL Link Mode */
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      placeholder="https://example.com/audio/choukai-n5.mp3"
                      className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-card text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Tashqi CDN, Google Drive yoki toʻgʻridan-toʻgʻri audio manzilini kiriting
                    </p>
                  </div>
                )}

                {/* Live Audio Player Preview if audioUrl is set */}
                {formData.audioUrl && (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={togglePreviewAudio}
                        className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
                        title={isPreviewPlaying ? 'Pauza' : 'Tinglab koʻrish'}
                      >
                        {isPreviewPlaying ? (
                          <Pause className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-xs flex items-center gap-1.5">
                          <Music className="h-3 w-3 text-blue-500" />
                          <span>Biriktirilgan Choukai Audiosi</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
                          {formData.audioUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Hidden audio element for preview */}
                      <audio
                        ref={previewAudioRef}
                        src={getMediaUrl(formData.audioUrl)}
                        onEnded={() => setIsPreviewPlaying(false)}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (previewAudioRef.current) previewAudioRef.current.pause();
                          setIsPreviewPlaying(false);
                          setFormData((prev) => ({ ...prev, audioUrl: '' }));
                        }}
                        className="px-2.5 py-1 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Oʻchirish
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Tavsif</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Test haqida qisqacha maʼlumot..."
                  className="w-full p-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 space-y-2">
                <label className="text-xs font-bold text-foreground">Test Tarifi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPremium: false })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      !formData.isPremium
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-card text-muted-foreground border-border/60 hover:text-foreground'
                    }`}
                  >
                    <span>🔓 Bepul (Hamma uchun)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPremium: true })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.isPremium
                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-xs font-black'
                        : 'bg-card text-muted-foreground border-border/60 hover:text-foreground'
                    }`}
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>👑 Faqat Pro obuna</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-foreground cursor-pointer">
                  Test faol (talabalar uchun ochiq)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <Trash2 className="h-10 w-10 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Testni oʻchirish</h3>
              <p className="text-xs text-muted-foreground">
                Haqiqatan ham bu mock imtihonni va uning barcha savollarini oʻchirib tashlamoqchimisiz?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-destructive text-xs font-bold text-destructive-foreground hover:opacity-90 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Oʻchirilmoqda...' : 'Ha, oʻchirilsin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
