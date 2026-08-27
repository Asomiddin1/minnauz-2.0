'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Sparkles, Maximize2, Moon, Sun } from 'lucide-react';
import { useLang, type Lang } from '@/lib/i18n';
import { useThemeCtx } from '@/lib/theme';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export function DashboardHeader({
  activeTab,
  onTabChange,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const { lang } = useLang();
  const { theme, toggle } = useThemeCtx();
  const [currentTab, setCurrentTab] = React.useState(activeTab || 'Bosh sahifa');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFocusMode, setIsFocusMode] = React.useState(false);

  const tabs = [
    { id: 'home', label: 'Bosh sahifa' },
    { id: 'vocab', label: "Lug'at" },
    { id: 'games', label: "O'yinlar" },
    { id: 'dokkay', label: 'Dokkay' },
    { id: 'kanji', label: 'Kanji' },
    { id: 'store', label: "Do'kon" },
    { id: 'translate', label: 'Tarjimon' },
    { id: 'ai', label: 'AI ustoz' },
    { id: 'premium', label: 'Premium' },
  ];

  const handleTabClick = (label: string) => {
    setCurrentTab(label);
    if (onTabChange) onTabChange(label);
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-border bg-card/85 backdrop-blur-xl">
      {/* Top Search & Actions Bar */}
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidiruv..."
            className="h-9 w-full rounded-full border border-border bg-secondary/40 pl-9 pr-12 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
          >
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFocusMode}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 h-9 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Diqqat rejimi</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto px-4 sm:px-6 py-2 no-scrollbar border-t border-border/50">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.label;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.label)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
