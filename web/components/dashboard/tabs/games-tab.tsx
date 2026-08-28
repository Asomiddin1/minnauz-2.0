'use client';

import * as React from 'react';
import {
  Gamepad2,
  Trophy,
  Zap,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface GameScore {
  title: string;
  score: number;
  badge: string;
}

const KANA_PAIRS = [
  { kana: 'あ', romaji: 'a' },
  { kana: 'い', romaji: 'i' },
  { kana: 'う', romaji: 'u' },
  { kana: 'え', romaji: 'e' },
  { kana: 'お', romaji: 'o' },
  { kana: 'か', romaji: 'ka' },
  { kana: 'き', romaji: 'ki' },
  { kana: 'く', romaji: 'ku' },
  { kana: 'け', romaji: 'ke' },
  { kana: 'こ', romaji: 'ko' },
  { kana: 'さ', romaji: 'sa' },
  { kana: 'し', romaji: 'shi' },
];

export function GamesTab() {
  const [selectedGame, setSelectedGame] = React.useState<'speed' | 'kanji-match' | 'word-rush'>('speed');
  
  // Speed Drill Game State
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(20);
  const [gameState, setGameState] = React.useState<'idle' | 'playing' | 'ended'>('idle');
  const [feedback, setFeedback] = React.useState<'correct' | 'wrong' | null>(null);

  // Generate 4 randomized options
  const currentPair = KANA_PAIRS[currentIndex % KANA_PAIRS.length];
  const options = React.useMemo(() => {
    const wrong = KANA_PAIRS.filter((p) => p.romaji !== currentPair.romaji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((p) => p.romaji);
    return [currentPair.romaji, ...wrong].sort(() => 0.5 - Math.random());
  }, [currentIndex, currentPair.romaji]);

  React.useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('ended');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(20);
    setCurrentIndex(0);
    setGameState('playing');
    setFeedback(null);
  };

  const handleAnswer = (romaji: string) => {
    if (gameState !== 'playing') return;
    if (romaji === currentPair.romaji) {
      setScore((s) => s + 10);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setTimeout(() => {
      setFeedback(null);
      setCurrentIndex((idx) => idx + 1);
    }, 250);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-amber-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Yapon tili oʻyinlari & Bellashuvlar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Oʻynab oʻrganing: Interaktiv mashqlar
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Xotirani charxlash va reaksiyani oshirish uchun qiziqarli mini-oʻyinlar. Har kuni 5
              daqiqa oʻynab yangi soʻz va belgilarni mustahkamlang!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-border bg-card/80 p-4 text-center">
              <Trophy className="mx-auto h-5 w-5 text-amber-500 mb-1" />
              <div className="text-xs text-muted-foreground">Eng yuqori ball</div>
              <div className="text-lg font-bold text-foreground">240 pts</div>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4 text-center">
              <Flame className="mx-auto h-5 w-5 text-rose-500 mb-1" />
              <div className="text-xs text-muted-foreground">Oʻyin ligasi</div>
              <div className="text-lg font-bold text-rose-500">Oltin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            id: 'speed',
            title: 'Kana Speed Sprint',
            desc: 'Hiragana va Katakanani tezkor topish',
            icon: Zap,
            tag: 'Mashhur',
          },
          {
            id: 'kanji-match',
            title: 'Kanji Match',
            desc: 'Iyeroglif va maʼnolarini juftlash',
            icon: Sparkles,
            tag: 'N5-N4',
          },
          {
            id: 'word-rush',
            title: 'Kotoba Rush',
            desc: 'Vaqtga qarshi soʻz topish maratoni',
            icon: Clock,
            tag: 'Tezkor',
          },
        ].map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGame(g.id as any)}
            className={`flex flex-col text-left p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedGame === g.id
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                : 'border-border bg-card hover:bg-secondary/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-secondary text-foreground">
                <g.icon className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-bold text-muted-foreground">
                {g.tag}
              </span>
            </div>
            <div className="font-bold text-foreground text-base">{g.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{g.desc}</div>
          </button>
        ))}
      </div>

      {/* Main Interactive Game Arena */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 text-center shadow-xs">
        {selectedGame === 'speed' && (
          <div className="max-w-md mx-auto space-y-6">
            {gameState === 'idle' && (
              <div className="space-y-6 py-8">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-500/10 text-amber-500 shadow-inner">
                  <Zap className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Kana Speed Sprint</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    20 soniya ichida imkon qadar koʻproq Hiragana belgilarining toʻgʻri oʻqilishini
                    toping!
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
                >
                  Oʻyinni boshlash (20s)
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="space-y-6">
                {/* Stats Header */}
                <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-secondary/50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Vaqt: {timeLeft}s</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Award className="h-4 w-4" />
                    <span>Ball: {score}</span>
                  </div>
                </div>

                {/* Question Kana Card */}
                <div
                  className={`relative rounded-3xl border-2 p-10 transition-all ${
                    feedback === 'correct'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : feedback === 'wrong'
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-border bg-secondary/30'
                  }`}
                >
                  <span className="text-7xl font-extrabold text-foreground tracking-widest select-none">
                    {currentPair.kana}
                  </span>
                  {feedback === 'correct' && (
                    <CheckCircle2 className="absolute top-4 right-4 h-6 w-6 text-emerald-500" />
                  )}
                  {feedback === 'wrong' && (
                    <XCircle className="absolute top-4 right-4 h-6 w-6 text-rose-500" />
                  )}
                </div>

                {/* 4 Choices */}
                <div className="grid grid-cols-2 gap-3">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="h-14 rounded-2xl border border-border bg-card text-base font-bold text-foreground hover:bg-secondary/80 hover:border-primary/50 transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState === 'ended' && (
              <div className="space-y-6 py-8">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-500/10 text-emerald-500">
                  <Trophy className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Vaqt tugadi!</h3>
                  <p className="text-sm text-muted-foreground">
                    Siz <span className="font-bold text-foreground">{score} ball</span> toʻpladingiz!
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" /> Qayta oʻynash
                </button>
              </div>
            )}
          </div>
        )}

        {selectedGame !== 'speed' && (
          <div className="py-12 space-y-4 max-w-sm mx-auto">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Tez kunda yangi daraja</h3>
            <p className="text-xs text-muted-foreground">
              Ushbu oʻyin rejimi keyingi yangilanishda taqdim etiladi. Hozircha Kana Speed Sprint
              oʻyinida bellashing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
