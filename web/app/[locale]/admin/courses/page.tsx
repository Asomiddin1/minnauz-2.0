'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Layers,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

export default function AdminCoursesPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [courses, setCourses] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = React.useState<string>('ALL');

  // Create / Edit Course modal
  const [courseModalOpen, setCourseModalOpen] = React.useState(false);
  const [editingCourseId, setEditingCourseId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const [form, setForm] = React.useState({
    title: '',
    slug: '',
    description: '',
    level: 'N5',
    authorId: '',
    isPublished: true,
  });

  const loadData = async () => {
    try {
      const [coursesData, teachersData] = await Promise.all([
        api.getAdminCourses(),
        isAdmin ? api.getAdminTeachers().catch(() => []) : Promise.resolve([]),
      ]);
      setCourses(coursesData);
      setTeachers(teachersData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [isAdmin]);

  const openCreateModal = () => {
    setEditingCourseId(null);
    setForm({
      title: '',
      slug: '',
      description: '',
      level: 'N5',
      authorId: user?.id || '',
      isPublished: true,
    });
    setCourseModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingCourseId(c.id);
    setForm({
      title: c.title || '',
      slug: c.slug || '',
      description: c.description || '',
      level: c.level || 'N5',
      authorId: c.authorId || c.author?.id || user?.id || '',
      isPublished: c.isPublished ?? true,
    });
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    try {
      if (editingCourseId) {
        await api.updateAdminCourse(editingCourseId, form);
      } else {
        await api.createAdminCourse(form);
      }
      setCourseModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Haqiqatan ham ushbu kursni va uning barcha darslarini oʻchirmoqchimisiz?')) return;
    try {
      await api.deleteAdminCourse(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.level.toLowerCase().includes(search.toLowerCase()) ||
      (c.author?.fullName && c.author.fullName.toLowerCase().includes(search.toLowerCase()));

    const matchTeacher =
      selectedTeacherFilter === 'ALL' ||
      c.authorId === selectedTeacherFilter ||
      c.author?.id === selectedTeacherFilter;

    return matchSearch && matchTeacher;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="headline text-[26px] font-bold text-foreground">
            Kurslar va Darslar Boshqaruvi
          </h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            {isAdmin
              ? 'Barcha oʻqituvchilar va platforma kurslarini boshqarish'
              : 'Oʻzingizning mualliflik kurslaringiz va dars materiallarini boshqarish'}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-[#0077ed] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Yangi kurs yaratish</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kurs nomi, darajasi yoki oʻqituvchi..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Teacher Filter for Admins */}
          {isAdmin && teachers.length > 0 && (
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-card border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">Barcha mualliflar</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName || t.email} ({t.role})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-[13px] text-muted-foreground font-medium self-end sm:self-auto">
          Jami {filteredCourses.length} ta kurs
        </div>
      </div>

      {/* Courses List Cards */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-[16px] text-foreground">Kurslar topilmadi</h3>
          <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
            Yangi kurs qoʻshish uchun yuqoridagi "Yangi kurs yaratish" tugmasini bosing.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((c) => {
            const moduleCount = c.modules?.length || 0;
            const lessonCount =
              c.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
            const author = c.author;

            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-colors space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                      JLPT {c.level}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        c.isPublished
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {c.isPublished ? 'Faol' : 'Qoralama'}
                    </span>
                  </div>

                  <h3 className="text-[18px] font-bold text-foreground">{c.title}</h3>
                  <p className="text-[13px] text-muted-foreground line-clamp-2">
                    {c.description || 'Tavsif kiritilmagan'}
                  </p>

                  {/* Author / Teacher Badge */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/50 border border-border/50 text-[12px]">
                    {author?.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={author.fullName || 'Ustoz'}
                        className="h-6 w-6 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        <GraduationCap className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="truncate flex-1 min-w-0">
                      <span className="font-semibold text-foreground truncate block">
                        {author?.fullName || author?.email || 'MinnaUz Sensei'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {author?.role === 'SUPER_ADMIN' ? 'Rasmiy' : author?.role || 'Ustoz'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[12px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Layers className="h-3.5 w-3.5" />
                      {moduleCount} ta modul
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {lessonCount} ta dars
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${lang}/admin/courses/${c.id}/modules`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-foreground text-background font-semibold text-[13px] hover:bg-primary hover:text-white transition-colors"
                    >
                      <span>Modul & Darslar</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 text-[12px]"
                      title="Kurs maʼlumotlarini tahrirlash"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    title="Oʻchirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-foreground">
                {editingCourseId ? 'Kursni tahrirlash' : 'Yangi kurs yaratish'}
              </h3>
              <button
                type="button"
                onClick={() => setCourseModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Kurs nomi *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Masalan: Minna no Nihongo I (N5)"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Daraja
                  </label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                    <option value="OTHER">Boshqa / Maxsus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="minna-no-nihongo-1"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Course Author Selector for Admin */}
              {isAdmin && teachers.length > 0 && (
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Kurs Muallifi (Oʻqituvchi)
                  </label>
                  <select
                    value={form.authorId}
                    onChange={(e) => setForm({ ...form, authorId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName || t.email} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Kurs tavsifi
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Kurs haqida batafsil maʼlumot..."
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0071e3] text-white font-semibold text-[13px] shadow-md hover:bg-[#0077ed] disabled:opacity-50"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
