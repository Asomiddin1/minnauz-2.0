'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RotateCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Play,
  Award,
  Layers,
  FileText,
  PenTool,
  Check,
  X,
  MessageSquare,
  Bot,
  Lightbulb,
  Video,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Film,
} from 'lucide-react';
import { api, LessonDetailsResponse, KotobaItem, BunpouItem, KanjiItem, RenshuuItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';

type TabKey = 'kotoba' | 'bunpou' | 'kanji' | 'renshuu' | 'kaiwa';

export default function LessonPlayerPage() {
  const { lang } = useLang();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = React.useState<LessonDetailsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabKey>('kotoba');

  // Video Player state
  const [videoOpen, setVideoOpen] = React.useState(true);
  const [theaterMode, setTheaterMode] = React.useState(false);

  // Kotoba Flashcard state
  const [flashcardIndex, setFlashcardIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [showFurigana, setShowFurigana] = React.useState(true);
  const [kotobaViewMode, setKotobaViewMode] = React.useState<'flashcard' | 'list'>('flashcard');

  // Renshuu Quiz state
  const [quizAnswers, setQuizAnswers] = React.useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);
  const [quizScore, setQuizScore] = React.useState<number | null>(null);

  // Completed tabs
  const [completedSections, setCompletedSections] = React.useState<string[]>([]);
  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    async function loadLesson() {
      try {
        const data = await api.getLesson(courseId, lessonId);
        setLesson(data);
        if (data.userProgress) {
          setCompletedSections(data.userProgress.completedSections || []);
          setIsCompleted(data.userProgress.isCompleted);
          if (data.userProgress.quizScore !== null && data.userProgress.quizScore !== undefined) {
            setQuizScore(data.userProgress.quizScore);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Darsni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [courseId, lessonId]);

  // Audio Speech Synthesis for Japanese
  const playJapaneseAudio = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const markSectionCompleted = async (section: TabKey, nextTab?: TabKey) => {
    const updated = Array.from(new Set([...completedSections, section]));
    setCompletedSections(updated);

    try {
      await api.updateLessonProgress(courseId, lessonId, {
        completedSections: updated,
      });
    } catch (e) {
      console.error(e);
    }

    if (nextTab) {
      setActiveTab(nextTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuizOptionSelect = (qIdx: number, option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const submitQuiz = async () => {
    if (!lesson) return;
    const questions = lesson.content.renshuu;
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    const updated = Array.from(new Set([...completedSections, 'renshuu']));
    setCompletedSections(updated);
    setIsCompleted(score >= 70);

    try {
      await api.updateLessonProgress(courseId, lessonId, {
        completedSections: updated,
        quizScore: score,
        isCompleted: score >= 70,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to extract YouTube embed URL
  const getYouTubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
  };

  // Helper to resolve video source
  const getResolvedVideoUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const baseUrl = rawApiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-[14px] text-muted-foreground">Dars yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4">
        <div className="text-destructive font-semibold">{error || 'Dars topilmadi'}</div>
        <Link
          href={`/${lang}/dashboard/courses/${courseId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-[14px] font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kurs xaritasiga qaytish</span>
        </Link>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: any; count?: number }[] = [
    { key: 'kotoba', label: '1. Kotoba (Lugʻat)', icon: BookOpen, count: lesson.content.kotoba.length },
    { key: 'bunpou', label: '2. Bunpou (Grammatika)', icon: FileText, count: lesson.content.bunpou.length },
    { key: 'kanji', label: '3. Kanji (Iyerogliflar)', icon: PenTool, count: lesson.content.kanji.length },
    { key: 'renshuu', label: '4. Renshuu (Mashqlar)', icon: HelpCircle, count: lesson.content.renshuu.length },
    { key: 'kaiwa', label: '5. Kaiwa (AI Dialog)', icon: Bot },
  ];

  const hasVideo = !!lesson.videoUrl;
  const ytEmbed = getYouTubeEmbedUrl(lesson.videoUrl);
  const resolvedVideoSrc = getResolvedVideoUrl(lesson.videoUrl);

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 pb-28 ${theaterMode ? 'max-w-7xl' : 'max-w-[1040px]'} mx-auto transition-all`}>
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <Link
            href={`/${lang}/dashboard/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{lesson.module.courseTitle} • {lesson.module.title}</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary font-japanese">
              {lesson.japaneseTitle || `${lesson.order}-dars`}
            </span>
            <h1 className="headline text-[20px] sm:text-[24px] font-bold text-foreground">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Prev / Next Navigation Buttons */}
        <div className="flex items-center gap-2">
          {lesson.navigation.prevLesson && (
            <Link
              href={`/${lang}/dashboard/courses/${courseId}/lessons/${lesson.navigation.prevLesson.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Oldingi dars</span>
            </Link>
          )}
          {lesson.navigation.nextLesson && (
            <Link
              href={`/${lang}/dashboard/courses/${courseId}/lessons/${lesson.navigation.nextLesson.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
            >
              <span className="hidden sm:inline">Keyingi dars</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* DEDICATED THEATRE VIDEO SECTION (IF LESSON HAS VIDEO) */}
      {hasVideo && (
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-md">
          <div className="flex items-center justify-between p-3.5 bg-secondary/50 border-b border-border/70">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
                <Video className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-bold text-foreground">
                Videodarslik (Video Maʼruza)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheaterMode(!theaterMode)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                title={theaterMode ? 'Kichik ekran' : 'Katta ekran'}
              >
                {theaterMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                <span>{theaterMode ? 'Normal rejim' : 'Katta rejim'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoOpen(!videoOpen)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {videoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>{videoOpen ? 'Yashirish' : 'Koʻrsatish'}</span>
              </button>
            </div>
          </div>

          {videoOpen && (
            <div className="relative aspect-video w-full bg-black">
              {ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : resolvedVideoSrc ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  src={resolvedVideoSrc}
                  className="w-full h-full object-contain"
                >
                  Brauzeringiz ushbu videoni qoʻllab-quvvatlamaydi.
                </video>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* 5-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border/60">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          const isTabDone = completedSections.includes(t.key);

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-foreground text-background shadow-md'
                  : isTabDone
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t.label}</span>
              {isTabDone && !isActive && (
                <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: KOTOBA (LUG'AT) */}
      {activeTab === 'kotoba' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setKotobaViewMode('flashcard')}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors ${
                  kotobaViewMode === 'flashcard' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                }`}
              >
                Flashcard rejimi
              </button>
              <button
                type="button"
                onClick={() => setKotobaViewMode('list')}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors ${
                  kotobaViewMode === 'list' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                }`}
              >
                Roʻyxat ({lesson.content.kotoba.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFurigana(!showFurigana)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
            >
              {showFurigana ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>Furigana: {showFurigana ? 'Yoqilgan' : 'Oʻchirilgan'}</span>
            </button>
          </div>

          {/* FLASHCARD REJIMI */}
          {kotobaViewMode === 'flashcard' && lesson.content.kotoba.length > 0 && (
            <div className="max-w-md mx-auto space-y-6">
              {(() => {
                const item = lesson.content.kotoba[flashcardIndex];
                return (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="relative cursor-pointer min-h-[320px] rounded-3xl border-2 border-border/80 bg-card p-8 shadow-xl flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-primary/40 select-none"
                  >
                    {/* Top Pill */}
                    <div className="w-full flex items-center justify-between text-[12px] text-muted-foreground font-semibold">
                      <span className="rounded-lg bg-secondary px-2.5 py-1">
                        {item.partOfSpeech || 'Soʻz'}
                      </span>
                      <span>{flashcardIndex + 1} / {lesson.content.kotoba.length}</span>
                    </div>

                    {/* Middle: Word & Pronounce */}
                    {!isFlipped ? (
                      <div className="space-y-4 my-auto">
                        {showFurigana && item.furigana && item.furigana !== item.word && (
                          <div className="text-[15px] font-medium text-primary tracking-widest font-japanese">
                            {item.furigana}
                          </div>
                        )}
                        <div className="text-[44px] font-bold text-foreground tracking-wide font-japanese">
                          {item.word}
                        </div>
                        {item.romaji && (
                          <div className="text-[15px] text-muted-foreground font-mono">
                            {item.romaji}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 my-auto animate-in fade-in zoom-in-95">
                        <div className="text-[26px] font-bold text-foreground">
                          {item.meaningUz}
                        </div>
                        {item.sampleSentence && (
                          <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50 text-left space-y-1">
                            <p className="text-[14px] font-semibold text-foreground font-japanese">
                              {item.sampleSentence}
                            </p>
                            {item.sampleSentenceUz && (
                              <p className="text-[12px] text-muted-foreground">
                                {item.sampleSentenceUz}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Controls */}
                    <div className="w-full flex items-center justify-between pt-4 border-t border-border/60">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playJapaneseAudio(item.word);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                        title="Talaffuzni tinglash"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>

                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <RotateCw className="h-3 w-3" />
                        Aylantirish uchun bosing
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Prev / Next Card Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary text-[13px] font-bold text-foreground disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Oldingisi</span>
                </button>
                <button
                  type="button"
                  disabled={flashcardIndex === lesson.content.kotoba.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) => Math.min(lesson.content.kotoba.length - 1, prev + 1));
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white text-[13px] font-bold shadow-md hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
                >
                  <span>Keyingisi</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* LIST REJIMI */}
          {kotobaViewMode === 'list' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {lesson.content.kotoba.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      {showFurigana && item.furigana && item.furigana !== item.word && (
                        <span className="text-[12px] text-primary font-medium font-japanese">{item.furigana}</span>
                      )}
                      <h4 className="text-[20px] font-bold text-foreground font-japanese">{item.word}</h4>
                      {item.romaji && <span className="text-[12px] text-muted-foreground font-mono">{item.romaji}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => playJapaneseAudio(item.word)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="border-t border-border/60 pt-2">
                    <p className="text-[14px] font-semibold text-foreground">{item.meaningUz}</p>
                    {item.sampleSentence && (
                      <p className="text-[12px] text-muted-foreground mt-1 font-japanese">
                        {item.sampleSentence} — <span className="text-[11px] font-sans">{item.sampleSentenceUz}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completion CTA */}
          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => markSectionCompleted('kotoba', 'bunpou')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0071e3] text-white font-bold text-[14px] shadow-lg hover:bg-[#0077ed] transition-all cursor-pointer"
            >
              <span>Lugʻatni oʻzlashtirdim, Grammatikaga oʻtish</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: BUNPOU (GRAMMATIKA) */}
      {activeTab === 'bunpou' && (
        <div className="space-y-8">
          {lesson.content.bunpou.map((item, idx) => (
            <div
              key={item.id}
              className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <h3 className="headline text-[18px] sm:text-[22px] font-bold text-foreground">
                  {item.title}
                </h3>
                <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  {idx + 1}-Qoida
                </span>
              </div>

              {/* Formula / Structure Banner */}
              {item.structure && (
                <div className="rounded-2xl bg-secondary/70 p-4 border border-border flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Grammatik formula:</div>
                    <div className="text-[16px] font-bold text-primary mt-0.5 font-japanese">{item.structure}</div>
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div className="text-[14px] sm:text-[15px] leading-relaxed text-foreground/90 space-y-2">
                <p>{item.explanationUz}</p>
              </div>

              {/* Examples */}
              {item.examples && Array.isArray(item.examples) && item.examples.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                    Namunaviy jumlalar (Reibun):
                  </div>
                  <div className="space-y-2.5">
                    {item.examples.map((ex: any, eIdx: number) => (
                      <div
                        key={eIdx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="text-[15px] font-bold text-foreground font-japanese">
                            {ex.japanese}
                          </div>
                          {ex.romaji && (
                            <div className="text-[12px] text-muted-foreground font-mono">
                              {ex.romaji}
                            </div>
                          )}
                          <div className="text-[13px] font-medium text-primary">
                            {ex.uzbek}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => playJapaneseAudio(ex.japanese)}
                          className="self-end sm:self-auto grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Completion CTA */}
          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => markSectionCompleted('bunpou', 'kanji')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0071e3] text-white font-bold text-[14px] shadow-lg hover:bg-[#0077ed] transition-all cursor-pointer"
            >
              <span>Grammatikani tushundim, Kanjiga oʻtish</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: KANJI (IYEROGLIFLAR) */}
      {activeTab === 'kanji' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {lesson.content.kanji.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors"
              >
                {/* Large Character & Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/10 border border-primary/20 text-[48px] font-bold text-foreground font-japanese select-none">
                      {item.character}
                    </div>
                    <div>
                      <h4 className="text-[18px] font-bold text-foreground">{item.meaningUz}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {item.strokeCount && (
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            {item.strokeCount} ta chiziq
                          </span>
                        )}
                        {item.radical && (
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground font-japanese">
                            Ildiz: {item.radical}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => playJapaneseAudio(item.character)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Readings */}
                <div className="grid grid-cols-2 gap-2 text-[13px] bg-secondary/40 p-3 rounded-2xl border border-border/50">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-muted-foreground">Onʼyomi (Xitoycha):</span>
                    <span className="font-semibold text-foreground font-japanese">{item.onyomi || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-muted-foreground">Kunʼyomi (Yaponcha):</span>
                    <span className="font-semibold text-foreground font-japanese">{item.kunyomi || '—'}</span>
                  </div>
                </div>

                {/* Examples */}
                {item.examples && Array.isArray(item.examples) && item.examples.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground">Birikmalar va soʻzlar:</div>
                    <div className="space-y-1.5">
                      {item.examples.map((ex: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-[13px] py-1">
                          <span className="font-bold text-foreground font-japanese">{ex.word} ({ex.reading})</span>
                          <span className="text-muted-foreground">{ex.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Completion CTA */}
          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => markSectionCompleted('kanji', 'renshuu')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0071e3] text-white font-bold text-[14px] shadow-lg hover:bg-[#0077ed] transition-all cursor-pointer"
            >
              <span>Kanjilarni oʻzlashtirdim, Mashqlarga oʻtish</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: RENSHUU (MASHQLAR & TESTLAR) */}
      {activeTab === 'renshuu' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="headline text-[20px] font-bold text-foreground">
                  Dars Mashqlari va Sinov
                </h3>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Darsni toʻliq yakunlash uchun testni 70% dan yuqori ball bilan topshiring.
                </p>
              </div>
              {quizScore !== null && (
                <div className={`px-3 py-1.5 rounded-xl font-bold text-[14px] ${
                  quizScore >= 70 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/15 text-destructive'
                }`}>
                  Natija: {quizScore}%
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-8">
              {lesson.content.renshuu.map((q, qIdx) => {
                const selected = quizAnswers[qIdx];
                const isCorrect = selected === q.correctAnswer;

                return (
                  <div key={q.id} className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-[12px] mt-0.5">
                          {qIdx + 1}
                        </span>
                        <div className="font-semibold text-foreground whitespace-pre-line text-[15px]">
                          {q.question}
                        </div>
                      </div>
                      {q.type === 'AUDIO_LISTENING' && (
                        <button
                          type="button"
                          onClick={() => playJapaneseAudio(q.question)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid gap-2 pl-8">
                      {q.options && Array.isArray(q.options) && q.options.map((opt: string, optIdx: number) => {
                        const isThisSelected = selected === opt;
                        const showFeedback = quizSubmitted;
                        const isThisCorrect = opt === q.correctAnswer;

                        let style = 'border-border bg-secondary/40 text-foreground hover:bg-secondary';
                        if (isThisSelected) {
                          style = 'border-primary bg-primary/15 text-primary font-bold';
                        }
                        if (showFeedback) {
                          if (isThisCorrect) {
                            style = 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold';
                          } else if (isThisSelected && !isThisCorrect) {
                            style = 'border-destructive bg-destructive/20 text-destructive font-bold';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => handleQuizOptionSelect(qIdx, opt)}
                            className={`w-full text-left p-3 rounded-xl border text-[14px] transition-all flex items-center justify-between cursor-pointer ${style}`}
                          >
                            <span>{opt}</span>
                            {showFeedback && isThisCorrect && (
                              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                            )}
                            {showFeedback && isThisSelected && !isThisCorrect && (
                              <X className="h-4 w-4 text-destructive shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {quizSubmitted && q.explanation && (
                      <div className="ml-8 p-3 rounded-xl bg-secondary/70 text-[12px] text-muted-foreground leading-relaxed">
                        <strong>Tushuntirish:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Action */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              {quizSubmitted ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                  className="px-4 py-2.5 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-secondary cursor-pointer"
                >
                  Qayta topshirish
                </button>
              ) : (
                <button
                  type="button"
                  disabled={Object.keys(quizAnswers).length < lesson.content.renshuu.length}
                  onClick={submitQuiz}
                  className="w-full py-3 rounded-2xl bg-[#0071e3] text-white font-bold text-[14px] shadow-lg hover:bg-[#0077ed] disabled:opacity-50 transition-all cursor-pointer"
                >
                  Natijalarni tekshirish va darsni yakunlash
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KAIWA (AI DIALOG SCENARIO) */}
      {activeTab === 'kaiwa' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    AI Speaking Sensei
                  </span>
                  <span className="text-[11px] text-muted-foreground">2–5 daqiqalik muloqot</span>
                </div>
                <h3 className="headline text-[20px] font-bold text-foreground mt-0.5">
                  {lesson.kaiwaScenario?.topic || 'Dars mavzusiga mos interaktiv suhbat'}
                </h3>
              </div>
            </div>

            <div className="space-y-3 bg-secondary/40 p-4 rounded-2xl border border-border/50">
              <div className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider">Suhbat maqsadi:</div>
              <p className="text-[14px] text-foreground leading-relaxed">
                {lesson.kaiwaScenario?.goal || 'Oʻzingizning ismingiz, kasbingiz va qayerdan ekanligingizni aytib suhbatdosh bilan tanishing.'}
              </p>
            </div>

            {/* Sample Dialog Preview */}
            {lesson.kaiwaScenario?.sampleDialog && (
              <div className="space-y-3">
                <div className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider">
                  Namunaviy dialog:
                </div>
                <div className="space-y-3">
                  {lesson.kaiwaScenario.sampleDialog.map((line: any, lIdx: number) => (
                    <div key={lIdx} className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-primary">{line.speaker}:</span>
                        <button
                          type="button"
                          onClick={() => playJapaneseAudio(line.text)}
                          className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[15px] font-bold text-foreground font-japanese">{line.text}</p>
                      <p className="text-[12px] text-muted-foreground">{line.uz}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI speaking button banner */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent p-5 border border-purple-500/20 text-center space-y-2">
              <Sparkles className="h-6 w-6 text-purple-500 mx-auto animate-pulse" />
              <div className="font-bold text-foreground text-[15px]">AI Suhbat moduli tayyorlanmoqda</div>
              <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
                Ushbu dars boʻyicha real vaqtda ovozli gaplashish (Speaking practice) keyingi bosqichda toʻliq faollashtiriladi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
