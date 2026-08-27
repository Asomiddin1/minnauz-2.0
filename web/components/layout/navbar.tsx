'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { useLanguage } from '@/components/providers/language-provider';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [lifted, setLifted] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { t, language } = useLanguage();

  const navLinks = [
    { href: '#courses', label: t.courses },
    { href: '#jlpt', label: t.jlpt },
    { href: '#ai-speaking', label: t.aiSpeaking },
    { href: '#about', label: t.about },
  ];

  React.useEffect(() => {
    setMounted(true);
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hydration mismatch oldini olish uchun dastlabki holat
  if (!mounted) {
    return (
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          backgroundColor: 'transparent',
          borderBottom: '1px solid transparent',
        }}
      >
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <span
                  key={link.href}
                  className="text-[13px] font-medium text-muted-foreground"
                >
                  {link.label}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full border border-border" />
            <div className="h-9 w-9 rounded-full border border-border" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        lifted ? 'backdrop-blur-2xl' : ''
      }`}
      style={{
        backgroundColor: lifted ? 'var(--glass)' : 'transparent',
        borderBottom: lifted ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Logo />
          
          {/* Desktop Center Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-[13px] font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Right Nav */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href={`/${language}/login`}
            className="rounded-full bg-foreground px-4 py-1.5 text-[13px] font-medium text-background transition-opacity duration-300 hover:opacity-85"
          >
            {t.login}
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
            aria-expanded={isOpen}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <ul className="grid gap-1 border-t border-border bg-glass px-5 pb-5 pt-3 backdrop-blur-2xl md:hidden">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href}
                className="block py-2 text-[17px] font-medium text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link
              href={`/${language}/login`}
              onClick={() => setIsOpen(false)}
              className="block rounded-full bg-foreground px-4 py-2.5 text-center text-[15px] font-medium text-background"
            >
              {t.login}
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}