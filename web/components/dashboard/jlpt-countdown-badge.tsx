// components/dashboard/jlpt-countdown-badge.tsx
'use client';

import * as React from 'react';
import { getNextJLPTCountdown, JLPTCountdown } from '@/lib/jlpt';
import { Sparkles, Calendar } from 'lucide-react';

export function JLPTCountdownBadge() {
  const [cd, setCd] = React.useState<JLPTCountdown | null>(null);

  React.useEffect(() => {
    setCd(getNextJLPTCountdown());
    const timer = setInterval(() => {
      setCd(getNextJLPTCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!cd) return null;

  const timeUnits = [
    { label: 'KUN', value: String(cd.days).padStart(2, '0') },
    { label: 'SOAT', value: String(cd.hours).padStart(2, '0') },
    { label: 'DAQ', value: String(cd.minutes).padStart(2, '0') },
    { label: 'SON', value: String(cd.seconds).padStart(2, '0') },
  ];

  return (
    <div className="inline-flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-card/80 dark:bg-card/40 border border-border/80 backdrop-blur-md shadow-xs">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
          <Calendar className="h-3.5 w-3.5" />
          JLPT {cd.season}
        </span>
        <span className="text-[11px] text-muted-foreground/80">{cd.formattedDate}</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {timeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <div className="flex flex-col items-center">
              <div className="min-w-[42px] sm:min-w-[48px] h-11 sm:h-12 flex items-center justify-center rounded-xl bg-secondary/80 border border-border font-mono text-lg sm:text-xl font-black text-foreground shadow-inner">
                {unit.value}
              </div>
              <span className="mt-1 text-[9px] sm:text-[10px] font-bold tracking-wider text-muted-foreground">
                {unit.label}
              </span>
            </div>
            {index < timeUnits.length - 1 && (
              <span className="text-muted-foreground font-bold text-base -mt-4">:</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}