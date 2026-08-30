'use client';

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export type DashboardTabId =
  | 'home'
  | 'vocab'
  | 'games'
  | 'dokkay'
  | 'kanji'
  | 'store'
  | 'translate'
  | 'ai';

const VALID_TABS: DashboardTabId[] = [
  'home',
  'vocab',
  'games',
  'dokkay',
  'kanji',
  'store',
  'translate',
  'ai',
];

interface DashboardTabContextType {
  activeTab: DashboardTabId;
  setActiveTab: (tab: DashboardTabId) => void;
}

const DashboardTabContext = React.createContext<DashboardTabContextType | undefined>(undefined);

function DashboardTabSync({
  setActiveTab,
}: {
  setActiveTab: React.Dispatch<React.SetStateAction<DashboardTabId>>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'premium') {
      const match = pathname ? pathname.match(/^\/([a-z]{2})\//) : null;
      const lang = match ? match[1] : 'uz';
      router.replace(`/${lang}/dashboard/premium`);
      return;
    }
    if (tabParam && VALID_TABS.includes(tabParam as DashboardTabId)) {
      setActiveTab(tabParam as DashboardTabId);
    }
  }, [searchParams, setActiveTab, router, pathname]);

  return null;
}

export function DashboardTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState<DashboardTabId>('home');

  return (
    <DashboardTabContext.Provider value={{ activeTab, setActiveTab }}>
      <React.Suspense fallback={null}>
        <DashboardTabSync setActiveTab={setActiveTab} />
      </React.Suspense>
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
