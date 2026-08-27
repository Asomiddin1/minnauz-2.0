'use client';

import * as React from 'react';
import { Languages } from 'lucide-react';
import { useLang, type Lang } from '@/lib/i18n';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  const flags: Record<Lang, string> = {
    uz: "🇺🇿 O'zbekcha",
    en: '🇬🇧 English',
    ru: '🇷🇺 Русский',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({
          variant: 'ghost',
          size: 'sm',
          className: 'gap-1.5 cursor-pointer rounded-full text-[13px] font-medium border border-border transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10 px-3 h-9 text-foreground',
        })}
      >
        <Languages className="h-3.5 w-3.5 opacity-70" />
        <span>{flags[lang] || flags.uz}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-[16px] border border-border bg-glass backdrop-blur-2xl p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)]">
        <DropdownMenuItem
          onClick={() => setLang('uz')}
          className={`cursor-pointer rounded-[12px] px-3 py-2 text-[14px] transition-colors duration-150 ${
            lang === 'uz' ? 'bg-black/5 dark:bg-white/10 font-medium text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
          }`}
        >
          🇺🇿 O'zbekcha
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLang('en')}
          className={`cursor-pointer rounded-[12px] px-3 py-2 text-[14px] transition-colors duration-150 ${
            lang === 'en' ? 'bg-black/5 dark:bg-white/10 font-medium text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
          }`}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLang('ru')}
          className={`cursor-pointer rounded-[12px] px-3 py-2 text-[14px] transition-colors duration-150 ${
            lang === 'ru' ? 'bg-black/5 dark:bg-white/10 font-medium text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
          }`}
        >
          🇷🇺 Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
