'use client';

import * as React from 'react';
import { useDashboardTab } from '@/components/dashboard/tab-context';

import { MainDashboard } from '@/components/dashboard/tabs/main-dashboard';
import { VocabTab } from '@/components/dashboard/tabs/vocab-tab';
import { GamesTab } from '@/components/dashboard/tabs/games-tab';
import { DokkayTab } from '@/components/dashboard/tabs/dokkay-tab';
import { KanjiTab } from '@/components/dashboard/tabs/kanji-tab';
import { StoreTab } from '@/components/dashboard/tabs/store-tab';
import { TranslateTab } from '@/components/dashboard/tabs/translate-tab';
import { AiLiveCallTab } from '@/components/dashboard/tabs/ai-tab';

export default function DashboardPage() {
  const { activeTab } = useDashboardTab();

  return (
    <div className="w-full">
      {activeTab === 'home' && <MainDashboard />}
      {activeTab === 'vocab' && <VocabTab />}
      {activeTab === 'games' && <GamesTab />}
      {activeTab === 'dokkay' && <DokkayTab />}
      {activeTab === 'kanji' && <KanjiTab />}
      {activeTab === 'store' && <StoreTab />}
      {activeTab === 'translate' && <TranslateTab />}
      {activeTab === 'ai' && <AiLiveCallTab />}
    </div>
  );
}