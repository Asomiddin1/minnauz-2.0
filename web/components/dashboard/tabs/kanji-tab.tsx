'use client';

import * as React from 'react';
import {
  Type,
  Search,
  Sparkles,
  Volume2,
  Bookmark,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface KanjiCard {
  id: string;
  char: string;
  onyomi: string;
  kunyomi: string;
  meaningUz: string;
  meaningRu: string;
  strokes: number;
  level: 'N5' | 'N4' | 'N3' | 'N2';
  radical: string;
  examples: { word: string; reading: string; meaning: string }[];
}

const SAMPLE_KANJI: KanjiCard[] = [
  {
    id: 'k1',
    char: '日',
    onyomi: 'ニチ, ジツ',
    kunyomi: 'ひ, -び, -か',
    meaningUz: 'Quyosh, kun',
    meaningRu: 'Солнце, день',
    strokes: 4,
    level: 'N5',
    radical: '日 (quyosh)',
    examples: [
      { word: '日本', reading: 'にほん', meaning: 'Yaponiya' },
      { word: '日曜日', reading: 'にちようび', meaning: 'Yakshanba' },
      { word: '毎日', reading: 'まいにち', meaning: 'Har kuni' },
    ],
  },
  {
    id: 'k2',
    char: '本',
    onyomi: 'ホン',
    kunyomi: 'もと',
    meaningUz: 'Kitob, asos',
    meaningRu: 'Книга, основа',
    strokes: 5,
    level: 'N5',
    radical: '木 (daraxt)',
    examples: [
      { word: '本', reading: 'ほん', meaning: 'Kitob' },
      { word: '日本語', reading: 'にほんご', meaning: 'Yapon tili' },
    ],
  },
  {
    id: 'k3',
    char: '人',
    onyomi: 'ジン, ニン',
    kunyomi: 'ひと',
    meaningUz: 'Odam, shaxs',
    meaningRu: 'Человек',
    strokes: 2,
    level: 'N5',
    radical: '人 (odam)',
    examples: [
      { word: '日本人', reading: 'にほんじん', meaning: 'Yaponiyalik' },
      { word: '三人', reading: 'さんにん', meaning: 'Uch kishi' },
    ],
  },
  {
    id: 'k4',
    char: '月',
    onyomi: 'ゲツ, ガツ',
    kunyomi: 'つき',
    meaningUz: 'Oy, oy (vaqt)',
    meaningRu: 'Луна, месяц',
    strokes: 4,
    level: 'N5',
    radical: '月 (oy)',
    examples: [
      { word: '月曜日', reading: 'げつようび', meaning: 'Dushanba' },
      { word: '一月', reading: 'いちがつ', meaning: 'Yanvar' },
    ],
  },
  {
    id: 'k5',
    char: '学',
    onyomi: 'ガク',
    kunyomi: 'まな・ぶ',
    meaningUz: "Ta'lim, o'rganish",
    meaningRu: 'Учёба, наука',
    strokes: 8,
    level: 'N5',
    radical: '子 (bola)',
    examples: [
      { word: '学校', reading: 'がっこう', meaning: 'Maktab' },
      { word: '学生', reading: 'がくせい', meaning: 'Talaba' },
    ],
  },
  {
    id: 'k6',
    char: '先',
    onyomi: 'セン',
    kunyomi: 'さき',
    meaningUz: 'Oldin, oldingi',
    meaningRu: 'Прежде, раньше',
    strokes: 6,
    level: 'N5',
    radical: '儿 (oyoqlar)',
    examples: [
      { word: '先生', reading: 'せんせい', meaning: "O'qituvchi" },
      { word: '先月', reading: 'せんげつ', meaning: "O'tgan oy" },
    ],
  },
];

export function KanjiTab() {
  const [search, setSearch] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState('ALL');
  const [selectedKanji, setSelectedKanji] = React.useState<KanjiCard | null>(SAMPLE_KANJI[0]);

  const levels = ['ALL', 'N5', 'N4', 'N3', 'N2'];

  const filteredKanji = SAMPLE_KANJI.filter((k) => {
    const matchLvl = selectedLevel === 'ALL' || k.level === selectedLevel;
    const q = search.toLowerCase().trim();
    const matchQuery =
      !q ||
      k.char.includes(q) ||
      k.onyomi.toLowerCase().includes(q) ||
      k.kunyomi.toLowerCase().includes(q) ||
      k.meaningUz.toLowerCase().includes(q);
    return matchLvl && matchQuery;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-indigo-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Type className="h-3.5 w-3.5" />
              <span>Kanji (漢字) — Iyerogliflar Laboratoriyasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              JLPT Iyerogliflari & Radikallar
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Onyomi va Kunyomi oʻqilishlari, chiziqlar ketma-ketligi (stroke order) va birikmalar
              bilan kanjilarni chuqur oʻrganing.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kanji, o'qilishi yoki ma'nosini izlang..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs sm:text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6">
        {/* Kanji Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredKanji.map((kanji) => {
            const isSelected = selectedKanji?.id === kanji.id;
            return (
              <button
                key={kanji.id}
                onClick={() => setSelectedKanji(kanji)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/40'
                }`}
              >
                <span className="text-4xl font-extrabold text-foreground mb-1 select-none">
                  {kanji.char}
                </span>
                <span className="text-xs font-semibold text-foreground text-center line-clamp-1">
                  {kanji.meaningUz}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-bold text-muted-foreground">
                    {kanji.level}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{kanji.strokes} chiziq</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Kanji Details Card */}
        {selectedKanji && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6 self-start sticky top-24">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-secondary/80 text-5xl font-extrabold text-foreground shadow-inner">
                  {selectedKanji.char}
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{selectedKanji.meaningUz}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{selectedKanji.meaningRu}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-xs font-bold">
                      {selectedKanji.level}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Chiziqlar: {selectedKanji.strokes}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Readings */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-secondary/40 space-y-1">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">
                  Onyomi (音読み)
                </div>
                <div className="font-bold text-foreground text-sm">{selectedKanji.onyomi}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 space-y-1">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">
                  Kunyomi (訓読み)
                </div>
                <div className="font-bold text-foreground text-sm">{selectedKanji.kunyomi}</div>
              </div>
            </div>

            {/* Radical */}
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Radikal (Ildiz): </span>
              {selectedKanji.radical}
            </div>

            {/* Compounds / Examples */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Namunaviy birikmalar
              </div>
              <div className="space-y-2">
                {selectedKanji.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-secondary/20 text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground text-sm">{ex.word}</span>
                      <span className="text-muted-foreground ml-2">({ex.reading})</span>
                    </div>
                    <div className="font-medium text-foreground">{ex.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
