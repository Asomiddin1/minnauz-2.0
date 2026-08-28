'use client';

import * as React from 'react';
import {
  BookOpen,
  Volume2,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
} from 'lucide-react';

interface DokkaiStory {
  id: string;
  title: string;
  titleUz: string;
  level: 'N5' | 'N4' | 'N3';
  readingTime: string;
  japaneseText: string;
  furiganaText: string;
  uzbekTranslation: string;
  vocabulary: { word: string; meaning: string }[];
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const SAMPLE_STORIES: DokkaiStory[] = [
  {
    id: 'dokkai-1',
    title: '私の家族と日曜日',
    titleUz: 'Mening oilam va yakshanba kuni',
    level: 'N5',
    readingTime: '3 daqiqa',
    japaneseText: '日曜日、私の家族は公園へ行きます。公園で散歩をして、お弁当を食べます。妹は花が好きです。とても楽しいです。',
    furiganaText: 'にちようび、わたしの かぞくは こうえんへ いきます。こうえんで さんぽをして、おべんとうを たべます。いもうとは はなが すきです。とても たのしいです。',
    uzbekTranslation: 'Yakshanba kuni mening oilam boqqa boradi. Bogʻda sayr qilib, tushlik (bento) yeymiz. Singlim gullarni yoqtiradi. Juda maroqli.',
    vocabulary: [
      { word: '家族 (かぞく)', meaning: 'Oila' },
      { word: '公園 (こうえん)', meaning: "Bog', park" },
      { word: 'お弁当 (おべんとう)', meaning: 'Bento / tayyor tushlik' },
      { word: '妹 (いもうと)', meaning: 'Singil' },
    ],
    question: {
      prompt: '日曜日、家族はどこへ行きますか？ (Yakshanba kuni oila qayerga boradi?)',
      options: ['学校 (Maktabga)', '公園 (Boqqa / Parkka)', '海 (Dengizga)', '病院 (Shifoxonaga)'],
      correctIndex: 1,
      explanation: "Matnda '私の家族は公園へ行きます' (Mening oilam boqqa boradi) deb keltirilgan.",
    },
  },
  {
    id: 'dokkai-2',
    title: '日本の四季',
    titleUz: 'Yaponiyaning toʻrt fasli',
    level: 'N4',
    readingTime: '4 daqiqa',
    japaneseText: '日本には春、夏、秋、冬の四季があります。春には桜が咲いて、花見をします。秋は紅葉がとても美しいです。',
    furiganaText: 'にほんには はる、なつ、あき、ふゆの しきが あります。はるには さくらが さいて、はなみを します。あきは こうようが とても うつくしいです。',
    uzbekTranslation: 'Yaponiyada bahor, yoz, kuz, qish toʻrt fasli bor. Bahorda sakura gullab, odamlar xanami qilishadi. Kuzda qizil barglar juda chiroyli boʻladi.',
    vocabulary: [
      { word: '四季 (しき)', meaning: 'Toʻrt fasl' },
      { word: '桜 (さくら)', meaning: 'Sakura guli' },
      { word: '花見 (はなみ)', meaning: 'Gul tomoshasi' },
      { word: '紅葉 (こうよう)', meaning: 'Kuzgi qizil yaproqlar' },
    ],
    question: {
      prompt: '春に人々は何をしますか？ (Bahorda odamlar nima qilishadi?)',
      options: ['花見をします (Gul tomosha qiladi)', 'スキーをします (Changʻi uchadi)', '水泳をします (Suzadi)', '紅葉を見ます (Kuzgi yaproqlarni koʻradi)'],
      correctIndex: 0,
      explanation: "Matnda '春には桜が咲いて、花見をします' deb ta'kidlangan.",
    },
  },
];

export function DokkayTab() {
  const [selectedStory, setSelectedStory] = React.useState<DokkaiStory>(SAMPLE_STORIES[0]);
  const [showFurigana, setShowFurigana] = React.useState(true);
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = React.useState(false);

  const handleSelectStory = (story: DokkaiStory) => {
    setSelectedStory(story);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowTranslation(false);
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-emerald-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Dokkay (読解) — Oʻqish & Matn tushunish</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Yapon tilida matn oʻqish va tahlil
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              JLPT imtihonida eng koʻp ball beruvchi qism — Dokkay. Qisqa hikoyalar, maqolalar va
              dialoglarni oʻqib, savollarga javob bering.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-6">
        {/* Story List Sidebar */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Hikoyalar toʻplami
          </div>
          {SAMPLE_STORIES.map((story) => {
            const isSelected = selectedStory.id === story.id;
            return (
              <button
                key={story.id}
                onClick={() => handleSelectStory(story)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                    : 'border-border bg-card hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-bold text-primary">
                    {story.level}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {story.readingTime}
                  </span>
                </div>
                <div className="font-bold text-foreground text-sm">{story.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{story.titleUz}</div>
              </button>
            );
          })}
        </div>

        {/* Story Reader & Quiz Area */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{selectedStory.title}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                    {selectedStory.level}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedStory.titleUz}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFurigana(!showFurigana)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/50 text-xs font-medium text-foreground hover:bg-secondary cursor-pointer"
                >
                  {showFurigana ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>Furigana</span>
                </button>
                <button
                  onClick={() => playAudio(selectedStory.japaneseText)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/50 text-xs font-medium text-foreground hover:bg-secondary cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Oʻqib berish</span>
                </button>
              </div>
            </div>

            {/* Story Text Box */}
            <div className="rounded-2xl bg-secondary/30 p-6 text-foreground leading-loose text-base sm:text-lg">
              {showFurigana ? selectedStory.furiganaText : selectedStory.japaneseText}
            </div>

            {/* Translation Toggle */}
            <div>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{showTranslation ? "Oʻzbekcha tarjimani yashirish" : "Oʻzbekcha tarjimani koʻrish"}</span>
              </button>
              {showTranslation && (
                <div className="mt-3 p-4 rounded-xl bg-secondary/40 text-xs text-muted-foreground leading-relaxed animate-in fade-in">
                  {selectedStory.uzbekTranslation}
                </div>
              )}
            </div>

            {/* Vocabulary Highlight */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Muhim soʻzlar (Lugʻat)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedStory.vocabulary.map((v, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-border/80 bg-card text-xs">
                    <div className="font-bold text-foreground">{v.word}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{v.meaning}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehension Quiz */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Matn yuzasidan savol</span>
              </div>
              <div className="font-semibold text-sm text-foreground">
                {selectedStory.question.prompt}
              </div>

              <div className="space-y-2">
                {selectedStory.question.options.map((opt, idx) => {
                  const isCorrect = idx === selectedStory.question.correctIndex;
                  const isChosen = selectedOption === idx;
                  let style = 'border-border bg-card hover:bg-secondary/60';
                  if (isAnswerSubmitted) {
                    if (isCorrect) style = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-semibold';
                    else if (isChosen) style = 'border-rose-500 bg-rose-500/10 text-rose-600';
                  } else if (isChosen) {
                    style = 'border-primary bg-primary/10 text-primary font-semibold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isAnswerSubmitted && setSelectedOption(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {!isAnswerSubmitted && selectedOption !== null && (
                <button
                  onClick={() => setIsAnswerSubmitted(true)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Javobni tekshirish
                </button>
              )}

              {isAnswerSubmitted && (
                <div className="p-3 rounded-xl bg-secondary/70 text-xs text-muted-foreground space-y-1 animate-in fade-in">
                  <div className="font-semibold text-foreground">Izoh:</div>
                  <div>{selectedStory.question.explanation}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
