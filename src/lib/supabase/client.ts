import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

/**
 * Creates a single, cached instance of the Supabase browser client.
 * For use strictly inside Client Components (files containing the 'use client' directive).
 */
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
