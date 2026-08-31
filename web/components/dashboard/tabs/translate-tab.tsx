'use client';

import * as React from 'react';
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  Sparkles,
  BookA,
  RotateCcw,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { api, TranslateResponse } from '@/lib/api';

const QUICK_PROMPTS_JA = [
  'こんにちは、お元気ですか？',
  '初めまして、よろしくお願いします。',
  '明日の天気を教えてください。',
  '日本語の勉強はとても面白いです。',
];

const QUICK_PROMPTS_UZ = [
  'Assalomu alaykum, ishlaringiz yaxshimi?',
  'Tanishganimdan juda xursandman.',
  'Yapon tilini oʻrganish qiziqarli.',
  'Kutubxona qayerda joylashgan?',
];

export function TranslateTab() {
  const [inputText, setInputText] = React.useState('');
  const [result, setResult] = React.useState<TranslateResponse | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [direction, setDirection] = React.useState<'ja-uz' | 'uz-ja'>('ja-uz');

  const handleTranslate = async (textToTranslate?: string) => {
    const query = (textToTranslate ?? inputText).trim();
    if (!query) {
      setResult(null);
      setError(null);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const res = await api.translate(query, direction);
      setResult(res);
    } catch (err: any) {
      const msg =
        err?.message ||
        'Tarjima qilishda xatolik yuz berdi. Backenddagi GROQ_API_KEY sozlamalarini tekshiring.';
      setError(msg);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapDirection = () => {
    setDirection((prev) => (prev === 'ja-uz' ? 'uz-ja' : 'ja-uz'));
    if (result?.translation) {
      const newQuery = result.translation;
      setInputText(newQuery);
      setResult(null);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playAudio = (text: string, lang: 'ja' | 'uz') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ja' ? 'ja-JP' : 'uz-UZ';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const quickPrompts = direction === 'ja-uz' ? QUICK_PROMPTS_JA : QUICK_PROMPTS_UZ;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-blue-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
                <Languages className="h-3.5 w-3.5" />
                <span>Smart Tarjimon & Lugʻat</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                <Cpu className="h-3.5 w-3.5" />
                <span>Model: Groq AI (Ultra Fast)</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Yaponcha-Oʻzbekcha Sunʼiy Intellekt Tarjimoni
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Iyerogliflar (kanji), furigana, romaji va grammatik kontekstni aniq tahlil
              qiluvchi yuqori unumdor AI modeli bilan integratsiya qilingan tarjima moduli.
            </p>
          </div>
        </div>
      </div>

      {/* Translation Workspace */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        {/* Direction Switcher & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">
              {direction === 'ja-uz' ? 'Yapon tili (日本語)' : 'Oʻzbek tili'}
            </span>
            <button
              type="button"
              onClick={handleSwapDirection}
              title="Tilni almashtirish"
              className="p-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-foreground">
              {direction === 'ja-uz' ? 'Oʻzbek tili' : 'Yapon tili (日本語)'}
            </span>
          </div>

          {inputText && (
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setResult(null);
                setError(null);
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Tozalash
            </button>
          )}
        </div>

        {/* Textboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Box */}
          <div className="flex flex-col justify-between space-y-3">
            <div className="relative flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                placeholder={
                  direction === 'ja-uz'
                    ? 'Yaponcha soʻz yoki gap kiriting (masalan: こんにちは、元気ですか？)...'
                    : 'Oʻzbekcha soʻz yoki gap kiriting...'
                }
                rows={7}
                className="w-full h-full min-h-[180px] rounded-2xl border border-border bg-secondary/30 p-4 text-sm sm:text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {inputText && (
                  <button
                    type="button"
                    onClick={() =>
                      playAudio(inputText, direction === 'ja-uz' ? 'ja' : 'uz')
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Eshitish
                  </button>
                )}
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Ctrl + Enter orqali tarjima qiling
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleTranslate()}
                disabled={isTranslating || !inputText.trim()}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isTranslating ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>AI tahlil qilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Tarjima qilish</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick sample prompt chips */}
            <div className="pt-2">
              <span className="text-[11px] text-muted-foreground block mb-2 font-medium">
                Tezkor namunalar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(prompt);
                      handleTranslate(prompt);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output Box */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-secondary/20 p-5 min-h-[220px]">
            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  <span>Xatolik</span>
                </div>
                <p className="leading-relaxed">{error}</p>
              </div>
            ) : isTranslating ? (
              <div className="space-y-4 py-6">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Groq AI kontekstni tahlil qilmoqda...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-secondary/70 rounded-md animate-pulse w-3/4" />
                  <div className="h-4 bg-secondary/50 rounded-md animate-pulse w-1/2" />
                  <div className="h-4 bg-secondary/30 rounded-md animate-pulse w-5/6" />
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Main Translation */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tarjima:
                  </span>
                  <div className="text-base sm:text-lg text-foreground font-semibold leading-relaxed select-text">
                    {result.translation}
                  </div>
                </div>

                {/* Romaji Reading */}
                {result.romaji && (
                  <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      <span className="flex items-center gap-1">
                        <BookA className="h-3.5 w-3.5" />
                        Romaji (Oʻqilishi):
                      </span>
                      <button
                        type="button"
                        onClick={() => playAudio(result.romaji || '', 'ja')}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="h-3 w-3" /> Tinglash
                      </button>
                    </div>
                    <p className="text-sm font-mono text-foreground select-text">
                      {result.romaji}
                    </p>
                  </div>
                )}

                {/* Furigana / Kanji breakdown */}
                {result.furigana && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Kanjilar: </span>
                    <span className="font-mono">{result.furigana}</span>
                  </div>
                )}

                {/* Notes & Grammar context */}
                {result.notes && (
                  <div className="rounded-xl border border-purple-500/15 bg-purple-500/5 p-3 text-xs space-y-1">
                    <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Izoh va Grammatika:
                    </span>
                    <p className="text-foreground/90 leading-relaxed select-text">
                      {result.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center text-muted-foreground p-6 space-y-2">
                <Languages className="h-8 w-8 stroke-1 text-muted-foreground/50" />
                <p className="text-sm font-medium">
                  Tarjima natijasi shu yerda koʻrinadi
                </p>
                <p className="text-xs text-muted-foreground/80 max-w-xs">
                  Matn kiriting va &quot;Tarjima qilish&quot; tugmasini bosing yoki namunalardan birini tanlang.
                </p>
              </div>
            )}

            {result && !isTranslating && (
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-border/50 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    playAudio(
                      result.translation,
                      direction === 'ja-uz' ? 'uz' : 'ja'
                    )
                  }
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <Volume2 className="h-4 w-4" /> Natijani eshitish
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(result.translation)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" /> Nusxa olindi
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Nusxalash
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
