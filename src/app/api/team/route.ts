import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, nickname, role, is_core_admin, client_id, assigned_clients, is_active, title, avatar_color')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ members: members || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, assigned_clients, role } = body;

    if (!userId && !email) {
      return NextResponse.json({ error: 'userId or email is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (Array.isArray(assigned_clients)) {
      updates.assigned_clients = assigned_clients;
    }
    if (role) {
      updates.role = role;
    }

    let query = supabase.from('profiles').update(updates);
    if (userId) {
      query = query.eq('id', userId);
    } else {
      query = query.eq('email', email);
    }

    const { data, error } = await query.select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
