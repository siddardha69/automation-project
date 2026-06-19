'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut();
      // Clear all cookies manually as well
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
      });
      router.replace('/login');
    };
    signOut();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
      Signing you out...
    </div>
  );
}
