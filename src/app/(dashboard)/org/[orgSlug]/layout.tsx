'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';
import TenantSwitcher from '@/components/shared/tenant-switcher';
import {
  LayoutDashboard,
  MailOpen,
  Users,
  LineChart,
  Settings,
  User,
  LogOut,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const { user, signOut } = useAuth();
  const { currentOrg, isLoading } = useTenant();

  const orgSlug = params?.orgSlug as string;

  // Navigation Items definitions
  const navItems = [
    {
      name: 'Overview',
      href: `/org/${orgSlug}`,
      icon: LayoutDashboard,
      active: pathname === `/org/${orgSlug}`,
    },
    {
      name: 'Campaigns',
      href: `/org/${orgSlug}/campaigns`,
      icon: MailOpen,
      active: pathname.startsWith(`/org/${orgSlug}/campaigns`),
    },
    {
      name: 'Leads',
      href: `/org/${orgSlug}/leads`,
      icon: Users,
      active: pathname.startsWith(`/org/${orgSlug}/leads`),
    },
    {
      name: 'Analytics',
      href: `/org/${orgSlug}/analytics`,
      icon: LineChart,
      active: pathname.startsWith(`/org/${orgSlug}/analytics`),
    },
    {
      name: 'Settings',
      href: `/org/${orgSlug}/settings`,
      icon: Settings,
      active: pathname.startsWith(`/org/${orgSlug}/settings`),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-200 mx-auto" />
          <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500">
            Initializing interface...
          </p>
        </div>
      </div>
    );
  }

  // Find active nav name for page header breadcrumb
  const activeNavItem = navItems.find((item) => item.active);
  const pageTitle = activeNavItem ? activeNavItem.name : 'Workspace';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 font-sans text-zinc-200">
      {/* Sidebar Panel */}
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-900 bg-zinc-950 p-4">
        {/* Brand Banner */}
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-950">
            <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span className="text-sm font-semibold tracking-wider uppercase text-zinc-100">
            Annulus
          </span>
        </div>

        {/* Tenant Switcher dropdown */}
        <div className="mb-6">
          <TenantSwitcher />
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  item.active
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-zinc-200' : 'text-zinc-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto border-t border-zinc-900 pt-4 space-y-1">
          {/* User profile details */}
          <Link
            href={`/org/${orgSlug}/profile`}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              pathname.startsWith(`/org/${orgSlug}/profile`)
                ? 'bg-zinc-900 text-white font-semibold'
                : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
            }`}
          >
            <User className="h-4 w-4 shrink-0 text-zinc-500" />
            <div className="flex-1 truncate text-left">
              <span className="block truncate text-xs">Profile Settings</span>
            </div>
          </Link>

          {/* Logout button */}
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-400/80 hover:bg-red-950/20 hover:text-red-400 transition-colors focus:outline-none"
          >
            <LogOut className="h-4 w-4 shrink-0 text-red-500/70" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content shell */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Header Breadcrumbs bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950/50 px-8 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="uppercase tracking-wider text-zinc-400">{currentOrg?.name}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-200">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300">
              {user?.email?.slice(0, 2).toUpperCase() || 'US'}
            </div>
          </div>
        </header>

        {/* View Frame */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
