'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useThemeCtx } from '@/lib/theme';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export function AdminHeader() {
  const { lang } = useLang();
  const { theme, toggle } = useThemeCtx();
  const pathname = usePathname();

  const getBreadcrumb = () => {
    if (pathname.includes('/admin/users')) {
      return { title: 'Foydalanuvchilar', sub: 'Barcha oʻquvchilar, ustozlar va adminlar boshqaruvi' };
    }
    if (pathname.includes('/admin/courses')) {
      return { title: 'Kurslar', sub: 'Darslar va modullar' };
    }
    if (pathname.includes('/admin/tests')) {
      return { title: 'JLPT Testlar', sub: 'Imtihon savollari bazasi' };
    }
    return { title: 'Boshqaruv paneli', sub: 'Platforma statistikasi va umumiy koʻrsatkichlar' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/85 px-4 backdrop-blur-xl sm:px-6">
      {/* Left: Breadcrumbs / Title */}
      <div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/admin`}
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
          <span className="text-[13px] text-muted-foreground/60">/</span>
          <span className="text-[13px] font-semibold text-foreground">
            {breadcrumb.title}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <Link
          href={`/${lang}/dashboard`}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <span>Asosiy sayt</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>

        <LanguageSwitcher />

        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary"
        >
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
