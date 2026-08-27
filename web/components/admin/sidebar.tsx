'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCheck2,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { LogoMark } from '@/components/intro/Logo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function AdminSidebar() {
  const { lang } = useLang();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('minna-admin-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('minna-admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  const navItems: NavItem[] = [
    {
      label: 'Boshqaruv paneli',
      href: `/${lang}/admin`,
      icon: LayoutDashboard,
    },
    {
      label: 'Foydalanuvchilar',
      href: `/${lang}/admin/users`,
      icon: Users,
    },
    {
      label: 'Kurslar & Darslar',
      href: `/${lang}/admin/courses`,
      icon: BookOpen,
    },
    {
      label: 'JLPT Testlar',
      href: `/${lang}/admin/tests`,
      icon: FileCheck2,
      badge: 'Tez kunda',
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${lang}/admin`) {
      return pathname === `/${lang}/admin`;
    }
    return pathname.startsWith(href);
  };

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
    : 'AD';

  const navContent = (
    <div
      className={`flex h-full flex-col justify-between bg-card border-r border-border transition-all duration-300 ease-in-out ${
        isCollapsed ? 'p-2.5 items-center' : 'p-4'
      }`}
    >
      <div className="w-full space-y-5">
        {/* Brand & Mode Header */}
        <div
          className={`flex items-center pt-2 pb-1 ${
            isCollapsed ? 'justify-center' : 'justify-between px-2'
          }`}
        >
          {!isCollapsed ? (
            <>
              <Link href={`/${lang}/admin`} className="flex items-center gap-2.5">
                <LogoMark className="h-7 w-7" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[17px] font-bold tracking-tight text-foreground">
                      MinnaUz
                    </span>
                    <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Admin
                    </span>
                  </div>
                </div>
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
              <Link href={`/${lang}/admin`} title="MinnaUz Admin" className="grid place-items-center">
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

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between rounded-xl text-[14px] font-medium transition-all duration-200 ${
                  isCollapsed
                    ? 'h-11 w-11 justify-center mx-auto'
                    : 'px-3.5 py-2.5'
                } ${
                  active
                    ? 'bg-foreground text-background shadow-xs font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      active ? 'text-background' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher & Profile Section */}
      <div className="w-full space-y-2.5 pt-3 border-t border-border">
        {/* Switch back to user app */}
        {!isCollapsed ? (
          <Link
            href={`/${lang}/dashboard`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Oʻquvchi paneliga qaytish</span>
          </Link>
        ) : (
          <Link
            href={`/${lang}/dashboard`}
            title="Oʻquvchi paneliga qaytish"
            className="grid h-9 w-9 place-items-center rounded-lg text-primary hover:bg-secondary mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}

        {/* User Card */}
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/40 border border-border/50">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'Admin'}
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-white text-[13px]">
                  {initials}
                </div>
              )}
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {user?.fullName || user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user?.email || 'admin@minna.uz'}
                </p>
              </div>
            </div>

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
          <div className="flex flex-col items-center gap-2.5">
            <div
              title={`${user?.fullName || user?.email} (Admin)`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-white text-[13px]"
            >
              {initials}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Chiqish"
              className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
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
      <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground hover:bg-secondary"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <span className="font-bold text-[16px] text-foreground">MinnaUz Admin</span>
          </div>
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

      {/* Desktop Persistent Sidebar */}
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
