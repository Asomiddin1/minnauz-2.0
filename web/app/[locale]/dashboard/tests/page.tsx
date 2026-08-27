'use client';

import * as React from 'react';
import { Award, CheckCircle2, Clock, Play } from 'lucide-react';

export default function TestsPage() {
  const tests = [
    { title: 'JLPT N5 Toʻliq Mock Imtihon #1', time: '105 daqiqa', questions: '65 ta savol', status: 'Yakunlangan (85%)' },
    { title: 'JLPT N5 Toʻliq Mock Imtihon #2', time: '105 daqiqa', questions: '65 ta savol', status: 'Boshlanmagan' },
    { title: 'JLPT N5 Kanji va Lugʻat Testi', time: '25 daqiqa', questions: '30 ta savol', status: 'Boshlanmagan' },
    { title: 'JLPT N5 Grammatika va Oʻqish', time: '50 daqiqa', questions: '35 ta savol', status: 'Boshlanmagan' },
    { title: 'JLPT N5 Tinglab tushunish', time: '30 daqiqa', questions: '25 ta savol', status: 'Boshlanmagan' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="headline text-[32px] font-semibold text-foreground">JLPT Testlar</h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Haqiqiy Yaponiya imtihon andozasi asosida tuzilgan sinov testlari
        </p>
      </div>

      <div className="space-y-4">
        {tests.map((test, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20"
          >
            <div className="space-y-1">
              <h3 className="text-[16px] font-semibold text-foreground">{test.title}</h3>
              <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {test.time}
                </span>
                <span>•</span>
                <span>{test.questions}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-muted-foreground">{test.status}</span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Testni boshlash</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
