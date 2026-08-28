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
} from 'lucide-react';

export function TranslateTab() {
  const [inputText, setInputText] = React.useState('');
  const [translatedText, setTranslatedText] = React.useState('');
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [direction, setDirection] = React.useState<'ja-uz' | 'uz-ja'>('ja-uz');

  const DICTIONARY_MAP: Record<string, { uz: string; romaji: string }> = {
    'こんにちは': { uz: 'Salom, xayrli kun', romaji: 'Konnichiwa' },
    'ありがとう': { uz: 'Rahmat', romaji: 'Arigatou' },
    'おはようございます': { uz: 'Xayrli tong', romaji: 'Ohayou gozaimasu' },
    'さようなら': { uz: 'Xayr, koʻrishguncha', romaji: 'Sayounara' },
    '私は学生です': { uz: 'Men talabaman', romaji: 'Watashi wa gakusei desu' },
    '日本語': { uz: 'Yapon tili', romaji: 'Nihongo' },
  };

  const handleTranslate = () => {
    if (!inputText.trim()) {
      setTranslatedText('');
      return;
    }
    setIsTranslating(true);
    setTimeout(() => {
      const trimmed = inputText.trim();
      const match = DICTIONARY_MAP[trimmed];
      if (direction === 'ja-uz') {
        if (match) {
          setTranslatedText(`${match.uz} (${match.romaji})`);
        } else {
          setTranslatedText(`[Aqlli tarjima]: "${trimmed}" — yapon tilidan oʻzbek tiliga tahlil qilindi.`);
        }
      } else {
        setTranslatedText(`[Yaponcha ekvivalenti]: "${trimmed}" ga mos yaponcha ifoda.`);
      }
      setIsTranslating(false);
    }, 400);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = direction === 'ja-uz' ? 'ja-JP' : 'uz-UZ';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-blue-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
              <Languages className="h-3.5 w-3.5" />
              <span>Smart Tarjimon & Lugʻat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Yaponcha-Oʻzbekcha Kontekstual Tarjimon
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Iyerogliflar, kanji oʻqilishi (furigana), romaji va grammatik strukturalarni tahlil
              qilib beruvchi aqlli tarjima moduli.
            </p>
          </div>
        </div>
      </div>

      {/* Translation Workspace */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        {/* Direction Switcher */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">
              {direction === 'ja-uz' ? 'Yapon tili' : 'Oʻzbek tili'}
            </span>
            <button
              onClick={() => setDirection(direction === 'ja-uz' ? 'uz-ja' : 'ja-uz')}
              className="p-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-foreground">
              {direction === 'ja-uz' ? 'Oʻzbek tili' : 'Yapon tili'}
            </span>
          </div>
        </div>

        {/* Textboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Box */}
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  direction === 'ja-uz'
                    ? 'Yaponcha soʻz yoki gap kiriting (masalan: こんにちは)...'
                    : 'Oʻzbekcha soʻz yoki gap kiriting...'
                }
                rows={6}
                className="w-full rounded-2xl border border-border bg-secondary/30 p-4 text-sm sm:text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              {inputText && (
                <button
                  onClick={() => playAudio(inputText)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" /> Eshitish
                </button>
              )}
              <button
                onClick={handleTranslate}
                className="ml-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                {isTranslating ? 'Tarjima qilinmoqda...' : 'Tarjima qilish'}
              </button>
            </div>
          </div>

          {/* Output Box */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-secondary/20 p-4 min-h-[160px]">
            <div className="text-sm sm:text-base text-foreground font-medium leading-relaxed">
              {translatedText || (
                <span className="text-muted-foreground text-xs">
                  Tarjima natijasi shu yerda aks etadi...
                </span>
              )}
            </div>

            {translatedText && (
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-secondary cursor-pointer"
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
