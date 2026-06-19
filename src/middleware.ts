import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // 1. Detect Sandbox Demo Mode Cookie
  const isDemoMode = request.cookies.get('demo_mode')?.value === 'true';

  if (isDemoMode) {
    // If in sandbox mode, redirect setup and auth pages to the demo workspace
    const isDashboardRoute = url.pathname.startsWith('/org/');
    if (!isDashboardRoute) {
      url.pathname = '/org/demo-agency';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2. Standard Mode: Sync session/cookies using the Supabase helper
  const { supabase, user, response } = await updateSession(request);

  // If Supabase configuration is missing or invalid, route to /setup
  if (!supabase) {
    if (url.pathname !== '/setup') {
      url.pathname = '/setup';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // If configured, block access to the setup screen and route to landing
  if (url.pathname === '/setup') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/register');
  const isDashboardRoute = url.pathname.startsWith('/org');

  // 3. Authentication Enforcement Guard
  if (!user && isDashboardRoute) {
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // 4. User is signed in but requesting Auth forms (/login, /register)
  if (user && isAuthRoute) {
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('id, organizations(slug)')
      .eq('user_id', user.id)
      .limit(1);

    const firstOrgSlug = memberships?.[0]?.organizations
      ? (memberships[0].organizations as any).slug
      : null;

    if (firstOrgSlug) {
      url.pathname = `/org/${firstOrgSlug}`;
      return NextResponse.redirect(url);
    }

    if (url.pathname !== '/register') {
      url.pathname = '/register';
      return NextResponse.redirect(url);
    }
  }

  // 5. Tenant Slug Membership Guard
  if (user && isDashboardRoute) {
    const segments = url.pathname.split('/');
    const orgSlug = segments[2];

    if (orgSlug) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('id, organizations!inner(slug)')
        .eq('user_id', user.id)
        .eq('organizations.slug', orgSlug)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        const { data: fallbackOrgs } = await supabase
          .from('organization_members')
          .select('organizations(slug)')
          .eq('user_id', user.id)
          .limit(1);

        const fallbackSlug = fallbackOrgs?.[0]?.organizations
          ? (fallbackOrgs[0].organizations as any).slug
          : null;

        if (fallbackSlug) {
          url.pathname = `/org/${fallbackSlug}`;
          return NextResponse.redirect(url);
        } else {
          url.pathname = '/register';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
