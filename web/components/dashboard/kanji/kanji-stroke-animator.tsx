'use client';

import * as React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Loader2,
  Gauge,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';

interface KanjiStrokeAnimatorProps {
  character: string;
  size?: number;
}

export function KanjiStrokeAnimator({ character, size = 260 }: KanjiStrokeAnimatorProps) {
  const { t } = useLang();
  const kDict = t?.kanji;
  const [paths, setPaths] = React.useState<string[]>([]);
  const [numbers, setNumbers] = React.useState<{ text: string; x: number; y: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  // Animation state
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [currentStroke, setCurrentStroke] = React.useState(0); // 0 to paths.length
  const [speed, setSpeed] = React.useState<number>(1); // 0.6 = slow, 1 = normal, 1.6 = fast
  const [showNumbers, setShowNumbers] = React.useState(true);

  // Convert character to 5-digit hex code point for KanjiVG
  const hexCode = React.useMemo(() => {
    if (!character) return '';
    const codePoint = character.codePointAt(0);
    if (!codePoint) return '';
    return codePoint.toString(16).padStart(5, '0');
  }, [character]);

  // Fetch KanjiVG SVG data
  React.useEffect(() => {
    let cancelled = false;
    if (!hexCode) return;

    setLoading(true);
    setError(false);
    setIsPlaying(true);
    setCurrentStroke(0);

    const url = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${hexCode}.svg`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Kanji SVG not found');
        return res.text();
      })
      .then((svgText) => {
        if (cancelled) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');

        // Extract stroke paths
        const pathElements = Array.from(
          doc.querySelectorAll('g[id^="kvg:StrokePaths"] path, path[id*="-s"]'),
        );
        const extractedPaths = pathElements
          .map((p) => p.getAttribute('d') || '')
          .filter((d) => !!d);

        // Extract stroke numbers
        const textElements = Array.from(
          doc.querySelectorAll('g[id^="kvg:StrokeNumbers"] text'),
        );
        const extractedNumbers = textElements.map((t) => {
          const transform = t.getAttribute('transform') || '';
          const match = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,([^,]+),([^)]+)\)/);
          let x = 0;
          let y = 0;
          if (match) {
            x = parseFloat(match[1]);
            y = parseFloat(match[2]);
          } else {
            x = parseFloat(t.getAttribute('x') || '0');
            y = parseFloat(t.getAttribute('y') || '0');
          }
          return {
            text: t.textContent || '',
            x,
            y,
          };
        });

        if (extractedPaths.length > 0) {
          setPaths(extractedPaths);
          setNumbers(extractedNumbers);
          setCurrentStroke(extractedPaths.length); // initially show all or start animating
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hexCode]);

  // Step timer loop
  React.useEffect(() => {
    if (!isPlaying || paths.length === 0) return;

    const intervalTime = Math.round(750 / speed);
    const timer = setInterval(() => {
      setCurrentStroke((prev) => {
        if (prev >= paths.length) {
          // Pause briefly at end, then loop
          return 1;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, paths.length, speed]);

  const handleRestart = () => {
    setCurrentStroke(1);
    setIsPlaying(true);
  };

  const handlePrevStroke = () => {
    setIsPlaying(false);
    setCurrentStroke((prev) => Math.max(1, prev - 1));
  };

  const handleNextStroke = () => {
    setIsPlaying(false);
    setCurrentStroke((prev) => Math.min(paths.length, prev + 1));
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none">
      {/* Canvas Frame with Traditional "田" Grid */}
      <div
        className="relative rounded-3xl border-2 border-border/80 bg-card overflow-hidden shadow-inner flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Traditional Japanese 4-Quadrant Dashed Guideline Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-15">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] border-t-2 border-dashed border-foreground" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-l-2 border-dashed border-foreground" />
          <div className="absolute inset-4 rounded-2xl border border-dashed border-foreground/50" />
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-[11px] font-semibold">Chiziqlar yuklanmoqda...</span>
          </div>
        )}

        {/* Fallback if SVG fails to fetch */}
        {!loading && (error || paths.length === 0) && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <span className="text-7xl sm:text-8xl font-black text-foreground font-japanese">
              {character}
            </span>
            <span className="text-[11px] text-muted-foreground mt-2">
              (Standart koʻrinish)
            </span>
          </div>
        )}

        {/* Animated SVG */}
        {!loading && paths.length > 0 && (
          <svg
            viewBox="0 0 109 109"
            className="w-full h-full p-4"
            style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
          >
            {/* 1. Ghost / Background completed outline in faint gray */}
            <g opacity="0.12">
              {paths.map((d, i) => (
                <path
                  key={`bg-${i}`}
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  className="text-foreground"
                />
              ))}
            </g>

            {/* 2. Active Strokes up to currentStroke */}
            <g>
              {paths.map((d, i) => {
                if (i >= currentStroke) return null;
                const isLatest = i === currentStroke - 1;

                return (
                  <path
                    key={`stroke-${i}`}
                    d={d}
                    fill="none"
                    stroke={isLatest ? '#3b82f6' : 'currentColor'}
                    strokeWidth={isLatest ? '5' : '4.5'}
                    className={isLatest ? 'transition-all duration-200 text-primary' : 'text-foreground'}
                  />
                );
              })}
            </g>

            {/* 3. Stroke Order Numbers */}
            {showNumbers && (
              <g className="font-sans font-bold text-[8px] fill-muted-foreground select-none pointer-events-none">
                {numbers.map((num, i) => {
                  const isVisible = i < currentStroke;
                  if (!isVisible) return null;
                  const isLatest = i === currentStroke - 1;

                  return (
                    <text
                      key={`num-${i}`}
                      x={num.x}
                      y={num.y}
                      fill={isLatest ? '#3b82f6' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {num.text}
                    </text>
                  );
                })}
              </g>
            )}
          </svg>
        )}

        {/* Stroke Counter Overlay Badge */}
        {!loading && paths.length > 0 && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-secondary/80 border border-border/60 text-[10px] font-black text-foreground shadow-2xs">
            {currentStroke} / {paths.length} chiziq
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {!loading && paths.length > 0 && (
        <div className="flex flex-col items-center gap-2.5 w-full max-w-[280px]">
          {/* Main Playback Bar */}
          <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-secondary/60 border border-border/60 w-full shadow-2xs">
            <button
              type="button"
              onClick={handlePrevStroke}
              disabled={currentStroke <= 1}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-40 transition-colors cursor-pointer"
              title={kDict?.animPrev || 'Oldingi chiziq'}
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title={isPlaying ? (kDict?.animPause || 'Pauza') : (kDict?.animPlay || 'Ijro')}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isPlaying ? (kDict?.animPause || 'Pauza') : (kDict?.animPlay || 'Ijro')}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStroke}
              disabled={currentStroke >= paths.length}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-40 transition-colors cursor-pointer"
              title={kDict?.animNext || 'Keyingi chiziq'}
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
              title={kDict?.animRestart || 'Boshidan qayta koʻrsatish'}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Selector & Number Toggle */}
          <div className="flex items-center justify-between w-full text-xs font-semibold px-1">
            {/* Speed buttons */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-muted-foreground mr-1">
                {kDict?.animSpeed || 'Tezlik:'}
              </span>
              {[
                { val: 0.6, label: '0.6x' },
                { val: 1, label: '1x' },
                { val: 1.6, label: '1.6x' },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSpeed(s.val)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    speed === s.val
                      ? 'bg-foreground text-background shadow-2xs'
                      : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Numbers toggle */}
            <button
              type="button"
              onClick={() => setShowNumbers(!showNumbers)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                showNumbers
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/60 text-muted-foreground'
              }`}
            >
              {showNumbers
                ? (kDict?.animNumbersOn || 'Raqamlar: Yoqiq')
                : (kDict?.animNumbersOff || 'Raqamlar: Oʻchiq')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
