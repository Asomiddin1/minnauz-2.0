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
  X,
  PanelLeftClose,
  PanelLeft,
  ArrowRight,
  Shield,
  Crown,
  GraduationCap,
  Search,
  Moon,
  Sun,
} from 'lucide-react';

import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import Logo, { LogoMark } from '@/components/intro/Logo';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useThemeCtx } from '@/lib/theme';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardSidebar({
  mobileOpen = false,
  onMobileClose,
  onSearchOpen,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onSearchOpen?: () => void;
}) {
  const { lang, t } = useLang();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { theme, toggle: toggleTheme } = useThemeCtx();

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
      label: t?.sidebar?.home || t?.dash?.nav?.[0] || 'Bosh sahifa',
      href: `/${lang}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: t?.sidebar?.courses || 'Kurslar',
      href: `/${lang}/dashboard/courses`,
      icon: BookOpen,
    },
    {
      label: t?.sidebar?.jlpt || 'JLPT',
      href: `/${lang}/dashboard/tests`,
      icon: FileCheck2,
    },
    {
      label: t?.sidebar?.premium || 'Premium',
      href: `/${lang}/dashboard/premium`,
      icon: Sparkles,
    },
    {
      label: t?.sidebar?.profile || t?.profile?.title || 'Profil',
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

  const renderNavContent = (isMobileDrawer = false) => (
    <div
      className={`flex h-full flex-col justify-between bg-card border-r border-border transition-all duration-300 ease-in-out ${
        !isMobileDrawer && isCollapsed ? 'p-2.5 items-center' : 'p-4'
      }`}
    >
      <div className="w-full space-y-5">
        {/* Top: Brand Logo & Collapse / Close Toggle */}
        <div
          className={`flex items-center pt-2 pb-1 ${
            !isMobileDrawer && isCollapsed ? 'justify-center' : 'justify-between px-2'
          }`}
        >
          {isMobileDrawer || !isCollapsed ? (
            <>
              <Link href={`/`} onClick={onMobileClose} className="flex items-center gap-2.5">
                <LogoMark className="h-10 w-10" />
                <span className="text-[19px] font-semibold tracking-[-0.045em] text-foreground">
                  MinnaUz
                </span>
              </Link>
              <div className="flex items-center gap-1">
                {!isMobileDrawer ? (
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    title={t?.sidebar?.collapse || 'Sidebarni kichraytirish'}
                    aria-label="Collapse sidebar"
                    className="hidden md:grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onMobileClose}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border text-foreground hover:bg-secondary cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Link href={`/${lang}/dashboard`} title="Minna" className="grid place-items-center">
                <LogoMark className="h-9 w-9" />
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                title={t?.sidebar?.expand || 'Sidebarni kengaytirish'}
                aria-label="Expand sidebar"
                className="hidden md:grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {isMobileDrawer && (
          <div className="flex items-center gap-2 px-1">
            <button
              type="button"
              onClick={onSearchOpen}
              className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/70 bg-secondary/35 px-3 text-left text-[12px] text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
              aria-label="Qidiruvni ochish"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate">Qidirish...</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 text-foreground transition-colors hover:bg-secondary"
              aria-label="Mavzuni almashtirish"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isMobileDrawer && isCollapsed ? item.label : undefined}
                onClick={onMobileClose}
                className={`group flex items-center rounded-xl text-[14px] font-medium transition-all duration-200 ${
                  !isMobileDrawer && isCollapsed
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
                {(isMobileDrawer || !isCollapsed) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: User Profile & Logout */}
      <div className="w-full pt-4 border-t border-border space-y-2">
        {/* Admin Link if role is ADMIN or SUPER_ADMIN */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <Link
            href={`/${lang}/admin`}
            onClick={onMobileClose}
            title={!isMobileDrawer && isCollapsed ? (t?.sidebar?.admin || 'Admin Paneli') : undefined}
            className={`flex items-center rounded-xl text-[13px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors ${
              !isMobileDrawer && isCollapsed ? 'h-10 w-10 justify-center mx-auto' : 'gap-2.5 px-3 py-2'
            }`}
          >
            <Shield className="h-4 w-4 shrink-0" />
            {(isMobileDrawer || !isCollapsed) && <span>{t?.sidebar?.admin || 'Admin Paneli'}</span>}
          </Link>
        )}

        {/* Teacher Link if role is TEACHER */}
        {(user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <Link
            href={`/${lang}/teacher`}
            onClick={onMobileClose}
            title={!isMobileDrawer && isCollapsed ? (t?.sidebar?.teacher || 'Oʻqituvchi Paneli') : undefined}
            className={`flex items-center rounded-xl text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors ${
              !isMobileDrawer && isCollapsed ? 'h-10 w-10 justify-center mx-auto' : 'gap-2.5 px-3 py-2'
            }`}
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            {(isMobileDrawer || !isCollapsed) && <span>{t?.sidebar?.teacher || 'Oʻqituvchi Paneli'}</span>}
          </Link>
        )}

        {isMobileDrawer || !isCollapsed ? (
          <>
            <Link
              href={`/${lang}/dashboard/profile`}
              onClick={onMobileClose}
              className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-secondary group"
            >
              <UserAvatar user={user} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold text-foreground group-hover:text-[#0071e3] transition-colors">
                    {user?.fullName || user?.email?.split('@')[0] || 'Foydalanuvchi'}
                  </p>
                  {user?.isPro ? (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-yellow-500/20 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-yellow-600 dark:text-yellow-400">
                      <Crown className="h-3 w-3" />
                      <span>PRO</span>
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                      FREE
                    </span>
                  )}
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
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>{t?.sidebar?.logout || t?.dash?.logout || 'Chiqish'}</span>
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
              title={t?.sidebar?.logout || t?.dash?.logout || 'Chiqish'}
              className="grid h-8 w-8 place-items-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
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
      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent(true)}
      </div>

      {/* Desktop Persistent Sidebar with Collapse Support */}
      <aside
        className={`hidden h-screen shrink-0 md:sticky md:top-0 md:block transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderNavContent(false)}
      </aside>
    </>
  );
}