'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useReveal } from '../../lib/hooks'
import { useLang } from '../../lib/i18n'
import { useAuth } from '../../lib/auth-context'

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useReveal<HTMLDivElement>(delay)
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] font-medium tracking-[0.22em] uppercase text-primary">{children}</p>
  )
}

export function CTA({
  children,
  href = '#',
  to,
  variant = 'solid',
  className = '',
}: {
  children: ReactNode
  href?: string
  /** Internal route — renders a router Link instead of an anchor. */
  to?: string
  variant?: 'solid' | 'ghost'
  className?: string
}) {
  const { lang } = useLang()
  const { isAuthenticated, user } = useAuth()
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[15px] font-medium transition-all duration-300 active:scale-[0.97]'
  const styles =
    variant === 'solid'
      ? 'bg-primary text-primary-foreground hover:brightness-110 hover:shadow-[0_8px_30px_-8px_var(--primary)]'
      : 'border border-border text-foreground hover:bg-secondary'
  const combinedClassName = `${base} ${styles} ${className}`.trim()

  if (to) {
    let cleanTo = to === '/login' ? '/auth/login' : to
    if (isAuthenticated && (cleanTo === '/auth/login' || cleanTo === '/login' || cleanTo === '/register')) {
      cleanTo = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'
    }

    const target = cleanTo.startsWith(`/${lang}`)
      ? cleanTo
      : `/${lang}${cleanTo.startsWith('/') ? cleanTo : `/${cleanTo}`}`

    return (
      <Link href={target} className={combinedClassName}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={combinedClassName}>
      {children}
    </a>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-32px_rgba(0,0,0,0.45)] ${className}`}
    >
      {children}
    </div>
  )
}
