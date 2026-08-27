'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Layers,
  BookOpen,
  Trash2,
  Edit,
  Clock,
  Play,
  FileText,
  PenTool,
  HelpCircle,
  Eye,
  Video,
  UploadCloud,
  Film,
  CheckCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n';

function YoutubeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function AdminCourseModulesPage() {
  const { lang } = useLang();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Module modal
  const [moduleModalOpen, setModuleModalOpen] = React.useState(false);
  const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null);
  const [moduleForm, setModuleForm] = React.useState({ title: '', description: '', order: 1 });

  // Lesson modal
  const [lessonModalOpen, setLessonModalOpen] = React.useState(false);
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = React.useState<string | null>(null);
  const [videoSourceType, setVideoSourceType] = React.useState<'youtube' | 'upload'>('youtube');
  const [uploadingVideo, setUploadingVideo] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null);

  const [lessonForm, setLessonForm] = React.useState({
    title: '',
    japaneseTitle: '',
    slug: '',
    summary: '',
    videoUrl: '',
    order: 1,
  });

  const loadCourse = async () => {
    try {
      const data = await api.getAdminCourse(courseId);
      setCourse(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCourse();
  }, [courseId]);

  // Open Create/Edit Module modal
  const openModuleModal = (mod?: any) => {
    if (mod) {
      setEditingModuleId(mod.id);
      setModuleForm({
        title: mod.title || '',
        description: mod.description || '',
        order: mod.order || 1,
      });
    } else {
      setEditingModuleId(null);
      setModuleForm({
        title: '',
        description: '',
        order: (course?.modules?.length || 0) + 1,
      });
    }
    setModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.title) return;
    try {
      if (editingModuleId) {
        await api.updateAdminModule(courseId, editingModuleId, moduleForm);
      } else {
        await api.createAdminModule(courseId, moduleForm);
      }
      setModuleModalOpen(false);
      await loadCourse();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Modul va uning barcha darslarini oʻchirmoqchimisiz?')) return;
    try {
      await api.deleteAdminModule(courseId, moduleId);
      await loadCourse();
    } catch (e) {
      console.error(e);
    }
  };

  // Open Create/Edit Lesson modal
  const openLessonModal = (moduleId: string, lesson?: any) => {
    setSelectedModuleId(moduleId);
    if (lesson) {
      setEditingLessonId(lesson.id);
      const isUpload = lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/');
      setVideoSourceType(isUpload ? 'upload' : 'youtube');
      setLessonForm({
        title: lesson.title || '',
        japaneseTitle: lesson.japaneseTitle || '',
        slug: lesson.slug || '',
        summary: lesson.summary || '',
        videoUrl: lesson.videoUrl || '',
        order: lesson.order || 1,
      });
    } else {
      setEditingLessonId(null);
      setVideoSourceType('youtube');
      const currentModule = course?.modules?.find((m: any) => m.id === moduleId);
      setLessonForm({
        title: '',
        japaneseTitle: '',
        slug: '',
        summary: '',
        videoUrl: '',
        order: (currentModule?.lessons?.length || 0) + 1,
      });
    }
    setLessonModalOpen(true);
  };

  // Video File Upload Handler
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 500MB
    if (file.size > 500 * 1024 * 1024) {
      alert('Video fayl hajmi 500 MB dan oshmasligi kerak');
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(`Yuklanmoqda: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      const res = await api.uploadVideo(file);
      setLessonForm((prev) => ({ ...prev, videoUrl: res.url }));
      setUploadProgress(`Muvaffaqiyatli yuklandi: ${res.originalName}`);
    } catch (err: any) {
      alert(err.message || 'Video yuklashda xatolik yuz berdi');
      setUploadProgress(null);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId || !lessonForm.title) return;
    try {
      if (editingLessonId) {
        await api.updateAdminLesson(courseId, editingLessonId, lessonForm);
      } else {
        await api.createAdminLesson(courseId, selectedModuleId, lessonForm);
      }
      setLessonModalOpen(false);
      await loadCourse();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Darsni oʻchirmoqchimisiz?')) return;
    try {
      await api.deleteAdminLesson(courseId, lessonId);
      await loadCourse();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href={`/${lang}/admin/courses`}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kurslar roʻyxatiga qaytish</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                JLPT {course?.level}
              </span>
              <h1 className="headline text-[24px] font-bold text-foreground">
                {course?.title}
              </h1>
            </div>
            <p className="text-[14px] text-muted-foreground mt-0.5">
              Modullar, darslar, video darsliklar va oʻquv materiallarini boshqarish
            </p>
          </div>

          <button
            type="button"
            onClick={() => openModuleModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-2 text-[13px] font-semibold text-white shadow-md hover:bg-[#0077ed]"
          >
            <Plus className="h-4 w-4" />
            <span>Yangi modul qoʻshish</span>
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {course?.modules?.map((mod: any, mIdx: number) => (
          <div
            key={mod.id}
            className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4"
          >
            {/* Module Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase text-primary tracking-wider">
                    {mIdx + 1}-Modul
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-foreground">{mod.title}</h3>
                {mod.description && (
                  <p className="text-[13px] text-muted-foreground mt-0.5">{mod.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => openLessonModal(mod.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-[12px] font-semibold hover:bg-primary/90 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Dars qoʻshish</span>
                </button>
                <button
                  type="button"
                  onClick={() => openModuleModal(mod)}
                  className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 text-[12px]"
                  title="Modulni tahrirlash"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteModule(mod.id)}
                  className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Modulni oʻchirish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lessons Inside Module */}
            <div className="divide-y divide-border/60">
              {mod.lessons?.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-muted-foreground">
                  Ushbu modulda hozircha darslar yoʻq. "Dars qoʻshish" tugmasini bosing.
                </div>
              ) : (
                mod.lessons?.map((lesson: any) => {
                  const hasVideo = !!lesson.videoUrl;
                  const isUploadedVideo = hasVideo && lesson.videoUrl.startsWith('/uploads/');

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-secondary/30 px-3 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-[12px]">
                          {lesson.order}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-primary font-japanese">
                              {lesson.japaneseTitle || `${lesson.order}-dars`}
                            </span>
                            {hasVideo && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                                {isUploadedVideo ? <Film className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                                <span>{isUploadedVideo ? 'Server video' : 'YouTube'}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-[14px] font-semibold text-foreground">{lesson.title}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Content summary badges */}
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium mr-2 hidden md:flex">
                          <span>{lesson._count?.kotobaItems || 0} Kotoba</span> •
                          <span>{lesson._count?.bunpouItems || 0} Bunpou</span> •
                          <span>{lesson._count?.kanjiItems || 0} Kanji</span> •
                          <span>{lesson._count?.renshuuItems || 0} Renshuu</span>
                        </div>

                        {/* Edit Lesson Info & Video */}
                        <button
                          type="button"
                          onClick={() => openLessonModal(mod.id, lesson)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-foreground text-[12px] font-semibold hover:bg-secondary/80 transition-colors"
                          title="Dars nomi va videosini tahrirlash"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Darsni tahrirlash</span>
                        </button>

                        {/* Edit Content Sections (Kotoba, Bunpou, etc) */}
                        <Link
                          href={`/${lang}/admin/courses/${courseId}/lessons/${lesson.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground text-background text-[12px] font-semibold hover:bg-primary hover:text-white transition-colors"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Materiallar</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Darsni oʻchirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODULE MODAL */}
      {moduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-foreground">
                {editingModuleId ? 'Modulni tahrirlash' : 'Yangi modul'}
              </h3>
              <button onClick={() => setModuleModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveModule} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                  Modul nomi *
                </label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="1-Modul: Tanishtiruv va asoslar"
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                  Tavsif
                </label>
                <textarea
                  rows={2}
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Modul mazmuni haqida..."
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                  Tartib raqami
                </label>
                <input
                  type="number"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-border text-[12px] font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LESSON MODAL */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-foreground">
                {editingLessonId ? 'Dars maʼlumotlarini tahrirlash' : 'Yangi dars qoʻshish'}
              </h3>
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                    Dars nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="1-dars: Oʻzini tanishtirish"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                    Yaponcha sarlavha
                  </label>
                  <input
                    type="text"
                    value={lessonForm.japaneseTitle}
                    onChange={(e) => setLessonForm({ ...lessonForm, japaneseTitle: e.target.value })}
                    placeholder="第1課"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-japanese"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                  Qisqacha mazmun (Summary)
                </label>
                <textarea
                  rows={2}
                  value={lessonForm.summary}
                  onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
                  placeholder="Darsda oʻrganiladigan asosiy bilimlar..."
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* VIDEO SECTION (YOUTUBE LINK YOKI SERVERGA UPLOAD) */}
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <label className="text-[12px] font-bold uppercase text-foreground">
                      Dars Videosi (2 xil usul)
                    </label>
                  </div>

                  {/* Video Type Selector */}
                  <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('youtube')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
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
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
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
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      YouTube videoning toʻliq havolasini kiriting. Oʻquvchiga toʻgʻridan-toʻgʻri player ochiladi.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/50 p-5 text-center transition-colors hover:border-primary/50">
                      <UploadCloud className="h-8 w-8 text-primary mb-2" />
                      <div className="text-[13px] font-semibold text-foreground">
                        Video faylni tanlang yoki shu yerga tashlang
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        MP4, WebM, MOV formatlar (Maksimal 500 MB)
                      </p>

                      <label className="mt-3 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-1.5 text-[12px] font-semibold text-background hover:bg-primary hover:text-white transition-colors">
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
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border text-[12px]">
                        <div className="flex items-center gap-2 truncate font-mono text-foreground">
                          <Film className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="truncate">{lessonForm.videoUrl}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLessonForm({ ...lessonForm, videoUrl: '' })}
                          className="text-destructive font-semibold hover:underline ml-2"
                        >
                          Oʻchirish
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                    Tartib raqami
                  </label>
                  <input
                    type="number"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={lessonForm.slug}
                    onChange={(e) => setLessonForm({ ...lessonForm, slug: e.target.value })}
                    placeholder="lesson-1"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={uploadingVideo}
                  className="px-5 py-2 rounded-xl bg-[#0071e3] text-white text-[13px] font-semibold shadow-md hover:bg-[#0077ed] disabled:opacity-50"
                >
                  {editingLessonId ? 'Saqlash' : 'Darsni yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
