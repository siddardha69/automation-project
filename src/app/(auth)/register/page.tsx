'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Building2, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Helper to format organization name into a clean URL-friendly slug
  const handleNameChange = (nameValue: string) => {
    setOrgName(nameValue);
    // Convert to lowercase, remove non-alphanumeric chars, replace spaces with hyphens
    const formattedSlug = nameValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setOrgSlug(formattedSlug);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Call server-side API to create user + org using service role (bypasses RLS)
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, orgName, orgSlug }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Registration failed.');
      }

      // 2. Sign the user in on the client side now that account exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 3. Redirect to the newly created tenant workspace
      router.push(`/org/${result.orgSlug}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during account registration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 backdrop-blur-md">
        
        {/* Title */}
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="mt-6 text-xl font-bold tracking-tight text-white">
            Create Your Outbound Workspace
          </h2>
          <p className="mt-1.5 text-xs text-zinc-500">
            Set up your organization and admin account to begin
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Form Details */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="border-b border-zinc-900 pb-3 mb-2">
            <h3 className="text-xs font-semibold text-zinc-300">1. User Credentials</h3>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agency.com"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3.5 py-2 pl-10 text-sm text-white placeholder-zinc-600 transition-colors focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3.5 py-2 pl-10 text-sm text-white placeholder-zinc-600 transition-colors focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
            </div>
          </div>

          <div className="border-b border-zinc-900 pt-2 pb-3 mb-2">
            <h3 className="text-xs font-semibold text-zinc-300">2. Organization Details</h3>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Agency Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Acme Agency"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3.5 py-2 text-sm text-white placeholder-zinc-600 transition-colors focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Workspace URL Slug
              </label>
            </div>
            <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/40 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700">
              <span className="flex select-none items-center pl-3 text-xs text-zinc-600 font-mono">
                /org/
              </span>
              <input
                type="text"
                required
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="acme-agency"
                className="w-full bg-transparent px-1 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Create Workspace Account</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500">
            Already have a workspace?{' '}
            <Link href="/login" className="font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
