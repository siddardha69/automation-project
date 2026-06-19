import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

/**
 * Creates a Supabase client capable of running inside Server Components, Route Handlers, or Server Actions.
 * Integrates directly with Next.js headers to manage cookie-based authentication sessions.
 * Fallback values are used during static build/compilation to prevent crashes.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The setAll method can be called from Server Components which cannot write cookies.
            // This catch block prevents the application from crashing.
          }
        },
      },
    }
  );
}
