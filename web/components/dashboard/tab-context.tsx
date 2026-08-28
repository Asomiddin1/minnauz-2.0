'use client';

import * as React from 'react';

export type DashboardTabId =
  | 'home'
  | 'vocab'
  | 'games'
  | 'dokkay'
  | 'kanji'
  | 'store'
  | 'translate'
  | 'ai'
  | 'premium';

interface DashboardTabContextType {
  activeTab: DashboardTabId;
  setActiveTab: (tab: DashboardTabId) => void;
}

const DashboardTabContext = React.createContext<DashboardTabContextType | undefined>(undefined);

export function DashboardTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState<DashboardTabId>('home');

  return (
    <DashboardTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DashboardTabContext.Provider>
  );
}

export function useDashboardTab() {
  const context = React.useContext(DashboardTabContext);
  if (!context) {
    throw new Error('useDashboardTab must be used within a DashboardTabProvider');
  }
  return context;
}
