'use client';

import * as React from 'react';
import {
  X,
  Volume2,
  Bookmark,
  CheckCircle2,
  RotateCw,
  Plus,
  Play,
  PenTool,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { UserKanjiItem, FlashcardStatus } from '@/lib/api';
import { KanjiStrokeAnimator } from './kanji-stroke-animator';
import { KanjiDrawingCanvas } from './kanji-drawing-canvas';

interface KanjiDetailModalProps {
  kanji: UserKanjiItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFlashcard: (kanji: UserKanjiItem, status?: FlashcardStatus) => void;
}

export function KanjiDetailModal({
  kanji,
  isOpen,
  onClose,
  onToggleFlashcard,
}: KanjiDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<'ANIMATION' | 'DRAWING'>('ANIMATION');

  if (!isOpen || !kanji) return null;

  const playPronunciation = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-card border border-border/80 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-12 w-12 rounded-2xl bg-primary/10 text-primary place-items-center text-2xl font-black font-japanese shrink-0 shadow-inner">
              {kanji.character}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-foreground truncate">
                  {kanji.meaningUz}
                </h3>
                <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black shrink-0">
                  {kanji.courseLevel}
                </span>
                <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                  {kanji.strokeCount} chiziq
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {kanji.meaningRu || 'Iyeroglif laboratoriyasi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Flashcard Button */}
            {kanji.flashcardStatus === 'MASTERED' ? (
              <button
                type="button"
                onClick={() => onToggleFlashcard(kanji, 'LEARNING')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer shadow-2xs"
                title="Yodlangan"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Yodlandi</span>
              </button>
            ) : kanji.flashcardStatus === 'LEARNING' ? (
              <button
                type="button"
                onClick={() => onToggleFlashcard(kanji, 'MASTERED')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25 transition-all cursor-pointer shadow-2xs"
                title="Yodlanmoqda"
              >
                <RotateCw className="h-3.5 w-3.5 text-yellow-500" />
                <span className="hidden sm:inline">Yodlanmoqda</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleFlashcard(kanji, 'LEARNING')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 transition-all cursor-pointer shadow-2xs"
                title="Flashcardga qo'shish"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Flashcard</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Animation vs Canvas */}
        <div className="flex items-center justify-center p-2 bg-secondary/30 border-b border-border/40">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-secondary/60 border border-border/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('ANIMATION')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ANIMATION'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Play className="h-3.5 w-3.5 text-primary" />
              <span>Chizilish Animatsiyasi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DRAWING')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'DRAWING'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PenTool className="h-3.5 w-3.5 text-amber-500" />
              <span>Oʻzing Chizib Koʻr</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Interactive Column (Animation or Canvas) */}
            <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-secondary/15 border border-border/60">
              {activeTab === 'ANIMATION' ? (
                <KanjiStrokeAnimator character={kanji.character} size={250} />
              ) : (
                <KanjiDrawingCanvas character={kanji.character} size={250} />
              )}
            </div>

            {/* Kanji Information & Readings Column */}
            <div className="space-y-4">
              {/* Readings: Onyomi & Kunyomi */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Onyomi (音)
                    </span>
                    {kanji.onyomi && (
                      <button
                        type="button"
                        onClick={() => playPronunciation(kanji.onyomi)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Tinglash"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-black text-foreground font-japanese">
                    {kanji.onyomi || '—'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Kunyomi (訓)
                    </span>
                    {kanji.kunyomi && (
                      <button
                        type="button"
                        onClick={() => playPronunciation(kanji.kunyomi)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Tinglash"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-black text-foreground font-japanese">
                    {kanji.kunyomi || '—'}
                  </p>
                </div>
              </div>

              {/* Radical / Ildiz */}
              {kanji.radical && (
                <div className="p-2.5 rounded-xl bg-secondary/20 border border-border/40 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Radikal (Ildizi):</span>
                  <span className="font-bold text-foreground font-japanese">
                    {kanji.radical}
                  </span>
                </div>
              )}

              {/* Compounds Examples */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Namunaviy soʻzlar
                  </span>
                </div>

                {kanji.examples && kanji.examples.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {kanji.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-secondary/25 border border-border/40 flex items-center justify-between text-xs gap-2"
                      >
                        <div className="flex items-baseline gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => playPronunciation(ex.word)}
                            className="text-muted-foreground hover:text-primary shrink-0 cursor-pointer"
                            title="Tinglash"
                          >
                            <Volume2 className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-foreground font-japanese text-sm">
                            {ex.word}
                          </span>
                          {ex.reading && (
                            <span className="text-[11px] text-muted-foreground font-japanese">
                              [{ex.reading}]
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-foreground/90 truncate text-right">
                          {ex.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-secondary/10 text-center text-xs text-muted-foreground">
                    Namunaviy soʻzlar tez orada kiritiladi.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
