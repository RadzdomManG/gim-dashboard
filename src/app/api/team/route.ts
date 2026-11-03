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

    if (error || !members || members.length === 0) {
      const fallbackMembers = [
        { id: 'usr-divine', email: 'divine.origines', full_name: 'Divine Origines', nickname: 'Divine', role: 'Owner', is_core_admin: false, client_id: null, assigned_clients: ['All Accounts'], is_active: true, title: 'Owner & Strategy Lead', avatar_color: '#3D5249' },
        { id: 'usr-radz', email: 'rdzgllgo', full_name: 'Radzdom Gallego', nickname: 'Radz', role: 'Admin', is_core_admin: true, client_id: null, assigned_clients: ['All Accounts'], is_active: true, title: 'Chief Automation Architect & Tech Lead', avatar_color: '#466B53' },
        { id: 'usr-ra', email: 'aneweraa.ai@gmail.com', full_name: 'Ma. Rose Anne (RA) Malinao', nickname: 'RA', role: 'Admin', is_core_admin: true, client_id: null, assigned_clients: ['All Accounts'], is_active: true, title: 'Commercial Operations & Billing Lead', avatar_color: '#518E6A' },
        { id: 'usr-erwin', email: 'erwin@gim.com', full_name: 'Erwin Manaog', nickname: 'Erwin', role: 'Specialist', is_core_admin: false, client_id: null, assigned_clients: ['Little Treasures Company', 'Studio Nets'], is_active: true, title: 'Project Owner & Delivery Specialist', avatar_color: '#65746C' },
        { id: 'usr-bj', email: 'bj@gim.com', full_name: 'BJ Ricafrente', nickname: 'BJ', role: 'Specialist', is_core_admin: false, client_id: null, assigned_clients: ['Little Treasures Company', 'Aaron Ofosu Bootcamp'], is_active: true, title: 'Operations Specialist', avatar_color: '#3D5249' },
        { id: 'usr-joy', email: 'joy@gim.com', full_name: 'Joy Fabular', nickname: 'Joy', role: 'Specialist', is_core_admin: false, client_id: null, assigned_clients: ['InVogue Cleans'], is_active: true, title: 'Operations Assistant', avatar_color: '#518E6A' },
        { id: 'usr-jedy', email: 'jedy@gim.com', full_name: 'Jedy Caillio', nickname: 'Jedy', role: 'Specialist', is_core_admin: false, client_id: null, assigned_clients: ['Studio Nets'], is_active: true, title: 'Creative Assistant', avatar_color: '#466B53' },
      ];
      return NextResponse.json({ members: fallbackMembers });
    }

    return NextResponse.json({ members });
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
