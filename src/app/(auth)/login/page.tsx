'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Resolve tenant membership slug
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('organizations(slug)')
          .eq('user_id', data.user.id)
          .limit(1);

        const firstSlug = memberships?.[0]?.organizations
          ? (memberships[0].organizations as any).slug
          : null;

        if (firstSlug) {
          router.push(`/org/${firstSlug}`);
        } else {
          router.push('/register'); // Redirect to register to create/join an organization
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authorize. Please double-check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 backdrop-blur-md">
        
        {/* Title */}
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="mt-6 text-xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-1.5 text-xs text-zinc-500">
            Sign in to access your outbound workspace
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Password
              </label>
            </div>
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

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500">
            Don't have an outbound workspace?{' '}
            <Link href="/register" className="font-medium text-zinc-300 hover:text-white transition-colors">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
