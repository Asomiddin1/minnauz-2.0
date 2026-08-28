'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Flame,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  TrendingUp,
  Award,
  Sparkles,
  Target,
  ArrowRight,
  Clock,
} from 'lucide-react';

import { useLang } from '@/lib/i18n';
import { api, UserDashboardStats, BannerItem, NotificationItem } from '@/lib/api';
import { getNextJLPTCountdown, getNextJLPTExamDate, JLPTCountdown } from '@/lib/jlpt';
import { StudyPlanModal } from '@/components/dashboard/study-plan-modal';
import { NotificationModal } from '@/components/dashboard/notification-modal';

import { DashboardBanner, DashboardSlide } from '@/components/dashboard/dashboard-banner';
import { StreakCalendar } from '@/components/dashboard/streak-calendar';
import {
  DashboardStats,
  ActiveCourseWidget,
  TestsWidget,
  ProgressWidget,
} from '@/components/dashboard/dashboard-widgets';

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Target,
  Award,
  PlayCircle,
  TrendingUp,
  Flame,
  BookOpen,
  CheckCircle2,
};

export function MainDashboard() {
  const { lang } = useLang();
  const [statsData, setStatsData] = React.useState<UserDashboardStats | null>(null);
  const [customBanners, setCustomBanners] = React.useState<BannerItem[]>([]);
  const [dismissedBannerIds, setDismissedBannerIds] = React.useState<string[]>([]);
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationItem | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  // 1 soniyali jonli hisoblagich (Kun, Soat, Daqiqa, Soniya)
  const [countdown, setCountdown] = React.useState<JLPTCountdown>(() => getNextJLPTCountdown());
  const examInfo = React.useMemo(() => getNextJLPTExamDate(), []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getNextJLPTCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load dismissed banners from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('minna_dismissed_banners');
      if (saved) {
        setDismissedBannerIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      const [statsRes, bannersRes] = await Promise.all([
        api.getUserDashboardStats().catch(() => null),
        api.getBanners().catch(() => []),
      ]);

      if (statsRes) {
        setStatsData(statsRes);
        if (statsRes.studyPlan?.isConfigured === false) {
          setIsOnboardingOpen(true);
        }
      }
      if (bannersRes) {
        setCustomBanners(bannersRes);
      }
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        api.logStudyTime(1).catch(() => {});
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleDismissSlide = (slideId: string | number) => {
    const idStr = String(slideId);
    const updated = [...dismissedBannerIds, idStr];
    setDismissedBannerIds(updated);
    try {
      localStorage.setItem('minna_dismissed_banners', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Fallback data
  const studyPlan = statsData?.studyPlan;
  const targetLevel = studyPlan?.targetLevel || 'N5';
  const weeklyGoalHours = studyPlan?.weeklyGoalHours || 4;
  const activeCourse = statsData?.activeCourse;
  const nextLesson = activeCourse?.nextLesson;
  const studyTime = statsData?.studyTime;
  const weeklyProgress = studyTime?.weeklyProgressPercent ?? 75;

  const courseTargetUrl = activeCourse
    ? nextLesson
      ? `/${lang}/dashboard/courses/${activeCourse.slug || activeCourse.id}/lessons/${nextLesson.id}`
      : `/${lang}/dashboard/courses/${activeCourse.slug || activeCourse.id}`
    : `/${lang}/dashboard/courses`;

  // 1. Core Default Dynamic Slides (JLPT olib tashlandi, faqat maqsad qoldi)
  const defaultSlides: DashboardSlide[] = [
    {
      id: 'default-weekly-goal',
      tag: 'Haftalik maqsad',
      tagIcon: Target,
      title: 'Haftalik rejangiz qanday ketyapti?',
      desc: `Siz bu hafta rejangizning ${weeklyProgress}% qismini bajardingiz. Belgilangan maqsadga yetishish uchun oz qoldi!`,
      btnText: "Rejani ko'rish",
      btnUrl: null,
      btnIcon: TrendingUp,
      actionType: 'PLAN_MODAL',
      image: '/banner_art.png',
      isDismissible: false,
    },
  ];

  // 2. Custom Admin Banners
  const convertedCustomSlides: DashboardSlide[] = customBanners
    .filter((b) => !dismissedBannerIds.includes(b.id))
    .map((b) => {
      const isNotifDetail = b.actionType === 'NOTIFICATION_DETAIL';
      const targetUrl =
        isNotifDetail && b.notificationId
          ? `/${lang}/dashboard/notifications/${b.notificationId}`
          : b.btnUrl || null;

      return {
        id: b.id,
        tag: b.tag || 'Eʼlon',
        tagIcon: ICON_MAP[b.tagIcon] || Sparkles,
        title: b.title,
        desc: b.desc,
        btnText: b.btnText || 'Batafsil oʻqish',
        btnUrl: targetUrl,
        btnIcon: ICON_MAP[b.btnIcon] || (isNotifDetail ? PlayCircle : ArrowRight),
        actionType: isNotifDetail && targetUrl ? 'LINK' : b.actionType,
        notification: b.notification || null,
        image: b.image || '/banner_art.png',
        isDismissible: b.isDismissible,
      };
    });

  const allSlides = [...defaultSlides, ...convertedCustomSlides];

  const statsProps = [
    {
      label: 'Streak (kunlar)',
      value: `${statsData?.streakDays || 1} kun`,
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Yodlangan soʻzlar',
      value: `${statsData?.wordsLearned || 0} ta`,
      icon: BookOpen,
      color: 'text-[#0071e3] bg-[#0071e3]/10',
    },
    {
      label: 'Yakunlangan darslar',
      value: `${statsData?.completedLessons || 0} / ${statsData?.totalLessons || 25}`,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: `JLPT ${targetLevel} tayyorgarlik`,
      value: `${statsData?.n5ProgressPercent || 0}%`,
      icon: TrendingUp,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
  ];

  const weeklyActivityMock = [
    { day: 'Du', active: false, height: 'h-8' },
    { day: 'Se', active: false, height: 'h-12' },
    { day: 'Ch', active: false, height: 'h-10' },
    { day: 'Pa', active: true, height: 'h-16' },
    { day: 'Ju', active: false, height: 'h-10' },
    { day: 'Sh', active: false, height: 'h-6' },
    { day: 'Ya', active: false, height: 'h-14' },
  ];

  const timeUnits = [
    { label: 'KUN', value: String(countdown.days).padStart(2, '0') },
    { label: 'SOAT', value: String(countdown.hours).padStart(2, '0') },
    { label: 'DAQ', value: String(countdown.minutes).padStart(2, '0') },
    { label: 'SON', value: String(countdown.seconds).padStart(2, '0') },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      <StudyPlanModal
        isOpen={isPlanModalOpen || isOnboardingOpen}
        isOnboarding={isOnboardingOpen}
        initialPlan={studyPlan}
        onClose={() => {
          setIsPlanModalOpen(false);
          setIsOnboardingOpen(false);
        }}
        onSaved={loadData}
      />

      <NotificationModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      {/* 1. DINAMIK BANNER */}
      <DashboardBanner
        slides={allSlides}
        onOpenPlan={() => setIsPlanModalOpen(true)}
        onOpenNotification={(notif) => setSelectedNotification(notif)}
        onDismissSlide={handleDismissSlide}
      />

      {/* 2. ZAMONAVIY JONLI JLPT TIMER PANELI */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-card via-card to-amber-500/5 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              <span>JLPT {countdown.season} Imtihonigacha</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Vaqt ketyapti! Bilimingizni muntazam mustahkamlab boring.
            </h3>
            <p className="text-xs text-muted-foreground">
              Rasmiy imtihon sanasi: <span className="font-semibold text-foreground">{countdown.formattedDate}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {timeUnits.map((unit, index) => (
                <React.Fragment key={unit.label}>
                  <div className="flex flex-col items-center">
                    <div className="min-w-[44px] sm:min-w-[54px] h-12 sm:h-14 flex items-center justify-center rounded-2xl bg-secondary/80 border border-border font-mono text-lg sm:text-2xl font-black text-foreground shadow-inner">
                      {unit.value}
                    </div>
                    <span className="mt-1 text-[9px] sm:text-[10px] font-bold tracking-wider text-muted-foreground">
                      {unit.label}
                    </span>
                  </div>
                  {index < timeUnits.length - 1 && (
                    <span className="text-muted-foreground font-bold text-base sm:text-lg -mt-3.5">:</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <Link
              href={`/${lang}/dashboard/tests`}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-sm"
            >
              <Award className="h-4 w-4" />
              <span>Mock Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. STATISTIKA KARTALARI */}
      <DashboardStats stats={statsProps} />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <ActiveCourseWidget
            activeCourse={activeCourse}
            nextLesson={nextLesson}
            courseTargetUrl={courseTargetUrl}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TestsWidget examInfo={examInfo} targetLevel={targetLevel} lang={lang} />

            <ProgressWidget
              studyTime={studyTime}
              weeklyActivity={studyTime?.weeklyActivity || weeklyActivityMock}
              weeklyGoalHours={weeklyGoalHours}
              weeklyProgress={weeklyProgress}
            />
          </div>
        </div>

        <div className="space-y-6">
          <StreakCalendar
            streakDays={statsData?.streakDays || 1}
            activeDates={statsData?.activeDates || [new Date().getDate()]}
          />
        </div>
      </div>
    </div>
  );
}