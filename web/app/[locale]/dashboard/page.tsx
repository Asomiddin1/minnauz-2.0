'use client';

import * as React from 'react';
import { Flame, BookOpen, CheckCircle2, PlayCircle, TrendingUp, Award, Sparkles, Calendar as CalendarIcon, Target, ArrowRight } from 'lucide-react';

import { useLang } from '@/lib/i18n';
import { api, UserDashboardStats, UserStudyPlan, BannerItem, NotificationItem } from '@/lib/api';
import { getNextJLPTExamDate } from '@/lib/jlpt';
import { StudyPlanModal } from '@/components/dashboard/study-plan-modal';
import { NotificationModal } from '@/components/dashboard/notification-modal';

// Biz yangi yaratgan komponentlar
import { DashboardBanner, DashboardSlide } from '@/components/dashboard/dashboard-banner';
import { StreakCalendar } from '@/components/dashboard/streak-calendar';
import { DashboardStats, ActiveCourseWidget, TestsWidget, ProgressWidget } from '@/components/dashboard/dashboard-widgets';

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Calendar: CalendarIcon,
  Target,
  Award,
  PlayCircle,
  TrendingUp,
  Flame,
  BookOpen,
  CheckCircle2,
};

export default function DashboardPage() {
  const { lang } = useLang();
  const [statsData, setStatsData] = React.useState<UserDashboardStats | null>(null);
  const [customBanners, setCustomBanners] = React.useState<BannerItem[]>([]);
  const [dismissedBannerIds, setDismissedBannerIds] = React.useState<string[]>([]);
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  const examInfo = React.useMemo(() => getNextJLPTExamDate(), []);

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

  // Ma'lumotlarni yig'ish (Fallback data bilan)
  const studyPlan = statsData?.studyPlan;
  const targetLevel = studyPlan?.targetLevel || 'N5';
  const weeklyGoalHours = studyPlan?.weeklyGoalHours || 4;
  const dailyMinutes = studyPlan?.dailyMinutes || 35;
  const activeCourse = statsData?.activeCourse;
  const nextLesson = activeCourse?.nextLesson;
  const studyTime = statsData?.studyTime;
  const weeklyProgress = studyTime?.weeklyProgressPercent ?? 75;

  const courseTargetUrl = activeCourse
    ? nextLesson
      ? `/${lang}/dashboard/courses/${activeCourse.slug || activeCourse.id}/lessons/${nextLesson.id}`
      : `/${lang}/dashboard/courses/${activeCourse.slug || activeCourse.id}`
    : `/${lang}/dashboard/courses`;

  // 1. Core Default Dynamic Slides
  const defaultSlides: DashboardSlide[] = [
    {
      id: 'default-active-course',
      tag: `MinnaUz 2.0 · ${targetLevel}`,
      tagIcon: Sparkles,
      title: "Yapon tilini oʻrganishni davom ettiramizmi?",
      desc: `Bugungi rejangiz: ${dailyMinutes} daqiqa dars qilish va ${nextLesson ? `"${nextLesson.title}" mavzusini oʻrganish.` : 'yangi soʻzlarni yodlash.'}`,
      btnText: "Darsni davom ettirish",
      btnUrl: courseTargetUrl,
      btnIcon: PlayCircle,
      actionType: 'LINK',
      image: "/banner_art.png",
      isDismissible: false,
    },
    {
      id: 'default-jlpt-countdown',
      tag: `JLPT ${examInfo.season}`,
      tagIcon: CalendarIcon,
      title: `Imtihonga ${examInfo.daysRemaining} kun qoldi!`,
      desc: "Vaqtni boy bermang! Mock testlarni ishlab, o'z bilimingizni sinovdan o'tkazing va imtihonga tayyorlaning.",
      btnText: "Test ishlash",
      btnUrl: `/${lang}/dashboard/tests`,
      btnIcon: Award,
      actionType: 'LINK',
      image: "/banner_art.png",
      isDismissible: false,
    },
    {
      id: 'default-weekly-goal',
      tag: "Haftalik maqsad",
      tagIcon: Target,
      title: "Haftalik rejangiz qanday ketyapti?",
      desc: `Siz bu hafta rejangizning ${weeklyProgress}% qismini bajardingiz. Belgilangan maqsadga yetishish uchun oz qoldi!`,
      btnText: "Rejani ko'rish",
      btnUrl: null,
      btnIcon: TrendingUp,
      actionType: 'PLAN_MODAL',
      image: "/banner_art.png",
      isDismissible: false,
    },
  ];

  // 2. Custom Admin Banners (converted to slides & filtered for dismissed ones)
  const convertedCustomSlides: DashboardSlide[] = customBanners
    .filter((b) => !dismissedBannerIds.includes(b.id))
    .map((b) => {
      const isNotifDetail = b.actionType === 'NOTIFICATION_DETAIL';
      const targetUrl = isNotifDetail && b.notificationId
        ? `/${lang}/dashboard/notifications/${b.notificationId}`
        : (b.btnUrl || null);

      return {
        id: b.id,
        tag: b.tag || 'Eʼlon',
        tagIcon: ICON_MAP[b.tagIcon] || Sparkles,
        title: b.title,
        desc: b.desc,
        btnText: b.btnText || 'Batafsil oʻqish',
        btnUrl: targetUrl,
        btnIcon: ICON_MAP[b.btnIcon] || (isNotifDetail ? PlayCircle : ArrowRight),
        actionType: (isNotifDetail && targetUrl) ? 'LINK' : b.actionType,
        notification: b.notification || null,
        image: b.image || '/banner_art.png',
        isDismissible: b.isDismissible,
      };
    });

  const allSlides = [...defaultSlides, ...convertedCustomSlides];

  const statsProps = [
    { label: 'Streak (kunlar)', value: `${statsData?.streakDays || 1} kun`, icon: Flame, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Yodlangan soʻzlar', value: `${statsData?.wordsLearned || 0} ta`, icon: BookOpen, color: 'text-[#0071e3] bg-[#0071e3]/10' },
    { label: 'Yakunlangan darslar', value: `${statsData?.completedLessons || 0} / ${statsData?.totalLessons || 25}`, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: `JLPT ${targetLevel} tayyorgarlik`, value: `${statsData?.n5ProgressPercent || 0}%`, icon: TrendingUp, color: 'text-indigo-500 bg-indigo-500/10' },
  ];

  const weeklyActivityMock = [
    { day: 'Du', active: false, height: 'h-8' }, { day: 'Se', active: false, height: 'h-12' },
    { day: 'Ch', active: false, height: 'h-10' }, { day: 'Pa', active: true, height: 'h-16' },
    { day: 'Ju', active: false, height: 'h-10' }, { day: 'Sh', active: false, height: 'h-6' },
    { day: 'Ya', active: false, height: 'h-14' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Study Plan Modal */}
      <StudyPlanModal
        isOpen={isPlanModalOpen || isOnboardingOpen}
        isOnboarding={isOnboardingOpen}
        initialPlan={studyPlan}
        onClose={() => { setIsPlanModalOpen(false); setIsOnboardingOpen(false); }}
        onSaved={loadData}
      />

      {/* Rich Notification Modal */}
      <NotificationModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      {/* 1. DINAMIK & ADMIN BANNER */}
      <DashboardBanner 
        slides={allSlides} 
        onOpenPlan={() => setIsPlanModalOpen(true)}
        onOpenNotification={(notif) => setSelectedNotification(notif)}
        onDismissSlide={handleDismissSlide}
      />

      {/* 2. STATISTIKA KARTALARI */}
      <DashboardStats stats={statsProps} />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          {/* 3. JORIY KURS */}
          <ActiveCourseWidget 
            activeCourse={activeCourse} 
            nextLesson={nextLesson} 
            courseTargetUrl={courseTargetUrl} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 4. MOCK TESTLAR */}
            <TestsWidget examInfo={examInfo} targetLevel={targetLevel} lang={lang} />
            
            {/* 5. HAFTALIK PROGRESS */}
            <ProgressWidget 
              studyTime={studyTime} 
              weeklyActivity={studyTime?.weeklyActivity || weeklyActivityMock} 
              weeklyGoalHours={weeklyGoalHours} 
              weeklyProgress={weeklyProgress} 
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* 6. KALENDAR */}
          <StreakCalendar 
            streakDays={statsData?.streakDays || 1} 
            activeDates={statsData?.activeDates || [(new Date()).getDate()]} 
          />
        </div>
      </div>
    </div>
  );
}