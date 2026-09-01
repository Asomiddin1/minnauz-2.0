'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const router = useRouter();
  const pathname = usePathname();

  const flags: Record<string, string> = {
    uz: "🇺🇿 O'zbekcha",
    en: '🇬🇧 English',
    ru: '🇷🇺 Русский',
    ja: '🇯🇵 日本語',
    jp: '🇯🇵 日本語',
  };

  const handleSelect = (newLang: Lang) => {
    const canonicalLang = newLang === 'jp' ? 'ja' : newLang;
    setLang(canonicalLang);
    if (!pathname) return;

    const segments = pathname.split('/');
    if (['uz', 'ru', 'en', 'ja', 'jp'].includes(segments[1])) {
      segments[1] = canonicalLang;
    } else {
      segments.splice(1, 0, canonicalLang);
    }
    const newPath = segments.join('/') || `/${canonicalLang}`;
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    router.push(`${newPath}${search}${hash}`);
  };

  const currentFlag = flags[lang] || flags.uz;

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
        <span>{currentFlag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-[16px] border border-border bg-glass backdrop-blur-2xl p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)]">
        <DropdownMenuItem
          onClick={() => handleSelect('uz')}
          className={`cursor-pointer rounded-[12px] px-3 py-2 text-[14px] transition-colors duration-150 ${
            lang === 'uz' ? 'bg-black/5 dark:bg-white/10 font-medium text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
          }`}
        >
          🇺🇿 O'zbekcha
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect('en')}
          className={`cursor-pointer rounded-[12px] px-3 py-2 text-[14px] transition-colors duration-150 ${
            lang === 'en' ? 'bg-black/5 dark:bg-white/10 font-medium text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
          }`}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect('ru')}
          className={`cursor-pointer rounded-[12px] px-3 py-2 text-[14px] transition-colors duration-150 ${
            lang === 'ru' ? 'bg-black/5 dark:bg-white/10 font-medium text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
          }`}
        >
          🇷🇺 Русский
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect('ja')}
          className={`cursor-pointer rounded-[12px] px-3 py-2 text-[14px] transition-colors duration-150 ${
            lang === 'ja' || lang === 'jp' ? 'bg-black/5 dark:bg-white/10 font-medium text-foreground' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
          }`}
        >
          🇯🇵 日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
