'use client'

import { useEffect, useRef, useState } from 'react'
import { languages, useLang } from '../../lib/i18n'

export default function LanguageMenu() {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = languages.find((l) => l.code === lang)!

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.nav.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-medium text-foreground transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="h-[13px] w-[13px] opacity-60" fill="none" stroke="currentColor" strokeWidth={1.3}>
          <circle cx="8" cy="8" r="6.2" />
          <ellipse cx="8" cy="8" rx="2.6" ry="6.2" />
          <path d="M2 6h12M2 10h12" />
        </svg>
        {current.label}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-[16px] border border-border bg-glass p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-[14px] transition-colors duration-150 ${
                  l.code === lang
                    ? 'bg-black/5 dark:bg-white/10 text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
                }`}
              >
                {l.full}
                <span className="text-[12px] tracking-[0.08em] opacity-60">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}