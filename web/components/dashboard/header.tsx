'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Maximize2,
  Moon,
  Sun,
  Menu,
  Home,
  BookA,
  Gamepad2,
  BookOpen,
  Languages,
  ShoppingBag,
  Sparkles,
  Crown,
  Type,
} from 'lucide-react';
import { useLang, type Lang } from '@/lib/i18n';
import { useThemeCtx } from '@/lib/theme';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { LogoMark } from '@/components/intro/Logo';
import { NotificationPopover } from './notification-popover';
import { useDashboardTab, type DashboardTabId } from './tab-context';

export function DashboardHeader({
  activeTab: externalActiveTab,
  onTabChange,
  onMenuClick,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onMenuClick?: () => void;
}) {
  const { lang } = useLang();
  const pathname = usePathname();
  const { theme, toggle } = useThemeCtx();
  const { activeTab, setActiveTab } = useDashboardTab();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFocusMode, setIsFocusMode] = React.useState(false);

  const isDashboardHome = pathname ? /^\/([a-z]{2}\/)?dashboard\/?$/.test(pathname) : false;

  const tabs: { id: DashboardTabId; label: string; icon: any }[] = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'vocab', label: "Lug'at", icon: BookA },
    { id: 'games', label: "O'yinlar", icon: Gamepad2 },
    { id: 'dokkay', label: 'Dokkay', icon: BookOpen },
    { id: 'kanji', label: 'Kanji', icon: Type },
    { id: 'store', label: "Do'kon", icon: ShoppingBag },
    { id: 'translate', label: 'Tarjimon', icon: Languages },
    { id: 'ai', label: 'AI ustoz', icon: Sparkles },
    { id: 'premium', label: 'Premium', icon: Crown },
  ];

  const handleTabClick = (tabId: DashboardTabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
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
    <header className="sticky top-0 z-40 flex flex-col border-b border-border bg-card/90 backdrop-blur-xl transition-all duration-300 shadow-xs w-full">
      {/* Top Search & Actions Bar */}
      <div className="flex h-14 items-center justify-between gap-2.5 sm:gap-4 px-3.5 sm:px-6">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Menyu"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border text-foreground hover:bg-secondary active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href={`/${lang}/dashboard`} className="flex items-center">
            <LogoMark className="h-6 w-6" />
          </Link>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidiruv..."
            className="h-8.5 sm:h-9 w-full rounded-full border border-border bg-secondary/40 pl-8.5 sm:pl-9 pr-8 sm:pr-12 text-[12px] sm:text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageSwitcher />

          <NotificationPopover />

          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-8.5 w-8.5 sm:h-9 sm:w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFocusMode}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 h-9 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Diqqat rejimi</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      {isDashboardHome && (
        <div className="w-full overflow-x-auto no-scrollbar border-t border-border/50 animate-in fade-in duration-200">
          <div className="flex w-full min-w-full items-center gap-1.5 px-3.5 sm:px-6 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex-1 min-w-max inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-foreground text-background shadow-xs font-semibold'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      tab.id === 'ai' && !isActive ? 'text-amber-500' : ''
                    } ${tab.id === 'premium' && !isActive ? 'text-yellow-500' : ''}`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}