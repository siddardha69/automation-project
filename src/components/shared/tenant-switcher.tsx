'use client';

import React, { useState } from 'react';
import { useTenant } from '@/contexts/tenant-context';
import { ChevronDown, Plus, Check, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function TenantSwitcher() {
  const { currentOrg, organizations, switchTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-left text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 text-zinc-300">
            <Building2 className="h-3 w-3" />
          </div>
          <span className="truncate text-xs font-semibold uppercase tracking-wider">
            {currentOrg?.name || 'Loading organization...'}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute left-0 right-0 z-50 mt-1 origin-top-right rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-xl focus:outline-none">
            <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Workspaces
            </div>
            
            <div className="max-h-60 overflow-y-auto py-1">
              {organizations.map((org) => {
                const isActive = org.id === currentOrg?.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchTenant(org.slug);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors focus:outline-none ${
                      isActive
                        ? 'bg-zinc-900 text-white font-medium'
                        : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    {isActive && <Check className="h-3.5 w-3.5 text-zinc-200" />}
                  </button>
                );
              })}
            </div>

            <div className="my-1 border-t border-zinc-800" />

            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create new workspace</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
