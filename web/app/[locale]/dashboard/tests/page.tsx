'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Clock,
  Play,
  HelpCircle,
  Sparkles,
  BookOpen,
  Headphones,
  FileCheck2,
  Trophy,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  Loader2,
  GraduationCap,
  Volume2,
  Eye,
  XCircle,
  History,
  Lock,
  Crown,
  X,
} from 'lucide-react';
import { api, JlptTestItem, JlptTestStats, JlptUserTestHistoryItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { getNextJLPTExamDate } from '@/lib/jlpt';

export default function TestsPage() {
  const { lang, t } = useLang();
  const tpDict = t?.testsPage;
  const { user } = useAuth();
  const isPro = !!user?.isPro;

  const [tests, setTests] = React.useState<JlptTestItem[]>([]);
  const [stats, setStats] = React.useState<JlptTestStats | null>(null);
  const [history, setHistory] = React.useState<JlptUserTestHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [proPromptOpen, setProPromptOpen] = React.useState(false);

  // Tab: 'EXAMS' or 'HISTORY'
  const [activeView, setActiveView] = React.useState<'EXAMS' | 'HISTORY'>('EXAMS');

  // Filter by JLPT level
  const [selectedLevel, setSelectedLevel] = React.useState<string>('ALL');

  const examInfo = React.useMemo(() => getNextJLPTExamDate(), []);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [testsData, statsData, historyData] = await Promise.allSettled([
        api.getJlptTests({ category: 'MOCK_EXAM' }),
        api.getJlptTestStats(),
        api.getJlptTestHistory(30),
      ]);

      if (testsData.status === 'fulfilled') {
        setTests(testsData.value);
      }
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (historyData.status === 'fulfilled') {
        setHistory(historyData.value);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter by level
  const filteredTests = React.useMemo(() => {
    return tests.filter((t) => {
      if (selectedLevel !== 'ALL' && t.level !== selectedLevel) return false;
      return true;
    });
  }, [tests, selectedLevel]);

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'N5':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'N4':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'N3':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'N2':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'N1':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-secondary text-muted-foreground border-border';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-20 animate-in fade-in duration-300">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{tpDict?.badge || 'JLPT 2026 Rasmiy Mock Imtihonlar'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {tpDict?.title || 'Toʻliq JLPT Mock Imtihonlari'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {tpDict?.subtitle ||
                'Haqiqiy Yaponiya imtihoni andozasida 3 ta rasmiy moduldan iborat toʻliq sinov: 1. Lugʻat & Kanji, 2. Grammatika & Oʻqish va 3. Tinglab tushunish (Choukai).'}
            </p>
          </div>

          {/* Exam Countdown Card */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-border/60 bg-card/60 shadow-md min-w-[170px] shrink-0 text-center space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
              <Calendar className="h-4 w-4" />
              <span>{tpDict?.nextExam || 'Keyingi JLPT'}</span>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-amber-500">
              {examInfo.daysRemaining} <span className="text-xs font-medium">{tpDict?.daysUnit || 'kun'}</span>
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              {examInfo.formattedDate}
            </p>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid gap-3 sm:grid-cols-3 pt-2">
          <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3.5 border border-border/40">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                {tpDict?.statsTaken || 'Topshirilgan Mocklar'}
              </p>
              <p className="text-base font-extrabold text-foreground">
                {stats?.totalTestsTaken || 0} {tpDict?.statsTakenUnit || 'ta'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3.5 border border-border/40">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                {tpDict?.statsAvg || 'Oʻrtacha ball'}
              </p>
              <p className="text-base font-extrabold text-emerald-500">
                {stats?.avgPercentage || 0}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3.5 border border-border/40">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                {tpDict?.statsPassed || 'Muvaffaqiyat'}
              </p>
              <p className="text-base font-extrabold text-foreground">
                {stats?.passedCount || 0} {tpDict?.statsPassedUnit || 'ta imtihon'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top View Switcher (Exams vs My History) */}
      <div className="flex items-center gap-3 border-b border-border/50 pb-2">
        <button
          type="button"
          onClick={() => setActiveView('EXAMS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'EXAMS'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{tpDict?.tabExams || t?.tests?.mockExam || 'Mock Imtihonlar'} ({tests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'HISTORY'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <History className="h-4 w-4" />
          <span>{tpDict?.tabHistory || t?.tests?.resultTitle || 'Mening natijalarim tarixi'} ({history.length})</span>
        </button>
      </div>

      {/* VIEW A: HISTORY VIEW */}
      {activeView === 'HISTORY' ? (
        loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-semibold text-muted-foreground">
              {tpDict?.historyLoading || 'Testlar tarixi yuklanmoqda...'}
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
            <History className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              {tpDict?.historyEmptyTitle || 'Topshirilgan testlar yoʻq'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {tpDict?.historyEmptyDesc ||
                'Siz hali birorta ham mock test topshirmadingiz. Imtihonlar roʻyxatidan birini tanlab, bilimingizni sinab koʻring!'}
            </p>
            <button
              type="button"
              onClick={() => setActiveView('EXAMS')}
              className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground cursor-pointer shadow-xs"
            >
              {tpDict?.btnViewExams || 'Imtihonlarni koʻrish'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((h) => (
              <div
                key={h.id}
                className="group rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${getLevelBadgeColor(
                        h.level
                      )}`}
                    >
                      {h.level}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        h.isPassed
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {h.isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      <span>{h.isPassed ? (tpDict?.statusPassed || 'Oʻtdi') : (tpDict?.statusFailed || 'Oʻta olmadi')}</span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {h.testTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {Math.round(h.timeSpentSeconds / 60)} {tpDict?.minutesUnit || 'daqiqa'}
                    </span>
                    <span>•</span>
                    <span>
                      {tpDict?.dateLabel || 'Sana'}:{' '}
                      {new Date(h.completedAt).toLocaleDateString(
                        lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : lang === 'ja' ? 'ja-JP' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="text-left sm:text-right">
                    <p className="text-base sm:text-lg font-extrabold text-foreground">
                      {h.score}{' '}
                      <span className="text-xs text-muted-foreground font-normal">
                        / {h.totalScore} {tpDict?.scoreUnit || 'ball'}
                      </span>
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      {(tpDict?.percentCorrect || '{pct}% toʻgʻri').replace('{pct}', String(h.percentage))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${lang}/dashboard/tests/results/${h.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary text-xs font-bold text-foreground hover:text-primary transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span>{tpDict?.btnViewAnalysis || 'Tahlilni koʻrish'}</span>
                    </Link>

                    {h.testSlug && (
                      <Link
                        href={`/${lang}/dashboard/tests/${h.testSlug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>{tpDict?.btnRetake || 'Qayta'}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {/* 3. Level Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => {
          const isActive = selectedLevel === lvl;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {lvl === 'ALL' ? (tpDict?.allLevels || 'Barcha darajalar') : `JLPT ${lvl}`}
            </button>
          );
        })}
      </div>

      {/* 3. Full Mock Exams List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">
            {tpDict?.examsLoading || 'Mock imtihonlar yuklanmoqda...'}
          </p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
          <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            {tpDict?.examsEmptyTitle || 'Imtihonlar topilmadi'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {tpDict?.examsEmptyDesc ||
              'Tanlangan daraja boʻyicha mock imtihon mavjud emas. Filtrlarni tozalab koʻring.'}
          </p>
          <button
            type="button"
            onClick={() => setSelectedLevel('ALL')}
            className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground cursor-pointer"
          >
            {tpDict?.btnShowAllLevels || 'Barcha darajalarni koʻrsatish'}
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTests.map((t) => {
            const hasTaken = !!t.latestResult;
            const isLocked = t.isPremium && !isPro;

            return (
              <div
                key={t.id}
                className={`group relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:shadow-xs ${
                  isLocked
                    ? 'border-border/60 bg-card/60 hover:border-yellow-500/30'
                    : 'border-border/70 bg-card hover:border-primary/40'
                }`}
              >
                {/* Left: Level badge + Title + compact metadata */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-xl text-xs font-black border ${getLevelBadgeColor(
                        t.level
                      )}`}
                    >
                      {t.level}
                    </span>
                    {t.isPremium ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 text-[10px] font-black border border-yellow-500/25">
                        <Crown className="h-2.5 w-2.5" />
                        <span>{tpDict?.tagPro || 'PRO'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {tpDict?.tagFree || 'Bepul'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {t.title}
                      </h2>
                      {t.audioUrl && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-bold shrink-0">
                          <Headphones className="h-3 w-3" />
                          <span>{tpDict?.badgeAudio || 'Audio'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" />
                        {t.durationMinutes} {tpDict?.minutesShort || 'daq'}
                      </span>
                      <span>•</span>
                      <span>
                        {(tpDict?.questionsCount || '{count} ta savol').replace(
                          '{count}',
                          String(t.questionCount || 0)
                        )}
                      </span>
                      <span>•</span>
                      <span>
                        {(tpDict?.passingRequirement || 'Oʻtish: {pass} ball ({total} dan)')
                          .replace('{pass}', String(t.passingScore))
                          .replace('{total}', String(t.totalScore))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Results status + Action button */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                  {hasTaken && (
                    <div className="text-left md:text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                          t.latestResult?.isPassed
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {t.latestResult?.isPassed ? <CheckCircle2 className="h-3 w-3" /> : null}
                        <span>{t.latestResult?.score}/{t.totalScore} ({t.latestResult?.percentage}%)</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {hasTaken && t.latestResult && (
                      <Link
                        href={`/${lang}/dashboard/tests/results/${t.latestResult.id}`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary text-xs font-bold text-foreground hover:text-primary transition-all active:scale-95 shadow-2xs"
                        title={tpDict?.tooltipPreviousResult || 'Oldingi natijani koʻrish'}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{tpDict?.btnAnalysis || 'Tahlil'}</span>
                      </Link>
                    )}

                    {isLocked ? (
                      <button
                        type="button"
                        onClick={() => setProPromptOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Lock className="h-3.5 w-3.5 text-yellow-500" />
                        <span>{tpDict?.btnProLock || 'Pro Obuna 🔒'}</span>
                      </button>
                    ) : (
                      <Link
                        href={`/${lang}/dashboard/tests/${t.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                      >
                        {hasTaken ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>{tpDict?.btnRetake || 'Qayta'}</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>{tpDict?.btnStart || 'Boshlash'}</span>
                          </>
                        )}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Pro Subscription Prompt Modal */}
      {proPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setProPromptOpen(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="h-16 w-16 rounded-3xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shadow-inner">
                <Crown className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-foreground">
                  {tpDict?.proModal?.title || 'Pro Obuna Talab Qilinadi'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {tpDict?.proModal?.subtitle ||
                    'Ushbu JLPT Mock Imtihoni pullik tarifga mansub. Barcha darajadagi toʻliq imtihonlarni topshirish va natijalarni chuqur tahlil qilish uchun Pro obunani faollashtiring.'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-secondary/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{tpDict?.proModal?.benefit1 || 'Barcha N5 – N1 Mock imtihonlari ochiq'}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{tpDict?.proModal?.benefit2 || 'Toʻliq Choukai audiolari va tushuntirishlar'}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{tpDict?.proModal?.benefit3 || 'Shaxsiy xatolar tahlili va sertifikat'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <Link
                href={`/${lang}/dashboard/premium`}
                onClick={() => setProPromptOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs sm:text-sm font-black transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Crown className="h-4 w-4" />
                <span>{tpDict?.proModal?.btnUpgrade || 'Pro Obunani Faollashtirish'}</span>
              </Link>
              <button
                type="button"
                onClick={() => setProPromptOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer"
              >
                {tpDict?.proModal?.btnCancel || 'Hozircha bekor qilish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
