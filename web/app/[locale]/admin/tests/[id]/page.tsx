'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  FileCheck2,
  Headphones,
  Sparkles,
  Loader2,
  Check,
  X,
  Layers,
  Clock,
} from 'lucide-react';
import {
  api,
  AdminJlptTestDetail,
  AdminJlptQuestionItem,
} from '@/lib/api';
import { useLang } from '@/lib/i18n';

export default function AdminTestQuestionsPage() {
  const { lang } = useLang();
  const params = useParams();
  const testId = params?.id as string;

  const [test, setTest] = React.useState<AdminJlptTestDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Active module filter
  const [activeModule, setActiveModule] = React.useState<string>('ALL');

  // Question Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<AdminJlptQuestionItem | null>(null);
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
    points: 3,
  });

  // Delete modal state
  const [deletingQuestionId, setDeletingQuestionId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadTest = React.useCallback(async () => {
    if (!testId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminGetTest(testId);
      setTest(data);
    } catch (err: any) {
      setError(err?.message || 'Testni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  React.useEffect(() => {
    loadTest();
  }, [loadTest]);

  const handleOpenCreate = () => {
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
      points: 3,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: AdminJlptQuestionItem) => {
    setEditingQuestion(q);
    const correctIdx = q.options?.indexOf(q.correctAnswer) ?? 0;
    setFormData({
      section: q.section,
      mondaiTitle: q.mondaiTitle || '',
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      contextText: q.contextText || '',
      options: q.options?.length === 4 ? q.options : [...q.options, '', '', '', ''].slice(0, 4),
      correctAnswerIndex: correctIdx >= 0 ? correctIdx : 0,
      explanation: q.explanation || '',
      points: q.points || 3,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOptionChange = (idx: number, val: string) => {
    setFormData((prev) => {
      const next = [...prev.options];
      next[idx] = val;
      return { ...prev, options: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const payload = {
        section: formData.section,
        mondaiTitle: formData.mondaiTitle.trim() || undefined,
        questionNumber: Number(formData.questionNumber),
        questionText: formData.questionText.trim(),
        contextText: formData.contextText.trim() || undefined,
        options: filledOptions,
        correctAnswer,
        explanation: formData.explanation.trim() || undefined,
        points: Number(formData.points),
        order: Number(formData.questionNumber),
      };

      if (editingQuestion) {
        await api.adminUpdateQuestion(editingQuestion.id, payload);
      } else {
        await api.adminAddQuestion(testId, payload);
      }

      setIsModalOpen(false);
      await loadTest();
    } catch (err: any) {
      setModalError(err?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingQuestionId) return;
    setIsDeleting(true);
    try {
      await api.adminDeleteQuestion(deletingQuestionId);
      setDeletingQuestionId(null);
      await loadTest();
    } catch (err: any) {
      alert(err?.message || 'Savolni oʻchirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  const moduleCounts = React.useMemo(() => {
    if (!test?.questions) return { m1: 0, m2: 0, m3: 0 };
    let m1 = 0,
      m2 = 0,
      m3 = 0;
    for (const q of test.questions) {
      if (q.section === 'MODULE_1_VOCAB' || q.section === 'KOTOBA') m1++;
      else if (
        q.section === 'MODULE_2_GRAMMAR_READING' ||
        q.section === 'BUNPOU' ||
        q.section === 'DOKKAI'
      )
        m2++;
      else if (q.section === 'MODULE_3_LISTENING' || q.section === 'CHOUKAI') m3++;
    }
    return { m1, m2, m3 };
  }, [test?.questions]);

  const filteredQuestions = React.useMemo(() => {
    if (!test?.questions) return [];
    if (activeModule === 'ALL') return test.questions;
    return test.questions.filter((q) => {
      if (activeModule === 'MODULE_1_VOCAB')
        return q.section === 'MODULE_1_VOCAB' || q.section === 'KOTOBA';
      if (activeModule === 'MODULE_2_GRAMMAR_READING')
        return (
          q.section === 'MODULE_2_GRAMMAR_READING' ||
          q.section === 'BUNPOU' ||
          q.section === 'DOKKAI'
        );
      if (activeModule === 'MODULE_3_LISTENING')
        return q.section === 'MODULE_3_LISTENING' || q.section === 'CHOUKAI';
      return true;
    });
  }, [test?.questions, activeModule]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground">Test maʼlumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-3xl border border-destructive/30 bg-destructive/5 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-base font-bold text-foreground">Xatolik</h2>
        <p className="text-xs text-muted-foreground">{error || 'Test topilmadi'}</p>
        <Link
          href={`/${lang}/admin/tests`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Testlar roʻyxatiga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <Link
            href={`/${lang}/admin/tests`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Mock imtihonlar roʻyxatiga qaytish</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-black">
              {test.level}
            </span>
            <h1 className="text-lg sm:text-xl font-black text-foreground">{test.title}</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Jami {test.questions.length} ta savol • {test.durationMinutes} daqiqa • {test.totalScore} ball
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/${lang}/dashboard/tests/${test.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-2xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
          >
            Foydalanuvchi sifatida koʻrish ↗
          </Link>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Savol qoʻshish</span>
          </button>
        </div>
      </div>

      {/* 3 Module Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveModule('ALL')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
            activeModule === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Barcha savollar ({test.questions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('MODULE_1_VOCAB')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
            activeModule === 'MODULE_1_VOCAB'
              ? 'bg-blue-600 text-white shadow-md'
              : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>1-Modul: 文字・語彙 ({moduleCounts.m1})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('MODULE_2_GRAMMAR_READING')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
            activeModule === 'MODULE_2_GRAMMAR_READING'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>2-Modul: 文法・読解 ({moduleCounts.m2})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('MODULE_3_LISTENING')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
            activeModule === 'MODULE_3_LISTENING'
              ? 'bg-purple-600 text-white shadow-md'
              : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Headphones className="h-3.5 w-3.5" />
          <span>3-Modul: 聴解 Audio ({moduleCounts.m3})</span>
        </button>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
          <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">Bu modulda savol yoʻq</h3>
          <p className="text-xs text-muted-foreground">
            Ushbu modulga birinchi savolni qoʻshish uchun pastdagi tugmani bosing.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
          >
            Yangi savol qoʻshish
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-4 hover:border-primary/30 transition-colors"
            >
              {/* Question Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-black">
                      № {q.questionNumber}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {q.section === 'MODULE_1_VOCAB' || q.section === 'KOTOBA'
                        ? '1-Modul: 文字・語彙'
                        : q.section === 'MODULE_2_GRAMMAR_READING' ||
                          q.section === 'BUNPOU' ||
                          q.section === 'DOKKAI'
                        ? '2-Modul: 文法・読解'
                        : '3-Modul: 聴解 (Audio)'}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      • {q.points} ball
                    </span>
                  </div>

                  {q.mondaiTitle && (
                    <p className="text-xs font-semibold text-foreground/80 pt-0.5">
                      {q.mondaiTitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className="h-8 px-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-primary" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingQuestionId(q.id)}
                    className="h-8 w-8 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive flex items-center justify-center transition-all cursor-pointer"
                    title="Oʻchirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Context if available */}
              {q.contextText && (
                <div className="p-3.5 rounded-2xl bg-secondary/20 border border-border/40 text-xs font-medium text-foreground whitespace-pre-line leading-relaxed">
                  {q.contextText}
                </div>
              )}

              {/* Question Text */}
              <p className="text-sm sm:text-base font-bold text-foreground leading-relaxed">
                {q.questionText}
              </p>

              {/* 4 Options Grid */}
              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {q.options?.map((opt, optIdx) => {
                  const isCorrect = q.correctAnswer === opt;
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-xs'
                          : 'border-border/60 bg-secondary/10 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="h-6 w-6 rounded-lg bg-card border border-border/60 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {optIdx + 1}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-[11px] font-bold text-emerald-500 shrink-0 ml-2">
                          Toʻgʻri javob ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Oʻzbek tilidagi tushuntirish:</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {editingQuestion ? 'Savolni Tahrirlash' : 'Yangi Savol Qoʻshish'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-3">
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

              <div className="grid grid-cols-4 gap-3">
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
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  placeholder="Masalan: 毎朝、しんぶんを 読みます。"
                  className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-secondary/20 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* 4 Options & Correct Answer Radio */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-foreground">
                  4 ta Variant va Toʻgʻri Javobni belgilang *
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {formData.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                        formData.correctAnswerIndex === idx
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border/60 bg-secondary/20'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`opt-radio-${idx}`}
                        name="correctAnswerIndex"
                        checked={formData.correctAnswerIndex === idx}
                        onChange={() => setFormData({ ...formData, correctAnswerIndex: idx })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`${idx + 1}-variant`}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-border/50 bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Oʻzbek Tilidagi Tushuntirish (Grammatik qoida)
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Nima uchun bu javob toʻgʻri ekanligining batafsil izohi..."
                  className="w-full p-3 rounded-xl border border-border/60 bg-secondary/20 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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

      {/* Delete Question Modal */}
      {deletingQuestionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-4 text-center">
            <Trash2 className="h-10 w-10 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Savolni oʻchirish</h3>
              <p className="text-xs text-muted-foreground">
                Haqiqatan ham bu savolni oʻchirib tashlamoqchimisiz?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuestionId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-destructive text-xs font-bold text-destructive-foreground hover:opacity-90 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Oʻchirilmoqda...' : 'Ha, oʻchirilsin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
