'use client';

import * as React from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  ExternalLink,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { api, AdminTeacherItem, AdminDeletionRequestItem } from '@/lib/api';
import { UserAvatar } from '@/components/shared/user-avatar';
import Link from 'next/link';

export default function AdminTeachersPage() {
  const { lang, t } = useLang();

  const [activeTab, setActiveTab] = React.useState<'TEACHERS' | 'DELETIONS'>('TEACHERS');
  const [teachers, setTeachers] = React.useState<AdminTeacherItem[]>([]);
  const [deletions, setDeletions] = React.useState<AdminDeletionRequestItem[]>([]);
  const [allCourses, setAllCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  // Modals state
  const [assignRoleModalOpen, setAssignRoleModalOpen] = React.useState(false);
  const [assignCourseModalOpen, setAssignCourseModalOpen] = React.useState(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<AdminTeacherItem | null>(null);
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [assignUserIdInput, setAssignUserIdInput] = React.useState('');
  const [modalSubmitting, setModalSubmitting] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [teachersRes, deletionsRes, coursesRes] = await Promise.all([
        api.getAdminTeachers(),
        api.getAdminDeletionRequests(),
        api.getAdminCourses(),
      ]);
      setTeachers(teachersRes || []);
      setDeletions(deletionsRes || []);
      setAllCourses(coursesRes || []);
    } catch (err) {
      console.error('Failed to load admin teachers data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Assign Teacher Role
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserIdInput.trim()) return;
    try {
      setModalSubmitting(true);
      await api.assignAdminTeacherRole(assignUserIdInput.trim());
      setFeedbackMsg({ type: 'success', text: 'Foydalanuvchiga TEACHER roli muvaffaqiyatli berildi!' });
      setAssignRoleModalOpen(false);
      setAssignUserIdInput('');
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle Remove Teacher Role
  const handleRemoveRole = async (teacher: AdminTeacherItem) => {
    if (!confirm(`${teacher.fullName} dan TEACHER rolini bekor qilib, oddiy USER ga qaytarmoqchimisiz?`)) {
      return;
    }
    try {
      await api.removeAdminTeacherRole(teacher.id);
      setFeedbackMsg({ type: 'success', text: 'Oʻqituvchi roli bekor qilindi.' });
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    }
  };

  // Handle Assign Course to Teacher
  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedCourseId) return;
    try {
      setModalSubmitting(true);
      await api.assignAdminCourseToTeacher(selectedCourseId, selectedTeacher.id);
      setFeedbackMsg({ type: 'success', text: 'Kurs oʻqituvchiga muvaffaqiyatli biriktirildi!' });
      setAssignCourseModalOpen(false);
      setSelectedCourseId('');
      setSelectedTeacher(null);
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle Approve Deletion
  const handleApproveDeletion = async (req: AdminDeletionRequestItem) => {
    if (
      !confirm(
        `"${req.title}" darsini butunlay oʻchirishni tasdiqlaysizmi? Ushbu amal ortga qaytarilmaydi!`
      )
    ) {
      return;
    }
    try {
      await api.approveAdminDeletionRequest(req.id);
      setFeedbackMsg({ type: 'success', text: 'Dars muvaffaqiyatli oʻchirildi.' });
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    }
  };

  // Handle Reject Deletion
  const handleRejectDeletion = async (req: AdminDeletionRequestItem) => {
    try {
      await api.rejectAdminDeletionRequest(req.id);
      setFeedbackMsg({ type: 'success', text: 'Oʻchirish soʻrovi rad etildi va dars qayta faollashtirildi.' });
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Oʻqituvchilar va Moderatorlar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Oʻqituvchilarni Boshqarish
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Platforma oʻqituvchilari roʻyxati, ularga kurs biriktirish, yuklagan darslar statistikasi va dars oʻchirish soʻrovlarini nazorat qilish.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAssignRoleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-95 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Yangi Oʻqituvchi tayinlash</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-border/50 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('TEACHERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'TEACHERS'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Oʻqituvchilar</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-background/20">
            {teachers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DELETIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'DELETIONS'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span>Dars oʻchirish soʻrovlari</span>
          {deletions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {deletions.length} ta
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: TEACHERS LIST */}
      {activeTab === 'TEACHERS' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Oʻqituvchi ismi yoki emaili boʻyicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border/60 bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-semibold text-muted-foreground">
                Oʻqituvchilar yuklanmoqda...
              </p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
              <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-foreground">Oʻqituvchilar topilmadi</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Platformada hali oʻqituvchi roli berilgan foydalanuvchilar yoʻq.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <UserAvatar
                      src={teacher.avatarUrl}
                      name={teacher.fullName}
                      size="lg"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                          {teacher.fullName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black border border-primary/20 uppercase">
                          {teacher.role}
                        </span>
                        {teacher.pendingDeletionCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                            {teacher.pendingDeletionCount} ta oʻchirish soʻrovi
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {teacher.email}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <BookOpen className="h-3 w-3 text-primary" />
                          {teacher.coursesCount} ta kurs
                        </span>
                        <span>•</span>
                        <span>{teacher.lessonsCount} ta dars</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Courses badges */}
                  <div className="flex items-center gap-1.5 flex-wrap max-w-sm">
                    {teacher.courses.map((c) => (
                      <span
                        key={c.id}
                        className="px-2.5 py-1 rounded-lg bg-secondary/70 border border-border/40 text-[11px] font-semibold text-foreground"
                      >
                        {c.title} ({c.level})
                      </span>
                    ))}
                    {teacher.courses.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">
                        Kurs biriktirilmagan
                      </span>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setAssignCourseModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary text-xs font-bold text-foreground transition-all cursor-pointer"
                    >
                      Kurs biriktirish
                    </button>

                    {teacher.role === 'TEACHER' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(teacher)}
                        className="p-2 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-destructive text-xs transition-all cursor-pointer"
                        title="Oʻqituvchi rolini bekor qilish"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DELETION REQUESTS */}
      {activeTab === 'DELETIONS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-600 dark:text-amber-400 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              Oʻqituvchilar darslarni toʻgʻridan-toʻgʻri oʻchira olmaydi
            </p>
            <p className="text-[11px] text-muted-foreground">
              Oʻqituvchi darsni oʻchirish soʻrovini yuborganda, dars vaqtincha nofaol boʻladi. Admin quyida dars va uning sababini koʻrib chiqib, oʻchirishni tasdiqlashi yoki rad etishi mumkin.
            </p>
          </div>

          {deletions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-foreground">
                Kutilayotgan soʻrovlar yoʻq
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Barcha darslar faol yoki hech qaysi oʻqituvchi dars oʻchirish soʻrovini yubormagan.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {deletions.map((del) => (
                <div
                  key={del.id}
                  className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black">
                        №{del.order}
                      </span>
                      <h4 className="text-sm font-bold text-foreground">
                        {del.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        ({del.module?.course?.title})
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground font-medium">
                      Oʻqituvchi:{' '}
                      <strong className="text-foreground">
                        {del.module?.course?.author?.fullName || del.module?.course?.author?.email || 'Nomaʼlum'}
                      </strong>
                    </div>
                  </div>

                  {/* Reason Box */}
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/50 text-xs space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">
                      Oʻchirish sababi:
                    </p>
                    <p className="text-foreground italic">
                      "{del.deleteReason || 'Sabab koʻrsatilmagan'}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRejectDeletion(del)}
                      className="px-4 py-2 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary text-xs font-bold text-foreground cursor-pointer transition-all"
                    >
                      Rad etish (Qayta faollashtirish)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveDeletion(del)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive text-xs font-bold text-destructive-foreground hover:opacity-90 cursor-pointer shadow-xs transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Tasdiqlash va Oʻchirish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ASSIGN TEACHER ROLE */}
      {assignRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Yangi Oʻqituvchi tayinlash
              </h3>
              <button
                type="button"
                onClick={() => setAssignRoleModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignRole} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Foydalanuvchi ID (UUID):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                  value={assignUserIdInput}
                  onChange={(e) => setAssignUserIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-muted-foreground">
                  Foydalanuvchilar boʻlimidan kerakli foydalanuvchi ID raqamini nusxalab kiriting.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {modalSubmitting ? 'Tayinlanmoqda...' : 'Oʻqituvchi qilish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN COURSE TO TEACHER */}
      {assignCourseModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Kurs biriktirish
              </h3>
              <button
                type="button"
                onClick={() => setAssignCourseModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/40 text-xs space-y-1">
              <p className="text-muted-foreground">Tanlangan oʻqituvchi:</p>
              <p className="font-bold text-foreground">{selectedTeacher.fullName}</p>
              <p className="text-muted-foreground text-[11px]">{selectedTeacher.email}</p>
            </div>

            <form onSubmit={handleAssignCourse} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Biriktiriladigan kursni tanlang:
                </label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">-- Kursni tanlang --</option>
                  {allCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.level}) {c.author ? `[Hozirgi: ${c.author.fullName || c.author.email}]` : '[Biriktirilmagan]'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting || !selectedCourseId}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {modalSubmitting ? 'Biriktirilmoqda...' : 'Biriktirish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
