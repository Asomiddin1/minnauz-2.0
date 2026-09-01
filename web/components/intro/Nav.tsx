'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '../../lib/i18n'
import { useThemeCtx } from '../../lib/theme'
import { useAuth } from '../../lib/auth-context'
import { LanguageSwitcher } from '../shared/language-switcher'
import Logo from './Logo'

export default function Nav() {
  const { t, lang } = useLang()
  const { theme, toggle } = useThemeCtx()
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [lifted, setLifted] = useState(false)
  const [mounted, setMounted] = useState(false)

  const links = [
    { label: t.nav.levels, href: '#levels' },
    { label: t.nav.practice, href: '#practice' },
    { label: t.nav.kids, href: '#kids' },
    { label: t.nav.premium, href: '#premium' },
    { label: t.nav.schools, href: '#schools' },
  ]

  const authTarget = isAuthenticated
    ? user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
      ? `/${lang}/admin`
      : `/${lang}/dashboard`
    : `/${lang}/auth/login`

  const buttonLabel = isAuthenticated
    ? t?.dash?.nav?.[0] || 'Dashboard'
    : t.nav.getStarted

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setLifted(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none transition-all duration-300 pt-0">
      <div
        className={`pointer-events-auto transition-all duration-300 ease-out ${
          lifted
            ? 'mt-2.5 w-[96%] max-w-[1020px] rounded-full border border-border shadow-md backdrop-blur-2xl'
            : 'w-full max-w-full border-b border-transparent backdrop-blur-none'
        }`}
        style={{
          backgroundColor: lifted ? 'var(--glass)' : 'transparent',
          borderBottomColor: !lifted ? 'transparent' : undefined,
        }}
      >
        <nav
          className={`mx-auto flex h-14 items-center justify-between transition-all duration-300 ${
            lifted ? 'px-6' : 'max-w-[1120px] px-5'
          }`}
        >
          {/* flex items-center qo'shildi */}
          <a href="#top" aria-label="Minna" className="shrink-0 flex items-center">
            <Logo />
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />

            <button
              type="button"
              onClick={toggle}
              aria-label={!mounted ? 'Toggle theme' : theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-secondary"
            >
              {!mounted ? (
                <span className="h-4 w-4" />
              ) : theme === 'dark' ? (
                /* Quyosh ikonkasi */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                /* Oy ikonkasi */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            <Link
              href={authTarget}
              className="hidden rounded-full bg-foreground px-4 py-1.5 text-[13px] font-medium text-background transition-opacity duration-200 hover:opacity-85 sm:inline-block"
            >
              {buttonLabel}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-full border border-border md:hidden"
            >
              <span className="text-[14px] leading-none">{open ? '✕' : '☰'}</span>
            </button>
          </div>
        </nav>

        {/* Mobil menyu */}
        {open && (
          <ul
            className={`grid gap-1 border-t border-border bg-glass px-5 pb-5 pt-3 backdrop-blur-2xl md:hidden ${
              lifted ? 'rounded-b-[28px]' : ''
            }`}
          >
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-[17px] font-medium text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href={authTarget}
                onClick={() => setOpen(false)}
                className="block rounded-full bg-foreground px-4 py-2.5 text-center text-[15px] font-medium text-background"
              >
                {buttonLabel}
              </Link>
            </li>
          </ul>
        )}
      </div>
    </header>
  )
}