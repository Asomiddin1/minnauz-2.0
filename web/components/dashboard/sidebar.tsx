'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Sparkles,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  ArrowRight,
  Shield,
} from 'lucide-react';

import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import Logo, { LogoMark } from '@/components/intro/Logo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function UserAvatar({
  user,
  size = 'md',
  className = '',
}: {
  user: any;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  const initials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'MU';

  const sizeClasses = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-9 w-9 text-[13px]',
    lg: 'h-14 w-14 text-[20px]',
  }[size];

  if (user?.avatarUrl && !imgError) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName || user.email || 'Avatar'}
        onError={() => setImgError(true)}
        className={`${sizeClasses} shrink-0 rounded-full object-cover border border-border/80 shadow-xs ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0071e3] to-[#005bb5] font-bold text-white shadow-xs ${className}`}
    >
      {initials}
    </div>
  );
}

export function DashboardSidebar() {
  const { lang, t } = useLang();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('minna-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('minna-sidebar-collapsed', String(next));
      return next;
    });
  };

  const navItems: NavItem[] = [
    {
      label: t?.dash?.nav?.[0] || 'Bosh sahifa',
      href: `/${lang}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: 'Kurslar',
      href: `/${lang}/dashboard/courses`,
      icon: BookOpen,
    },
    {
      label: 'JLPT',
      href: `/${lang}/dashboard/tests`,
      icon: FileCheck2,
    },
    {
      label: 'Premium',
      href: `/${lang}/dashboard/premium`,
      icon: Sparkles,
    },
    {
      label: t?.profile?.title || 'Profil',
      href: `/${lang}/dashboard/profile`,
      icon: User,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${lang}/dashboard`) {
      return pathname === `/${lang}/dashboard`;
    }
    return pathname.startsWith(href);
  };

  const navContent = (
    <div
      className={`flex h-full flex-col justify-between bg-card border-r border-border transition-all duration-300 ease-in-out ${
        isCollapsed ? 'p-2.5 items-center' : 'p-4'
      }`}
    >
      <div className="w-full space-y-5">
        {/* Top: Brand Logo & Collapse Toggle */}
        <div
          className={`flex items-center pt-2 pb-1 ${
            isCollapsed ? 'justify-center' : 'justify-between px-2'
          }`}
        >
          {!isCollapsed ? (
            <>
              <Link href={`/${lang}/dashboard`} className="flex items-center gap-2.5">
                <LogoMark className="h-7 w-7" />
                <span className="text-[19px] font-semibold tracking-[-0.045em] text-foreground">
                  MinnaUz
                </span>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleCollapse}
                  title="Sidebarni kichraytirish"
                  aria-label="Collapse sidebar"
                  className="hidden md:grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border text-foreground md:hidden hover:bg-secondary"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Link href={`/${lang}/dashboard`} title="Minna" className="grid place-items-center">
                <LogoMark className="h-7 w-7" />
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                title="Sidebarni kengaytirish"
                aria-label="Expand sidebar"
                className="hidden md:grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center rounded-xl text-[14px] font-medium transition-all duration-200 ${
                  isCollapsed
                    ? 'h-11 w-11 justify-center mx-auto'
                    : 'justify-start gap-3 px-3.5 py-2.5'
                } ${
                  active
                    ? 'bg-[#0071e3] text-white shadow-sm font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    active ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Goal Card in Sidebar */}
        {!isCollapsed && (
          <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3.5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-[13px] font-semibold text-foreground leading-snug">
                  Maqsadingizga yaqinlashyapsiz!
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Daraja: <span className="font-medium text-foreground">JLPT N5</span>
                </p>
              </div>

              {/* Mini circular progress */}
              <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <span>72%</span>
              </div>
            </div>

            <Link href={`/${lang}/dashboard/courses`} className="block">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0071e3] py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
              >
                <span>Davom etish</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Management & User info */}
      <div className="w-full space-y-2 pt-3 border-t border-border">
        {/* Admin Shortcut for Admins */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          !isCollapsed ? (
            <Link
              href={`/${lang}/admin`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Panelga oʻtish</span>
            </Link>
          ) : (
            <Link
              href={`/${lang}/admin`}
              title="Admin Panel"
              className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors mx-auto"
            >
              <Shield className="h-4 w-4" />
            </Link>
          )
        )}

        {!isCollapsed ? (
          <>
            {/* User Profile Card */}
            <Link
              href={`/${lang}/dashboard/profile`}
              title="Profil sozlamalari"
              className="group flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-secondary/70"
            >
              <UserAvatar user={user} size="md" />
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold text-foreground group-hover:text-[#0071e3] transition-colors">
                    {user?.fullName || user?.email?.split('@')[0] || 'Foydalanuvchi'}
                  </p>
                  {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? (
                    <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase text-amber-600 dark:text-amber-400">
                      Admin
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </Link>

            {/* Logout button */}
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Chiqish</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Link
              href={`/${lang}/dashboard/profile`}
              title={`${user?.fullName || user?.email || 'Profil'} (Profil sozlamalari)`}
              className="grid place-items-center transition-transform hover:scale-105"
            >
              <UserAvatar user={user} size="md" />
            </Link>
            <button
              type="button"
              onClick={logout}
              title="Chiqish"
              className="grid h-8 w-8 place-items-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-glass px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground hover:bg-secondary"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Logo />
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </div>

      {/* Desktop Persistent Sidebar with Collapse Support */}
      <aside
        className={`hidden h-screen shrink-0 md:sticky md:top-0 md:block transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}