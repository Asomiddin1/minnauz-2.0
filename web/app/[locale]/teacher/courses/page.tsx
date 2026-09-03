'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  ArrowRight,
  Layers,
  Edit,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function TeacherCoursesPage() {
  const { lang, t } = useLang();

  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState('ALL');

  // Edit course modal
  const [editCourse, setEditCourse] = React.useState<any | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editCoverImage, setEditCoverImage] = React.useState('');
  const [editIsPublished, setEditIsPublished] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const loadCourses = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getTeacherCourses();
      setCourses(res || []);
    } catch (err) {
      console.error('Failed to load teacher courses', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const openEditModal = (c: any) => {
    setEditCourse(c);
    setEditTitle(c.title || '');
    setEditDescription(c.description || '');
    setEditCoverImage(c.coverImage || '');
    setEditIsPublished(c.isPublished ?? true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;
    try {
      setSaving(true);
      await api.updateTeacherCourse(editCourse.id, {
        title: editTitle,
        description: editDescription,
        coverImage: editCoverImage,
        isPublished: editIsPublished,
      });
      setEditCourse(null);
      await loadCourses();
    } catch (err: any) {
      alert(err?.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchLevel = selectedLevel === 'ALL' || c.level === selectedLevel;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    return matchLevel && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Kurslar boshqaruvi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Mening Kurslarim
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Sizga biriktirilgan barcha yapon tili kurslari roʻyxati. Kurs modullari, darslari, lugʻat va grammatika materiallarini tahrirlang.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => {
            const isActive = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {lvl === 'ALL' ? 'Barcha darajalar' : `JLPT ${lvl}`}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kurs nomi boʻyicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/60 bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">
            Kurslar yuklanmoqda...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">Kurslar topilmadi</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tanlangan mezonlar boʻyicha kurs mavjud emas. Filtrlarni tozalab koʻring.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => {
            const totalLessons = course.modules?.reduce(
              (sum: number, m: any) => sum + (m.lessons?.length || 0),
              0
            ) || 0;

            return (
              <div
                key={course.id}
                className="group relative rounded-3xl border border-border/70 bg-card overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20">
                      {course.level}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                        course.isPublished
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {course.isPublished ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Eʼlon qilingan</span>
                        </>
                      ) : (
                        <span>Qoralama</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {course.description || 'Kurs tavsifi kiritilmagan.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      {course.modules?.length || 0} ta modul
                    </span>
                    <span>•</span>
                    <span>{totalLessons} ta dars</span>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 border-t border-border/50 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(course)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Tahrirlash</span>
                  </button>

                  <Link
                    href={`/${lang}/teacher/courses/${course.id}/modules`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Modullar & Darslar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Kurs maʼlumotlarini tahrirlash
              </h3>
              <button
                type="button"
                onClick={() => setEditCourse(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Kurs nomi:</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Tavsifi:</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Muqova rasm URL:</label>
                <input
                  type="text"
                  placeholder="https://... yoki /covers/..."
                  value={editCoverImage}
                  onChange={(e) => setEditCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coursePublishedCheck"
                  checked={editIsPublished}
                  onChange={(e) => setEditIsPublished(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="coursePublishedCheck" className="text-xs font-semibold text-foreground cursor-pointer">
                  Kurs oʻquvchilar uchun eʼlon qilingan (Faol)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditCourse(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
