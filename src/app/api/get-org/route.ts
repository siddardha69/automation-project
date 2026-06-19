import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Use service role client to bypass RLS and read memberships
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: memberships, error } = await adminClient
      .from('organization_members')
      .select('organizations(slug)')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const firstSlug = memberships?.[0]?.organizations
      ? (memberships[0].organizations as any).slug
      : null;

    return NextResponse.json({ orgSlug: firstSlug }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
