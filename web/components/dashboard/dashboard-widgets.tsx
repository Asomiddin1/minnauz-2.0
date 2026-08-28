'use client';

import Link from 'next/link';
import { ArrowRight, Award, Clock } from 'lucide-react';

export function DashboardStats({ stats }: { stats: any[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${stat.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</p>
              <p className="headline text-[22px] font-bold text-foreground mt-0.5">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ActiveCourseWidget({ activeCourse, nextLesson, courseTargetUrl }: any) {
  return (
    <div className="space-y-6 rounded-[28px] border border-border bg-card p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-[#0071e3] font-semibold">Joriy Kurs</p>
          <h2 className="headline text-[22px] font-semibold text-foreground mt-1">
            {activeCourse?.title || 'Minna no Nihongo I (N5)'}
          </h2>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[13px] font-medium text-foreground">
          {activeCourse ? `${activeCourse.completedLessons} / ${activeCourse.totalLessons} Dars` : '0 / 25 Dars'}
        </span>
      </div>

      <div className="rounded-2xl bg-secondary/40 p-5 border border-border/50 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">Navbatdagi dars:</p>
            <h3 className="text-[17px] font-semibold text-foreground mt-1">
              {nextLesson ? `${nextLesson.order}-dars: ${nextLesson.title}` : '1-dars: Tanishtiruv va asoslar'}
            </h3>
          </div>
          <span className="shrink-0 rounded-lg bg-[#0071e3]/10 px-2.5 py-1 text-[12px] font-semibold text-[#0071e3]">
            {nextLesson?.category || 'Grammatika'}
          </span>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-[13px] text-muted-foreground">
            <span>Kurs oʻzlashtirilishi</span>
            <span className="font-semibold text-foreground">{activeCourse?.progressPercent || 0}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-[#0071e3] transition-all duration-500" style={{ width: `${Math.max(3, activeCourse?.progressPercent || 0)}%` }} />
          </div>
        </div>

        <div className="pt-2">
          <Link href={courseTargetUrl} className="block">
            <button type="button" className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-[14px] font-medium text-background transition-opacity duration-200 hover:opacity-90 cursor-pointer">
              <span>Darsga oʻtish</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function TestsWidget({ examInfo, targetLevel, lang }: any) {
  return (
    <div className="space-y-5 rounded-[28px] border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div className="space-y-4">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Imtihon</p>
          <h3 className="headline text-[19px] font-semibold text-foreground mt-0.5">JLPT Mock Testlar</h3>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-3 border border-amber-500/30">
            <div>
              <p className="text-[13px] font-bold text-foreground">JLPT {examInfo.season} Imtihoni</p>
              <p className="text-[11px] text-muted-foreground">{examInfo.formattedDate}</p>
            </div>
            <span className="text-[12px] font-bold text-amber-500 bg-amber-500/20 px-2.5 py-1 rounded-full">
              {examInfo.daysRemaining} kun qoldi
            </span>
          </div>
          {/* Mock static results */}
          {[{ level: `${targetLevel} Mock Test #1`, score: '142 / 180', date: 'Kecha' }].map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-secondary/40 p-3 border border-border/40">
              <div>
                <p className="text-[13px] font-medium text-foreground">{item.level}</p>
                <p className="text-[11px] text-muted-foreground">{item.date}</p>
              </div>
              <span className="text-[12px] font-semibold text-[#0071e3]">{item.score}</span>
            </div>
          ))}
        </div>
      </div>
      <Link href={`/${lang}/dashboard/tests`} className="block pt-2">
        <button type="button" className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors">
          <Award className="h-4 w-4 text-[#0071e3]" />
          <span>Barcha testlar</span>
        </button>
      </Link>
    </div>
  );
}

export function ProgressWidget({ studyTime, weeklyActivity, weeklyGoalHours, weeklyProgress }: any) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-bold text-foreground">Umumiy progress</h3>
          <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-[12px] font-medium text-muted-foreground">Bu hafta</span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#0071e3]" />
              <span>Bugungi oʻrganish vaqti</span>
            </p>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[28px] font-bold text-foreground">{studyTime?.todayHours ?? 0}</span>
            <span className="text-[15px] font-semibold text-foreground">h</span>
            <span className="text-[28px] font-bold text-foreground ml-1">{studyTime?.todayMinutesRemainder ?? 15}</span>
            <span className="text-[15px] font-semibold text-foreground">m</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-1.5 pt-5 pb-1">
          {weeklyActivity.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-20 items-end justify-center w-full">
                <div className={`w-full max-w-[28px] rounded-full transition-all duration-300 ${item.active ? 'bg-[#0071e3] shadow-xs' : 'bg-[#0071e3]/60'} ${item.height}`} />
              </div>
              <span className={`text-[12px] font-medium ${item.active ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{item.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground font-medium">Haftalik maqsad ({weeklyGoalHours} soat)</span>
          <span className="font-bold text-foreground">{weeklyProgress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-foreground transition-all duration-500" style={{ width: `${Math.min(100, Math.max(3, weeklyProgress))}%` }} />
        </div>
      </div>
    </div>
  );
}