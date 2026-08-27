'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Layers,
  ListFilter,
  Check,
  Star,
  MessageCircle,
  HelpCircle,
  Clock,
  Compass,
  Video,
  Trophy,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { api, CourseDetailsResponse, CourseLessonSummary } from '@/lib/api';
import { useLang } from '@/lib/i18n';

export default function CourseRoadmapPage() {
  const { lang } = useLang();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = React.useState<CourseDetailsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'roadmap' | 'list'>('roadmap');
  const [selectedLesson, setSelectedLesson] = React.useState<CourseLessonSummary | null>(null);

  React.useEffect(() => {
    async function loadDetails() {
      try {
        const data = await api.getCourseDetails(courseId);
        setCourse(data);
      } catch (err: any) {
        setError(err.message || 'Kursni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-[14px] text-muted-foreground">Kurs xaritasi yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4">
        <div className="text-destructive font-semibold">{error || 'Kurs topilmadi'}</div>
        <Link
          href={`/${lang}/dashboard/courses`}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-[14px] font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kurslar roʻyxatiga qaytish</span>
        </Link>
      </div>
    );
  }

  const moduleThemeIcons = ['⛩️', '🏯', '🗻', '🌸', '🎋', '🎏'];

  return (
    <div className="max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-500 pb-28">
      {/* Back Button & Course Header */}
      <div className="space-y-4">
        <Link
          href={`/${lang}/dashboard/courses`}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Barcha kurslar</span>
        </Link>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-secondary/40 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-xl bg-primary/10 px-3 py-1 text-[12px] font-bold text-primary">
                  JLPT {course.level}
                </span>
                <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {course.completedLessons} / {course.totalLessons} dars yakunlangan
                </span>
              </div>
              <h1 className="headline text-[26px] sm:text-[34px] font-bold text-foreground tracking-tight">
                {course.title}
              </h1>
              <p className="text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed">
                {course.description}
              </p>

              {/* Author / Teacher Badge */}
              <div className="flex items-center gap-2.5 pt-2">
                {course.author?.avatarUrl ? (
                  <img
                    src={course.author.avatarUrl}
                    alt={course.author.fullName || 'Ustoz'}
                    className="h-7 w-7 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary text-[11px] font-bold">
                    {course.author?.fullName ? course.author.fullName.charAt(0) : 'M'}
                  </div>
                )}
                <div className="text-[13px]">
                  <span className="text-muted-foreground">Kurs muallifi: </span>
                  <span className="font-semibold text-foreground">
                    {course.author?.fullName || 'MinnaUz Sensei (Rasmiy)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Progress Widget */}
            <div className="flex md:flex-col items-center justify-between md:justify-center gap-3 p-5 rounded-2xl bg-secondary/70 border border-border/80 min-w-[210px] shadow-xs">
              <div className="text-left md:text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Umumiy progress
                </div>
                <div className="text-[32px] font-extrabold text-primary mt-0.5 font-mono">
                  {course.progressPercent}%
                </div>
              </div>
              <div className="h-2.5 w-36 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[#0077ed] rounded-full transition-all duration-700"
                  style={{ width: `${course.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher: Roadmap vs List */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('roadmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
              viewMode === 'roadmap'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Interaktiv Xarita (Roadmap)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListFilter className="h-4 w-4" />
            <span>Klassik Roʻyxat</span>
          </button>
        </div>

        <div className="text-[12px] text-muted-foreground hidden sm:flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Darsni boshlash uchun bosqich tugunini bosing</span>
        </div>
      </div>

      {/* GAMIFIED WINDING ROADMAP VIEW */}
      {viewMode === 'roadmap' && (
        <div className="space-y-20 py-4">
          {course.modules.map((mod, moduleIndex) => {
            const completedCount = mod.lessons.filter((l) => l.isCompleted).length;
            const modulePercent =
              mod.lessons.length > 0 ? Math.round((completedCount / mod.lessons.length) * 100) : 0;
            const themeEmoji = moduleThemeIcons[moduleIndex % moduleThemeIcons.length];

            return (
              <div key={mod.id} className="space-y-10 relative">
                {/* Module Stage Gate Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-secondary/80 to-card border border-primary/25 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-card border border-primary/20 text-[28px] shadow-sm">
                        {themeEmoji}
                      </div>
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                          <Layers className="h-3.5 w-3.5" />
                          <span>{moduleIndex + 1}-Bosqich Moduli</span>
                        </div>
                        <h2 className="text-[20px] sm:text-[22px] font-bold text-foreground">
                          {mod.title}
                        </h2>
                        {mod.description && (
                          <p className="text-[13px] text-muted-foreground">{mod.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto bg-card/70 px-4 py-2.5 rounded-2xl border border-border/80">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase text-muted-foreground">Bosqich</div>
                        <div className="text-[13px] font-bold text-foreground">
                          {completedCount}/{mod.lessons.length} dars
                        </div>
                      </div>
                      <div className="h-2.5 w-20 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${modulePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Serpentine Winding Grid Path */}
                <div className="relative max-w-2xl mx-auto py-6">
                  {/* Wavy Lesson Nodes */}
                  <div className="space-y-14 relative z-10">
                    {mod.lessons.map((lesson, idx) => {
                      // Snake pattern: 0: center, 1: -80px (left), 2: -140px (far left), 3: -70px (mid left), 4: 0 (center), 5: +80px (right), etc.
                      const waveOffsets = [
                        'translate-x-0',
                        '-translate-x-14 sm:-translate-x-28',
                        '-translate-x-20 sm:-translate-x-44',
                        '-translate-x-12 sm:-translate-x-24',
                        'translate-x-0',
                        'translate-x-14 sm:translate-x-28',
                        'translate-x-20 sm:translate-x-44',
                        'translate-x-12 sm:translate-x-24',
                      ];
                      const offsetClass = waveOffsets[idx % waveOffsets.length];

                      const isCompleted = lesson.isCompleted;
                      const isCurrent = lesson.status === 'CURRENT';
                      const isLocked = lesson.status === 'LOCKED';

                      return (
                        <div
                          key={lesson.id}
                          className={`flex justify-center transition-all duration-300 ${offsetClass}`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedLesson(lesson)}
                            className="group relative flex flex-col items-center text-center focus:outline-none cursor-pointer"
                          >
                            {/* Animated Pulse Halo for Current Active Lesson */}
                            {isCurrent && (
                              <>
                                <span className="absolute -inset-3 rounded-full bg-primary/25 animate-ping duration-1000" />
                                <span className="absolute -inset-1.5 rounded-full bg-primary/40 animate-pulse" />
                              </>
                            )}

                            {/* 3D-styled Stepping Stone Button */}
                            <div
                              className={`relative grid h-18 w-18 place-items-center rounded-full border-4 shadow-xl transition-all duration-300 group-hover:scale-115 group-active:scale-95 ${
                                isCompleted
                                  ? 'border-emerald-400 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                                  : isCurrent
                                  ? 'border-[#0071e3] bg-gradient-to-br from-[#0071e3] to-[#0055b3] text-white shadow-[#0071e3]/50 ring-4 ring-[#0071e3]/30'
                                  : 'border-border/80 bg-card text-muted-foreground/50 shadow-sm'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="h-8 w-8 stroke-[3.5]" />
                              ) : isCurrent ? (
                                <Play className="h-7 w-7 fill-current ml-1" />
                              ) : (
                                <Lock className="h-6 w-6 stroke-[2]" />
                              )}
                            </div>

                            {/* Star Badge for completed / quiz score */}
                            {isCompleted && (
                              <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-7 w-7 rounded-full bg-amber-400 text-amber-950 shadow-md font-extrabold text-[11px] border-2 border-card animate-bounce">
                                <Star className="h-3.5 w-3.5 fill-current" />
                              </div>
                            )}

                            {/* Node Floating Label */}
                            <div className="mt-3 max-w-[170px] rounded-2xl bg-card/95 backdrop-blur-md px-3.5 py-2 border border-border shadow-md transition-transform group-hover:scale-105">
                              <span className="block text-[11px] font-bold text-primary font-japanese truncate">
                                {lesson.japaneseTitle || `${lesson.order}-dars`}
                              </span>
                              <span className="block text-[12px] font-semibold text-foreground truncate mt-0.5">
                                {lesson.title.replace(/^\d+-dars:?\s*/i, '')}
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KLASSIK RO'YXAT VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {course.modules.map((mod, modIdx) => (
            <div key={mod.id} className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-primary tracking-wider">
                    {modIdx + 1}-Modul
                  </span>
                  <h3 className="text-[18px] font-bold text-foreground">{mod.title}</h3>
                </div>
                <span className="text-[12px] font-medium text-muted-foreground">
                  {mod.lessons.length} ta dars
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {mod.lessons.map((lesson) => {
                  const isCompleted = lesson.isCompleted;
                  const isCurrent = lesson.status === 'CURRENT';
                  const isLocked = lesson.status === 'LOCKED';

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 hover:bg-secondary/40 px-3 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold text-[13px] ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : isCurrent
                              ? 'bg-primary/15 text-primary'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? <Check className="h-5 w-5 stroke-[2.5]" /> : lesson.order}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-primary font-japanese">
                              {lesson.japaneseTitle || `${lesson.order}-dars`}
                            </span>
                            {isCompleted && (
                              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Bajarilgan
                              </span>
                            )}
                          </div>
                          <p className="text-[14px] font-semibold text-foreground">{lesson.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedLesson(lesson)}
                          className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-secondary text-foreground hover:bg-secondary/80"
                        >
                          Tafsilotlar
                        </button>
                        <Link
                          href={`/${lang}/dashboard/courses/${course.slug || course.id}/lessons/${lesson.id}`}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${
                            isLocked
                              ? 'bg-secondary/60 text-muted-foreground cursor-not-allowed opacity-60'
                              : 'bg-foreground text-background hover:bg-primary hover:text-white'
                          }`}
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>{isCompleted ? 'Qayta koʻrish' : 'Boshlash'}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INTERACTIVE LESSON PREVIEW MODAL */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary font-japanese">
                  {selectedLesson.japaneseTitle || `${selectedLesson.order}-dars`}
                </span>
                <h3 className="text-[20px] font-bold text-foreground mt-1">
                  {selectedLesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLesson(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {selectedLesson.summary && (
              <p className="text-[14px] text-muted-foreground leading-relaxed bg-secondary/40 p-3.5 rounded-2xl border border-border/50">
                {selectedLesson.summary}
              </p>
            )}

            {/* 5 Components Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-2xl border border-border bg-secondary/30 p-3 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground">Kotoba</div>
                <div className="text-[16px] font-bold text-foreground mt-0.5">
                  {selectedLesson.counts?.kotobaItems || 12}+ soʻz
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-3 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground">Bunpou</div>
                <div className="text-[16px] font-bold text-foreground mt-0.5">
                  {selectedLesson.counts?.bunpouItems || 4} qoida
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-3 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground">Kanji</div>
                <div className="text-[16px] font-bold text-foreground mt-0.5">
                  {selectedLesson.counts?.kanjiItems || 4} belgi
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-3 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground">Renshuu</div>
                <div className="text-[16px] font-bold text-foreground mt-0.5">
                  {selectedLesson.counts?.renshuuItems || 5} mashq
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLesson(null)}
                className="w-1/3 rounded-xl border border-border py-2.5 text-[14px] font-semibold text-foreground hover:bg-secondary"
              >
                Yopish
              </button>
              <Link
                href={`/${lang}/dashboard/courses/${course.slug || course.id}/lessons/${selectedLesson.id}`}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-[#0071e3] py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-[#0077ed] transition-colors"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{selectedLesson.isCompleted ? 'Qayta oʻrganish' : 'Darsni boshlash'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
