'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Volume2,
  BookA,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  Layers,
  Filter,
  CheckCircle2,
  XCircle,
  Crown,
  Lock,
  Plus,
  Trash2,
  Shuffle,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  GraduationCap,
  Loader2,
  Check,
} from 'lucide-react';
import {
  api,
  getMediaUrl,
  UserKotobaWordItem,
  FlashcardStatus,
  VocabStatsResponse,
} from '@/lib/api';
import { useLang } from '@/lib/i18n';

export function VocabTab() {
  const { lang, t } = useLang();
  const vDict = t?.vocab;

  // Mode: 'CATALOG' (Lug'atlar ro'yxati) or 'FLASHCARDS' (Yodlash xonasi)
  const [activeMode, setActiveMode] = React.useState<'CATALOG' | 'FLASHCARDS'>('CATALOG');

  // Server Data
  const [words, setWords] = React.useState<UserKotobaWordItem[]>([]);
  const [stats, setStats] = React.useState<VocabStatsResponse>({
    totalLearning: 0,
    totalMastered: 0,
    totalSaved: 0,
  });
  const [lockedWordCount, setLockedWordCount] = React.useState(0);
  const [isPro, setIsPro] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>('ALL');

  // Expand row for example sentence in catalog
  const [expandedWordId, setExpandedWordId] = React.useState<string | null>(null);

  // Action loading states
  const [updatingWordId, setUpdatingWordId] = React.useState<string | null>(null);
  const [batchAdding, setBatchAdding] = React.useState(false);
  const [batchRemoving, setBatchRemoving] = React.useState(false);

  // Flashcards state
  const [flashcardFilter, setFlashcardFilter] = React.useState<'ALL' | 'LEARNING' | 'MASTERED'>('ALL');
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isCardFlipped, setIsCardFlipped] = React.useState(false);
  const [cardAnimation, setCardAnimation] = React.useState<'none' | 'success' | 'retry'>('none');

  // Load vocabulary from backend
  const loadVocabData = async () => {
    try {
      setLoading(true);
      const [vocabRes, statsRes] = await Promise.all([
        api.getAllVocab(),
        api.getVocabStats().catch(() => ({ totalLearning: 0, totalMastered: 0, totalSaved: 0 })),
      ]);
      setWords(vocabRes.words || []);
      setLockedWordCount(vocabRes.lockedWordCount || 0);
      setIsPro(vocabRes.isPro);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load vocab:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadVocabData();
  }, []);

  // Audio Player
  const playWordAudio = (word: UserKotobaWordItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (word.audioUrl) {
      const audio = new Audio(getMediaUrl(word.audioUrl));
      audio.play().catch(() => {
        speechFallback(word.word);
      });
    } else {
      speechFallback(word.word);
    }
  };

  const speechFallback = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle or Update Flashcard status
  const handleSetFlashcardStatus = async (
    word: UserKotobaWordItem,
    status?: FlashcardStatus,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingWordId(word.id);
      const targetStatus = status || (word.flashcardStatus === 'LEARNING' ? 'MASTERED' : 'LEARNING');
      await api.toggleVocabFlashcard(word.id, targetStatus);

      // Optimistic update
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, flashcardStatus: targetStatus } : w)),
      );

      // Re-fetch stats in background
      api.getVocabStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to update flashcard:', err);
    } finally {
      setUpdatingWordId(null);
    }
  };

  const handleRemoveFlashcard = async (word: UserKotobaWordItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingWordId(word.id);
      await api.removeVocabFlashcard(word.id);
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, flashcardStatus: null } : w)),
      );
      api.getVocabStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to remove flashcard:', err);
    } finally {
      setUpdatingWordId(null);
    }
  };

  // Batch add filtered words to flashcards
  const handleBatchAddFiltered = async () => {
    const unaddedIds = filteredWords.filter((w) => !w.flashcardStatus).map((w) => w.id);
    if (unaddedIds.length === 0) return;
    try {
      setBatchAdding(true);
      await api.batchAddVocabFlashcards(unaddedIds, 'LEARNING');
      setWords((prev) =>
        prev.map((w) => (unaddedIds.includes(w.id) ? { ...w, flashcardStatus: 'LEARNING' } : w)),
      );
      api.getVocabStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to batch add:', err);
    } finally {
      setBatchAdding(false);
    }
  };

  // Batch remove filtered words from flashcards
  const handleBatchRemoveFiltered = async () => {
    const savedIds = filteredWords.filter((w) => !!w.flashcardStatus).map((w) => w.id);
    if (savedIds.length === 0) return;
    try {
      setBatchRemoving(true);
      await api.batchRemoveVocabFlashcards(savedIds);
      setWords((prev) =>
        prev.map((w) => (savedIds.includes(w.id) ? { ...w, flashcardStatus: null } : w)),
      );
      api.getVocabStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to batch remove:', err);
    } finally {
      setBatchRemoving(false);
    }
  };

  // Filter words for catalog
  const filteredWords = React.useMemo(() => {
    return words.filter((w) => {
      const matchLevel = selectedLevel === 'ALL' || w.courseLevel === selectedLevel;
      const matchStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'SAVED' && !!w.flashcardStatus) ||
        (selectedStatusFilter === 'LEARNING' && w.flashcardStatus === 'LEARNING') ||
        (selectedStatusFilter === 'MASTERED' && w.flashcardStatus === 'MASTERED') ||
        (selectedStatusFilter === 'UNSAVED' && !w.flashcardStatus);

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        w.word.toLowerCase().includes(q) ||
        w.furigana.toLowerCase().includes(q) ||
        w.romaji.toLowerCase().includes(q) ||
        w.meaningUz.toLowerCase().includes(q) ||
        (w.meaningRu && w.meaningRu.toLowerCase().includes(q));

      return matchLevel && matchStatus && matchSearch;
    });
  }, [words, selectedLevel, selectedStatusFilter, search]);

  // Flashcards collection
  const flashcardWords = React.useMemo(() => {
    return words.filter((w) => {
      if (flashcardFilter === 'ALL') return !!w.flashcardStatus;
      if (flashcardFilter === 'LEARNING') return w.flashcardStatus === 'LEARNING';
      if (flashcardFilter === 'MASTERED') return w.flashcardStatus === 'MASTERED';
      return false;
    });
  }, [words, flashcardFilter]);

  const currentFlashcard = flashcardWords[currentCardIndex] || null;

  // Flashcard controls
  const handleCardNext = () => {
    setIsCardFlipped(false);
    if (currentCardIndex < flashcardWords.length - 1) {
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
      setCurrentCardIndex(flashcardWords.length - 1);
    }
  };

  const handleMarkMastered = async () => {
    if (!currentFlashcard) return;
    setCardAnimation('success');
    await handleSetFlashcardStatus(currentFlashcard, 'MASTERED');
    setTimeout(() => {
      setCardAnimation('none');
      handleCardNext();
    }, 250);
  };

  const handleMarkLearning = async () => {
    if (!currentFlashcard) return;
    setCardAnimation('retry');
    await handleSetFlashcardStatus(currentFlashcard, 'LEARNING');
    setTimeout(() => {
      setCardAnimation('none');
      handleCardNext();
    }, 250);
  };

  const handleShuffleCards = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex(Math.floor(Math.random() * Math.max(1, flashcardWords.length)));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              {vDict?.title || 'Yapon Tili Lugʻati'}
            </h1>
            <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-lg bg-secondary/80">
              {(vDict?.openWordsCount || '{count} ta ochiq soʻz').replace('{count}', String(words.length))}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {vDict?.subtitle || 'Kurslardagi barcha yangi soʻzlarni oʻrganing va Flashcard orqali mustahkamlang.'}
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
            <BookA className="h-4 w-4 text-primary" />
            <span>{vDict?.catalog || 'Lugʻat Qomusi'}</span>
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
            <span>{vDict?.flashcards || 'Flashcard Yodlash'}</span>
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
            <BookA className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {vDict?.openWords || 'Ochiq soʻzlar'}
            </p>
            <p className="text-base font-black text-foreground">{words.length} ta</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm shrink-0">
            <RotateCw className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {vDict?.learning || 'Yodlanayotgan'}
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
              {vDict?.mastered || 'Yodlangan'}
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
              {vDict?.saved || 'Toʻplamda jami'}
            </p>
            <p className="text-base font-black text-foreground">{stats.totalSaved} ta</p>
          </div>
        </div>
      </div>

      {/* Pro Lock Notification Banner */}
      {!isPro && lockedWordCount > 0 && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                {(vDict?.proBannerTitle || 'Yana {count} ta yuqori bosqich darslaridagi soʻzlar mavjud').replace('{count}', String(lockedWordCount))}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {vDict?.proBannerDesc || 'Minna no Nihongo va yuqori bosqich barcha kurs lugʻatlarini toʻliq ochish uchun Pro obunani faollashtiring.'}
              </p>
            </div>
          </div>

          <Link
            href={`/${lang}/dashboard/premium`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
          >
            <Crown className="h-3.5 w-3.5" />
            <span>{vDict?.proBtn || 'Pro Obuna'}</span>
          </Link>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">
            {vDict?.loading || 'Lugʻatlar yuklanmoqda...'}
          </p>
        </div>
      ) : activeMode === 'CATALOG' ? (
        /* ========================================================
           MODE 1: LUG'ATLAR QOMUSI (Apple/Jisho Compact Rows)
        ======================================================== */
        <div className="space-y-3.5">
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
                  placeholder={vDict?.searchPlaceholder || 'Yaponcha soʻz, furigana, romaji yoki oʻzbekcha maʼno qidirish...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-secondary/30 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
                  >
                    {vDict?.clearSearch || 'Tozalash'}
                  </button>
                )}
              </div>

              {/* Batch Add Button */}
              {filteredWords.some((w) => !w.flashcardStatus) && (
                <button
                  type="button"
                  onClick={handleBatchAddFiltered}
                  disabled={batchAdding || batchRemoving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  title={vDict?.batchAddTooltip || 'Ushbu roʻyxatdagi barcha soʻzlarni Flashcard toʻplamiga qoʻshish'}
                >
                  {batchAdding ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>{vDict?.batchAdd || 'Barchasini qoʻshish'}</span>
                </button>
              )}

              {/* Batch Remove Button */}
              {filteredWords.some((w) => !!w.flashcardStatus) && (
                <button
                  type="button"
                  onClick={handleBatchRemoveFiltered}
                  disabled={batchAdding || batchRemoving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-secondary/80 hover:bg-destructive/15 text-muted-foreground hover:text-destructive border border-border/60 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  title={vDict?.batchRemoveTooltip || 'Ushbu roʻyxatdagi barcha soʻzlarni Flashcard toʻplamidan chiqarish'}
                >
                  {batchRemoving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>{vDict?.batchRemove || 'Barchasini chiqarish'}</span>
                </button>
              )}
            </div>

            {/* Level and Flashcard Status Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
              {/* JLPT Levels */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">
                  {vDict?.levelLabel || 'Daraja:'}
                </span>
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
                    {lvl === 'ALL' ? (vDict?.allLevels || 'Barchasi') : lvl}
                  </button>
                ))}
              </div>

              {/* Flashcard Status Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">
                  {vDict?.collectionLabel || 'Toʻplam:'}
                </span>
                {[
                  { id: 'ALL', label: vDict?.statusAll || 'Barchasi' },
                  { id: 'SAVED', label: vDict?.statusSaved || 'Toʻplamdagi' },
                  { id: 'LEARNING', label: vDict?.statusLearning || '🟡 Yodlanmoqda' },
                  { id: 'MASTERED', label: vDict?.statusMastered || '🟢 Yodlangan' },
                  { id: 'UNSAVED', label: vDict?.statusUnsaved || '➕ Qoʻshilmagan' },
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

          {/* Words Count Indicator */}
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-1">
            <span>
              {vDict?.foundWords || 'Topilgan soʻzlar:'} <strong className="text-foreground font-bold">{filteredWords.length} ta</strong>
            </span>
            <span>{vDict?.styleBadge || 'Jisho minimalist koʻrinishida'}</span>
          </div>

          {/* Compact Rows List (Apple Dictionary Style) */}
          <div className="rounded-2xl border border-border/70 bg-card divide-y divide-border/50 shadow-2xs overflow-hidden">
            {filteredWords.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <BookA className="h-8 w-8 mx-auto text-muted-foreground/60" />
                <p className="text-sm font-bold text-foreground">
                  {vDict?.emptyCatalogTitle || 'Hech qanday soʻz topilmadi'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vDict?.emptyCatalogDesc || 'Qidiruv soʻzini oʻzgartirib yoki filtrlarni tozalab koʻring.'}
                </p>
              </div>
            ) : (
              filteredWords.map((word) => {
                const isExpanded = expandedWordId === word.id;
                const hasSentence = !!word.sampleSentence;

                return (
                  <div
                    key={word.id}
                    className="group hover:bg-secondary/25 transition-colors duration-150"
                  >
                    {/* Compact Main Row (~48px height) */}
                    <div
                      onClick={() => {
                        if (hasSentence) {
                          setExpandedWordId(isExpanded ? null : word.id);
                        }
                      }}
                      className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      {/* Left: Speaker + Japanese Word + Furigana/Romaji + Level/Lesson Pill */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Audio speaker button */}
                        <button
                          type="button"
                          onClick={(e) => playWordAudio(word, e)}
                          className="h-8 w-8 rounded-lg bg-secondary/60 hover:bg-primary hover:text-white text-muted-foreground flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs active:scale-90"
                          title={vDict?.listenAudio || 'Talaffuzni tinglash'}
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>

                        {/* Word Details */}
                        <div className="flex items-baseline gap-2.5 min-w-0 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-foreground font-japanese tracking-wide group-hover:text-primary transition-colors">
                            {word.word}
                          </span>

                          {word.furigana && word.furigana !== word.word && (
                            <span className="text-xs font-semibold text-muted-foreground font-japanese">
                              [{word.furigana}]
                            </span>
                          )}

                          {word.romaji && (
                            <span className="text-xs text-muted-foreground font-mono hidden md:inline">
                              {word.romaji}
                            </span>
                          )}

                          {/* Lesson badge */}
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-secondary/80 text-muted-foreground hidden sm:inline">
                            {(vDict?.lessonBadge || '{level} • {order}-dars')
                              .replace('{level}', word.courseLevel)
                              .replace('{order}', String(word.lessonOrder))}
                          </span>
                        </div>
                      </div>

                      {/* Middle / Right: Translated meaning */}
                      <div className="text-right sm:text-left sm:flex-1 min-w-0 pr-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground truncate block">
                          {lang === 'ru' && word.meaningRu ? word.meaningRu : word.meaningUz}
                        </span>
                      </div>

                      {/* Right: Actions & Flashcard Toggle */}
                      <div
                        className="flex items-center gap-1.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Example sentence expand indicator */}
                        {hasSentence && (
                          <button
                            type="button"
                            onClick={() => setExpandedWordId(isExpanded ? null : word.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all hidden sm:flex cursor-pointer"
                            title={isExpanded ? (vDict?.hideExample || 'Misolni yopish') : (vDict?.showExample || 'Misol gapni koʻrish')}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}

                        {/* Flashcard Action Button */}
                        {word.flashcardStatus === 'MASTERED' ? (
                          <button
                            type="button"
                            onClick={(e) => handleSetFlashcardStatus(word, 'LEARNING', e)}
                            disabled={updatingWordId === word.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer shadow-2xs active:scale-95"
                            title={vDict?.tooltipMastered || "Yodlangan deb belgilangan. Qaytarishga oʻtkazish uchun bosing."}
                          >
                            {updatingWordId === word.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            <span className="hidden sm:inline">{vDict?.btnMastered || 'Yodlandi'}</span>
                          </button>
                        ) : word.flashcardStatus === 'LEARNING' ? (
                          <button
                            type="button"
                            onClick={(e) => handleSetFlashcardStatus(word, 'MASTERED', e)}
                            disabled={updatingWordId === word.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25 transition-all cursor-pointer shadow-2xs active:scale-95"
                            title={vDict?.tooltipLearning || "Yodlanmoqda. Yodladim deb belgilash uchun bosing."}
                          >
                            {updatingWordId === word.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCw className="h-3 w-3 text-yellow-500" />
                            )}
                            <span className="hidden sm:inline">{vDict?.btnLearning || 'Yodlanmoqda'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleSetFlashcardStatus(word, 'LEARNING', e)}
                            disabled={updatingWordId === word.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 transition-all cursor-pointer shadow-2xs active:scale-95"
                            title={vDict?.tooltipAdd || "Flashcard toʻplamiga qoʻshish"}
                          >
                            {updatingWordId === word.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3 text-primary" />
                            )}
                            <span className="hidden sm:inline">{vDict?.btnAddToFlashcards || 'Flashcard'}</span>
                          </button>
                        )}

                        {/* Remove from Flashcards if already saved */}
                        {word.flashcardStatus && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveFlashcard(word, e)}
                            disabled={updatingWordId === word.id}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title={vDict?.removeFromCollection || "Toʻplamdan olib tashlash"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Example Sentence Accordion */}
                    {isExpanded && hasSentence && (
                      <div className="px-4 py-3 bg-secondary/15 border-t border-border/40 text-xs space-y-1.5 animate-in fade-in-50 duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {vDict?.exampleSentence || 'Misol gap:'}
                          </span>
                          <button
                            type="button"
                            onClick={() => speechFallback(word.sampleSentence!)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>{vDict?.listenExample || 'Misolni tinglash'}</span>
                          </button>
                        </div>
                        <p className="font-bold text-foreground font-japanese text-[13px] leading-relaxed">
                          {word.sampleSentence}
                        </p>
                        {word.sampleSentenceUz && (
                          <p className="text-muted-foreground leading-relaxed">
                            {word.sampleSentenceUz}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
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
              {vDict?.statusAll || 'Barchasi'} ({stats.totalSaved})
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
              {vDict?.statusLearning || '🔄 Yodlanmoqda'} ({stats.totalLearning})
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
              {vDict?.statusMastered || '✅ Yodlangan'} ({stats.totalMastered})
            </button>
          </div>

          {/* Flashcard Body */}
          {flashcardWords.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card p-10 text-center space-y-4 shadow-xs">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Layers className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {vDict?.emptyFlashcardsTitle || 'Ushbu toifada hozircha soʻzlar yoʻq'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {vDict?.emptyFlashcardsDesc || 'Lugʻatlar qomusiga oʻtib, xohlagan soʻzlaringizni «➕ Flashcard» tugmasi orqali toʻplamga qoʻshing va bu yerda yodlang.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMode('CATALOG')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <BookA className="h-4 w-4" />
                <span>{vDict?.goToCatalog || 'Lugʻatlar qomusiga oʻtish'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress and Counter */}
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-foreground">
                    {currentCardIndex + 1} / {flashcardWords.length}
                  </span>
                  <span>{vDict?.wordsCountSuffix || 'ta soʻz'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShuffleCards}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={vDict?.shuffle || 'Aralashtirish'}
                  >
                    <Shuffle className="h-3 w-3" />
                    <span>{vDict?.shuffle || 'Aralashtirish'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentCardIndex + 1) / flashcardWords.length) * 100}%`,
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
                      {(vDict?.lessonBadge || '{level} • {order}-dars')
                        .replace('{level}', currentFlashcard?.courseLevel || '')
                        .replace('{order}', String(currentFlashcard?.lessonOrder || ''))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground">
                      {currentFlashcard?.flashcardStatus === 'MASTERED'
                        ? (vDict?.statusMastered || '🟢 Yodlangan')
                        : (vDict?.statusLearning || '🟡 Yodlanmoqda')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => playWordAudio(currentFlashcard!, e)}
                      className="h-8 w-8 rounded-xl bg-secondary hover:bg-primary hover:text-white text-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title={vDict?.listenAudio || 'Talaffuzni tinglash'}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Card Center Content */}
                <div className="my-auto py-6 text-center space-y-3">
                  {!isCardFlipped ? (
                    /* FRONT: Japanese Word & Furigana */
                    <div className="space-y-2 animate-in zoom-in-95 duration-150">
                      <h2 className="text-3xl sm:text-4xl font-black text-foreground font-japanese tracking-wide">
                        {currentFlashcard?.word}
                      </h2>
                      {currentFlashcard?.furigana && currentFlashcard.furigana !== currentFlashcard.word && (
                        <p className="text-base sm:text-lg font-semibold text-primary font-japanese">
                          {currentFlashcard.furigana}
                        </p>
                      )}
                      {currentFlashcard?.romaji && (
                        <p className="text-xs font-mono text-muted-foreground">
                          {currentFlashcard.romaji}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground pt-4 animate-pulse">
                        {vDict?.flipHint || 'Maʼnosini koʻrish uchun bosing 👆'}
                      </p>
                    </div>
                  ) : (
                    /* BACK: Meaning & Example Sentence */
                    <div className="space-y-3 animate-in zoom-in-95 duration-150">
                      <span className="text-[11px] font-bold uppercase text-primary tracking-wider px-2 py-0.5 rounded-md bg-primary/10">
                        {currentFlashcard?.partOfSpeech}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                        {lang === 'ru' && currentFlashcard?.meaningRu
                          ? currentFlashcard.meaningRu
                          : currentFlashcard?.meaningUz}
                      </h3>
                      {lang !== 'ru' && currentFlashcard?.meaningRu && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {currentFlashcard.meaningRu}
                        </p>
                      )}

                      {currentFlashcard?.sampleSentence && (
                        <div className="rounded-2xl bg-card border border-border/60 p-3 text-left space-y-1 mt-4 text-xs">
                          <p className="font-bold text-foreground font-japanese">
                            {currentFlashcard.sampleSentence}
                          </p>
                          {currentFlashcard.sampleSentenceUz && (
                            <p className="text-muted-foreground text-[11px]">
                              {currentFlashcard.sampleSentenceUz}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Hint */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-medium">
                  <span>
                    {isCardFlipped ? (vDict?.confirmHint || 'Yodlaganingizni tasdiqlang 👇') : (vDict?.frontLabel || 'Old tomoni')}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentFlashcard) handleRemoveFlashcard(currentFlashcard);
                    }}
                    className="hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{vDict?.removeFromCollection || 'Toʻplamdan chiqarish'}</span>
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
                  <span>{vDict?.btnStillLearning || 'Hali yodlanmadi'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkMastered}
                  className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{vDict?.btnLearned || 'Yodladim!'}</span>
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
                  <span>{vDict?.btnPrev || 'Oldingisi'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCardNext}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <span>{vDict?.btnNext || 'Keyingisi'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
