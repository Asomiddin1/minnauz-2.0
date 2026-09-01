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
  Plus,
  RotateCcw,
  Bot,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n';

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
  isAiGenerated?: boolean;
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

const SUGGESTED_TOPICS = [
  'Yapon oshxonasi (Sushi va Ramen)',
  'Tokioda poezd bilan sayohat',
  'Yapon choy marosimi',
  'Universitet kutubxonasida',
  'Onsen (issiq buloq) safari',
];

export function DokkayTab() {
  const { lang, t } = useLang();
  const [stories, setStories] = React.useState<DokkaiStory[]>(SAMPLE_STORIES);
  const [selectedStory, setSelectedStory] = React.useState<DokkaiStory>(SAMPLE_STORIES[0]);
  const [showFurigana, setShowFurigana] = React.useState(true);
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = React.useState(false);

  // AI Generator state
  const [isGenModalOpen, setIsGenModalOpen] = React.useState(false);
  const [genLevel, setGenLevel] = React.useState<'N5' | 'N4' | 'N3'>('N5');
  const [genTopic, setGenTopic] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState<string | null>(null);

  const handleSelectStory = (story: DokkaiStory) => {
    setSelectedStory(story);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowTranslation(false);
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerateStory = async () => {
    const topic = genTopic.trim() || SUGGESTED_TOPICS[0];
    setIsGenerating(true);
    setGenError(null);

    try {
      const res = await api.generateDokkai({
        level: genLevel,
        topic,
      });

      const newStory: DokkaiStory = {
        id: `ai-dokkai-${Date.now()}`,
        title: res.title,
        titleUz: res.titleUz,
        level: genLevel,
        readingTime: res.readingTime || '3 daqiqa',
        japaneseText: res.japaneseText,
        furiganaText: res.furiganaText,
        uzbekTranslation: res.uzbekTranslation,
        vocabulary: res.vocabulary,
        question: res.question,
        isAiGenerated: true,
      };

      setStories((prev) => [newStory, ...prev]);
      handleSelectStory(newStory);
      setIsGenModalOpen(false);
      setGenTopic('');
    } catch (e: any) {
      setGenError(e.message || 'AI hikoyasini yaratishda xatolik yuz berdi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-emerald-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{t?.dokkai?.title || 'Dokkay (読解) — Oʻqish & Matn tushunish'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Generator</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t?.dokkai?.subtitle || 'Yapon tilida matn oʻqish va tahlil'}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              JLPT imtihonida eng koʻp ball beruvchi qism — Dokkay. Tayyor hikoyalarni oʻqing yoki AI yordamida oʻzingiz qiziqqan mavzuda cheksiz yangi matnlar yarating.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsGenModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span>Yangi AI Hikoya Yaratish</span>
          </button>
        </div>
      </div>

      {/* AI Generator Modal / Box */}
      {isGenModalOpen && (
        <div className="rounded-3xl border border-purple-500/30 bg-card p-6 sm:p-8 shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">
                  AI Dokkai Matn Generatori
                </h3>
                <p className="text-xs text-muted-foreground">
                  Daraja va mavzuni tanlang, AI siz uchun oʻqish matni, furigana va test savolini tuzadi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsGenModalOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded-lg border border-border"
            >
              Yopish
            </button>
          </div>

          {genError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
              {genError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Level selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">JLPT Darajasi:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['N5', 'N4', 'N3'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setGenLevel(lvl)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      genLevel === lvl
                        ? 'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Mavzu (yoki quyidagi namunalardan tanlang):
              </label>
              <input
                type="text"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="Masalan: Yaponiyada sayohat..."
                className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-purple-500 focus:bg-card"
              />
            </div>
          </div>

          {/* Quick topic suggestion chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">
              Tavsiya etiladigan mavzular:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TOPICS.map((topic, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => setGenTopic(topic)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    genTopic === topic
                      ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateStory}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI matn yaratmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Matnni Generatsiya Qilish</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-6">
        {/* Story List Sidebar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            <span>Hikoyalar ({stories.length})</span>
            <button
              type="button"
              onClick={() => setIsGenModalOpen(true)}
              className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer normal-case text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Yangi
            </button>
          </div>

          <div className="space-y-2">
            {stories.map((story) => {
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
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-bold text-foreground">
                        {story.level}
                      </span>
                      {story.isAiGenerated && (
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> AI
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {story.readingTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm truncate font-japanese">
                    {story.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">{story.titleUz}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Story Reading & Comprehension Area */}
        <div className="space-y-6">
          {/* Main Story Container */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            {/* Story Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    {selectedStory.level} Daraja
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {selectedStory.readingTime} oʻqish vaqti
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground font-japanese">
                  {selectedStory.title}
                </h2>
                <p className="text-sm text-muted-foreground">{selectedStory.titleUz}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => playAudio(selectedStory.japaneseText)}
                  className="p-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer"
                  title="Ovoz chiqarib oʻqish"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowFurigana(!showFurigana)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    showFurigana
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {showFurigana ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>Furigana</span>
                </button>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    showTranslation
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Tarjima
                </button>
              </div>
            </div>

            {/* Japanese Text */}
            <div className="space-y-4">
              <div className="text-lg sm:text-xl text-foreground font-medium leading-[2.4] tracking-wide font-japanese p-4 rounded-2xl bg-secondary/20 border border-border/50 select-text">
                {showFurigana ? selectedStory.furiganaText : selectedStory.japaneseText}
              </div>

              {/* Uzbek Translation (Toggleable) */}
              {showTranslation && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-foreground/90 leading-relaxed animate-in fade-in duration-200">
                  <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 block mb-1">
                    Oʻzbekcha tarjimasi:
                  </span>
                  {selectedStory.uzbekTranslation}
                </div>
              )}
            </div>

            {/* Vocabulary Breakdown */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Matndagi yangi soʻzlar (Kotoba):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedStory.vocabulary.map((vocab, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 text-xs"
                  >
                    <span className="font-bold text-foreground font-japanese text-sm">
                      {vocab.word}
                    </span>
                    <span className="text-muted-foreground">{vocab.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comprehension Question */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Award className="h-4 w-4" />
              <span>Matn tushunish savoli</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {selectedStory.question.prompt}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {selectedStory.question.options.map((option, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === selectedStory.question.correctIndex;

                let btnStyle = 'border-border bg-secondary/30 text-foreground hover:bg-secondary/60';
                if (isSelected) {
                  btnStyle = 'border-primary bg-primary/10 text-primary font-bold';
                }
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      'border-red-500 bg-red-500/15 text-red-700 dark:text-red-300 font-bold';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOption(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation after submission */}
            {isAnswerSubmitted && (
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-foreground/90 leading-relaxed animate-in fade-in duration-200">
                <span className="font-bold text-primary block mb-1">Tushuntirish:</span>
                {selectedStory.question.explanation}
              </div>
            )}

            {/* Submit / Retry Button */}
            <div className="flex items-center justify-end pt-2">
              {!isAnswerSubmitted ? (
                <button
                  disabled={selectedOption === null}
                  onClick={() => setIsAnswerSubmitted(true)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Javobni tekshirish
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAnswerSubmitted(false);
                    setSelectedOption(null);
                  }}
                  className="px-6 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Qayta yechish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
