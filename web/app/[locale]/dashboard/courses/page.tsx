'use client';

import * as React from 'react';
import { BookOpen, Play, CheckCircle, Clock } from 'lucide-react';

export default function CoursesPage() {
  const courses = [
    {
      title: 'Minna no Nihongo I (N5)',
      desc: 'Boshlangʻich yapon tili: Hiragana, Katakana, 100+ Kanji va 25 ta dars.',
      lessons: '25 dars',
      level: 'N5',
      progress: 48,
    },
    {
      title: 'Minna no Nihongo II (N4)',
      desc: 'Kundalik soʻzlashuv, murakkab feʼl shakllari va 300 ta Kanji.',
      lessons: '25 dars',
      level: 'N4',
      progress: 0,
    },
    {
      title: 'JLPT N3 Oʻrta daraja',
      desc: 'Gazeta sarlavhalari, Keigo asoslari va tabiiy tezlikdagi suhbatlar.',
      lessons: '30 dars',
      level: 'N3',
      progress: 0,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="headline text-[32px] font-semibold text-foreground">Kurslar</h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          JLPT darajalari bo'yicha bosqichma-bosqich videodarslar va mashqlar
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-[28px] border border-border bg-card p-6 transition-all duration-300 hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-primary/10 px-3 py-1 text-[12px] font-bold text-primary">
                  {course.level}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {course.lessons}
                </span>
              </div>

              <h3 className="headline text-[20px] font-semibold text-foreground">
                {course.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                {course.desc}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-border space-y-3">
              {course.progress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px] text-muted-foreground">
                    <span>O'zlashtirish</span>
                    <span className="font-semibold text-foreground">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              )}

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-[14px] font-medium text-background transition-opacity hover:opacity-90"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{course.progress > 0 ? 'Davom ettirish' : 'Kursni boshlash'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
