'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  FileText,
  PenTool,
  HelpCircle,
  Save,
  Check,
  Volume2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n';

type AdminTab = 'kotoba' | 'bunpou' | 'kanji' | 'renshuu';

export default function AdminLessonContentEditor() {
  const { lang } = useLang();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<AdminTab>('kotoba');

  // Kotoba form
  const [kotobaModal, setKotobaModal] = React.useState(false);
  const [kotobaForm, setKotobaForm] = React.useState<any>({
    word: '',
    furigana: '',
    romaji: '',
    meaningUz: '',
    partOfSpeech: 'Ot',
    sampleSentence: '',
    sampleSentenceUz: '',
  });

  // Bunpou form
  const [bunpouModal, setBunpouModal] = React.useState(false);
  const [bunpouForm, setBunpouForm] = React.useState<any>({
    title: '',
    structure: '',
    explanationUz: '',
    examples: [{ japanese: '', romaji: '', uzbek: '' }],
  });

  // Kanji form
  const [kanjiModal, setKanjiModal] = React.useState(false);
  const [kanjiForm, setKanjiForm] = React.useState<any>({
    character: '',
    onyomi: '',
    kunyomi: '',
    meaningUz: '',
    strokeCount: 4,
    radical: '',
    examples: [{ word: '', reading: '', meaning: '' }],
  });

  // Renshuu form
  const [renshuuModal, setRenshuuModal] = React.useState(false);
  const [renshuuForm, setRenshuuForm] = React.useState<any>({
    type: 'QUIZ',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
  });

  const loadContent = async () => {
    try {
      const data = await api.getAdminLessonContent(courseId, lessonId);
      setLesson(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadContent();
  }, [courseId, lessonId]);

  // Kotoba handlers
  const handleSaveKotoba = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kotobaForm.word || !kotobaForm.meaningUz) return;
    try {
      await api.saveAdminKotoba(courseId, lessonId, kotobaForm);
      setKotobaModal(false);
      setKotobaForm({ word: '', furigana: '', romaji: '', meaningUz: '', partOfSpeech: 'Ot', sampleSentence: '', sampleSentenceUz: '' });
      await loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKotoba = async (id: string) => {
    try {
      await api.deleteAdminKotoba(courseId, lessonId, id);
      await loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  // Bunpou handlers
  const handleSaveBunpou = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bunpouForm.title || !bunpouForm.explanationUz) return;
    try {
      await api.saveAdminBunpou(courseId, lessonId, bunpouForm);
      setBunpouModal(false);
      setBunpouForm({ title: '', structure: '', explanationUz: '', examples: [{ japanese: '', romaji: '', uzbek: '' }] });
      await loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBunpou = async (id: string) => {
    try {
      await api.deleteAdminBunpou(courseId, lessonId, id);
      await loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  // Kanji handlers
  const handleSaveKanji = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanjiForm.character || !kanjiForm.meaningUz) return;
    try {
      await api.saveAdminKanji(courseId, lessonId, kanjiForm);
      setKanjiModal(false);
      setKanjiForm({ character: '', onyomi: '', kunyomi: '', meaningUz: '', strokeCount: 4, radical: '', examples: [{ word: '', reading: '', meaning: '' }] });
      await loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKanji = async (id: string) => {
    try {
      await api.deleteAdminKanji(courseId, lessonId, id);
      await loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  // Renshuu handlers
  const handleSaveRenshuu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renshuuForm.question || !renshuuForm.correctAnswer) return;
    try {
      await api.saveAdminRenshuu(courseId, lessonId, renshuuForm);
      setRenshuuModal(false);
      setRenshuuForm({ type: 'QUIZ', question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
      await loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRenshuu = async (id: string) => {
    try {
      await api.deleteAdminRenshuu(courseId, lessonId, id);
      await loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href={`/${lang}/admin/courses/${courseId}/modules`}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Modullar va darslar roʻyxatiga qaytish</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                {lesson?.japaneseTitle || `${lesson?.order}-dars`}
              </span>
            </div>
            <h1 className="headline text-[22px] font-bold text-foreground mt-1">
              {lesson?.title}
            </h1>
          </div>

          <Link
            href={`/${lang}/dashboard/courses/${courseId}/lessons/${lessonId}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary text-foreground text-[12px] font-semibold hover:bg-secondary/80 self-start sm:self-auto"
          >
            <span>Oʻquvchi koʻrinishida ochish</span>
          </Link>
        </div>
      </div>

      {/* 4 Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('kotoba')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'kotoba' ? 'bg-foreground text-background shadow-xs' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>1. Kotoba ({lesson?.kotobaItems?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bunpou')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'bunpou' ? 'bg-foreground text-background shadow-xs' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>2. Bunpou ({lesson?.bunpouItems?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kanji')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'kanji' ? 'bg-foreground text-background shadow-xs' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <PenTool className="h-4 w-4" />
          <span>3. Kanji ({lesson?.kanjiItems?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('renshuu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'renshuu' ? 'bg-foreground text-background shadow-xs' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>4. Renshuu ({lesson?.renshuuItems?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: KOTOBA */}
      {activeTab === 'kotoba' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-foreground">Lugʻat soʻzlari</h3>
            <button
              type="button"
              onClick={() => {
                setKotobaForm({ word: '', furigana: '', romaji: '', meaningUz: '', partOfSpeech: 'Ot', sampleSentence: '', sampleSentenceUz: '' });
                setKotobaModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold hover:bg-[#0077ed]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Soʻz qoʻshish</span>
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-secondary/60 text-muted-foreground uppercase text-[11px] font-bold border-b border-border">
                <tr>
                  <th className="p-3">Soʻz (Kana/Kanji)</th>
                  <th className="p-3">Romaji</th>
                  <th className="p-3">Oʻzbekcha maʼnosi</th>
                  <th className="p-3">Turi</th>
                  <th className="p-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lesson?.kotobaItems?.map((k: any) => (
                  <tr key={k.id} className="hover:bg-secondary/20">
                    <td className="p-3 font-bold font-japanese text-foreground text-[15px]">{k.word}</td>
                    <td className="p-3 font-mono text-muted-foreground">{k.romaji}</td>
                    <td className="p-3 font-semibold text-foreground">{k.meaningUz}</td>
                    <td className="p-3 text-muted-foreground">{k.partOfSpeech}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteKotoba(k.id)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BUNPOU */}
      {activeTab === 'bunpou' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-foreground">Grammatika qoidalari</h3>
            <button
              type="button"
              onClick={() => {
                setBunpouForm({ title: '', structure: '', explanationUz: '', examples: [{ japanese: '', romaji: '', uzbek: '' }] });
                setBunpouModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold hover:bg-[#0077ed]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Qoida qoʻshish</span>
            </button>
          </div>

          <div className="space-y-3">
            {lesson?.bunpouItems?.map((b: any, idx: number) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[15px] text-foreground">{b.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleDeleteBunpou(b.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {b.structure && (
                  <div className="text-[12px] font-mono text-primary bg-primary/10 px-2 py-1 rounded-md w-fit">
                    {b.structure}
                  </div>
                )}
                <p className="text-[13px] text-muted-foreground">{b.explanationUz}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KANJI */}
      {activeTab === 'kanji' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-foreground">Kanji Iyerogliflari</h3>
            <button
              type="button"
              onClick={() => {
                setKanjiForm({ character: '', onyomi: '', kunyomi: '', meaningUz: '', strokeCount: 4, radical: '', examples: [{ word: '', reading: '', meaning: '' }] });
                setKanjiModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold hover:bg-[#0077ed]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Kanji qoʻshish</span>
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {lesson?.kanjiItems?.map((k: any) => (
              <div key={k.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-[26px] font-bold font-japanese">
                    {k.character}
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px] text-foreground">{k.meaningUz}</h4>
                    <p className="text-[12px] text-muted-foreground">On: {k.onyomi || '—'} | Kun: {k.kunyomi || '—'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteKanji(k.id)}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RENSHUU */}
      {activeTab === 'renshuu' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-foreground">Mashq va test savollari</h3>
            <button
              type="button"
              onClick={() => {
                setRenshuuForm({ type: 'QUIZ', question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
                setRenshuuModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold hover:bg-[#0077ed]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Savol qoʻshish</span>
            </button>
          </div>

          <div className="space-y-3">
            {lesson?.renshuuItems?.map((r: any, idx: number) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[14px] text-foreground">
                    {idx + 1}. {r.question}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRenshuu(r.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Toʻgʻri javob: {r.correctAnswer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KOTOBA MODAL */}
      {kotobaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-foreground">Yangi soʻz kiritish</h3>
              <button onClick={() => setKotobaModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveKotoba} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Soʻz (Yaponcha) *</label>
                  <input
                    type="text"
                    required
                    value={kotobaForm.word}
                    onChange={(e) => setKotobaForm({ ...kotobaForm, word: e.target.value })}
                    placeholder="わたし"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-japanese"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Romaji</label>
                  <input
                    type="text"
                    value={kotobaForm.romaji}
                    onChange={(e) => setKotobaForm({ ...kotobaForm, romaji: e.target.value })}
                    placeholder="watashi"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Oʻzbekcha maʼnosi *</label>
                  <input
                    type="text"
                    required
                    value={kotobaForm.meaningUz}
                    onChange={(e) => setKotobaForm({ ...kotobaForm, meaningUz: e.target.value })}
                    placeholder="men"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Soʻz turkumi</label>
                  <input
                    type="text"
                    value={kotobaForm.partOfSpeech}
                    onChange={(e) => setKotobaForm({ ...kotobaForm, partOfSpeech: e.target.value })}
                    placeholder="Olmosh / Ot / Feʼl"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Misol gap (Yaponcha)</label>
                <input
                  type="text"
                  value={kotobaForm.sampleSentence}
                  onChange={(e) => setKotobaForm({ ...kotobaForm, sampleSentence: e.target.value })}
                  placeholder="わたしは がくせいです。"
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-japanese"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Misol gap tarjimasi</label>
                <input
                  type="text"
                  value={kotobaForm.sampleSentenceUz}
                  onChange={(e) => setKotobaForm({ ...kotobaForm, sampleSentenceUz: e.target.value })}
                  placeholder="Men talabaman."
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setKotobaModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-border text-[12px] font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUNPOU MODAL */}
      {bunpouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-foreground">Grammatika qoidasi</h3>
              <button onClick={() => setBunpouModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveBunpou} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Qoida nomi *</label>
                <input
                  type="text"
                  required
                  value={bunpouForm.title}
                  onChange={(e) => setBunpouForm({ ...bunpouForm, title: e.target.value })}
                  placeholder="1. N1 は N2 です"
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-japanese"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Formula / Struktura</label>
                <input
                  type="text"
                  value={bunpouForm.structure}
                  onChange={(e) => setBunpouForm({ ...bunpouForm, structure: e.target.value })}
                  placeholder="N1 [Ot] は N2 [Ot] です"
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-japanese"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Oʻzbekcha tushuntirish *</label>
                <textarea
                  rows={3}
                  required
                  value={bunpouForm.explanationUz}
                  onChange={(e) => setBunpouForm({ ...bunpouForm, explanationUz: e.target.value })}
                  placeholder="は koʻmakchisi gap mavzusini bildiradi..."
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBunpouModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-border text-[12px] font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KANJI MODAL */}
      {kanjiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-foreground">Kanji Iyeroglifi</h3>
              <button onClick={() => setKanjiModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveKanji} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Belgi (Kanji) *</label>
                  <input
                    type="text"
                    required
                    value={kanjiForm.character}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, character: e.target.value })}
                    placeholder="日"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[16px] text-foreground focus:outline-none focus:border-primary font-japanese font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Oʻzbekcha maʼnosi *</label>
                  <input
                    type="text"
                    required
                    value={kanjiForm.meaningUz}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, meaningUz: e.target.value })}
                    placeholder="Quyosh, kun"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Onʼyomi</label>
                  <input
                    type="text"
                    value={kanjiForm.onyomi}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, onyomi: e.target.value })}
                    placeholder="ニチ, ジツ"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-japanese"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Kunʼyomi</label>
                  <input
                    type="text"
                    value={kanjiForm.kunyomi}
                    onChange={(e) => setKanjiForm({ ...kanjiForm, kunyomi: e.target.value })}
                    placeholder="ひ, -び, -か"
                    className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-japanese"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setKanjiModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-border text-[12px] font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENSHUU MODAL */}
      {renshuuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-foreground">Mashq savoli kiritish</h3>
              <button onClick={() => setRenshuuModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveRenshuu} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Savol matni *</label>
                <textarea
                  rows={2}
                  required
                  value={renshuuForm.question}
                  onChange={(e) => setRenshuuForm({ ...renshuuForm, question: e.target.value })}
                  placeholder="わたし ___ がくせいです。"
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase text-muted-foreground">Javob variantlari (4 ta)</label>
                {renshuuForm.options.map((opt: string, idx: number) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Variant ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...renshuuForm.options];
                      newOpts[idx] = e.target.value;
                      setRenshuuForm({ ...renshuuForm, options: newOpts });
                    }}
                    className="w-full px-3.5 py-1.5 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Toʻgʻri javob *</label>
                <input
                  type="text"
                  required
                  value={renshuuForm.correctAnswer}
                  onChange={(e) => setRenshuuForm({ ...renshuuForm, correctAnswer: e.target.value })}
                  placeholder="Variantlardan birining aniq matni"
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Tushuntirish</label>
                <input
                  type="text"
                  value={renshuuForm.explanation}
                  onChange={(e) => setRenshuuForm({ ...renshuuForm, explanation: e.target.value })}
                  placeholder="Nima uchun bu javob toʻgʻri..."
                  className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-[13px] text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenshuuModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-border text-[12px] font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold"
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
