'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Plus,
  Clock,
  BookOpen,
  ArrowRight,
  Trash2,
  Loader2,
  Headphones,
  UploadCloud,
  Link as LinkIcon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { api, JlptLevel } from '@/lib/api';

export function getOfficialJlptPassScore(level: string): number {
  switch (level) {
    case 'N5':
      return 80;
    case 'N4':
      return 90;
    case 'N3':
      return 95;
    case 'N2':
      return 90;
    case 'N1':
      return 100;
    default:
      return 80;
  }
}

export default function TeacherTestsPage() {
  const { lang, t } = useLang();

  const [tests, setTests] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Create Test Modal
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [testTitle, setTestTitle] = React.useState('');
  const [testLevel, setTestLevel] = React.useState<JlptLevel>('N5');
  const [testCourseId, setTestCourseId] = React.useState('');
  const [testDuration, setTestDuration] = React.useState<number>(105);
  const [testPassingScore, setTestPassingScore] = React.useState<number>(80);
  const [testTotalScore, setTestTotalScore] = React.useState<number>(180);
  const [testAudioUrl, setTestAudioUrl] = React.useState('');
  const [testDescription, setTestDescription] = React.useState('');

  // Audio upload state
  const [audioSourceType, setAudioSourceType] = React.useState<'UPLOAD' | 'URL'>('UPLOAD');
  const [isUploadingAudio, setIsUploadingAudio] = React.useState(false);
  const [uploadProgressText, setUploadProgressText] = React.useState('');
  const audioInputRef = React.useRef<HTMLInputElement | null>(null);

  // Audio preview playback
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [testsRes, coursesRes] = await Promise.all([
        api.getTeacherTests(),
        api.getTeacherCourses(),
      ]);
      setTests(testsRes || []);
      setCourses(coursesRes || []);
    } catch (err: any) {
      console.error('Failed to load teacher tests', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // When level changes, auto-set JLPT official passing score
  const handleLevelChange = (newLevel: JlptLevel) => {
    setTestLevel(newLevel);
    setTestPassingScore(getOfficialJlptPassScore(newLevel));
    setTestTotalScore(180);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setAlertMsg({ type: 'error', text: 'Audio fayl hajmi 100 MB dan oshmasligi kerak' });
      return;
    }

    setIsUploadingAudio(true);
    setUploadProgressText(`${file.name} yuklanmoqda...`);

    try {
      const res = await api.uploadAudio(file);
      if (res.url) {
        setTestAudioUrl(res.url);
        setUploadProgressText(`Yuklandi: ${file.name}`);
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err?.message || 'Audio yuklashda xatolik yuz berdi' });
    } finally {
      setIsUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const togglePreviewAudio = () => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => {});
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;
    try {
      setSubmitting(true);
      await api.createTeacherTest({
        title: testTitle.trim(),
        slug: testTitle.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4),
        level: testLevel,
        courseId: testCourseId || undefined,
        durationMinutes: Number(testDuration) || 105,
        passingScore: Number(testPassingScore) || 80,
        totalScore: Number(testTotalScore) || 180,
        audioUrl: testAudioUrl.trim() || undefined,
        description: testDescription.trim() || undefined,
        isPublished: true,
      });

      setAlertMsg({ type: 'success', text: 'Yangi test muvaffaqiyatli yaratildi!' });
      setCreateModalOpen(false);
      setTestTitle('');
      setTestAudioUrl('');
      setUploadProgressText('');
      setTestDescription('');
      await loadData();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTest = async (test: any) => {
    if (!confirm(`"${test.title}" testini oʻchirishni tasdiqlaysizmi?`)) return;
    try {
      await api.deleteTeacherTest(test.id);
      setAlertMsg({ type: 'success', text: 'Test oʻchirildi.' });
      await loadData();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Imtihonlar & Sinovlar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Testlar & Savollar Bazasi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Oʻz kurslaringiz uchun testlar yarating, Choukai audio yuklang, savollar, variantlar va oʻtish ballarini belgilang.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTestLevel('N5');
            setTestPassingScore(80);
            setTestTotalScore(180);
            setTestDuration(105);
            setTestAudioUrl('');
            setUploadProgressText('');
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Yangi Test yaratish</span>
        </button>
      </div>

      {/* Alert */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            alertMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button
            type="button"
            onClick={() => setAlertMsg(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tests Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">
            Testlar yuklanmoqda...
          </p>
        </div>
      ) : tests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
          <FileCheck2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">Hozircha testlar yoʻq</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Kurslaringiz uchun birinchi testni yarating, Choukai audio va savollarni joylang.
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground cursor-pointer shadow-xs"
          >
            Test yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((test) => (
            <div
              key={test.id}
              className="group rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20">
                      {test.level}
                    </span>
                    {test.audioUrl && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Headphones className="h-3 w-3" />
                        Choukai
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {test._count?.questions || 0} ta savol
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {test.title}
                  </h3>
                  {test.course && (
                    <p className="text-xs text-primary font-semibold mt-0.5 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{test.course.title}</span>
                    </p>
                  )}
                  {test.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {test.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {test.durationMinutes} daqiqa
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-foreground">
                    Oʻtish: <strong className="text-primary">{test.passingScore || 80}</strong> / {test.totalScore || 180} ball
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => handleDeleteTest(test)}
                  className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                  title="Testni oʻchirish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <Link
                  href={`/${lang}/teacher/tests/${test.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Savollar muharriri</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TEST MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                Yangi Test yaratish
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Test nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: JLPT N5 Mock Imtihon #1"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Daraja *</label>
                  <select
                    value={testLevel}
                    onChange={(e) => handleLevelChange(e.target.value as JlptLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-semibold cursor-pointer"
                  >
                    <option value="N5">JLPT N5 (80 ball)</option>
                    <option value="N4">JLPT N4 (90 ball)</option>
                    <option value="N3">JLPT N3 (95 ball)</option>
                    <option value="N2">JLPT N2 (90 ball)</option>
                    <option value="N1">JLPT N1 (100 ball)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kurs (ixtiyoriy):</label>
                  <select
                    value={testCourseId}
                    onChange={(e) => setTestCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-semibold cursor-pointer"
                  >
                    <option value="">Umumiy test (Barcha oʻquvchilar)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DURATION, PASSING SCORE, TOTAL SCORE */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Vaqt (daq):</label>
                  <input
                    type="number"
                    min={5}
                    value={testDuration}
                    onChange={(e) => setTestDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Oʻtish balli:</label>
                  <input
                    type="number"
                    min={1}
                    max={testTotalScore}
                    value={testPassingScore}
                    onChange={(e) => setTestPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Jami ball:</label>
                  <input
                    type="number"
                    min={10}
                    value={testTotalScore}
                    onChange={(e) => setTestTotalScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-border/60 bg-secondary/20 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* AUDIO (CHOUKAI) BO'LIMI */}
              <div className="space-y-2 p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Headphones className="h-3.5 w-3.5" />
                    <span>Choukai (Tinglab tushunish Audio fayli)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setAudioSourceType('UPLOAD')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        audioSourceType === 'UPLOAD'
                          ? 'bg-amber-500 text-white font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Fayl yuklash
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioSourceType('URL')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        audioSourceType === 'URL'
                          ? 'bg-amber-500 text-white font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      URL havola
                    </button>
                  </div>
                </div>

                {audioSourceType === 'UPLOAD' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={audioInputRef}
                      accept="audio/*,.mp3,.m4a,.wav"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => audioInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-border/80 bg-background/50 hover:bg-background/80 transition-all cursor-pointer text-center group"
                    >
                      {isUploadingAudio ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{uploadProgressText || 'Audio yuklanmoqda...'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                          <UploadCloud className="h-4 w-4 text-amber-500" />
                          <span>MP3, M4A yoki WAV audio faylni tanlang (max 100MB)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="url"
                      placeholder="https://.../choukai-audio.mp3"
                      value={testAudioUrl}
                      onChange={(e) => setTestAudioUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono"
                    />
                  </div>
                )}

                {/* Selected Audio preview bar */}
                {testAudioUrl && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-background border border-border/60 text-xs">
                    <audio
                      ref={previewAudioRef}
                      src={testAudioUrl.startsWith('http') ? testAudioUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${testAudioUrl}`}
                      onEnded={() => setIsPreviewPlaying(false)}
                      onError={() => setIsPreviewPlaying(false)}
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={togglePreviewAudio}
                        className="h-7 w-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 hover:opacity-90 cursor-pointer"
                        title={isPreviewPlaying ? "To'xtatish" : "Eshitib ko'rish"}
                      >
                        {isPreviewPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                      </button>
                      <span className="truncate text-[11px] font-mono text-muted-foreground">
                        {testAudioUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (previewAudioRef.current) previewAudioRef.current.pause();
                        setIsPreviewPlaying(false);
                        setTestAudioUrl('');
                        setUploadProgressText('');
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Audioni o'chirish"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Qisqacha tavsif (ixtiyoriy):</label>
                <textarea
                  rows={2}
                  placeholder="Test boʻyicha yoʻriqnoma..."
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
