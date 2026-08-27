'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';

import { useLang } from '@/lib/i18n';

export default function DashboardPage() {
  const { lang } = useLang();

  const stats = [
    {
      label: 'Streak (kunlar)',
      value: '12 kun',
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Yodlangan soʻzlar',
      value: '248 ta',
      icon: BookOpen,
      color: 'text-[#0071e3] bg-[#0071e3]/10',
    },
    {
      label: 'Yakunlangan darslar',
      value: '18 / 50',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: 'JLPT N5 tayyorgarlik',
      value: '64%',
      icon: TrendingUp,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
  ];

  // Calendar dates for August 2026 (Aug 1 is Saturday)
  const streakDays = [1, 3, 5, 6, 7];
  const calendarDays = [
    null, null, null, null, null, 1, 2, // Week 1
    3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30,
    31, null, null, null, null, null, null
  ];

  const continueLessons = [
    {
      kanji: 'ひらがな',
      title: 'Bir haftada hiragana',
      progress: '12 tadan 6-dars',
      link: `/${lang}/dashboard/courses`,
    },
    {
      kanji: '漢字',
      title: "N5 kanji · 3-to'plam",
      progress: '9 tadan 2-dars',
      link: `/${lang}/dashboard/courses`,
    },
    {
      kanji: '聴解',
      title: 'N4 tinglash',
      progress: '14 tadan 8-dars',
      link: `/${lang}/dashboard/courses`,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Modern Redesigned Banner with Image Slot */}
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-6 sm:p-8 shadow-xs">
        <div className="absolute right-1/4 top-0 h-64 w-64 rounded-full bg-[#0071e3]/8 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid gap-6 md:grid-cols-[1.3fr_1fr] items-center">
          {/* Left info & CTAs */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3.5 py-1 text-[12px] font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[#0071e3]" />
              <span>MinnaUz 2.0 · JLPT N5</span>
            </div>

            <h1 className="headline text-[26px] sm:text-[34px] font-bold tracking-tight text-foreground leading-[1.15]">
              Yapon tilini oʻrganishni davom ettiramizmi?
            </h1>

            <p className="text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed max-w-lg">
              Bugungi rejangiz: 15 ta yangi Kanji oʻrganish va 1 ta tinglab tushunish mashqini bajarish.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={`/${lang}/dashboard/courses`}>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-6 py-2.5 text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-sm"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Darsni boshlash</span>
                </button>
              </Link>

              <Link href={`/${lang}/dashboard/tests`}>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Reja tuzish</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Banner Image Slot */}
          <div className="relative flex items-center justify-center">
            <div className="relative aspect-[4/3] w-full max-w-[340px] overflow-hidden rounded-2xl border border-border/60 bg-secondary/40 shadow-sm transition-transform duration-300 hover:scale-[1.02]">
              <Image
                src="/banner_art.png"
                alt="MinnaUz Learning Banner"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid (4 Clean Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20"
            >
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">
                  {stat.label}
                </p>
                <p className="headline text-[22px] font-bold text-foreground mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Split Grid: Left Content (Course + Practice) & Right Content (Calendar + Tests) */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Active Course Card */}
          <div className="space-y-6 rounded-[28px] border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-[12px] uppercase tracking-wider text-[#0071e3] font-semibold">
                  Joriy Kurs
                </p>
                <h2 className="headline text-[22px] font-semibold text-foreground mt-1">
                  Minna no Nihongo · N5 Asoslari
                </h2>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[13px] font-medium text-foreground">
                12 / 25 Dars
              </span>
            </div>

            <div className="rounded-2xl bg-secondary/40 p-5 border border-border/50 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-muted-foreground">Navbatdagi dars:</p>
                  <h3 className="text-[17px] font-semibold text-foreground mt-1">
                    13-dars: ~たい (xohish) va fe'llar birikmasi
                  </h3>
                </div>
                <span className="shrink-0 rounded-lg bg-[#0071e3]/10 px-2.5 py-1 text-[12px] font-semibold text-[#0071e3]">
                  Grammatika
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[13px] text-muted-foreground">
                  <span>Mavzu oʻzlashtirilishi</span>
                  <span className="font-semibold text-foreground">48%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-[#0071e3]" style={{ width: '48%' }} />
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/${lang}/dashboard/courses`} className="block">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-[14px] font-medium text-background transition-opacity duration-200 hover:opacity-90"
                  >
                    <span>Darsga oʻtish</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* "To'xtagan joyingizdan davom eting" */}
          <div className="space-y-4">
            <h3 className="text-[18px] font-bold text-foreground">
              Toʻxtagan joyingizdan davom eting
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {continueLessons.map((item, i) => (
                <Link key={i} href={item.link} className="group block">
                  <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/20">
                    <div className="relative flex h-24 items-center justify-center rounded-xl bg-secondary/60">
                      <span className="font-jp text-[28px] font-medium text-foreground/80">
                        {item.kanji}
                      </span>
                      <div className="absolute bottom-2.5 right-2.5 grid h-7 w-7 place-items-center rounded-full bg-foreground text-background shadow-xs transition-transform group-hover:scale-110">
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-0.5">
                      <h4 className="text-[13px] font-semibold text-foreground group-hover:text-[#0071e3] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{item.progress}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Calendar & Tests) */}
        <div className="space-y-6">
          
          {/* Calendar (Streak) Card */}
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-foreground">Kalendar</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-2.5 py-0.5 text-[12px] font-semibold text-foreground">
                <span className="h-2 w-2 rounded-full bg-[#1a9e4b]" />
                <span>5 kunlik streak</span>
              </span>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center justify-between text-[14px] font-medium text-foreground">
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>Avgust 2026</span>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days Grid */}
            <div>
              <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground pb-2">
                <span>Du</span>
                <span>Se</span>
                <span>Ch</span>
                <span>Pa</span>
                <span>Ju</span>
                <span>Sh</span>
                <span>Ya</span>
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center text-[13px]">
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return <div key={idx} className="h-8" />;
                  }

                  const isStreak = streakDays.includes(day);

                  return (
                    <div key={idx} className="flex items-center justify-center">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full font-medium transition-all ${
                          isStreak
                            ? 'bg-[#1a9e4b] text-white font-bold shadow-xs'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
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

          {/* JLPT Mock Testlar */}
          <div className="space-y-5 rounded-[28px] border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Imtihon Tayyorgarligi
                </p>
                <h3 className="headline text-[20px] font-semibold text-foreground mt-0.5">
                  JLPT Mock Testlar
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { level: 'N5 Mock Test #1', score: '142 / 180 (Oʻtgan)', date: 'Kecha' },
                { level: 'N5 Tinglab tushunish', score: '48 / 60', date: '3 kun oldin' },
                { level: 'N5 Lugʻat va Ierogliflar', score: '52 / 60', date: '5 kun oldin' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-secondary/40 p-3.5 border border-border/40"
                >
                  <div>
                    <p className="text-[14px] font-medium text-foreground">{item.level}</p>
                    <p className="text-[12px] text-muted-foreground">{item.date}</p>
                  </div>
                  <span className="text-[13px] font-semibold text-[#0071e3]">{item.score}</span>
                </div>
              ))}
            </div>

            <Link href={`/${lang}/dashboard/tests`} className="block pt-1">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Award className="h-4 w-4 text-[#0071e3]" />
                <span>Barcha testlarni koʻrish</span>
              </button>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
