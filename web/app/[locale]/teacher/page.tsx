'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  Users,
  Bell,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { api, TeacherStatsResponse } from '@/lib/api';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function TeacherDashboardPage() {
  const { lang, t } = useLang();
  const { user } = useAuth();

  const [stats, setStats] = React.useState<TeacherStatsResponse | null>(null);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [statsRes, coursesRes] = await Promise.all([
          api.getTeacherStats(),
          api.getTeacherCourses(),
        ]);
        setStats(statsRes);
        setCourses(coursesRes || []);
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground">
          Oʻqituvchi boshqaruv paneli yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Oʻqituvchi Kabineti</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Xush kelibsiz, {user?.fullName || 'Ustoz'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Oʻzingizga biriktirilgan kurslarni boshqaring, yangi video dars va materiallar qoʻshing, oʻquvchilar progressini kuzatib, ularga fikr-mulohaza yuboring.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/${lang}/teacher/courses`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-95 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span>Kurslarim</span>
            </Link>

            <Link
              href={`/${lang}/teacher/announcements`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/70 bg-card hover:bg-secondary text-xs font-bold text-foreground transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <Bell className="h-4 w-4 text-primary" />
              <span>Eʼlon berish</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Courses */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              Biriktirilgan Kurslar
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {stats?.coursesCount ?? courses.length}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Siz boshqarayotgan kurslar
          </p>
        </div>

        {/* Metric 2: Lessons */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              Jami Darslar
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {stats?.lessonsCount ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Kurslardagi jami darslar soni
          </p>
        </div>

        {/* Metric 3: Active Students */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              Faol Oʻquvchilar
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {stats?.studentsCount ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Darslarni oʻzlashtirayotganlar
          </p>
        </div>

        {/* Metric 4: Tests */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              Yaratilgan Testlar
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {stats?.testsCount ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Mock va amaliy testlar
          </p>
        </div>
      </div>

      {/* 3. Main Content: Courses Preview & Recent Student Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My Courses (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Kurslarim va Darslar</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary font-semibold text-muted-foreground">
                {courses.length} ta
              </span>
            </div>

            <Link
              href={`/${lang}/teacher/courses`}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Barchasini boshqarish</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="text-sm font-bold text-foreground">
                Sizga biriktirilgan kurslar yoʻq
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Admin bilan bogʻlaning yoki sizga kurs biriktirilishini kuting.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {courses.map((course) => {
                const totalLessons = course.modules?.reduce(
                  (sum: number, m: any) => sum + (m.lessons?.length || 0),
                  0
                ) || 0;

                return (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black border border-primary/20">
                          {course.level}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                          {course.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {course.description || 'Kurs tavsifi kiritilmagan'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                        <span>{course.modules?.length || 0} ta modul</span>
                        <span>•</span>
                        <span>{totalLessons} ta dars</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/${lang}/teacher/courses/${course.id}/modules`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs"
                      >
                        <span>Darslarni koʻrish</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Student Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <Users className="h-4 w-4 text-emerald-500" />
              <span>Oxirgi oʻqish faolliklari</span>
            </div>

            <Link
              href={`/${lang}/teacher/students`}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Talabalarim</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-4 space-y-3 shadow-xs">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        src={act.studentAvatar}
                        name={act.studentName}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {act.studentName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          №{act.lessonOrder}: {act.lessonTitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          act.isCompleted
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {act.isCompleted ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Bajarildi</span>
                          </>
                        ) : (
                          <span>Oʻqilmoqda</span>
                        )}
                      </span>
                      <p className="text-[10px] text-muted-foreground pt-0.5">
                        {new Date(act.studiedAt).toLocaleDateString('uz-UZ', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-1">
                <Clock className="h-6 w-6 text-muted-foreground/60 mx-auto" />
                <p className="text-xs font-bold text-foreground">
                  Hozircha faollik yoʻq
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Talabalar darslaringizni oʻqishni boshlaganda shu yerda aks etadi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
