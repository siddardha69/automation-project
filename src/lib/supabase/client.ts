import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

/**
 * Creates a single, cached instance of the Supabase browser client.
 * For use strictly inside Client Components (files containing the 'use client' directive).
 * Fallback values are used during static build/compilation to prevent crashes.
 */
export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  return createBrowserClient<Database>(url, key);
};
