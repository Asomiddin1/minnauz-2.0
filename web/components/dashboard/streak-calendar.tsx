'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

interface StreakCalendarProps {
  streakDays: number;
  activeDates: number[];
}

export function StreakCalendar({ streakDays, activeDates }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(() => new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = MONTH_NAMES_UZ[month] || 'Avgust';
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDayOffset = (firstDayOfMonth + 6) % 7; 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDayOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const today = new Date();
  const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-bold text-foreground">Kalendar</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-2.5 py-0.5 text-[12px] font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-[#1a9e4b]" />
          <span>{streakDays} kunlik streak</span>
        </span>
      </div>

      <div className="flex items-center justify-between text-[14px] font-medium text-foreground">
        <button type="button" onClick={handlePrevMonth} className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary cursor-pointer">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>{monthName} {year}</span>
        <button type="button" onClick={handleNextMonth} className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary cursor-pointer">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground pb-2">
          <span>Du</span><span>Se</span><span>Ch</span><span>Pa</span><span>Ju</span><span>Sh</span><span>Ya</span>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-[13px]">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={idx} className="h-8" />;
            const isStreak = isCurrentMonthView && activeDates.includes(day);
            return (
              <div key={idx} className="flex items-center justify-center">
                <span className={`grid h-8 w-8 place-items-center rounded-full font-medium transition-all ${isStreak ? 'bg-[#1a9e4b] text-white font-bold shadow-xs' : 'text-foreground hover:bg-secondary'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pt-2 text-[12px] text-muted-foreground border-t border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1a9e4b]" />
          <span>Bajarilgan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-muted-foreground/60" />
          <span>Oʻtkazib yuborilgan</span>
        </div>
      </div>
    </div>
  );
}