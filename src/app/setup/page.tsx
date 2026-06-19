'use client';

import React, { useState } from 'react';
import { Database, Key, CheckCircle, ArrowRight, Play } from 'lucide-react';

export default function SetupPage() {
  const [isActivatingDemo, setIsActivatingDemo] = useState(false);

  const activateDemoMode = () => {
    setIsActivatingDemo(true);
    // Set a cookie so middleware/client contexts know to bypass auth and load dummy data
    document.cookie = "demo_mode=true; path=/; max-age=86400"; // 24 hours
    
    // Refresh to trigger middleware redirection to the demo workspace dashboard
    window.location.href = "/org/demo-agency";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8 text-zinc-200">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 sm:p-10 backdrop-blur-md">
        
        {/* Header Title */}
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950">
            <Database className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl pt-2">
            Annulus Automations Onboarding
          </h1>
          <p className="text-xs text-zinc-500">
            Your application framework has been generated successfully. Connect your database to start.
          </p>
        </div>

        {/* Action Options */}
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          
          {/* Option A: Connect Database */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-850">
                <Key className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                1. Connect Supabase
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Connect your Postgres database & authorization system. Update the keys inside the local config file:
              </p>
              <div className="bg-zinc-900/80 rounded border border-zinc-850 p-3 text-[10px] font-mono text-zinc-400 overflow-x-auto select-all">
                NEXT_PUBLIC_SUPABASE_URL=...
                <br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=...
              </div>
            </div>
            
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noreferrer" 
              className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors"
            >
              <span>Get API Credentials</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          {/* Option B: Demo Sandbox Mode */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900/50">
                <Play className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                2. Live Demo Sandbox
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Skip database setup and explore the production-grade dashboard interface instantly in mock sandbox mode.
              </p>
              <ul className="space-y-1.5 text-[11px] text-zinc-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500/80 shrink-0" />
                  <span>Explore dashboard panels</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500/80 shrink-0" />
                  <span>Click through campaigns & leads</span>
                </li>
              </ul>
            </div>

            <button
              onClick={activateDemoMode}
              disabled={isActivatingDemo}
              className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-emerald-400 hover:bg-emerald-350 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition-colors disabled:opacity-50"
            >
              {isActivatingDemo ? (
                <span>Loading Sandbox...</span>
              ) : (
                <>
                  <span>Enter Demo Sandbox</span>
                  <Play className="h-3 w-3 fill-current" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="border-t border-zinc-900 pt-6 flex justify-between items-center text-[10px] text-zinc-600 font-mono">
          <span>Target: Marketing Agencies (US)</span>
          <span>Status: Foundation Active</span>
        </div>

      </div>
    </div>
  );
}
