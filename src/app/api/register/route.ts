import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, password, orgName, orgSlug } = await req.json();

    if (!email || !password || !orgName || !orgSlug) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Use the service role client — bypasses ALL RLS policies
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Create the user account
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email — no verification needed
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Create the organization
    const { data: orgData, error: orgError } = await adminClient
      .from('organizations')
      .insert({ name: orgName, slug: orgSlug })
      .select()
      .single();

    if (orgError) {
      // Clean up the user if org creation fails
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: orgError.message }, { status: 400 });
    }

    // 3. Add the user as the organization owner
    const { error: memberError } = await adminClient
      .from('organization_members')
      .insert({ organization_id: orgData.id, user_id: userId, role: 'owner' });

    if (memberError) {
      // Clean up both the user and org if member creation fails
      await adminClient.from('organizations').delete().eq('id', orgData.id);
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({ orgSlug: orgData.slug }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
