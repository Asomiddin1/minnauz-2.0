'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  FileCheck2,
  CheckCircle2,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  HelpCircle,
  Headphones,
  Play,
  Pause,
  Volume2,
  Layers,
  BookOpen,
  Check,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function TeacherTestQuestionsPage() {
  const { lang } = useLang();
  const params = useParams();
  const testId = params.testId as string;

  const [test, setTest] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Active module filter
  const [activeModule, setActiveModule] = React.useState<string>('ALL');

  // Audio player state
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = React.useState(0);

  // Question modal state
  const [questionModalOpen, setQuestionModalOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<any | null>(null);
  const [modalLoading, setModalLoading] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = React.useState({
    section: 'MODULE_1_VOCAB',
    mondaiTitle: '',
    questionNumber: 1,
    questionText: '',
    contextText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    points: 2,
  });

  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTest = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getTeacherTest(testId);
      setTest(res);
    } catch (err: any) {
      console.error('Failed to load test questions', err);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  React.useEffect(() => {
    loadTest();
  }, [loadTest]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => {});
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleSeekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const openCreateQuestion = () => {
    setEditingQuestion(null);
    const nextNumber = (test?.questions?.length || 0) + 1;
    setFormData({
      section: activeModule !== 'ALL' ? activeModule : 'MODULE_1_VOCAB',
      mondaiTitle: '',
      questionNumber: nextNumber,
      questionText: '',
      contextText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      points: 2,
    });
    setModalError(null);
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (q: any) => {
    setEditingQuestion(q);
    const opts = (q.options as string[]) || [];
    const normalizedOptions = opts.length === 4 ? opts : [...opts, '', '', '', ''].slice(0, 4);
    const correctIdx = normalizedOptions.indexOf(q.correctAnswer);

    setFormData({
      section: q.section || 'MODULE_1_VOCAB',
      mondaiTitle: q.mondaiTitle || '',
      questionNumber: q.questionNumber || 1,
      questionText: q.questionText || '',
      contextText: q.contextText || '',
      options: normalizedOptions,
      correctAnswerIndex: correctIdx >= 0 ? correctIdx : 0,
      explanation: q.explanation || '',
      points: q.points || 2,
    });
    setModalError(null);
    setQuestionModalOpen(true);
  };

  const handleOptionChange = (idx: number, val: string) => {
    setFormData((prev) => {
      const next = [...prev.options];
      next[idx] = val;
      return { ...prev, options: next };
    });
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.questionText.trim()) {
      setModalError('Savol matni kiritilishi shart');
      return;
    }

    const filledOptions = formData.options.map((o) => o.trim());
    if (filledOptions.some((o) => !o)) {
      setModalError('Barcha 4 ta variant toʻldirilishi shart');
      return;
    }

    const correctAnswer = filledOptions[formData.correctAnswerIndex];
    if (!correctAnswer) {
      setModalError('Toʻgʻri javobni tanlang');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      const data = {
        section: formData.section,
        mondaiTitle: formData.mondaiTitle.trim() || undefined,
        questionNumber: Number(formData.questionNumber) || 1,
        questionText: formData.questionText.trim(),
        contextText: formData.contextText.trim() || undefined,
        options: filledOptions,
        correctAnswer,
        explanation: formData.explanation.trim() || undefined,
        points: Number(formData.points) || 2,
        order: Number(formData.questionNumber) || 1,
      };

      if (editingQuestion) {
        await api.updateTeacherQuestion(editingQuestion.id, data);
        setFeedbackMsg({ type: 'success', text: 'Savol muvaffaqiyatli yangilandi!' });
      } else {
        await api.createTeacherQuestion(testId, data);
        setFeedbackMsg({ type: 'success', text: 'Yangi savol qoʻshildi!' });
      }

      setQuestionModalOpen(false);
      await loadTest();
    } catch (err: any) {
      setModalError(err?.message || 'Xatolik yuz berdi');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Ushbu savolni oʻchirishni tasdiqlaysizmi?')) return;
    try {
      await api.deleteTeacherQuestion(id);
      setFeedbackMsg({ type: 'success', text: 'Savol oʻchirildi.' });
      await loadTest();
    } catch (err: any) {
      alert(err?.message || 'Xatolik yuz berdi');
    }
  };

  // Filter questions
  const filteredQuestions = React.useMemo(() => {
    if (!test?.questions) return [];
    if (activeModule === 'ALL') return test.questions;
    return test.questions.filter((q: any) => {
      if (activeModule === 'MODULE_1_VOCAB') {
        return q.section === 'MODULE_1_VOCAB' || q.section === 'KOTOBA';
      }
      if (activeModule === 'MODULE_2_GRAMMAR_READING') {
        return q.section === 'MODULE_2_GRAMMAR_READING' || q.section === 'BUNPOU' || q.section === 'DOKKAI';
      }
      if (activeModule === 'MODULE_3_LISTENING') {
        return q.section === 'MODULE_3_LISTENING' || q.section === 'CHOUKAI';
      }
      return q.section === activeModule;
    });
  }, [test?.questions, activeModule]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground">
          Savollar yuklanmoqda...
        </p>
      </div>
    );
  }

  const audioFullUrl = test?.audioUrl
    ? test.audioUrl.startsWith('http')
      ? test.audioUrl
      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${test.audioUrl}`
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
        <Link
          href={`/${lang}/teacher/tests`}
          className="hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Testlar roʻyxatiga qaytish</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">{test?.title}</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20">
              {test?.level}
            </span>
            <span className="text-xs font-semibold text-foreground">
              Oʻtish balli: <strong className="text-primary">{test?.passingScore || 80}</strong> / {test?.totalScore || 180} ball
            </span>
            <span className="text-xs text-muted-foreground">
              • {test?.questions?.length || 0} ta savol
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            {test?.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Test savollari, 4 ta variant va toʻgʻri javobni radio tugma orqali belgilang.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateQuestion}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Yangi Savol qoʻshish</span>
        </button>
      </div>

      {/* CHOUKAI AUDIO PLAYER BANNER (If audioUrl exists) */}
      {audioFullUrl && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <audio
            ref={audioRef}
            src={audioFullUrl}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onEnded={() => setIsPlayingAudio(false)}
            onError={() => setIsPlayingAudio(false)}
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAudio}
              className="h-11 w-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isPlayingAudio ? "To'xtatish" : "Tinglash"}
            >
              {isPlayingAudio ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Headphones className="h-3.5 w-3.5" />
                  Choukai Audio Treki
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Imtihon tinglab tushunish boʻlimi audiosi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[280px]">
            <span className="text-[11px] font-mono font-semibold text-muted-foreground shrink-0">
              {formatTime(audioCurrentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={audioDuration || 100}
              value={audioCurrentTime}
              onChange={handleSeekAudio}
              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[11px] font-mono font-semibold text-muted-foreground shrink-0">
              {formatTime(audioDuration)}
            </span>
          </div>
        </div>
      )}

      {/* Module / Section Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveModule('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeModule === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          Barcha savollar ({test?.questions?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveModule('MODULE_1_VOCAB')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeModule === 'MODULE_1_VOCAB'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          1-Modul: Lugʻat & Kanji
        </button>
        <button
          type="button"
          onClick={() => setActiveModule('MODULE_2_GRAMMAR_READING')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeModule === 'MODULE_2_GRAMMAR_READING'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          2-Modul: Grammatika & Oʻqish
        </button>
        <button
          type="button"
          onClick={() => setActiveModule('MODULE_3_LISTENING')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeModule === 'MODULE_3_LISTENING'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          3-Modul: Tinglab tushunish (Audio)
        </button>
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

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
            <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">Savollar topilmadi</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Ushbu boʻlimga birinchi savolni qoʻshish uchun quyidagi tugmani bosing.
            </p>
            <button
              type="button"
              onClick={openCreateQuestion}
              className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground cursor-pointer shadow-xs"
            >
              Savol qoʻshish
            </button>
          </div>
        ) : (
          filteredQuestions.map((q: any) => {
            const opts = (q.options as string[]) || [];

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-black">
                        №{q.questionNumber || 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-bold text-muted-foreground uppercase">
                        {q.section === 'MODULE_1_VOCAB' || q.section === 'KOTOBA'
                          ? '1-Modul (Lugʻat)'
                          : q.section === 'MODULE_2_GRAMMAR_READING' || q.section === 'BUNPOU' || q.section === 'DOKKAI'
                          ? '2-Modul (Grammatika)'
                          : q.section === 'MODULE_3_LISTENING' || q.section === 'CHOUKAI'
                          ? '3-Modul (Audio)'
                          : q.section}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{q.points || 2} ball
                      </span>
                      {q.mondaiTitle && (
                        <span className="text-xs text-muted-foreground font-japanese italic">
                          ({q.mondaiTitle})
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-foreground pt-1">
                      {q.questionText}
                    </h4>

                    {q.contextText && (
                      <p className="text-xs text-muted-foreground italic bg-secondary/30 p-2.5 rounded-xl border border-border/40">
                        {q.contextText}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditQuestion(q)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Savolni tahrirlash"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Savolni oʻchirish"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {opts.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        opt === q.correctAnswer
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'bg-secondary/20 border-border/40 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {opt === q.correctAnswer && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-border/40">
                    💡 Izoh: {q.explanation}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* QUESTION MODAL (WITH 4 OPTIONS & RADIO BUTTON SELECTOR) */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" />
                {editingQuestion ? 'Savolni tahrirlash' : 'Yangi savol qoʻshish'}
              </h3>
              <button
                type="button"
                onClick={() => setQuestionModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-foreground">Imtihon Moduli *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="MODULE_1_VOCAB">1-Modul: 文字・語彙 (Lugʻat & Kanji)</option>
                    <option value="MODULE_2_GRAMMAR_READING">2-Modul: 文法・読解 (Grammatika & Oʻqish)</option>
                    <option value="MODULE_3_LISTENING">3-Modul: 聴解 (Tinglab tushunish Audio)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Savol №</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.questionNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, questionNumber: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div className="space-y-1 col-span-3">
                  <label className="text-xs font-semibold text-foreground">Mondai Nomi / Yoʻriqnomasi</label>
                  <input
                    type="text"
                    value={formData.mondaiTitle}
                    onChange={(e) => setFormData({ ...formData, mondaiTitle: e.target.value })}
                    placeholder="Masalan: 問題1: 漢字の 読み方"
                    className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Ball</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Kontekst / Matn / Dialog (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={formData.contextText}
                  onChange={(e) => setFormData({ ...formData, contextText: e.target.value })}
                  placeholder="Oʻqish matni yoki tinglash dialogi skripti..."
                  className="w-full p-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Savol Matni *</label>
                <input
                  type="text"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Masalan: 毎朝、しんぶんを （　）ます。"
                  className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-secondary/20 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* 4 Options & Correct Answer Radio Selector */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    4 ta Variant va Toʻgʻri Javobni belgilang *
                  </label>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Toʻgʻri javobni radio orqali tanlang
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {formData.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                        formData.correctAnswerIndex === idx
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50'
                          : 'border-border/60 bg-secondary/20 hover:border-border'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`teacher-opt-radio-${idx}`}
                        name="correctAnswerIndex"
                        checked={formData.correctAnswerIndex === idx}
                        onChange={() => setFormData({ ...formData, correctAnswerIndex: idx })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`${idx + 1}-variant`}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-border/50 bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Oʻzbek Tilidagi Tushuntirish / Izoh (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Nima uchun bu javob toʻgʻri ekanligining izohi..."
                  className="w-full p-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
