'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  FileText,
  HelpCircle,
  Volume2,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { api, KotobaItem, BunpouItem, KanjiItem, RenshuuItem } from '@/lib/api';

export default function TeacherLessonContentPage() {
  const { lang } = useLang();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'KOTOBA' | 'BUNPOU' | 'KANJI' | 'RENSHUU'>('KOTOBA');

  // Kotoba Modal
  const [kotobaModalOpen, setKotobaModalOpen] = React.useState(false);
  const [editKotobaId, setEditKotobaId] = React.useState<string | null>(null);
  const [kWord, setKWord] = React.useState('');
  const [kFurigana, setKFurigana] = React.useState('');
  const [kRomaji, setKRomaji] = React.useState('');
  const [kMeaningUz, setKMeaningUz] = React.useState('');
  const [kPartOfSpeech, setKPartOfSpeech] = React.useState('');
  const [kSampleSentence, setKSampleSentence] = React.useState('');
  const [kSampleSentenceUz, setKSampleSentenceUz] = React.useState('');

  // Bunpou Modal
  const [bunpouModalOpen, setBunpouModalOpen] = React.useState(false);
  const [editBunpouId, setEditBunpouId] = React.useState<string | null>(null);
  const [bTitle, setBTitle] = React.useState('');
  const [bStructure, setBStructure] = React.useState('');
  const [bExplanationUz, setBExplanationUz] = React.useState('');
  const [bExJp, setBExJp] = React.useState('');
  const [bExUz, setBExUz] = React.useState('');

  // Kanji Modal
  const [kanjiModalOpen, setKanjiModalOpen] = React.useState(false);
  const [editKanjiId, setEditKanjiId] = React.useState<string | null>(null);
  const [kanCharacter, setKanCharacter] = React.useState('');
  const [kanOnyomi, setKanOnyomi] = React.useState('');
  const [kanKunyomi, setKanKunyomi] = React.useState('');
  const [kanMeaningUz, setKanMeaningUz] = React.useState('');
  const [kanStrokeCount, setKanStrokeCount] = React.useState<number>(1);
  const [kanRadical, setKanRadical] = React.useState('');

  // Renshuu Modal
  const [renshuuModalOpen, setRenshuuModalOpen] = React.useState(false);
  const [editRenshuuId, setEditRenshuuId] = React.useState<string | null>(null);
  const [rQuestion, setRQuestion] = React.useState('');
  const [rOpt1, setROpt1] = React.useState('');
  const [rOpt2, setROpt2] = React.useState('');
  const [rOpt3, setROpt3] = React.useState('');
  const [rOpt4, setROpt4] = React.useState('');
  const [rCorrectAnswer, setRCorrectAnswer] = React.useState('');
  const [rExplanation, setRExplanation] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadContent = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getTeacherLessonContent(lessonId);
      setLesson(res);
    } catch (err: any) {
      console.error('Failed to load lesson content', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  React.useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Kotoba actions
  const openKotobaCreate = () => {
    setEditKotobaId(null);
    setKWord('');
    setKFurigana('');
    setKRomaji('');
    setKMeaningUz('');
    setKPartOfSpeech('');
    setKSampleSentence('');
    setKSampleSentenceUz('');
    setKotobaModalOpen(true);
  };

  const openKotobaEdit = (item: KotobaItem) => {
    setEditKotobaId(item.id);
    setKWord(item.word);
    setKFurigana(item.furigana || '');
    setKRomaji(item.romaji || '');
    setKMeaningUz(item.meaningUz);
    setKPartOfSpeech(item.partOfSpeech || '');
    setKSampleSentence(item.sampleSentence || '');
    setKSampleSentenceUz(item.sampleSentenceUz || '');
    setKotobaModalOpen(true);
  };

  const handleSaveKotoba = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = {
        word: kWord.trim(),
        furigana: kFurigana.trim() || undefined,
        romaji: kRomaji.trim() || undefined,
        meaningUz: kMeaningUz.trim(),
        partOfSpeech: kPartOfSpeech.trim() || undefined,
        sampleSentence: kSampleSentence.trim() || undefined,
        sampleSentenceUz: kSampleSentenceUz.trim() || undefined,
        order: (lesson?.kotobaItems?.length || 0) + 1,
      };

      if (editKotobaId) {
        await api.updateTeacherKotoba(editKotobaId, data);
        setFeedbackMsg({ type: 'success', text: 'Soʻz muvaffaqiyatli tahrirlandi!' });
      } else {
        await api.addTeacherKotoba(lessonId, data);
        setFeedbackMsg({ type: 'success', text: 'Yangi soʻz qoʻshildi!' });
      }
      setKotobaModalOpen(false);
      await loadContent();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKotoba = async (id: string) => {
    if (!confirm('Ushbu soʻzni oʻchirishni tasdiqlaysizmi?')) return;
    try {
      await api.deleteTeacherKotoba(id);
      await loadContent();
    } catch (err: any) {
      alert(err?.message || 'Xatolik yuz berdi');
    }
  };

  // Bunpou actions
  const openBunpouCreate = () => {
    setEditBunpouId(null);
    setBTitle('');
    setBStructure('');
    setBExplanationUz('');
    setBExJp('');
    setBExUz('');
    setBunpouModalOpen(true);
  };

  const openBunpouEdit = (item: BunpouItem) => {
    setEditBunpouId(item.id);
    setBTitle(item.title);
    setBStructure(item.structure || '');
    setBExplanationUz(item.explanationUz);
    const firstEx = item.examples?.[0];
    setBExJp(firstEx?.japanese || '');
    setBExUz(firstEx?.uzbek || '');
    setBunpouModalOpen(true);
  };

  const handleSaveBunpou = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const examples = bExJp.trim() ? [{ japanese: bExJp.trim(), uzbek: bExUz.trim() }] : [];
      const data = {
        title: bTitle.trim(),
        structure: bStructure.trim() || undefined,
        explanationUz: bExplanationUz.trim(),
        examples,
        order: (lesson?.bunpouItems?.length || 0) + 1,
      };

      if (editBunpouId) {
        await api.updateTeacherBunpou(editBunpouId, data);
        setFeedbackMsg({ type: 'success', text: 'Grammatika muvaffaqiyatli tahrirlandi!' });
      } else {
        await api.addTeacherBunpou(lessonId, data);
        setFeedbackMsg({ type: 'success', text: 'Yangi grammatika qoidasi qoʻshildi!' });
      }
      setBunpouModalOpen(false);
      await loadContent();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBunpou = async (id: string) => {
    if (!confirm('Ushbu grammatikani oʻchirishni tasdiqlaysizmi?')) return;
    try {
      await api.deleteTeacherBunpou(id);
      await loadContent();
    } catch (err: any) {
      alert(err?.message || 'Xatolik yuz berdi');
    }
  };

  // Kanji actions
  const openKanjiCreate = () => {
    setEditKanjiId(null);
    setKanCharacter('');
    setKanOnyomi('');
    setKanKunyomi('');
    setKanMeaningUz('');
    setKanStrokeCount(1);
    setKanRadical('');
    setKanjiModalOpen(true);
  };

  const openKanjiEdit = (item: KanjiItem) => {
    setEditKanjiId(item.id);
    setKanCharacter(item.character);
    setKanOnyomi(item.onyomi || '');
    setKanKunyomi(item.kunyomi || '');
    setKanMeaningUz(item.meaningUz);
    setKanStrokeCount(item.strokeCount || 1);
    setKanRadical(item.radical || '');
    setKanjiModalOpen(true);
  };

  const handleSaveKanji = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = {
        character: kanCharacter.trim(),
        onyomi: kanOnyomi.trim() || undefined,
        kunyomi: kanKunyomi.trim() || undefined,
        meaningUz: kanMeaningUz.trim(),
        strokeCount: Number(kanStrokeCount) || 1,
        radical: kanRadical.trim() || undefined,
        order: (lesson?.kanjiItems?.length || 0) + 1,
      };

      if (editKanjiId) {
        await api.updateTeacherKanji(editKanjiId, data);
        setFeedbackMsg({ type: 'success', text: 'Kanji muvaffaqiyatli tahrirlandi!' });
      } else {
        await api.addTeacherKanji(lessonId, data);
        setFeedbackMsg({ type: 'success', text: 'Yangi kanji qoʻshildi!' });
      }
      setKanjiModalOpen(false);
      await loadContent();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKanji = async (id: string) => {
    if (!confirm('Ushbu kanjini oʻchirishni tasdiqlaysizmi?')) return;
    try {
      await api.deleteTeacherKanji(id);
      await loadContent();
    } catch (err: any) {
      alert(err?.message || 'Xatolik yuz berdi');
    }
  };

  // Renshuu actions
  const openRenshuuCreate = () => {
    setEditRenshuuId(null);
    setRQuestion('');
    setROpt1('');
    setROpt2('');
    setROpt3('');
    setROpt4('');
    setRCorrectAnswer('');
    setRExplanation('');
    setRenshuuModalOpen(true);
  };

  const openRenshuuEdit = (item: RenshuuItem) => {
    setEditRenshuuId(item.id);
    setRQuestion(item.question);
    const opts = (item.options as string[]) || [];
    setROpt1(opts[0] || '');
    setROpt2(opts[1] || '');
    setROpt3(opts[2] || '');
    setROpt4(opts[3] || '');
    setRCorrectAnswer(item.correctAnswer);
    setRExplanation(item.explanation || '');
    setRenshuuModalOpen(true);
  };

  const handleSaveRenshuu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const options = [rOpt1.trim(), rOpt2.trim(), rOpt3.trim(), rOpt4.trim()].filter(Boolean);
      const data = {
        question: rQuestion.trim(),
        options,
        correctAnswer: rCorrectAnswer.trim(),
        explanation: rExplanation.trim() || undefined,
        type: 'QUIZ',
        order: (lesson?.renshuuItems?.length || 0) + 1,
      };

      if (editRenshuuId) {
        await api.updateTeacherRenshuu(editRenshuuId, data);
        setFeedbackMsg({ type: 'success', text: 'Mashq muvaffaqiyatli tahrirlandi!' });
      } else {
        await api.addTeacherRenshuu(lessonId, data);
        setFeedbackMsg({ type: 'success', text: 'Yangi mashq qoʻshildi!' });
      }
      setRenshuuModalOpen(false);
      await loadContent();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRenshuu = async (id: string) => {
    if (!confirm('Ushbu mashqni oʻchirishni tasdiqlaysizmi?')) return;
    try {
      await api.deleteTeacherRenshuu(id);
      await loadContent();
    } catch (err: any) {
      alert(err?.message || 'Xatolik yuz berdi');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground">
          Dars materiallari yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
        <Link
          href={`/${lang}/teacher/courses/${courseId}/modules`}
          className="hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Modullarga qaytish</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">
          №{lesson?.order}: {lesson?.title}
        </span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Dars Materiallari (Lugʻat, Grammatika, Kanji, Mashqlar)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            {lesson?.japaneseTitle ? `${lesson.japaneseTitle}: ` : ''}
            {lesson?.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Ushbu dars uchun yangi soʻzlar (Kotoba), grammatika qoidalari (Bunpou), kanji va mashqlarni (Renshuu) kiriting yoki tahrirlang.
          </p>
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

      {/* 4 Core Content Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('KOTOBA')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'KOTOBA'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <span>📖 Kotoba (Lugʻat)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-background/20">
            {lesson?.kotobaItems?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BUNPOU')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'BUNPOU'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <span>📝 Bunpou (Grammatika)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-background/20">
            {lesson?.bunpouItems?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('KANJI')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'KANJI'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <span>🈸 Kanji (Iyerogliflar)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-background/20">
            {lesson?.kanjiItems?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RENSHUU')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'RENSHUU'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          }`}
        >
          <span>🎯 Renshuu (Mashqlar)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-background/20">
            {lesson?.renshuuItems?.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: KOTOBA */}
      {activeTab === 'KOTOBA' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Jami <strong>{lesson?.kotobaItems?.length || 0}</strong> ta yangi soʻz kiritilgan.
            </p>
            <button
              type="button"
              onClick={openKotobaCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Yangi soʻz qoʻshish</span>
            </button>
          </div>

          {lesson?.kotobaItems?.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-2">
              <p className="text-xs font-bold text-foreground">Hali soʻzlar kiritilmagan</p>
              <p className="text-[11px] text-muted-foreground">
                Darsga yangi yaponcha soʻz va tarjimalarni qoʻshing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lesson?.kotobaItems?.map((item: KotobaItem) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-border/60 bg-card flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-primary font-japanese">
                        {item.word}
                      </span>
                      {item.furigana && (
                        <span className="text-xs text-muted-foreground">
                          ({item.furigana})
                        </span>
                      )}
                      {item.romaji && (
                        <span className="text-[11px] text-muted-foreground italic font-mono">
                          [{item.romaji}]
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      {item.meaningUz}
                    </p>
                    {item.sampleSentence && (
                      <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-border/40">
                        "{item.sampleSentence}" — {item.sampleSentenceUz}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openKotobaEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKotoba(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUNPOU */}
      {activeTab === 'BUNPOU' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Jami <strong>{lesson?.bunpouItems?.length || 0}</strong> ta grammatika qoidasi.
            </p>
            <button
              type="button"
              onClick={openBunpouCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Grammatika qoʻshish</span>
            </button>
          </div>

          {lesson?.bunpouItems?.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-2">
              <p className="text-xs font-bold text-foreground">Grammatika qoidalari yoʻq</p>
              <p className="text-[11px] text-muted-foreground">
                Ushbu dars qoidalarini kiritish uchun yuqoridagi tugmani bosing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lesson?.bunpouItems?.map((item: BunpouItem) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-card space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-black">
                          {item.title}
                        </span>
                        {item.structure && (
                          <span className="text-xs text-muted-foreground font-mono">
                            [{item.structure}]
                          </span>
                        )}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openBunpouEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBunpou(item.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                    {item.explanationUz}
                  </p>

                  {item.examples && item.examples.length > 0 && (
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Namunaviy gap:
                      </p>
                      <p className="font-bold text-foreground">
                        {item.examples[0]?.japanese}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {item.examples[0]?.uzbek}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KANJI */}
      {activeTab === 'KANJI' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Jami <strong>{lesson?.kanjiItems?.length || 0}</strong> ta iyeroglif kiritilgan.
            </p>
            <button
              type="button"
              onClick={openKanjiCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Kanji qoʻshish</span>
            </button>
          </div>

          {lesson?.kanjiItems?.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-2">
              <p className="text-xs font-bold text-foreground">Kanji kiritilmagan</p>
              <p className="text-[11px] text-muted-foreground">
                Ushbu dars uchun kerakli kanjilarni biriktiring.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lesson?.kanjiItems?.map((item: KanjiItem) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-border/60 bg-card flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary text-2xl font-black font-japanese border border-primary/20">
                      {item.character}
                    </span>
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-foreground">
                        {item.meaningUz}
                      </p>
                      {item.onyomi && (
                        <p className="text-[11px] text-muted-foreground">
                          On: {item.onyomi}
                        </p>
                      )}
                      {item.kunyomi && (
                        <p className="text-[11px] text-muted-foreground">
                          Kun: {item.kunyomi}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openKanjiEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKanji(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RENSHUU */}
      {activeTab === 'RENSHUU' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Jami <strong>{lesson?.renshuuItems?.length || 0}</strong> ta mashq savoli kiritilgan.
            </p>
            <button
              type="button"
              onClick={openRenshuuCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Mashq qoʻshish</span>
            </button>
          </div>

          {lesson?.renshuuItems?.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-2">
              <p className="text-xs font-bold text-foreground">Mashqlar mavjud emas</p>
              <p className="text-[11px] text-muted-foreground">
                Oʻquvchilar darsni mustahkamlashi uchun interaktiv test savollarini qoʻshing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lesson?.renshuuItems?.map((item: RenshuuItem, idx: number) => {
                const opts = (item.options as string[]) || [];

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-card space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary text-xs font-black">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground">
                          {item.question}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openRenshuuEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRenshuu(item.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {opts.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                            opt === item.correctAnswer
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                              : 'bg-secondary/20 border-border/40 text-muted-foreground'
                          }`}
                        >
                          <span>{opt}</span>
                          {opt === item.correctAnswer && (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {item.explanation && (
                      <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-border/40">
                        Izoh: {item.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* KOTOBA MODAL */}
      {kotobaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-foreground">
              {editKotobaId ? 'Soʻzni tahrirlash' : 'Yangi soʻz qoʻshish'}
            </h3>
            <form onSubmit={handleSaveKotoba} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Soʻz (Yaponcha):</label>
                <input
                  type="text"
                  required
                  placeholder="わたし yoki 私"
                  value={kWord}
                  onChange={(e) => setKWord(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Furigana (oʻqilishi):</label>
                <input
                  type="text"
                  placeholder="わたし"
                  value={kFurigana}
                  onChange={(e) => setKFurigana(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Romaji:</label>
                <input
                  type="text"
                  placeholder="watashi"
                  value={kRomaji}
                  onChange={(e) => setKRomaji(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Oʻzbekcha maʼnosi:</label>
                <input
                  type="text"
                  required
                  placeholder="Men"
                  value={kMeaningUz}
                  onChange={(e) => setKMeaningUz(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Namunaviy gap (Yaponcha):</label>
                <input
                  type="text"
                  placeholder="わたしは がくせいです。"
                  value={kSampleSentence}
                  onChange={(e) => setKSampleSentence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Namuna tarjimasi (Oʻzbekcha):</label>
                <input
                  type="text"
                  placeholder="Men talabaman."
                  value={kSampleSentenceUz}
                  onChange={(e) => setKSampleSentenceUz(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setKotobaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUNPOU MODAL */}
      {bunpouModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-foreground">
              {editBunpouId ? 'Grammatikani tahrirlash' : 'Yangi grammatika qoʻshish'}
            </h3>
            <form onSubmit={handleSaveBunpou} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Qoida sarlavhasi:</label>
                <input
                  type="text"
                  required
                  placeholder="~ は ~ です"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Struktura formulasi:</label>
                <input
                  type="text"
                  placeholder="N1 は N2 です"
                  value={bStructure}
                  onChange={(e) => setBStructure(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Batafsil tushuntirish (Oʻzbekcha):</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ushbu grammatik qoida qachon va qanday ishlatiladi..."
                  value={bExplanationUz}
                  onChange={(e) => setBExplanationUz(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Namunaviy gap (Yaponcha):</label>
                <input
                  type="text"
                  placeholder="わたしは スミスです。"
                  value={bExJp}
                  onChange={(e) => setBExJp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Namunaviy gap tarjimasi:</label>
                <input
                  type="text"
                  placeholder="Men Smitman."
                  value={bExUz}
                  onChange={(e) => setBExUz(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBunpouModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KANJI MODAL */}
      {kanjiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-foreground">
              {editKanjiId ? 'Kanjini tahrirlash' : 'Yangi kanji qoʻshish'}
            </h3>
            <form onSubmit={handleSaveKanji} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Iyeroglif (Kanji belgisi):</label>
                <input
                  type="text"
                  required
                  placeholder="日"
                  value={kanCharacter}
                  onChange={(e) => setKanCharacter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-sm font-black font-japanese"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Oʻzbekcha maʼnosi:</label>
                <input
                  type="text"
                  required
                  placeholder="Quyosh, kun"
                  value={kanMeaningUz}
                  onChange={(e) => setKanMeaningUz(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Onyomi:</label>
                  <input
                    type="text"
                    placeholder="ニチ, ジツ"
                    value={kanOnyomi}
                    onChange={(e) => setKanOnyomi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Kunyomi:</label>
                  <input
                    type="text"
                    placeholder="ひ, -び"
                    value={kanKunyomi}
                    onChange={(e) => setKanKunyomi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Chiziqlar soni:</label>
                  <input
                    type="number"
                    min={1}
                    value={kanStrokeCount}
                    onChange={(e) => setKanStrokeCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Radikal (Bushu):</label>
                  <input
                    type="text"
                    placeholder="日"
                    value={kanRadical}
                    onChange={(e) => setKanRadical(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setKanjiModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENSHUU MODAL */}
      {renshuuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-foreground">
              {editRenshuuId ? 'Mashqni tahrirlash' : 'Yangi test mashqi qoʻshish'}
            </h3>
            <form onSubmit={handleSaveRenshuu} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Savol matni:</label>
                <textarea
                  required
                  rows={2}
                  placeholder="わたし（　）がくせいです。"
                  value={rQuestion}
                  onChange={(e) => setRQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">Variantlar:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Variant A"
                    value={rOpt1}
                    onChange={(e) => setROpt1(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Variant B"
                    value={rOpt2}
                    onChange={(e) => setROpt2(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Variant C"
                    value={rOpt3}
                    onChange={(e) => setROpt3(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Variant D"
                    value={rOpt4}
                    onChange={(e) => setROpt4(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Toʻgʻri javob matni:</label>
                <input
                  type="text"
                  required
                  placeholder="Yuqoridagi variantlardan birining aniq matni"
                  value={rCorrectAnswer}
                  onChange={(e) => setRCorrectAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Izoh / Tushuntirish:</label>
                <input
                  type="text"
                  placeholder="Nima uchun ushbu javob toʻgʻri..."
                  value={rExplanation}
                  onChange={(e) => setRExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenshuuModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
