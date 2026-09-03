'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Layers,
  BookOpen,
  Video,
  FileText,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Sparkles,
  ExternalLink,
  UploadCloud,
  Film,
  X,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { api } from '@/lib/api';

function YoutubeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function TeacherCourseModulesPage() {
  const { lang, t } = useLang();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Module modal
  const [addModuleModalOpen, setAddModuleModalOpen] = React.useState(false);
  const [newModuleTitle, setNewModuleTitle] = React.useState('');
  const [newModuleDesc, setNewModuleDesc] = React.useState('');

  // Lesson modal state
  const [lessonModalOpen, setLessonModalOpen] = React.useState(false);
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = React.useState<string | null>(null);
  const [videoSourceType, setVideoSourceType] = React.useState<'youtube' | 'upload'>('youtube');
  const [uploadingVideo, setUploadingVideo] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null);

  const [lessonForm, setLessonForm] = React.useState({
    title: '',
    japaneseTitle: '',
    summary: '',
    videoUrl: '',
    order: 1,
    isFree: false,
    isPublished: true,
  });

  // Deletion Request modal
  const [deleteRequestLesson, setDeleteRequestLesson] = React.useState<any | null>(null);
  const [deleteReason, setDeleteReason] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCourseData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getTeacherCourse(courseId);
      setCourse(res);
    } catch (err: any) {
      console.error('Failed to load course modules', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  React.useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Add Module
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      setSubmitting(true);
      await api.createTeacherModule(courseId, {
        title: newModuleTitle.trim(),
        description: newModuleDesc.trim() || undefined,
        order: (course?.modules?.length || 0) + 1,
      });
      setAlertMsg({ type: 'success', text: 'Yangi modul muvaffaqiyatli qoʻshildi!' });
      setAddModuleModalOpen(false);
      setNewModuleTitle('');
      setNewModuleDesc('');
      await loadCourseData();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Unified Lesson Modal (Add or Edit)
  const openLessonModal = (moduleId: string, lesson?: any) => {
    setSelectedModuleId(moduleId);
    setUploadProgress(null);
    if (lesson) {
      setEditingLessonId(lesson.id);
      const isUpload = lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/');
      setVideoSourceType(isUpload ? 'upload' : 'youtube');
      setLessonForm({
        title: lesson.title || '',
        japaneseTitle: lesson.japaneseTitle || '',
        summary: lesson.summary || '',
        videoUrl: lesson.videoUrl || '',
        order: lesson.order || 1,
        isFree: lesson.isFree || false,
        isPublished: lesson.isPublished ?? true,
      });
    } else {
      setEditingLessonId(null);
      setVideoSourceType('youtube');
      const currentModule = course?.modules?.find((m: any) => m.id === moduleId);
      setLessonForm({
        title: '',
        japaneseTitle: '',
        summary: '',
        videoUrl: '',
        order: (currentModule?.lessons?.length || 0) + 1,
        isFree: false,
        isPublished: true,
      });
    }
    setLessonModalOpen(true);
  };

  // Video File Upload Handler
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      alert('Video fayl hajmi 500 MB dan oshmasligi kerak');
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(`Yuklanmoqda: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      const res = await api.uploadVideo(file);
      setLessonForm((prev) => ({ ...prev, videoUrl: res.url }));
      setUploadProgress(`Muvaffaqiyatli yuklandi: ${res.originalName || file.name}`);
    } catch (err: any) {
      alert(err?.message || 'Video yuklashda xatolik yuz berdi');
      setUploadProgress(null);
    } finally {
      setUploadingVideo(false);
    }
  };

  // Save Lesson (Create or Update)
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !selectedModuleId) return;
    try {
      setSubmitting(true);
      if (editingLessonId) {
        await api.updateTeacherLesson(courseId, editingLessonId, {
          title: lessonForm.title.trim(),
          japaneseTitle: lessonForm.japaneseTitle.trim() || null,
          videoUrl: lessonForm.videoUrl.trim() || null,
          summary: lessonForm.summary.trim() || null,
          order: lessonForm.order,
          isPublished: lessonForm.isPublished,
          isFree: lessonForm.isFree,
        });
        setAlertMsg({ type: 'success', text: 'Dars muvaffaqiyatli yangilandi!' });
      } else {
        await api.createTeacherLesson(courseId, selectedModuleId, {
          title: lessonForm.title.trim(),
          japaneseTitle: lessonForm.japaneseTitle.trim() || undefined,
          videoUrl: lessonForm.videoUrl.trim() || undefined,
          summary: lessonForm.summary.trim() || undefined,
          order: lessonForm.order,
          isPublished: true,
          isFree: lessonForm.isFree,
        });
        setAlertMsg({ type: 'success', text: 'Yangi dars muvaffaqiyatli yaratildi!' });
      }
      setLessonModalOpen(false);
      await loadCourseData();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Deletion Request to Admin
  const handleSubmitDeletionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteRequestLesson || !deleteReason.trim()) return;
    try {
      setSubmitting(true);
      await api.requestDeleteTeacherLesson(courseId, deleteRequestLesson.id, deleteReason.trim());
      setAlertMsg({
        type: 'success',
        text: 'Darsni oʻchirish soʻrovi Adminga yuborildi. Dars vaqtincha nofaol qilindi.',
      });
      setDeleteRequestLesson(null);
      setDeleteReason('');
      await loadCourseData();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Deletion Request
  const handleCancelDeletionRequest = async (lesson: any) => {
    try {
      await api.cancelDeleteTeacherLesson(courseId, lesson.id);
      setAlertMsg({ type: 'success', text: 'Oʻchirish soʻrovi bekor qilindi.' });
      await loadCourseData();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground">
          Modullar yuklanmoqda...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center rounded-3xl border border-destructive/20 bg-card space-y-3">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Kurs topilmadi</h3>
        <Link
          href={`/${lang}/teacher/courses`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kurslar roʻyxatiga qaytish</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
        <Link
          href={`/${lang}/teacher/courses`}
          className="hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kurslarim</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">{course.title}</span>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20">
              {course.level}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {course.modules?.length || 0} ta modul
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Modullar va darslarni yarating, video va oʻquv materiallarini biriktiring.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setAddModuleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Yangi Modul</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            alertMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button
            type="button"
            onClick={() => setAlertMsg(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-6">
        {course.modules?.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
            <Layers className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              Hozircha birorta ham modul yoʻq
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Darslarni joylash uchun avval modul yarating (masalan: "1-qism: Asosiy darslar").
            </p>
            <button
              type="button"
              onClick={() => setAddModuleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground cursor-pointer shadow-xs"
            >
              Modul yaratish
            </button>
          </div>
        ) : (
          course.modules?.map((mod: any, idx: number) => (
            <div
              key={mod.id}
              className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-2xs space-y-0"
            >
              {/* Module Header Bar */}
              <div className="p-4 sm:p-5 bg-secondary/30 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary text-xs font-black">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="text-xs text-muted-foreground">
                        {mod.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openLessonModal(mod.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Dars qoʻshish</span>
                  </button>
                </div>
              </div>

              {/* Module Lessons Table */}
              <div className="p-3 sm:p-4">
                {mod.lessons?.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground italic">
                    Ushbu modulda hozircha darslar yoʻq. "Dars qoʻshish" tugmasini bosing.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/50 text-muted-foreground font-bold text-[11px]">
                          <th className="py-2.5 px-3 w-12 text-center">№</th>
                          <th className="py-2.5 px-3">Dars nomi</th>
                          <th className="py-2.5 px-3 hidden md:table-cell text-center">Video</th>
                          <th className="py-2.5 px-3 text-center">Holat</th>
                          <th className="py-2.5 px-3 text-right">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-medium">
                        {mod.lessons?.map((lesson: any) => (
                          <tr
                            key={lesson.id}
                            className="hover:bg-secondary/20 transition-colors"
                          >
                            {/* Order */}
                            <td className="py-3 px-3 text-center font-bold text-foreground">
                              {lesson.order}
                            </td>

                            {/* Title */}
                            <td className="py-3 px-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  {lesson.japaneseTitle && (
                                    <span className="text-[11px] font-bold text-primary">
                                      {lesson.japaneseTitle}
                                    </span>
                                  )}
                                  {lesson.isFree && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                      Bepul
                                    </span>
                                  )}
                                </div>
                                <span className="font-semibold text-foreground">
                                  {lesson.title}
                                </span>
                              </div>
                            </td>

                            {/* Video */}
                            <td className="py-3 px-3 hidden md:table-cell text-center">
                              {lesson.videoUrl ? (
                                lesson.videoUrl.startsWith('/uploads/') ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-[#0071e3] font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                                    <Film className="h-3 w-3" />
                                    <span>Server</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                                    <YoutubeIcon className="h-3 w-3" />
                                    <span>YouTube</span>
                                  </span>
                                )
                              ) : (
                                <span className="text-muted-foreground/60">—</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3 text-center">
                              {lesson.deleteRequested ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Oʻchirish kutilmoqda</span>
                                </span>
                              ) : lesson.isPublished ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Faol</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-secondary text-muted-foreground">
                                  <span>Qoralama</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Open Materiallar Editor */}
                                <Link
                                  href={`/${lang}/teacher/courses/${courseId}/lessons/${lesson.id}/content`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground text-background text-[12px] font-semibold hover:bg-primary hover:text-white transition-colors"
                                  title="Dars materiallari (Lugʻat, Grammatika, Kanji va Mashqlar)"
                                >
                                  <BookOpen className="h-3.5 w-3.5" />
                                  <span>Dars materiallari</span>
                                </Link>

                                {/* Edit Lesson Basic Info */}
                                <button
                                  type="button"
                                  onClick={() => openLessonModal(mod.id, lesson)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-secondary text-foreground text-[12px] font-semibold hover:bg-secondary/80 transition-colors cursor-pointer"
                                  title="Dars nomi va videosini tahrirlash"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Tahrirlash</span>
                                </button>

                                {/* Request Delete vs Cancel Delete */}
                                {lesson.deleteRequested ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelDeletionRequest(lesson)}
                                    className="px-2.5 py-1 rounded-lg bg-secondary text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                                    title="Soʻrovni bekor qilish"
                                  >
                                    Bekor qilish
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteRequestLesson(lesson);
                                      setDeleteReason('');
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                                    title="Oʻchirish soʻrovi yuborish (Admin tasdigʻi uchun)"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: CREATE MODULE */}
      {addModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Yangi Modul yaratish
              </h3>
              <button
                type="button"
                onClick={() => setAddModuleModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Modul nomi:</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 1-qism: Kirish va Asosiy darslar"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Izoh (ixtiyoriy):</label>
                <textarea
                  rows={2}
                  placeholder="Modul boʻyicha qisqacha maʼlumot..."
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Yaratilmoqda...' : 'Modul yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LESSON MODAL */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {editingLessonId ? (
                    <Edit className="h-5 w-5" />
                  ) : (
                    <BookOpen className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    {editingLessonId ? 'Darsni tahrirlash' : 'Yangi dars qoʻshish'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Dars nomi, videoni (YouTube yoki fayl) va tavsifni kiriting
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
                aria-label="Yopish"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase text-muted-foreground">
                  Dars mavzusi (Oʻzbekcha) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 1-dars: Salomlashish va Oʻzini tanishtirish"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-secondary/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase text-muted-foreground">
                  Yaponcha sarlavha (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 第1課: 初めまして"
                  value={lessonForm.japaneseTitle}
                  onChange={(e) => setLessonForm({ ...lessonForm, japaneseTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-secondary/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-japanese"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase text-muted-foreground">
                  Qisqacha mazmun (Summary)
                </label>
                <textarea
                  rows={2}
                  placeholder="Darsda nimalar oʻrganilishi haqida qisqacha maʼlumot..."
                  value={lessonForm.summary}
                  onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border/70 bg-secondary/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* VIDEO SECTION (YOUTUBE LINK YOKI SERVERGA UPLOAD) */}
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <label className="text-[12px] font-bold uppercase text-foreground">
                      Dars Videosi (2 xil usul)
                    </label>
                  </div>

                  {/* Video Type Selector */}
                  <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border/60">
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('youtube')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        videoSourceType === 'youtube'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <YoutubeIcon className="h-3.5 w-3.5" />
                      <span>YouTube link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('upload')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        videoSourceType === 'upload'
                          ? 'bg-[#0071e3] text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Serverga yuklash</span>
                    </button>
                  </div>
                </div>

                {videoSourceType === 'youtube' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... yoki https://youtu.be/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/70 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      YouTube videoning toʻliq havolasini kiriting. Oʻquvchiga toʻgʻridan-toʻgʻri player ochiladi.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-card/60 p-5 text-center transition-colors hover:border-primary/50">
                      <UploadCloud className="h-8 w-8 text-primary mb-2" />
                      <div className="text-[13px] font-semibold text-foreground">
                        Video faylni tanlang yoki shu yerga tashlang
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        MP4, WebM, MOV formatlar (Maksimal 500 MB)
                      </p>

                      <label className="mt-3 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-[12px] font-semibold text-background hover:bg-primary hover:text-white transition-colors">
                        <span>Fayl tanlash</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                          disabled={uploadingVideo}
                        />
                      </label>
                    </div>

                    {uploadingVideo && (
                      <div className="flex items-center gap-2 text-[12px] text-primary font-medium animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{uploadProgress}</span>
                      </div>
                    )}

                    {!uploadingVideo && lessonForm.videoUrl && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/70 text-[12px]">
                        <div className="flex items-center gap-2 truncate font-mono text-foreground">
                          <Film className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="truncate">{lessonForm.videoUrl}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLessonForm({ ...lessonForm, videoUrl: '' })}
                          className="text-destructive font-semibold hover:underline ml-2 cursor-pointer"
                        >
                          Oʻchirish
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TARTIB RAQAMI VA SOZLAMALAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                    Tartib raqami
                  </label>
                  <input
                    type="number"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border/70 bg-secondary/30 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonForm.isFree}
                      onChange={(e) => setLessonForm({ ...lessonForm, isFree: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <span>Bepul sinov darsi (Free preview)</span>
                  </label>

                  {editingLessonId && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonForm.isPublished}
                        onChange={(e) => setLessonForm({ ...lessonForm, isPublished: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                      <span>Dars faol (Published)</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingVideo}
                  className="px-5 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>
                    {submitting
                      ? 'Saqlanmoqda...'
                      : editingLessonId
                      ? 'Saqlash'
                      : 'Dars yaratish'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETION REQUEST MODAL (TEACHER CANNOT DELETE DIRECTLY) */}
      {deleteRequestLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Darsni oʻchirish soʻrovi
              </h3>
              <button
                type="button"
                onClick={() => setDeleteRequestLesson(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
              <p className="font-bold">Xavfsizlik qoidasi:</p>
              <p className="text-[11px] leading-relaxed">
                Oʻquvchilar progressi va maʼlumotlar yoʻqolib ketishining oldini olish maqsadida, darslar faqat <strong>Admin tasdigʻi</strong> bilan oʻchiriladi. Soʻrov yuborilgach, dars vaqtincha nofaol qilinadi.
              </p>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-muted-foreground">Oʻchiriladigan dars:</p>
              <p className="font-bold text-foreground">
                №{deleteRequestLesson.order}: {deleteRequestLesson.title}
              </p>
            </div>

            <form onSubmit={handleSubmitDeletionRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Oʻchirish sababini koʻrsating (Admin koʻrishi uchun):
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Masalan: Darsda xatolik bor, yangi formatda qayta yuklanadi..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-destructive/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteRequestLesson(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting || !deleteReason.trim()}
                  className="px-5 py-2 rounded-xl bg-destructive text-xs font-bold text-destructive-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Yuborilmoqda...' : 'Soʻrovni yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
