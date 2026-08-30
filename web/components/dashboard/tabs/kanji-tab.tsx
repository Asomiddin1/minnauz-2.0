'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Type,
  Search,
  Sparkles,
  Volume2,
  BookA,
  RotateCw,
  Layers,
  CheckCircle2,
  Check,
  Plus,
  Trash2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Play,
  PenTool,
  Loader2,
  BookmarkCheck,
} from 'lucide-react';
import {
  api,
  UserKanjiItem,
  FlashcardStatus,
  KanjiStatsResponse,
} from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { KanjiDetailModal } from '../kanji/kanji-detail-modal';

export function KanjiTab() {
  const { lang } = useLang();

  // Mode: 'CATALOG' (Kanji qomusi) or 'FLASHCARDS' (Yodlash xonasi)
  const [activeMode, setActiveMode] = React.useState<'CATALOG' | 'FLASHCARDS'>('CATALOG');

  // Server Data
  const [kanjiList, setKanjiList] = React.useState<UserKanjiItem[]>([]);
  const [stats, setStats] = React.useState<KanjiStatsResponse>({
    totalLearning: 0,
    totalMastered: 0,
    totalSaved: 0,
  });
  const [lockedKanjiCount, setLockedKanjiCount] = React.useState(0);
  const [isPro, setIsPro] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>('ALL');

  // Modal State for Animation & Drawing
  const [selectedModalKanji, setSelectedModalKanji] = React.useState<UserKanjiItem | null>(null);

  // Action loading states
  const [updatingKanjiId, setUpdatingKanjiId] = React.useState<string | null>(null);
  const [batchAdding, setBatchAdding] = React.useState(false);
  const [batchRemoving, setBatchRemoving] = React.useState(false);

  // Flashcards state
  const [flashcardFilter, setFlashcardFilter] = React.useState<'ALL' | 'LEARNING' | 'MASTERED'>('ALL');
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isCardFlipped, setIsCardFlipped] = React.useState(false);
  const [cardAnimation, setCardAnimation] = React.useState<'none' | 'success' | 'retry'>('none');

  // Load Kanji data from backend
  const loadKanjiData = async () => {
    try {
      setLoading(true);
      const [kanjiRes, statsRes] = await Promise.all([
        api.getAllKanji(),
        api.getKanjiStats().catch(() => ({ totalLearning: 0, totalMastered: 0, totalSaved: 0 })),
      ]);
      setKanjiList(kanjiRes.kanji || []);
      setLockedKanjiCount(kanjiRes.lockedKanjiCount || 0);
      setIsPro(kanjiRes.isPro);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load kanji:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadKanjiData();
  }, []);

  // Flashcard toggle
  const handleToggleFlashcard = async (
    kanji: UserKanjiItem,
    status?: FlashcardStatus,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingKanjiId(kanji.id);
      const targetStatus =
        status || (kanji.flashcardStatus === 'LEARNING' ? 'MASTERED' : 'LEARNING');
      await api.toggleKanjiFlashcard(kanji.id, targetStatus);

      // Optimistic update
      setKanjiList((prev) =>
        prev.map((k) => (k.id === kanji.id ? { ...k, flashcardStatus: targetStatus } : k)),
      );
      if (selectedModalKanji?.id === kanji.id) {
        setSelectedModalKanji((prev) => (prev ? { ...prev, flashcardStatus: targetStatus } : null));
      }

      api.getKanjiStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to toggle kanji flashcard:', err);
    } finally {
      setUpdatingKanjiId(null);
    }
  };

  const handleRemoveFlashcard = async (kanji: UserKanjiItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingKanjiId(kanji.id);
      await api.removeKanjiFlashcard(kanji.id);
      setKanjiList((prev) =>
        prev.map((k) => (k.id === kanji.id ? { ...k, flashcardStatus: null } : k)),
      );
      if (selectedModalKanji?.id === kanji.id) {
        setSelectedModalKanji((prev) => (prev ? { ...prev, flashcardStatus: null } : null));
      }
      api.getKanjiStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to remove kanji flashcard:', err);
    } finally {
      setUpdatingKanjiId(null);
    }
  };

  // Batch add filtered kanji
  const handleBatchAddFiltered = async () => {
    const unaddedIds = filteredKanji.filter((k) => !k.flashcardStatus).map((k) => k.id);
    if (unaddedIds.length === 0) return;
    try {
      setBatchAdding(true);
      await api.batchAddKanjiFlashcards(unaddedIds, 'LEARNING');
      setKanjiList((prev) =>
        prev.map((k) => (unaddedIds.includes(k.id) ? { ...k, flashcardStatus: 'LEARNING' } : k)),
      );
      api.getKanjiStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to batch add kanji:', err);
    } finally {
      setBatchAdding(false);
    }
  };

  // Batch remove filtered kanji
  const handleBatchRemoveFiltered = async () => {
    const savedIds = filteredKanji.filter((k) => !!k.flashcardStatus).map((k) => k.id);
    if (savedIds.length === 0) return;
    try {
      setBatchRemoving(true);
      await api.batchRemoveKanjiFlashcards(savedIds);
      setKanjiList((prev) =>
        prev.map((k) => (savedIds.includes(k.id) ? { ...k, flashcardStatus: null } : k)),
      );
      api.getKanjiStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to batch remove kanji:', err);
    } finally {
      setBatchRemoving(false);
    }
  };

  // Filtered Kanji
  const filteredKanji = React.useMemo(() => {
    return kanjiList.filter((k) => {
      const matchLvl = selectedLevel === 'ALL' || k.courseLevel === selectedLevel;
      const matchStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'SAVED' && !!k.flashcardStatus) ||
        (selectedStatusFilter === 'LEARNING' && k.flashcardStatus === 'LEARNING') ||
        (selectedStatusFilter === 'MASTERED' && k.flashcardStatus === 'MASTERED') ||
        (selectedStatusFilter === 'UNSAVED' && !k.flashcardStatus);

      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        k.character.includes(q) ||
        k.onyomi.toLowerCase().includes(q) ||
        k.kunyomi.toLowerCase().includes(q) ||
        k.meaningUz.toLowerCase().includes(q) ||
        (k.meaningRu && k.meaningRu.toLowerCase().includes(q));

      return matchLvl && matchStatus && matchQuery;
    });
  }, [kanjiList, selectedLevel, selectedStatusFilter, search]);

  // Flashcards collection
  const flashcardKanji = React.useMemo(() => {
    return kanjiList.filter((k) => {
      if (flashcardFilter === 'ALL') return !!k.flashcardStatus;
      if (flashcardFilter === 'LEARNING') return k.flashcardStatus === 'LEARNING';
      if (flashcardFilter === 'MASTERED') return k.flashcardStatus === 'MASTERED';
      return false;
    });
  }, [kanjiList, flashcardFilter]);

  const currentFlashcard = flashcardKanji[currentCardIndex] || null;

  // Flashcard controls
  const handleCardNext = () => {
    setIsCardFlipped(false);
    if (currentCardIndex < flashcardKanji.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleCardPrev = () => {
    setIsCardFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    } else {
      setCurrentCardIndex(flashcardKanji.length - 1);
    }
  };

  const handleMarkMastered = async () => {
    if (!currentFlashcard) return;
    setCardAnimation('success');
    await handleToggleFlashcard(currentFlashcard, 'MASTERED');
    setTimeout(() => {
      setCardAnimation('none');
      handleCardNext();
    }, 250);
  };

  const handleMarkLearning = async () => {
    if (!currentFlashcard) return;
    setCardAnimation('retry');
    await handleToggleFlashcard(currentFlashcard, 'LEARNING');
    setTimeout(() => {
      setCardAnimation('none');
      handleCardNext();
    }, 250);
  };

  const handleShuffleCards = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex(Math.floor(Math.random() * Math.max(1, flashcardKanji.length)));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              Kanji (漢字) Laboratoriyasi
            </h1>
            <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-lg bg-secondary/80">
              {kanjiList.length} ta ochiq kanji
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Iyerogliflar chizilish tartibi (stroke order), kalligrafiya mashqi va Flashcard yodlash tizimi.
          </p>
        </div>

        {/* Mode Switch Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/60 border border-border/60 self-start md:self-auto shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveMode('CATALOG')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'CATALOG'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Type className="h-4 w-4 text-primary" />
            <span>Kanji Qomusi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('FLASHCARDS');
              setIsCardFlipped(false);
              setCurrentCardIndex(0);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'FLASHCARDS'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-4 w-4 text-amber-500" />
            <span>Flashcard Yodlash</span>
            {stats.totalSaved > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black">
                {stats.totalSaved}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/60 bg-card p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            <Type className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Ochiq Kanjilar
            </p>
            <p className="text-base font-black text-foreground">{kanjiList.length} ta</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm shrink-0">
            <RotateCw className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Yodlanayotgan
            </p>
            <p className="text-base font-black text-yellow-600 dark:text-yellow-400">
              {stats.totalLearning} ta
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Yodlangan
            </p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {stats.totalMastered} ta
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-sm shrink-0">
            <BookmarkCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Toʻplamda jami
            </p>
            <p className="text-base font-black text-foreground">{stats.totalSaved} ta</p>
          </div>
        </div>
      </div>

      {/* Pro Lock Notification Banner */}
      {!isPro && lockedKanjiCount > 0 && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                Yana {lockedKanjiCount} ta yuqori bosqich Kanjilari mavjud
              </p>
              <p className="text-[11px] text-muted-foreground">
                Minna no Nihongo va barcha JLPT Kanjilarini toʻliq ochish uchun Pro obunani faollashtiring.
              </p>
            </div>
          </div>

          <Link
            href={`/${lang}/dashboard/premium`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Pro Obuna</span>
          </Link>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">Kanjilar yuklanmoqda...</p>
        </div>
      ) : activeMode === 'CATALOG' ? (
        /* ========================================================
           MODE 1: KANJI QOMUSI (Cards + Laboratory Modal)
        ======================================================== */
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="rounded-2xl border border-border/70 bg-card p-3 sm:p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Kanji, onyomi, kunyomi yoki oʻzbekcha maʼno qidirish..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-secondary/30 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
                  >
                    Tozalash
                  </button>
                )}
              </div>

              {/* Batch Add Button */}
              {filteredKanji.some((k) => !k.flashcardStatus) && (
                <button
                  type="button"
                  onClick={handleBatchAddFiltered}
                  disabled={batchAdding || batchRemoving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  title="Ushbu ro'yxatdagi barcha Kanjilarni Flashcard to'plamiga qo'shish"
                >
                  {batchAdding ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>Barchasini qoʻshish</span>
                </button>
              )}

              {/* Batch Remove Button */}
              {filteredKanji.some((k) => !!k.flashcardStatus) && (
                <button
                  type="button"
                  onClick={handleBatchRemoveFiltered}
                  disabled={batchAdding || batchRemoving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-secondary/80 hover:bg-destructive/15 text-muted-foreground hover:text-destructive border border-border/60 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  title="Ushbu ro'yxatdagi barcha Kanjilarni Flashcard to'plamidan chiqarish"
                >
                  {batchRemoving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Barchasini chiqarish</span>
                </button>
              )}
            </div>

            {/* Level and Flashcard Status Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
              {/* JLPT Levels */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">Daraja:</span>
                {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-foreground text-background font-black shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Barchasi' : lvl}
                  </button>
                ))}
              </div>

              {/* Flashcard Status Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">Toʻplam:</span>
                {[
                  { id: 'ALL', label: 'Barchasi' },
                  { id: 'SAVED', label: 'Toʻplamdagi' },
                  { id: 'LEARNING', label: '🟡 Yodlanmoqda' },
                  { id: 'MASTERED', label: '🟢 Yodlangan' },
                  { id: 'UNSAVED', label: '➕ Qoʻshilmagan' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedStatusFilter === st.id
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Count Header */}
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-1">
            <span>
              Topilgan Kanjilar: <strong className="text-foreground font-bold">{filteredKanji.length} ta</strong>
            </span>
            <span>Animatsiyani koʻrish yoki chizish uchun kanji ustiga bosing</span>
          </div>

          {/* Kanji Cards Grid */}
          {filteredKanji.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-2 bg-card">
              <Type className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-bold text-foreground">Hech qanday Kanji topilmadi</p>
              <p className="text-xs text-muted-foreground">
                Qidiruv soʻzini oʻzgartirib yoki filtrlarni tozalab koʻring.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredKanji.map((kanji) => (
                <div
                  key={kanji.id}
                  onClick={() => setSelectedModalKanji(kanji)}
                  className="group relative rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md p-3.5 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-150 active:scale-98"
                >
                  {/* Top Badges */}
                  <div className="w-full flex items-center justify-between text-[10px] text-muted-foreground font-bold mb-1">
                    <span className="px-1.5 py-0.2 rounded bg-secondary/80 text-foreground">
                      {kanji.courseLevel}
                    </span>
                    <span>{kanji.strokeCount} chiziq</span>
                  </div>

                  {/* Character Display */}
                  <div className="my-2">
                    <span className="text-4xl sm:text-5xl font-black font-japanese text-foreground group-hover:text-primary transition-colors select-none">
                      {kanji.character}
                    </span>
                  </div>

                  {/* Meaning & Onyomi */}
                  <div className="space-y-0.5 w-full">
                    <p className="text-xs font-bold text-foreground truncate block">
                      {kanji.meaningUz}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate font-japanese">
                      {kanji.onyomi || kanji.kunyomi || '—'}
                    </p>
                  </div>

                  {/* Hover Actions: Learn/Draw & Flashcard Toggle */}
                  <div className="mt-3 w-full pt-2 border-t border-border/50 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalKanji(kanji);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                      title="Animatsiya va Chizish doskasi"
                    >
                      <PenTool className="h-3 w-3" />
                      <span>Chizish</span>
                    </button>

                    {/* Flashcard pill */}
                    {kanji.flashcardStatus === 'MASTERED' ? (
                      <span
                        onClick={(e) => handleToggleFlashcard(kanji, 'LEARNING', e)}
                        className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                        title="Yodlangan"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    ) : kanji.flashcardStatus === 'LEARNING' ? (
                      <span
                        onClick={(e) => handleToggleFlashcard(kanji, 'MASTERED', e)}
                        className="p-1 rounded-lg bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/25 transition-colors"
                        title="Yodlanmoqda"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span
                        onClick={(e) => handleToggleFlashcard(kanji, 'LEARNING', e)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="Flashcardga qo'shish"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
           MODE 2: FLASHCARD YODLASH XONASI (Interactive 3D Flip)
        ======================================================== */
        <div className="space-y-6 max-w-xl mx-auto py-2">
          {/* Flashcard Category Filter Pills */}
          <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-secondary/50 border border-border/60">
            <button
              type="button"
              onClick={() => {
                setFlashcardFilter('ALL');
                setCurrentCardIndex(0);
                setIsCardFlipped(false);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                flashcardFilter === 'ALL'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Barchasi ({stats.totalSaved})
            </button>
            <button
              type="button"
              onClick={() => {
                setFlashcardFilter('LEARNING');
                setCurrentCardIndex(0);
                setIsCardFlipped(false);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                flashcardFilter === 'LEARNING'
                  ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 shadow-xs border border-yellow-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🔄 Yodlanayotgan ({stats.totalLearning})
            </button>
            <button
              type="button"
              onClick={() => {
                setFlashcardFilter('MASTERED');
                setCurrentCardIndex(0);
                setIsCardFlipped(false);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                flashcardFilter === 'MASTERED'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ✅ Yodlangan ({stats.totalMastered})
            </button>
          </div>

          {/* Flashcard Body */}
          {flashcardKanji.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card p-10 text-center space-y-4 shadow-xs">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Layers className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Ushbu toifada hozircha Kanjilar yoʻq
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Kanji qomusiga oʻtib, xohlagan iyerogliflaringizni <strong>«➕ Flashcard»</strong> tugmasi orqali toʻplamga qoʻshing va bu yerda yodlang.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMode('CATALOG')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Type className="h-4 w-4" />
                <span>Kanji qomusiga oʻtish</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress and Counter */}
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-foreground">
                    {currentCardIndex + 1} / {flashcardKanji.length}
                  </span>
                  <span>ta kanji</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShuffleCards}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Tasodifiy tartibda aralashtirish"
                  >
                    <Shuffle className="h-3 w-3" />
                    <span>Aralashtirish</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentCardIndex + 1) / flashcardKanji.length) * 100}%`,
                  }}
                />
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className={`relative min-h-[300px] sm:min-h-[330px] rounded-[32px] border transition-all duration-300 p-7 flex flex-col justify-between cursor-pointer select-none shadow-md hover:shadow-lg ${
                  cardAnimation === 'success'
                    ? 'border-emerald-500 bg-emerald-500/10 scale-98'
                    : cardAnimation === 'retry'
                    ? 'border-yellow-500 bg-yellow-500/10 scale-98'
                    : isCardFlipped
                    ? 'border-primary/50 bg-secondary/30'
                    : 'border-border/80 bg-card hover:border-primary/40'
                }`}
              >
                {/* Top Card Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20">
                      {currentFlashcard?.courseLevel}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {currentFlashcard?.strokeCount} chiziq
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground">
                      {currentFlashcard?.flashcardStatus === 'MASTERED'
                        ? '🟢 Yodlangan'
                        : '🟡 Yodlanmoqda'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalKanji(currentFlashcard);
                      }}
                      className="p-1.5 rounded-xl bg-secondary hover:bg-primary hover:text-white text-foreground transition-all cursor-pointer shadow-2xs"
                      title="Chizilish animatsiyasini ko'rish"
                    >
                      <PenTool className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Card Center Content */}
                <div className="my-auto py-6 text-center space-y-3">
                  {!isCardFlipped ? (
                    /* FRONT: Big Kanji Character */
                    <div className="space-y-2 animate-in zoom-in-95 duration-150">
                      <h2 className="text-6xl sm:text-7xl font-black text-foreground font-japanese tracking-wide select-none">
                        {currentFlashcard?.character}
                      </h2>
                      {currentFlashcard?.radical && (
                        <p className="text-xs text-muted-foreground">
                          Radikal: <span className="font-bold text-foreground font-japanese">{currentFlashcard.radical}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground pt-4 animate-pulse">
                        Maʼnosi va oʻqilishini koʻrish uchun bosing 👆
                      </p>
                    </div>
                  ) : (
                    /* BACK: Meaning & Readings */
                    <div className="space-y-3 animate-in zoom-in-95 duration-150">
                      <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                        {currentFlashcard?.meaningUz}
                      </h3>
                      {currentFlashcard?.meaningRu && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {currentFlashcard.meaningRu}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <div className="p-2 rounded-xl bg-card border border-border/50 space-y-0.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Onyomi</span>
                          <p className="font-bold text-foreground font-japanese">{currentFlashcard?.onyomi || '—'}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-card border border-border/50 space-y-0.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Kunyomi</span>
                          <p className="font-bold text-foreground font-japanese">{currentFlashcard?.kunyomi || '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Hint */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-medium">
                  <span>
                    {isCardFlipped ? 'Yodlaganingizni tasdiqlang 👇' : 'Old tomoni'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentFlashcard) handleRemoveFlashcard(currentFlashcard);
                    }}
                    className="hover:text-destructive flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Toʻplamdan chiqarish</span>
                  </button>
                </div>
              </div>

              {/* Bottom Evaluation Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleMarkLearning}
                  className="py-3 px-4 rounded-2xl bg-card hover:bg-secondary text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <RotateCw className="h-4 w-4" />
                  <span>Hali yodlanmadi</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkMastered}
                  className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Yodladim!</span>
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between pt-2 px-2">
                <button
                  type="button"
                  onClick={handleCardPrev}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Oldingisi</span>
                </button>
                <button
                  type="button"
                  onClick={handleCardNext}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <span>Keyingisi</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kanji Laboratory Modal (Animation + Drawing Canvas) */}
      <KanjiDetailModal
        kanji={selectedModalKanji}
        isOpen={!!selectedModalKanji}
        onClose={() => setSelectedModalKanji(null)}
        onToggleFlashcard={handleToggleFlashcard}
      />
    </div>
  );
}
