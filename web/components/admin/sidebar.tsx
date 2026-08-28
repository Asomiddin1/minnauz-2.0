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
  X,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Bell,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { LogoMark } from '@/components/intro/Logo';
import { UserAvatar } from '@/components/shared/user-avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const { lang } = useLang();
  const { user, logout } = useAuth();
  const pathname = usePathname();
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
      label: 'Bannerlar',
      href: `/${lang}/admin/banners`,
      icon: Sliders,
    },
    {
      label: 'Xabarnomalar',
      href: `/${lang}/admin/notifications`,
      icon: Bell,
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

  const renderNavContent = (isMobileDrawer = false) => (
    <div
      className={`flex h-full flex-col justify-between bg-card border-r border-border transition-all duration-300 ease-in-out ${
        !isMobileDrawer && isCollapsed ? 'p-2.5 items-center' : 'p-4'
      }`}
    >
      <div className="w-full space-y-6">
        {/* Header: Logo & Collapse Toggle */}
        <div
          className={`flex items-center pt-2 pb-1 ${
            !isMobileDrawer && isCollapsed ? 'justify-center' : 'justify-between px-2'
          }`}
        >
          {isMobileDrawer || !isCollapsed ? (
            <>
              <Link href={`/${lang}/admin`} onClick={onMobileClose} className="flex items-center gap-2.5">
                <LogoMark className="h-7 w-7" />
                <div className="space-y-0.5">
                  <span className="text-[17px] font-bold tracking-tight text-foreground block leading-none">
                    MinnaUz
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                    Admin Panel
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                {!isMobileDrawer ? (
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    title="Sidebarni kichraytirish"
                    aria-label="Collapse sidebar"
                    className="hidden md:grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onMobileClose}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border text-foreground hover:bg-secondary"
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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

        {/* Back to User Dashboard */}
        <Link
          href={`/${lang}/dashboard`}
          onClick={onMobileClose}
          title={!isMobileDrawer && isCollapsed ? 'Oʻquvchi paneliga qaytish' : undefined}
          className={`flex items-center rounded-xl text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${
            !isMobileDrawer && isCollapsed ? 'h-10 w-10 justify-center mx-auto' : 'gap-2 px-3.5 py-2'
          }`}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {(isMobileDrawer || !isCollapsed) && <span>Oʻquvchi paneli</span>}
        </Link>

        {/* Nav Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isMobileDrawer && isCollapsed ? item.label : undefined}
                onClick={onMobileClose}
                className={`group flex items-center justify-between rounded-xl text-[14px] font-medium transition-all duration-200 ${
                  !isMobileDrawer && isCollapsed
                    ? 'h-11 w-11 justify-center mx-auto'
                    : 'px-3.5 py-2.5'
                } ${
                  active
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  {(isMobileDrawer || !isCollapsed) && <span>{item.label}</span>}
                </div>

                {(isMobileDrawer || !isCollapsed) && item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      active ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="w-full pt-4 border-t border-border">
        {isMobileDrawer || !isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <UserAvatar user={user} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {user?.fullName || 'Admin'}
                  </p>
                  <span className="shrink-0 rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase text-purple-600 dark:text-purple-400">
                    {user?.role === 'SUPER_ADMIN' ? 'Super' : 'Admin'}
                  </span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user?.email || 'admin@minna.uz'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Chiqish</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <UserAvatar user={user} size="sm" />
            <button
              type="button"
              onClick={logout}
              title="Chiqish"
              className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
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
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent(true)}
      </div>

      {/* Desktop Persistent Sidebar */}
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
