'use client';

import * as React from 'react';
import {
  Sparkles,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { api, UserStudyPlan } from '@/lib/api';
import { getNextJLPTExamDate } from '@/lib/jlpt';

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: UserStudyPlan | null;
  onSaved?: (newPlan: UserStudyPlan) => void;
  isOnboarding?: boolean;
}

const JLPT_LEVELS = [
  {
    id: 'N5',
    title: 'JLPT N5',
    tag: 'Boshlangʻich',
    desc: 'Hiragana, Katakana, 100+ Kanji va 800+ soʻzlar. Noldan boshlovchilar uchun ideal.',
    hours: '≈ 350 soat',
    color: 'from-blue-500/20 to-blue-600/5 text-blue-500 border-blue-500/30',
    badge: 'Tavsiya etiladi',
  },
  {
    id: 'N4',
    title: 'JLPT N4',
    tag: 'Boshlangʻich-Oʻrta',
    desc: '300+ Kanji, 1,500+ soʻzlar va kundalik suhbat grammatikasi.',
    hours: '≈ 550 soat',
    color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'N3',
    title: 'JLPT N3',
    tag: 'Oʻrta daraja',
    desc: '650+ Kanji va 3,750+ soʻzlar. Yaponiyada ishlash va kundalik erkin muloqot darajasi.',
    hours: '≈ 900 soat',
    color: 'from-amber-500/20 to-amber-600/5 text-amber-500 border-amber-500/30',
  },
  {
    id: 'N2',
    title: 'JLPT N2',
    tag: 'Yuqori daraja',
    desc: '1,000+ Kanji va 6,000+ soʻzlar. Universitet va professional kompaniyalar talabi.',
    hours: '≈ 1,600 soat',
    color: 'from-purple-500/20 to-purple-600/5 text-purple-500 border-purple-500/30',
  },
  {
    id: 'N1',
    title: 'JLPT N1',
    tag: 'Professional',
    desc: '2,000+ Kanji va 10,000+ soʻzlar. Ona tili darajasidagi murakkab yapon tili.',
    hours: '≈ 3,000 soat',
    color: 'from-rose-500/20 to-rose-600/5 text-rose-500 border-rose-500/30',
  },
];

const WEEKLY_GOALS = [
  {
    hours: 2,
    dailyMinutes: 15,
    title: 'Yengil reja',
    pace: '15-20 daqiqa / kun',
    desc: 'Boʻsh vaqtda, shoshilmasdan oʻrganish uchun.',
    icon: Clock,
  },
  {
    hours: 4,
    dailyMinutes: 35,
    title: 'Optimal reja',
    pace: '35-40 daqiqa / kun',
    desc: 'Eng samarali va mustahkam natija beruvchi reja.',
    icon: Flame,
    recommended: true,
  },
  {
    hours: 7,
    dailyMinutes: 60,
    title: 'Intensiv reja',
    pace: '1 soat / kun',
    desc: 'Yaqin oylarda imtihon topshirmoqchi boʻlganlar uchun.',
    icon: Zap,
  },
  {
    hours: 10,
    dailyMinutes: 90,
    title: 'Super intizom',
    pace: '1.5 - 2 soat / kun',
    desc: 'Maksimal tezlikda yapon tilini zabt etish.',
    icon: Award,
  },
];

const TIMELINE_OPTIONS = [
  { months: 3, label: '3 oyda', note: 'Tezlashtirilgan tayyorgarlik' },
  { months: 6, label: '6 oyda', note: 'Standart va qulay surʼat (Tavsiya)' },
  { months: 12, label: '1 yilda', note: 'Chuqurlashtirilgan toʻliq kurs' },
];

export function StudyPlanModal({
  isOpen,
  onClose,
  initialPlan,
  onSaved,
  isOnboarding = false,
}: StudyPlanModalProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [targetLevel, setTargetLevel] = React.useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>(
    (initialPlan?.targetLevel as any) || 'N5',
  );
  const [weeklyHours, setWeeklyHours] = React.useState<number>(
    initialPlan?.weeklyGoalHours || 4,
  );
  const [dailyMinutes, setDailyMinutes] = React.useState<number>(
    initialPlan?.dailyMinutes || 35,
  );
  const [targetMonths, setTargetMonths] = React.useState<number>(
    initialPlan?.targetMonths || 6,
  );
  const [saving, setSaving] = React.useState(false);

  const examInfo = React.useMemo(() => getNextJLPTExamDate(), []);

  React.useEffect(() => {
    if (initialPlan) {
      if (initialPlan.targetLevel) setTargetLevel(initialPlan.targetLevel as any);
      if (initialPlan.weeklyGoalHours) setWeeklyHours(initialPlan.weeklyGoalHours);
      if (initialPlan.dailyMinutes) setDailyMinutes(initialPlan.dailyMinutes);
      if (initialPlan.targetMonths) setTargetMonths(initialPlan.targetMonths);
    }
  }, [initialPlan]);

  if (!isOpen) return null;

  const handleSelectGoal = (hours: number, mins: number) => {
    setWeeklyHours(hours);
    setDailyMinutes(mins);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const planData: UserStudyPlan = {
        targetLevel,
        weeklyGoalHours: weeklyHours,
        dailyMinutes,
        targetMonths,
        isConfigured: true,
      };
      await api.saveStudyPlan(planData);
      if (onSaved) onSaved(planData);
      onClose();
    } catch (e) {
      console.error('Failed to save study plan:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with progress */}
        <div className="border-b border-border px-6 py-5 sm:px-8 flex items-center justify-between bg-secondary/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0071e3]">
                <Sparkles className="h-3 w-3" />
                <span>{isOnboarding ? 'Xush kelibsiz · Onboarding' : 'Shaxsiy Reja'}</span>
              </span>
              <span className="text-[12px] font-medium text-muted-foreground">
                {step} / 3-qadam
              </span>
            </div>
            <h2 className="headline text-[20px] sm:text-[22px] font-bold text-foreground mt-1">
              {step === 1 && 'Maqsad JLPT darajangizni tanlang'}
              {step === 2 && 'Haftada necha soat dars qilasiz?'}
              {step === 3 && 'Tayyorgarlik muddati va Imtihon'}
            </h2>
          </div>

          {!isOnboarding && (
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Step Content */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8 space-y-6 flex-1">
          
          {/* STEP 1: JLPT Level */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[13px] text-muted-foreground">
                Oʻrganmoqchi boʻlgan darajangizni belgilang. Dashboard va darslar shu darajaga moslashadi:
              </p>

              <div className="grid gap-3 sm:grid-cols-1">
                {JLPT_LEVELS.map((lvl) => {
                  const isSelected = targetLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setTargetLevel(lvl.id as any)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-[#0071e3] bg-[#0071e3]/5 shadow-xs ring-2 ring-[#0071e3]/30'
                          : 'border-border bg-card hover:bg-secondary/40 hover:border-foreground/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-bold text-[16px] bg-gradient-to-br border ${lvl.color}`}
                        >
                          {lvl.id}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-semibold text-foreground">
                              {lvl.title}
                            </h3>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {lvl.tag}
                            </span>
                            {lvl.badge && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                                {lvl.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">
                            {lvl.desc}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          {lvl.hours}
                        </span>
                        <div
                          className={`mt-1 h-5 w-5 rounded-full border grid place-items-center ml-auto ${
                            isSelected
                              ? 'border-[#0071e3] bg-[#0071e3] text-white'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 fill-current" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Weekly Hours */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[13px] text-muted-foreground">
                Oʻzingizga qulay dars jadvalini tanlang. Haftalik maqsad shu asosda hisoblanadi:
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {WEEKLY_GOALS.map((goal) => {
                  const isSelected = weeklyHours === goal.hours;
                  const Icon = goal.icon;
                  return (
                    <button
                      key={goal.hours}
                      type="button"
                      onClick={() => handleSelectGoal(goal.hours, goal.dailyMinutes)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'border-[#0071e3] bg-[#0071e3]/5 shadow-xs ring-2 ring-[#0071e3]/30'
                          : 'border-border bg-card hover:bg-secondary/40 hover:border-foreground/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                          <Icon className="h-5 w-5" />
                        </div>
                        {goal.recommended && (
                          <span className="rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#0071e3]">
                            Tavsiya
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-[16px] font-bold text-foreground">{goal.title}</p>
                        <p className="headline text-[22px] font-bold text-[#0071e3] mt-0.5">
                          {goal.hours} soat <span className="text-[13px] font-normal text-muted-foreground">/ hafta</span>
                        </p>
                        <p className="text-[12px] font-semibold text-foreground/90 mt-1">
                          {goal.pace}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">{goal.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Timeline & JLPT Exam Countdown */}
          {step === 3 && (
            <div className="space-y-5">
              {/* JLPT Exam Banner */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span className="text-[12px] font-bold uppercase tracking-wider text-amber-500">
                    Rasmiy JLPT Imtihoni Countdown
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h3 className="headline text-[22px] font-bold text-foreground">
                      {examInfo.formattedDate}
                    </h3>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      JLPT {examInfo.season} imtihoni (Oyning 1-yakshanbasi)
                    </p>
                  </div>
                  <div className="inline-flex items-baseline gap-1 rounded-xl bg-amber-500/20 px-3.5 py-1.5 text-amber-500 font-bold text-[18px]">
                    <span>{examInfo.daysRemaining}</span>
                    <span className="text-[12px] font-semibold">kun qoldi</span>
                  </div>
                </div>
              </div>

              {/* Target timeline */}
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-foreground">
                  Qaysi muddatda {targetLevel} darajasiga toʻliq yetishmoqchisiz?
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {TIMELINE_OPTIONS.map((opt) => {
                    const isSelected = targetMonths === opt.months;
                    return (
                      <button
                        key={opt.months}
                        type="button"
                        onClick={() => setTargetMonths(opt.months)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0071e3] bg-[#0071e3]/5 shadow-xs ring-2 ring-[#0071e3]/30'
                            : 'border-border bg-card hover:bg-secondary/40'
                        }`}
                      >
                        <p className="text-[16px] font-bold text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{opt.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plan Summary Preview */}
              <div className="rounded-2xl bg-secondary/40 p-4 border border-border/50 space-y-2">
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Sizning yakuniy rejangiz
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="rounded-xl bg-card p-2 border border-border/50">
                    <span className="text-[11px] text-muted-foreground block">Maqsad</span>
                    <span className="text-[14px] font-bold text-[#0071e3]">{targetLevel}</span>
                  </div>
                  <div className="rounded-xl bg-card p-2 border border-border/50">
                    <span className="text-[11px] text-muted-foreground block">Haftalik</span>
                    <span className="text-[14px] font-bold text-foreground">{weeklyHours} soat</span>
                  </div>
                  <div className="rounded-xl bg-card p-2 border border-border/50">
                    <span className="text-[11px] text-muted-foreground block">Kunlik</span>
                    <span className="text-[14px] font-bold text-foreground">{dailyMinutes} daq</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-border px-6 py-4 sm:px-8 flex items-center justify-between bg-secondary/20">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Orqaga</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-6 py-2 text-[13px] font-semibold text-white hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all shadow-xs"
            >
              <span>Keyingisi</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-7 py-2.5 text-[14px] font-bold text-white hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Rejani tasdiqlash</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
