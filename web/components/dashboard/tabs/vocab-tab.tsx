'use client';

import * as React from 'react';
import {
  Search,
  Volume2,
  BookA,
  Sparkles,
  Bookmark,
  ChevronRight,
  RotateCw,
  Layers,
  Filter,
  CheckCircle,
} from 'lucide-react';

interface WordItem {
  id: string;
  word: string;
  furigana: string;
  romaji: string;
  meaningUz: string;
  meaningRu: string;
  level: 'N5' | 'N4' | 'N3' | 'N2';
  partOfSpeech: string;
  sampleSentence: string;
  sampleSentenceUz: string;
}

const SAMPLE_WORDS: WordItem[] = [
  {
    id: '1',
    word: 'わたし',
    furigana: 'わたし',
    romaji: 'watashi',
    meaningUz: 'Men',
    meaningRu: 'Я',
    level: 'N5',
    partOfSpeech: 'Olmosh',
    sampleSentence: 'わたしは がくせいです。',
    sampleSentenceUz: 'Men talabaman.',
  },
  {
    id: '2',
    word: 'せんせい',
    furigana: 'せんせい',
    romaji: 'sensei',
    meaningUz: "O'qituvchi, ustoz",
    meaningRu: 'Учитель',
    level: 'N5',
    partOfSpeech: 'Ot',
    sampleSentence: 'たなかさんは にほんごの せんせいです。',
    sampleSentenceUz: 'Tanaka janoblari yapon tili oʻqituvchisi.',
  },
  {
    id: '3',
    word: 'にほんご',
    furigana: 'にほんご',
    romaji: 'nihongo',
    meaningUz: 'Yapon tili',
    meaningRu: 'Японский язык',
    level: 'N5',
    partOfSpeech: 'Ot',
    sampleSentence: 'にほんごを べんきょうします。',
    sampleSentenceUz: 'Yapon tilini oʻrganaman.',
  },
  {
    id: '4',
    word: 'ともだち',
    furigana: 'ともだち',
    romaji: 'tomodachi',
    meaningUz: "Do'st",
    meaningRu: 'Друг',
    level: 'N5',
    partOfSpeech: 'Ot',
    sampleSentence: 'あした ともだちに あいます。',
    sampleSentenceUz: "Ertaga do'stim bilan uchrashaman.",
  },
  {
    id: '5',
    word: 'べんきょう',
    furigana: 'べんきょう',
    romaji: 'benkyou',
    meaningUz: "O'qish, ta'lim",
    meaningRu: 'Учёба',
    level: 'N5',
    partOfSpeech: 'Ot / Feʻl',
    sampleSentence: 'まいあさ にほんごを べんきょうします。',
    sampleSentenceUz: 'Har tong yapon tilini oʻrganaman.',
  },
  {
    id: '6',
    word: 'がんばる',
    furigana: 'がんばる',
    romaji: 'ganbaru',
    meaningUz: "Qattiq harakat qilmoq, g'ayrat qilmoq",
    meaningRu: 'Стараться',
    level: 'N4',
    partOfSpeech: "Fe'l",
    sampleSentence: 'しけんのために いっしょうけんめい がんばります。',
    sampleSentenceUz: 'Imtihon uchun bor kuchim bilan harakat qilaman.',
  },
  {
    id: '7',
    word: 'やくそく',
    furigana: 'やくそく',
    romaji: 'yakusoku',
    meaningUz: "Va'da, kelishuv",
    meaningRu: 'Обещание',
    level: 'N4',
    partOfSpeech: 'Ot',
    sampleSentence: 'ともだちと やくそくが あります。',
    sampleSentenceUz: "Do'stim bilan va'dalashuvim bor.",
  },
  {
    id: '8',
    word: 'けいけん',
    furigana: 'けいけん',
    romaji: 'keiken',
    meaningUz: 'Tajriba',
    meaningRu: 'Опыт',
    level: 'N3',
    partOfSpeech: 'Ot',
    sampleSentence: 'にほんで たくさんの けいけんを つみました。',
    sampleSentenceUz: 'Yaponiyada koʻplab tajriba orttirdim.',
  },
];

export function VocabTab() {
  const [search, setSearch] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('ALL');
  const [savedWordIds, setSavedWordIds] = React.useState<string[]>([]);
  const [flashcardIndex, setFlashcardIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  const levels = ['ALL', 'N5', 'N4', 'N3', 'N2'];

  const filteredWords = SAMPLE_WORDS.filter((w) => {
    const matchLevel = selectedLevel === 'ALL' || w.level === selectedLevel;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      w.word.toLowerCase().includes(q) ||
      w.furigana.toLowerCase().includes(q) ||
      w.romaji.toLowerCase().includes(q) ||
      w.meaningUz.toLowerCase().includes(q);
    return matchLevel && matchSearch;
  });

  const toggleSave = (id: string) => {
    setSavedWordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const playWordAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentFlashcard = filteredWords[flashcardIndex % (filteredWords.length || 1)];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BookA className="h-3.5 w-3.5" />
              <span>Interaktiv Lugʻat Bazasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Yapon tili lugʻati & Flashkartalar
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              JLPT N5 dan N1 gacha boʻlgan 5000+ dan ziyod soʻzlarni audiolari, misol gaplari va
              furigana oʻqilishlari bilan oson yod oling.
            </p>
          </div>

          {/* Quick Flashcard Mini Widget */}
          {currentFlashcard && (
            <div className="shrink-0 w-full md:w-80 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-semibold text-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Kun soʻzi
                </span>
                <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-bold">
                  {currentFlashcard.level}
                </span>
              </div>
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer rounded-xl bg-secondary/50 p-4 text-center transition-all hover:bg-secondary/70 min-h-[90px] flex flex-col items-center justify-center"
              >
                {!isFlipped ? (
                  <>
                    <span className="text-2xl font-bold text-foreground">
                      {currentFlashcard.word}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {currentFlashcard.romaji}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-base font-bold text-primary">
                      {currentFlashcard.meaningUz}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {currentFlashcard.sampleSentenceUz}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 text-xs">
                <button
                  onClick={() => playWordAudio(currentFlashcard.word)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Eshitish
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) => (prev + 1) % filteredWords.length);
                  }}
                  className="flex items-center gap-1 font-medium text-primary hover:underline cursor-pointer"
                >
                  Keyingisi <RotateCw className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {lvl === 'ALL' ? 'Barchasi' : lvl}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="So'z, furigana yoki tarjima qidiring..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs sm:text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((item) => {
          const isSaved = savedWordIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground tracking-wide">
                        {item.word}
                      </span>
                      {item.furigana !== item.word && (
                        <span className="text-xs text-muted-foreground">({item.furigana})</span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{item.romaji}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                      {item.level}
                    </span>
                    <button
                      onClick={() => toggleSave(item.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isSaved
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                          : 'border-border text-muted-foreground hover:bg-secondary'
                      }`}
                      title={isSaved ? "Saqlanganlardan o'chirish" : 'Lugʻatga saqlash'}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 space-y-1.5">
                  <div className="text-sm font-semibold text-foreground">{item.meaningUz}</div>
                  {item.meaningRu && (
                    <div className="text-xs text-muted-foreground">{item.meaningRu}</div>
                  )}
                </div>

                {/* Example sentence */}
                <div className="mt-4 rounded-xl bg-secondary/40 p-3 text-xs space-y-1">
                  <div className="font-medium text-foreground">{item.sampleSentence}</div>
                  <div className="text-muted-foreground">{item.sampleSentenceUz}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="text-muted-foreground text-[11px]">{item.partOfSpeech}</span>
                <button
                  onClick={() => playWordAudio(item.word)}
                  className="flex items-center gap-1.5 font-medium text-primary hover:text-primary/80 cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Talaffuz</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWords.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BookA className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">Hech qanday soʻz topilmadi</p>
          <p className="text-xs text-muted-foreground mt-1">
            Qidiruv soʻzini oʻzgartirib yoki filtrni tozalab koʻring.
          </p>
        </div>
      )}
    </div>
  );
}
