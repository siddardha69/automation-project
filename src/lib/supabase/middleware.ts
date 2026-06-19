import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the user auth session token if expired and synchronizes session cookies.
 * Returns the authenticated user, the Supabase client instance, and the updated response object.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if variables are missing or contain placeholder values
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your-project-id') ||
    supabaseAnonKey.includes('dummykey')
  ) {
    return { supabase: null, user: null, response: supabaseResponse };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // Refresh session and fetch current user context safely
    const { data: { user } } = await supabase.auth.getUser();
    return { supabase, user, response: supabaseResponse };
  } catch (err) {
    console.error('Supabase session update failed:', err);
    return { supabase, user: null, response: supabaseResponse };
  }
}
